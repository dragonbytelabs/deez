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
	
	// Serve favicon and other root-level static files
	mux.HandleFunc("GET /favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/favicon.ico")
	})
	mux.HandleFunc("GET /favicon-32.png", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/favicon-32.png")
	})
	
	// Admin routes under /_/ prefix serve the SPA
	mux.HandleFunc("GET /_/{rest...}", func(w http.ResponseWriter, r *http.Request) {
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
	   strings.HasPrefix(path, "/uploads/") {
		return
	}
	// Serve admin SPA for all other routes when no theme is active
	http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
}
