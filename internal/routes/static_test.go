package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRegisterStatic(t *testing.T) {
	mux := http.NewServeMux()
	RegisterStatic(mux)

	t.Run("GET / returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK
		if rec.Code != http.StatusOK {
			t.Errorf("GET / status = %v, want %v", rec.Code, http.StatusOK)
		}
	})

	t.Run("GET /login returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/login", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK (SPA routing)
		if rec.Code != http.StatusOK {
			t.Errorf("GET /login status = %v, want %v", rec.Code, http.StatusOK)
		}
	})

	t.Run("GET /any-route returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/some/random/route", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK (SPA routing)
		if rec.Code != http.StatusOK {
			t.Errorf("GET /some/random/route status = %v, want %v", rec.Code, http.StatusOK)
		}
	})
}
