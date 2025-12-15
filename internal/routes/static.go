package routes

import (
	"io/fs"
	"log"
	"net/http"
	"strings"

	web "dragonbytelabs/dz/web"
)

func RegisterStatic(mux *http.ServeMux) {
	dist, err := fs.Sub(web.DistFS, "dist")
	if err != nil {
		log.Fatal(err)
	}

	assets := http.StripPrefix("/assets/", http.FileServer(http.FS(dist)))
	mux.Handle("GET /assets/{file...}", assets)

	mux.HandleFunc("GET /favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, dist, "favicon.ico")
	})

	// SPA fallback (but NOT for /api/*)
	mux.HandleFunc("GET /{rest...}", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}
		http.ServeFileFS(w, r, dist, "index.html")
	})

}
