package routes

import (
	"dragonbytelabs/dz/internal/vault"
	"encoding/json"
	"fmt"
	"net/http"
)

type Info struct {
	App     string `json:"app"`
	Version string `json:"version"`
}

func RegisterApi(mux *http.ServeMux, v *vault.Vault) {
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
	mux.HandleFunc("GET /api/files", func(w http.ResponseWriter, r *http.Request) {
		files, err := v.ListMarkdown(r.Context())
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, files)
	})

	mux.HandleFunc("GET /api/file", func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Query().Get("path")
		res, err := v.ReadFile(r.Context(), p)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}
		writeJSON(w, res)
	})

	mux.HandleFunc("POST /api/file", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Path    string `json:"path"`
			Content string `json:"content"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json body", 400)
			return
		}

		// Check if file already exists
		_, err := v.ReadFile(r.Context(), req.Path)
		if err == nil {
			http.Error(w, "file already exists", http.StatusConflict)
			return
		}

		// Create the file
		writeReq := vault.WriteRequest{Content: req.Content}
		res, err := v.WriteFile(r.Context(), req.Path, writeReq)
		if err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		writeJSON(w, res)
	})

	mux.HandleFunc("PUT /api/file", func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Query().Get("path")

		var req vault.WriteRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json body", 400)
			return
		}

		res, err := v.WriteFile(r.Context(), p, req)
		if err != nil {
			if err.Error() == "conflict: file changed" {
				http.Error(w, err.Error(), http.StatusConflict)
				return
			}
			http.Error(w, err.Error(), 400)
			return
		}

		writeJSON(w, res)
	})

	mux.HandleFunc("GET /api/tree", func(w http.ResponseWriter, r *http.Request) {
		entries, err := v.ListEntries(r.Context())
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
		writeJSON(w, entries)
	})

	mux.HandleFunc("POST /api/rename", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			OldPath string `json:"oldPath"`
			NewPath string `json:"newPath"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json body", 400)
			return
		}

		if err := v.Rename(r.Context(), req.OldPath, req.NewPath); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		writeJSON(w, map[string]bool{"ok": true})
	})

	mux.HandleFunc("DELETE /api/file", func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Query().Get("path")
		if p == "" {
			http.Error(w, "path required", 400)
			return
		}

		if err := v.DeleteFile(r.Context(), p); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		writeJSON(w, map[string]bool{"ok": true})
	})

	mux.HandleFunc("DELETE /api/folder", func(w http.ResponseWriter, r *http.Request) {
		p := r.URL.Query().Get("path")
		if p == "" {
			http.Error(w, "path required", 400)
			return
		}

		if err := v.DeleteFolder(r.Context(), p); err != nil {
			http.Error(w, err.Error(), 400)
			return
		}

		writeJSON(w, map[string]bool{"ok": true})
	})

}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}
