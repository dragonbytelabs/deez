package routes

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/session"
)

func TestRegisterAPI(t *testing.T) {
	mux := http.NewServeMux()
	RegisterAPI(mux)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/me returns unauthenticated for new session", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/me", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("GET /api/me status = %v, want %v", rec.Code, http.StatusOK)
		}

		body := rec.Body.String()
		if body == "" {
			t.Error("GET /api/me returned empty body")
		}
		// Should contain "authenticated":false for unauthenticated users
		if !containsString(body, `"authenticated":false`) {
			t.Errorf("GET /api/me body should contain authenticated:false, got %v", body)
		}
	})

	t.Run("GET /api/game requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/game", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/game status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}

func containsString(s, substr string) bool {
	return strings.Contains(s, substr)
}
