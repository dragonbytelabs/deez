package routes

import (
	"io/fs"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	web "dragonbytelabs/dz/web"
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

func TestAssetsServing(t *testing.T) {
	mux := http.NewServeMux()
	RegisterStatic(mux)

	// Find actual asset files from the embedded dist
	dist, err := fs.Sub(web.DistFS, "dist/assets")
	if err != nil {
		t.Skipf("dist/assets not found: %v", err)
	}

	entries, err := fs.ReadDir(dist, ".")
	if err != nil {
		t.Skipf("Cannot read dist/assets directory: %v", err)
	}

	for _, entry := range entries {
		name := entry.Name()

		t.Run("GET /assets/"+name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/assets/"+name, nil)
			rec := httptest.NewRecorder()

			mux.ServeHTTP(rec, req)

			if rec.Code != http.StatusOK {
				t.Errorf("GET /assets/%s status = %v, want %v", name, rec.Code, http.StatusOK)
			}

			// Verify correct Content-Type for CSS and JS files
			contentType := rec.Header().Get("Content-Type")
			if strings.HasSuffix(name, ".css") {
				if !strings.Contains(contentType, "text/css") {
					t.Errorf("GET /assets/%s Content-Type = %v, want text/css", name, contentType)
				}
			}
			if strings.HasSuffix(name, ".js") {
				if !strings.Contains(contentType, "javascript") {
					t.Errorf("GET /assets/%s Content-Type = %v, want application/javascript or text/javascript", name, contentType)
				}
			}
		})
	}
}
