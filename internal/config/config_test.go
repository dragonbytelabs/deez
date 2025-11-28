package config

import (
	"os"
	"testing"
	"time"
)

func TestGetEnv(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue string
		envValue     string
		setEnv       bool
		expected     string
	}{
		{
			name:         "returns default when env not set",
			key:          "TEST_KEY_1",
			defaultValue: "default",
			setEnv:       false,
			expected:     "default",
		},
		{
			name:         "returns env value when set",
			key:          "TEST_KEY_2",
			defaultValue: "default",
			envValue:     "custom",
			setEnv:       true,
			expected:     "custom",
		},
		{
			name:         "returns default for empty env value",
			key:          "TEST_KEY_3",
			defaultValue: "default",
			envValue:     "",
			setEnv:       true,
			expected:     "default",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clean up any existing env
			os.Unsetenv(tt.key)

			if tt.setEnv {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getEnv(tt.key, tt.defaultValue)
			if result != tt.expected {
				t.Errorf("getEnv(%q, %q) = %q, want %q", tt.key, tt.defaultValue, result, tt.expected)
			}
		})
	}
}

func TestGetDuration(t *testing.T) {
	tests := []struct {
		name         string
		key          string
		defaultValue time.Duration
		envValue     string
		setEnv       bool
		expected     time.Duration
	}{
		{
			name:         "returns default when env not set",
			key:          "TEST_DURATION_1",
			defaultValue: 30 * time.Minute,
			setEnv:       false,
			expected:     30 * time.Minute,
		},
		{
			name:         "returns parsed duration when set",
			key:          "TEST_DURATION_2",
			defaultValue: 30 * time.Minute,
			envValue:     "1h",
			setEnv:       true,
			expected:     1 * time.Hour,
		},
		{
			name:         "returns default for invalid duration",
			key:          "TEST_DURATION_3",
			defaultValue: 30 * time.Minute,
			envValue:     "invalid",
			setEnv:       true,
			expected:     30 * time.Minute,
		},
		{
			name:         "parses seconds correctly",
			key:          "TEST_DURATION_4",
			defaultValue: 30 * time.Minute,
			envValue:     "45s",
			setEnv:       true,
			expected:     45 * time.Second,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clean up any existing env
			os.Unsetenv(tt.key)

			if tt.setEnv {
				os.Setenv(tt.key, tt.envValue)
				defer os.Unsetenv(tt.key)
			}

			result := getDuration(tt.key, tt.defaultValue)
			if result != tt.expected {
				t.Errorf("getDuration(%q, %v) = %v, want %v", tt.key, tt.defaultValue, result, tt.expected)
			}
		})
	}
}

func TestLoad(t *testing.T) {
	// Test with default values
	t.Run("loads with defaults", func(t *testing.T) {
		// Ensure no env variables are set that would override defaults
		os.Unsetenv("APP_NAME")
		os.Unsetenv("APP_VERSION")
		os.Unsetenv("PORT")
		os.Unsetenv("DATABASE_PATH")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() returned error: %v", err)
		}

		if cfg.App.Name != "dz" {
			t.Errorf("cfg.App.Name = %q, want %q", cfg.App.Name, "dz")
		}
		if cfg.App.Version != "0.1.0" {
			t.Errorf("cfg.App.Version = %q, want %q", cfg.App.Version, "0.1.0")
		}
		if cfg.Server.Port != "3000" {
			t.Errorf("cfg.Server.Port = %q, want %q", cfg.Server.Port, "3000")
		}
		if cfg.Database.Path != "dz.db" {
			t.Errorf("cfg.Database.Path = %q, want %q", cfg.Database.Path, "dz.db")
		}
	})

	t.Run("loads with custom env values", func(t *testing.T) {
		os.Setenv("APP_NAME", "custom-app")
		os.Setenv("PORT", "8080")
		defer os.Unsetenv("APP_NAME")
		defer os.Unsetenv("PORT")

		cfg, err := Load()
		if err != nil {
			t.Fatalf("Load() returned error: %v", err)
		}

		if cfg.App.Name != "custom-app" {
			t.Errorf("cfg.App.Name = %q, want %q", cfg.App.Name, "custom-app")
		}
		if cfg.Server.Port != "8080" {
			t.Errorf("cfg.Server.Port = %q, want %q", cfg.Server.Port, "8080")
		}
	})
}

func TestMustLoad(t *testing.T) {
	t.Run("does not panic with valid config", func(t *testing.T) {
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("MustLoad() panicked: %v", r)
			}
		}()

		cfg := MustLoad()
		if cfg == nil {
			t.Error("MustLoad() returned nil")
		}
	})
}
