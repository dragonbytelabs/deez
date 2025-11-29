package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/session"
	"dragonbytelabs/dz/internal/storage"
)

func TestRegisterMedia(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Create a temporary storage for testing
	store, err := storage.NewLocalStore(t.TempDir(), "/uploads")
	if err != nil {
		t.Fatalf("failed to create test storage: %v", err)
	}

	mux := http.NewServeMux()
	RegisterMedia(mux, db, store, 10*1024*1024) // 10MB max file size

	// Create session manager for testing
	sessionStore := session.NewInMemoryStore()
	sm := session.NewSessionManager(sessionStore, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/media requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/media", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/media status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("POST /api/media/upload requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/media/upload", nil)
		req.Header.Set("Content-Type", "multipart/form-data")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("POST /api/media/upload status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("GET /api/media/{id} requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/media/1", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/media/1 status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("DELETE /api/media/{id} requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/media/1", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("DELETE /api/media/1 status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}

func TestGetExtensionFromMimeType(t *testing.T) {
	tests := []struct {
		mimeType string
		expected string
	}{
		{"image/jpeg", ".jpg"},
		{"image/png", ".png"},
		{"image/gif", ".gif"},
		{"image/webp", ".webp"},
		{"image/svg+xml", ".svg"},
		{"text/plain", ""},
		{"application/json", ""},
	}

	for _, tt := range tests {
		t.Run(tt.mimeType, func(t *testing.T) {
			result := getExtensionFromMimeType(tt.mimeType)
			if result != tt.expected {
				t.Errorf("getExtensionFromMimeType(%q) = %q, want %q", tt.mimeType, result, tt.expected)
			}
		})
	}
}

func TestAllowedMimeTypes(t *testing.T) {
	tests := []struct {
		mimeType string
		allowed  bool
	}{
		{"image/jpeg", true},
		{"image/png", true},
		{"image/gif", true},
		{"image/webp", true},
		{"image/svg+xml", true},
		{"text/plain", false},
		{"application/json", false},
		{"video/mp4", false},
	}

	for _, tt := range tests {
		t.Run(tt.mimeType, func(t *testing.T) {
			if allowedMimeTypes[tt.mimeType] != tt.allowed {
				t.Errorf("allowedMimeTypes[%q] = %v, want %v", tt.mimeType, allowedMimeTypes[tt.mimeType], tt.allowed)
			}
		})
	}
}
