package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/session"
)

func TestRequireAuth(t *testing.T) {
	t.Run("redirects unauthenticated users", func(t *testing.T) {
		// Create a test handler
		innerHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		// Create session manager with in-memory store
		store := session.NewInMemoryStore()
		sm := session.NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

		// Wrap with RequireAuth and session middleware
		handler := sm.Handle(RequireAuth(innerHandler))

		req := httptest.NewRequest("GET", "/protected", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("RequireAuth() status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
		if rec.Header().Get("Location") != "/_/admin/login" {
			t.Errorf("RequireAuth() redirect = %v, want /_/admin/login", rec.Header().Get("Location"))
		}
	})
}

func TestRequireGuest(t *testing.T) {
	t.Run("allows unauthenticated users", func(t *testing.T) {
		// Create a test handler that returns OK
		innerHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})

		// Create session manager with in-memory store
		store := session.NewInMemoryStore()
		sm := session.NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

		// Wrap with RequireGuest and session middleware
		handler := sm.Handle(RequireGuest(innerHandler))

		req := httptest.NewRequest("GET", "/_/admin/login", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should allow through
		if rec.Code != http.StatusOK {
			t.Errorf("RequireGuest() status = %v, want %v", rec.Code, http.StatusOK)
		}
	})
}
