package routes

import (
	"archive/zip"
	"bytes"
	"io"
	"mime/multipart"
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

	t.Run("POST /api/themes/upload requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/themes/upload", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("POST /api/themes/upload status = %v, want %v", rec.Code, http.StatusSeeOther)
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

func TestIsValidThemeName(t *testing.T) {
	tests := []struct {
		name     string
		expected bool
	}{
		{"my-theme", true},
		{"MyTheme", true},
		{"my_theme", true},
		{"theme123", true},
		{"My-Theme_123", true},
		{"", false},
		{"my theme", false},
		{"my/theme", false},
		{"my..theme", false},
		{"../theme", false},
		{"theme@name", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isValidThemeName(tt.name)
			if result != tt.expected {
				t.Errorf("isValidThemeName(%q) = %v, want %v", tt.name, result, tt.expected)
			}
		})
	}
}

// createTestZip creates a test zip file with the given files
func createTestZip(t *testing.T, files map[string]string) []byte {
	t.Helper()

	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	for name, content := range files {
		writer, err := zipWriter.Create(name)
		if err != nil {
			t.Fatalf("failed to create zip entry: %v", err)
		}
		if _, err := writer.Write([]byte(content)); err != nil {
			t.Fatalf("failed to write zip entry: %v", err)
		}
	}

	if err := zipWriter.Close(); err != nil {
		t.Fatalf("failed to close zip writer: %v", err)
	}

	return buf.Bytes()
}

func TestExtractZip(t *testing.T) {
	t.Run("extracts valid zip successfully", func(t *testing.T) {
		tempDir := t.TempDir()
		themesPath := filepath.Join(tempDir, "themes")
		if err := os.MkdirAll(themesPath, 0755); err != nil {
			t.Fatalf("failed to create themes directory: %v", err)
		}

		// Create a test zip
		zipContent := createTestZip(t, map[string]string{
			"index.html": "<html>Test</html>",
			"style.css":  "body {}",
		})

		// Write the zip to a temp file
		zipPath := filepath.Join(tempDir, "test.zip")
		if err := os.WriteFile(zipPath, zipContent, 0644); err != nil {
			t.Fatalf("failed to write zip file: %v", err)
		}

		destPath := filepath.Join(themesPath, "test-theme")
		if err := extractZip(zipPath, destPath, themesPath); err != nil {
			t.Fatalf("extractZip failed: %v", err)
		}

		// Verify files were extracted
		indexPath := filepath.Join(destPath, "index.html")
		if _, err := os.Stat(indexPath); os.IsNotExist(err) {
			t.Error("index.html was not extracted")
		}

		stylePath := filepath.Join(destPath, "style.css")
		if _, err := os.Stat(stylePath); os.IsNotExist(err) {
			t.Error("style.css was not extracted")
		}
	})

	t.Run("handles nested directories", func(t *testing.T) {
		tempDir := t.TempDir()
		themesPath := filepath.Join(tempDir, "themes")
		if err := os.MkdirAll(themesPath, 0755); err != nil {
			t.Fatalf("failed to create themes directory: %v", err)
		}

		// Create a test zip with nested directories
		zipContent := createTestZip(t, map[string]string{
			"index.html":       "<html>Test</html>",
			"css/style.css":    "body {}",
			"js/app.js":        "console.log('hello')",
		})

		zipPath := filepath.Join(tempDir, "test.zip")
		if err := os.WriteFile(zipPath, zipContent, 0644); err != nil {
			t.Fatalf("failed to write zip file: %v", err)
		}

		destPath := filepath.Join(themesPath, "nested-theme")
		if err := extractZip(zipPath, destPath, themesPath); err != nil {
			t.Fatalf("extractZip failed: %v", err)
		}

		// Verify nested files were extracted
		cssPath := filepath.Join(destPath, "css", "style.css")
		if _, err := os.Stat(cssPath); os.IsNotExist(err) {
			t.Error("css/style.css was not extracted")
		}

		jsPath := filepath.Join(destPath, "js", "app.js")
		if _, err := os.Stat(jsPath); os.IsNotExist(err) {
			t.Error("js/app.js was not extracted")
		}
	})
}

// createMultipartRequest creates a multipart form request with a file
func createMultipartRequest(t *testing.T, url string, filename string, content []byte) *http.Request {
	t.Helper()

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}

	if _, err := io.Copy(part, bytes.NewReader(content)); err != nil {
		t.Fatalf("failed to copy file content: %v", err)
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close multipart writer: %v", err)
	}

	req := httptest.NewRequest("POST", url, &buf)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	return req
}
