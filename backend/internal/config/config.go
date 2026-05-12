package config

import (
	"log"
	"os"
	"time"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	JWTSecret        string
	JWTAccessExpire  time.Duration
	JWTRefreshExpire time.Duration

	ServerPort string
}

func Load() *Config {
	// Validate required JWT_SECRET - fail-fast if missing
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("ERROR: JWT_SECRET environment variable must be set. Refusing to start with insecure default token secret.")
	}

	return &Config{
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "3306"),
		DBUser:           getEnv("DB_USER", "root"),
		DBPassword:       getEnv("DB_PASSWORD", ""),
		DBName:           getEnv("DB_NAME", "sistem_pakar"),
		JWTSecret:        jwtSecret,
		JWTAccessExpire:  parseDuration(getEnv("JWT_ACCESS_EXPIRE", "24h")),
		JWTRefreshExpire: parseDuration(getEnv("JWT_REFRESH_EXPIRE", "168h")),
		ServerPort:       getEnv("SERVER_PORT", "8080"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 24 * time.Hour
	}
	return d
}
