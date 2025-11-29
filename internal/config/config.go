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
	Media    MediaConfig
	Content  ContentConfig
}

type ContentConfig struct {
	BasePath    string // Base path for dz_content folder
	ThemesPath  string // Path to themes folder
	PluginsPath string // Path to plugins folder
	UploadsPath string // Path to uploads folder
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

type MediaConfig struct {
	StoragePath string
	MaxFileSize int64
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
		Media: MediaConfig{
			StoragePath: getEnv("MEDIA_STORAGE_PATH", "uploads"),
			MaxFileSize: getInt64("MEDIA_MAX_FILE_SIZE", 10*1024*1024), // 10MB default
		},
		Content: ContentConfig{
			BasePath:    getEnv("CONTENT_PATH", "dz_content"),
			ThemesPath:  getEnv("CONTENT_THEMES_PATH", "dz_content/themes"),
			PluginsPath: getEnv("CONTENT_PLUGINS_PATH", "dz_content/plugins"),
			UploadsPath: getEnv("CONTENT_UPLOADS_PATH", "dz_content/uploads"),
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

func getInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		var result int64
		_, err := fmt.Sscanf(value, "%d", &result)
		if err != nil {
			log.Printf("Invalid int64 for %s: %v, using default", key, err)
			return defaultValue
		}
		return result
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

// EnsureContentFolders creates the dz_content directory structure if it doesn't exist
func (c *ContentConfig) EnsureContentFolders() error {
	dirs := []string{c.BasePath, c.ThemesPath, c.PluginsPath, c.UploadsPath}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}
	return nil
}
