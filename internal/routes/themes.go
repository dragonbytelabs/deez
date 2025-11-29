package routes

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"dragonbytelabs/dz/internal/dbx"
)

// Theme represents a theme available in dz_content/themes
type Theme struct {
	Name   string `json:"name"`
	Path   string `json:"path"`
	Active bool   `json:"active"`
}

// RegisterThemes registers theme management routes and theme serving
func RegisterThemes(mux *http.ServeMux, db *dbx.DB, themesPath string) {
	// API endpoints for theme management
	mux.Handle("GET /api/themes", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		themes, err := listThemes(r.Context(), db, themesPath)
		if err != nil {
			http.Error(w, "failed to list themes", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"themes": themes,
		})
	})))

	// Activate a theme
	mux.Handle("POST /api/themes/{name}/activate", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		themeName := r.PathValue("name")

		// Verify theme exists
		themePath := filepath.Join(themesPath, themeName)
		if _, err := os.Stat(themePath); os.IsNotExist(err) {
			http.Error(w, "theme not found", http.StatusNotFound)
			return
		}

		// Set as active theme in database
		if err := db.SetActiveTheme(r.Context(), themeName); err != nil {
			http.Error(w, "failed to activate theme", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "theme activated",
			"theme":   themeName,
		})
	})))

	// Deactivate current theme
	mux.Handle("POST /api/themes/deactivate", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Clear the active theme
		if err := db.SetActiveTheme(r.Context(), ""); err != nil {
			http.Error(w, "failed to deactivate theme", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "theme deactivated",
		})
	})))
}

// listThemes returns all available themes from the themes directory
func listThemes(ctx context.Context, db *dbx.DB, themesPath string) ([]Theme, error) {
	activeTheme, err := db.GetActiveTheme(ctx)
	if err != nil {
		return nil, err
	}

	themes := []Theme{}

	entries, err := os.ReadDir(themesPath)
	if err != nil {
		if os.IsNotExist(err) {
			return themes, nil
		}
		return nil, err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		// Check if theme has an index.html (valid theme)
		indexPath := filepath.Join(themesPath, entry.Name(), "index.html")
		if _, err := os.Stat(indexPath); os.IsNotExist(err) {
			continue
		}

		themes = append(themes, Theme{
			Name:   entry.Name(),
			Path:   filepath.Join(themesPath, entry.Name()),
			Active: entry.Name() == activeTheme,
		})
	}

	return themes, nil
}

// ServeTheme serves the active theme at the root path
// Returns nil handler if no theme is active (so admin can handle)
func ServeTheme(themesPath string, activeTheme string) http.Handler {
	if activeTheme == "" {
		return nil
	}

	themePath := filepath.Join(themesPath, activeTheme)
	if _, err := os.Stat(themePath); os.IsNotExist(err) {
		log.Printf("Active theme directory not found: %s", themePath)
		return nil
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Serve static files from theme directory
		path := r.URL.Path
		if path == "/" {
			path = "/index.html"
		}

		filePath := filepath.Join(themePath, filepath.Clean(path))

		// Security check: ensure path stays within theme directory
		if !strings.HasPrefix(filePath, themePath) {
			http.NotFound(w, r)
			return
		}

		// Check if file exists
		info, err := os.Stat(filePath)
		if err != nil {
			// If file doesn't exist and it's not an asset, serve index.html for SPA
			if os.IsNotExist(err) && !hasAssetExtension(path) {
				http.ServeFile(w, r, filepath.Join(themePath, "index.html"))
				return
			}
			http.NotFound(w, r)
			return
		}

		// If it's a directory, serve index.html from that directory
		if info.IsDir() {
			http.ServeFile(w, r, filepath.Join(filePath, "index.html"))
			return
		}

		http.ServeFile(w, r, filePath)
	})
}

// hasAssetExtension checks if path has a static asset extension
func hasAssetExtension(path string) bool {
	assetExtensions := []string{
		".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico",
		".woff", ".woff2", ".ttf", ".eot", ".otf", ".map", ".json",
		".webp", ".avif", ".mp4", ".webm", ".mp3", ".wav",
	}
	ext := strings.ToLower(filepath.Ext(path))
	for _, assetExt := range assetExtensions {
		if ext == assetExt {
			return true
		}
	}
	return false
}

// ThemePreviewHandler serves a preview of a specific theme
func ThemePreviewHandler(themesPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		themeName := r.PathValue("name")
		themePath := filepath.Join(themesPath, themeName)

		// Check theme exists
		if _, err := os.Stat(themePath); os.IsNotExist(err) {
			http.Error(w, "theme not found", http.StatusNotFound)
			return
		}

		// Get the rest of the path after the theme name
		rest := r.PathValue("rest")
		if rest == "" {
			rest = "index.html"
		}

		filePath := filepath.Join(themePath, filepath.Clean(rest))

		// Security check: ensure path stays within theme directory
		if !strings.HasPrefix(filePath, themePath) {
			http.NotFound(w, r)
			return
		}

		// Check if file exists
		info, err := os.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) && !hasAssetExtension(rest) {
				http.ServeFile(w, r, filepath.Join(themePath, "index.html"))
				return
			}
			http.NotFound(w, r)
			return
		}

		if info.IsDir() {
			http.ServeFile(w, r, filepath.Join(filePath, "index.html"))
			return
		}

		http.ServeFile(w, r, filePath)
	}
}

// RegisterThemeServing registers the catch-all route for theme serving at root
// This checks the database for active theme and serves it, falling back to admin SPA
func RegisterThemeServing(mux *http.ServeMux, db *dbx.DB, themesPath string) {
	mux.HandleFunc("GET /{rest...}", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		
		// Skip if it's an internal route, API route, or asset
		if strings.HasPrefix(path, "/_/") ||
			strings.HasPrefix(path, "/api/") ||
			strings.HasPrefix(path, "/assets/") ||
			strings.HasPrefix(path, "/uploads/") ||
			path == "/login" ||
			path == "/register" {
			// These are handled by other registered routes
			http.NotFound(w, r)
			return
		}

		// Get active theme from database
		activeTheme, err := db.GetActiveTheme(r.Context())
		if err != nil {
			log.Printf("Error getting active theme: %v", err)
			// Fall back to admin SPA
			ServeAdminFallback(w, r)
			return
		}

		// If no active theme, serve admin SPA
		if activeTheme == "" {
			ServeAdminFallback(w, r)
			return
		}

		// Serve theme
		handler := ServeTheme(themesPath, activeTheme)
		if handler == nil {
			// Theme not found, fall back to admin
			ServeAdminFallback(w, r)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
