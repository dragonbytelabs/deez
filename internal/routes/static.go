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
	mux.Handle("GET /assets/{file...}", distFS())
	mux.HandleFunc("GET /{rest...}", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, web.DistFS, "dist/index.html")
	})
}
