package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Server   ServerConfig
	Database DatabaseConfig
	Session  SessionConfig
	Queries  QueriesConfig
}

type AppConfig struct {
	Name    string
	Version string
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Path string
}

type SessionConfig struct {
	CookieName         string
	GCInterval         time.Duration
	IdleExpiration     time.Duration
	AbsoluteExpiration time.Duration
}

type QueriesConfig struct {
	CreateUser     string
	GetUserByEmail string
}

// Load reads configuration from environment variables and defaults
func Load() (*Config, error) {
	// Try to load .env file (optional)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables and defaults")
	}

	cfg := &Config{
		App: AppConfig{
			Name:    getEnv("APP_NAME", "dz"),
			Version: getEnv("APP_VERSION", "0.1.0"),
		},
		Server: ServerConfig{
			Port: getEnv("PORT", "3000"),
		},
		Database: DatabaseConfig{
			Path: getEnv("DATABASE_PATH", "dz.db"),
		},
		Session: SessionConfig{
			GCInterval:         getDuration("SESSION_GC_INTERVAL", 30*time.Minute),
			IdleExpiration:     getDuration("SESSION_IDLE_EXPIRATION", 1*time.Hour),
			AbsoluteExpiration: getDuration("SESSION_ABSOLUTE_EXPIRATION", 12*time.Hour),
			CookieName:         getEnv("SESSION_COOKIE_NAME", "session_id"),
		},
		Queries: QueriesConfig{
			CreateUser:     getEnv("QUERY_CREATE_USER", "create_user.sql"),
			GetUserByEmail: getEnv("QUERY_GET_USER_BY_EMAIL", "get_user_by_email.sql"),
		},
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		duration, err := time.ParseDuration(value)
		if err != nil {
			log.Printf("Invalid duration for %s: %v, using default", key, err)
			return defaultValue
		}
		return duration
	}
	return defaultValue
}

// MustLoad panics if config cannot be loaded
func MustLoad() *Config {
	cfg, err := Load()
	if err != nil {
		panic(fmt.Sprintf("failed to load config: %v", err))
	}
	return cfg
}
