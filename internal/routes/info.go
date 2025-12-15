package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Info struct {
	App     string `json:"app"`
	Version string `json:"version"`
}

func RegisterApi(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/info", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Printf("/api/info called\n")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Info{App: "deez", Version: "1.0.0"})
	})

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Printf("/api/health called\n")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"ok":true}`))
	})
}
