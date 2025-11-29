package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRegisterStatic(t *testing.T) {
	mux := http.NewServeMux()
	RegisterStatic(mux)

	t.Run("GET /_/admin returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/_/admin", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK
		if rec.Code != http.StatusOK {
			t.Errorf("GET /_/admin status = %v, want %v", rec.Code, http.StatusOK)
		}
	})

	t.Run("GET /_/admin/login returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/_/admin/login", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK (SPA routing)
		if rec.Code != http.StatusOK {
			t.Errorf("GET /_/admin/login status = %v, want %v", rec.Code, http.StatusOK)
		}
	})

	t.Run("GET /_/admin/any-route returns index.html", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/_/admin/some/random/route", nil)
		rec := httptest.NewRecorder()

		mux.ServeHTTP(rec, req)

		// Should return 200 OK (SPA routing)
		if rec.Code != http.StatusOK {
			t.Errorf("GET /_/admin/some/random/route status = %v, want %v", rec.Code, http.StatusOK)
		}
	})
}
