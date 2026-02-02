package middleware

import (
	"net/http"
	"strings"

	"sistem-pakar-jurusan/internal/auth"

	"github.com/gin-gonic/gin"
)

func JWTAuth(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		jwtManager := auth.NewJWTManager(secretKey, 0, 0)
		claims, err := jwtManager.ValidateAccessToken(tokenString)
		if err != nil {
			if err == auth.ErrExpiredToken {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
			} else {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			}
			c.Abort()
			return
		}

		// Set admin info in context
		c.Set("admin_id", claims.AdminID)
		c.Set("admin_username", claims.Username)

		c.Next()
	}
}
