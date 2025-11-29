package routes

import (
	"io/fs"
	"log"
	"net/http"
	"strings"

	web "dragonbytelabs/dz/web"
)

func distFS() http.Handler {
	dist, err := fs.Sub(web.DistFS, "dist")
	if err != nil {
		log.Fatal(err)
	}
	return http.FileServer(http.FS(dist))
}

func RegisterStatic(mux *http.ServeMux) {
	// Serve static assets
	mux.Handle("GET /assets/{file...}", distFS())
	
	// Admin routes under /_/ prefix serve the SPA
	mux.HandleFunc("GET /_/{rest...}", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
	})
	
	// Specific auth routes that need to serve the SPA (login, register)
	mux.HandleFunc("GET /login", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
	})
	mux.HandleFunc("GET /register", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
	})
}

// ServeAdminFallback handles requests that don't match any theme
// This is the fallback when no theme is active
func ServeAdminFallback(w http.ResponseWriter, r *http.Request) {
	// If path starts with /_/ or /api/ or specific routes, let other handlers deal with it
	path := r.URL.Path
	if strings.HasPrefix(path, "/_/") || 
	   strings.HasPrefix(path, "/api/") || 
	   strings.HasPrefix(path, "/assets/") ||
	   strings.HasPrefix(path, "/uploads/") ||
	   path == "/login" || 
	   path == "/register" {
		return
	}
	// Serve admin SPA for all other routes when no theme is active
	http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
}
