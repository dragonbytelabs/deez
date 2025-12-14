package routes

import (
	"io/fs"
	"log"
	"net/http"

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
	mux.HandleFunc("GET /{rest...}", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
	})
}
