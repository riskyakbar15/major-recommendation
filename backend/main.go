package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"sistem-pakar-jurusan/internal/config"
	"sistem-pakar-jurusan/internal/database"
	"sistem-pakar-jurusan/internal/handlers"
	"sistem-pakar-jurusan/internal/middleware"
	"sistem-pakar-jurusan/internal/repository"
	"sistem-pakar-jurusan/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.NewMySQL(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	jurusanRepo := repository.NewJurusanRepository(db)
	pertanyaanRepo := repository.NewPertanyaanRepository(db)
	ruleRepo := repository.NewRuleRepository(db)
	konsultasiRepo := repository.NewKonsultasiRepository(db)
	adminRepo := repository.NewAdminRepository(db)

	// Initialize services
	authService := services.NewAuthService(adminRepo, cfg)
	jurusanService := services.NewJurusanService(jurusanRepo)
	pertanyaanService := services.NewPertanyaanService(pertanyaanRepo)
	ruleService := services.NewRuleService(ruleRepo)
	konsultasiService := services.NewKonsultasiService(konsultasiRepo, pertanyaanRepo, ruleRepo, jurusanRepo)
	konsultasiService.SetDB(db) // Enable transactional consultation creation
	statistikService := services.NewStatistikService(konsultasiRepo, jurusanRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, handlers.CookieConfig{
		Secure:        cfg.CookieSecure,
		AccessMaxAge:  int(cfg.JWTAccessExpire.Seconds()),
		RefreshMaxAge: int(cfg.JWTRefreshExpire.Seconds()),
		Path:          "/",
	})
	jurusanHandler := handlers.NewJurusanHandler(jurusanService)
	pertanyaanHandler := handlers.NewPertanyaanHandler(pertanyaanService)
	ruleHandler := handlers.NewRuleHandler(ruleService)
	konsultasiHandler := handlers.NewKonsultasiHandler(konsultasiService)
	statistikHandler := handlers.NewStatistikHandler(statistikService)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration - externalized to environment variable
	corsOriginsEnv := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
	corsOrigins := strings.Split(corsOriginsEnv, ",")
	for i := range corsOrigins {
		corsOrigins[i] = strings.TrimSpace(corsOrigins[i])
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Public routes
	api := router.Group("/api")
	{
		api.GET("/questions", pertanyaanHandler.GetAll)
		api.POST("/consultation", konsultasiHandler.Create)
		api.GET("/consultation/:sessionId", konsultasiHandler.GetBySessionID)

		// Auth routes - rate limited to mitigate brute-force attacks
		authLimiter := middleware.NewRateLimiter(10, time.Minute)
		api.POST("/admin/login", authLimiter, authHandler.Login)
		api.POST("/admin/refresh", authLimiter, authHandler.RefreshToken)
	}

	// Protected admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.JWTAuth(cfg.JWTSecret))
	{
		admin.POST("/logout", authHandler.Logout)
		admin.GET("/me", authHandler.GetCurrentAdmin)

		// Jurusan CRUD
		admin.GET("/jurusan", jurusanHandler.GetAll)
		admin.GET("/jurusan/:id", jurusanHandler.GetByID)
		admin.POST("/jurusan", jurusanHandler.Create)
		admin.PUT("/jurusan/:id", jurusanHandler.Update)
		admin.DELETE("/jurusan/:id", jurusanHandler.Delete)

		// Pertanyaan CRUD
		admin.GET("/pertanyaan", pertanyaanHandler.GetAllAdmin)
		admin.GET("/pertanyaan/:id", pertanyaanHandler.GetByID)
		admin.POST("/pertanyaan", pertanyaanHandler.Create)
		admin.PUT("/pertanyaan/:id", pertanyaanHandler.Update)
		admin.DELETE("/pertanyaan/:id", pertanyaanHandler.Delete)

		// Rules CRUD
		admin.GET("/rules", ruleHandler.GetAll)
		admin.GET("/rules/:id", ruleHandler.GetByID)
		admin.POST("/rules", ruleHandler.Create)
		admin.PUT("/rules/:id", ruleHandler.Update)
		admin.DELETE("/rules/:id", ruleHandler.Delete)

		// Consultations history
		admin.GET("/consultations", konsultasiHandler.GetAllAdmin)
		admin.GET("/consultations/:id", konsultasiHandler.GetDetailAdmin)

		// Statistics
		admin.GET("/statistics", statistikHandler.GetStatistics)
	}

	// Start server
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("Server starting on port %s", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Failed to gracefully shutdown server: %v", err)
	}

	log.Println("Server stopped")
}
