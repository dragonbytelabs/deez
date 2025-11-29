package routes

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/session"
)

func TestRegisterThemes(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Create a temporary themes directory
	tempDir := t.TempDir()
	themesPath := filepath.Join(tempDir, "themes")
	if err := os.MkdirAll(themesPath, 0755); err != nil {
		t.Fatalf("failed to create themes directory: %v", err)
	}

	mux := http.NewServeMux()
	RegisterThemes(mux, db, themesPath)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/themes requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/themes", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/themes status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("POST /api/themes/{name}/activate requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/themes/test-theme/activate", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("POST /api/themes/test-theme/activate status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("POST /api/themes/deactivate requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/themes/deactivate", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("POST /api/themes/deactivate status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}

func TestListThemes(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Create a temporary themes directory
	tempDir := t.TempDir()
	themesPath := filepath.Join(tempDir, "themes")
	if err := os.MkdirAll(themesPath, 0755); err != nil {
		t.Fatalf("failed to create themes directory: %v", err)
	}

	t.Run("returns empty list when no themes", func(t *testing.T) {
		themes, err := listThemes(t.Context(), db, themesPath)
		if err != nil {
			t.Fatalf("listThemes failed: %v", err)
		}

		if len(themes) != 0 {
			t.Errorf("expected 0 themes, got %d", len(themes))
		}
	})

	t.Run("returns themes with index.html", func(t *testing.T) {
		// Create a valid theme directory
		validThemePath := filepath.Join(themesPath, "valid-theme")
		if err := os.MkdirAll(validThemePath, 0755); err != nil {
			t.Fatalf("failed to create theme directory: %v", err)
		}
		if err := os.WriteFile(filepath.Join(validThemePath, "index.html"), []byte("<html></html>"), 0644); err != nil {
			t.Fatalf("failed to create index.html: %v", err)
		}

		// Create an invalid theme directory (no index.html)
		invalidThemePath := filepath.Join(themesPath, "invalid-theme")
		if err := os.MkdirAll(invalidThemePath, 0755); err != nil {
			t.Fatalf("failed to create invalid theme directory: %v", err)
		}

		themes, err := listThemes(t.Context(), db, themesPath)
		if err != nil {
			t.Fatalf("listThemes failed: %v", err)
		}

		if len(themes) != 1 {
			t.Errorf("expected 1 theme, got %d", len(themes))
		}

		if len(themes) > 0 && themes[0].Name != "valid-theme" {
			t.Errorf("expected theme name 'valid-theme', got '%s'", themes[0].Name)
		}
	})
}

func TestServeTheme(t *testing.T) {
	// Create a temporary themes directory with a test theme
	tempDir := t.TempDir()
	themePath := filepath.Join(tempDir, "test-theme")
	if err := os.MkdirAll(themePath, 0755); err != nil {
		t.Fatalf("failed to create theme directory: %v", err)
	}

	indexContent := "<html><head><title>Test Theme</title></head><body>Hello</body></html>"
	if err := os.WriteFile(filepath.Join(themePath, "index.html"), []byte(indexContent), 0644); err != nil {
		t.Fatalf("failed to create index.html: %v", err)
	}

	cssContent := "body { color: red; }"
	if err := os.WriteFile(filepath.Join(themePath, "style.css"), []byte(cssContent), 0644); err != nil {
		t.Fatalf("failed to create style.css: %v", err)
	}

	t.Run("returns nil handler for empty theme name", func(t *testing.T) {
		handler := ServeTheme(tempDir, "")
		if handler != nil {
			t.Error("expected nil handler for empty theme name")
		}
	})

	t.Run("returns nil handler for non-existent theme", func(t *testing.T) {
		handler := ServeTheme(tempDir, "non-existent")
		if handler != nil {
			t.Error("expected nil handler for non-existent theme")
		}
	})

	t.Run("serves index.html for root path", func(t *testing.T) {
		handler := ServeTheme(tempDir, "test-theme")
		if handler == nil {
			t.Fatal("expected non-nil handler")
		}

		req := httptest.NewRequest("GET", "/", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("GET / status = %v, want %v", rec.Code, http.StatusOK)
		}

		body := rec.Body.String()
		if body != indexContent {
			t.Errorf("GET / body = %v, want %v", body, indexContent)
		}
	})

	t.Run("serves static files", func(t *testing.T) {
		handler := ServeTheme(tempDir, "test-theme")
		if handler == nil {
			t.Fatal("expected non-nil handler")
		}

		req := httptest.NewRequest("GET", "/style.css", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("GET /style.css status = %v, want %v", rec.Code, http.StatusOK)
		}

		body := rec.Body.String()
		if body != cssContent {
			t.Errorf("GET /style.css body = %v, want %v", body, cssContent)
		}
	})

	t.Run("serves index.html for unknown routes (SPA support)", func(t *testing.T) {
		handler := ServeTheme(tempDir, "test-theme")
		if handler == nil {
			t.Fatal("expected non-nil handler")
		}

		req := httptest.NewRequest("GET", "/some/unknown/route", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("GET /some/unknown/route status = %v, want %v", rec.Code, http.StatusOK)
		}

		body := rec.Body.String()
		if body != indexContent {
			t.Errorf("GET /some/unknown/route body = %v, want %v", body, indexContent)
		}
	})
}

func TestHasAssetExtension(t *testing.T) {
	tests := []struct {
		path     string
		expected bool
	}{
		{"/style.css", true},
		{"/script.js", true},
		{"/image.png", true},
		{"/image.jpg", true},
		{"/image.jpeg", true},
		{"/image.gif", true},
		{"/image.svg", true},
		{"/font.woff", true},
		{"/font.woff2", true},
		{"/data.json", true},
		{"/about", false},
		{"/users/123", false},
		{"/", false},
		{"/index.html", false}, // HTML is not considered an asset for SPA fallback
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			result := hasAssetExtension(tt.path)
			if result != tt.expected {
				t.Errorf("hasAssetExtension(%q) = %v, want %v", tt.path, result, tt.expected)
			}
		})
	}
}
