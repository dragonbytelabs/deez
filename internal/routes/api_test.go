package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"dragonbytelabs/dz/internal/session"
)

func TestRegisterAPI(t *testing.T) {
	mux := http.NewServeMux()
	RegisterAPI(mux)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*60*1000000000, 60*60*1000000000, 12*60*60*1000000000, "session_id")
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
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
