package main

import (
	"log"
	"os"

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
	statistikService := services.NewStatistikService(konsultasiRepo, jurusanRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	jurusanHandler := handlers.NewJurusanHandler(jurusanService)
	pertanyaanHandler := handlers.NewPertanyaanHandler(pertanyaanService)
	ruleHandler := handlers.NewRuleHandler(ruleService)
	konsultasiHandler := handlers.NewKonsultasiHandler(konsultasiService)
	statistikHandler := handlers.NewStatistikHandler(statistikService)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
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

		// Auth routes
		api.POST("/admin/login", authHandler.Login)
		api.POST("/admin/refresh", authHandler.RefreshToken)
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

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
