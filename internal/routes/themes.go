package routes

import (
	"archive/zip"
	"context"
	"encoding/json"
	"io"
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

	// Upload a new theme (zip file only)
	mux.Handle("POST /api/themes/upload", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Limit the request body size (50MB max for theme uploads)
		const maxThemeSize = 50 * 1024 * 1024
		r.Body = http.MaxBytesReader(w, r.Body, maxThemeSize)

		// Parse the multipart form
		if err := r.ParseMultipartForm(maxThemeSize); err != nil {
			log.Printf("UploadTheme: error parsing form: %v", err)
			http.Error(w, "file too large", http.StatusRequestEntityTooLarge)
			return
		}

		// Get the file from the form
		file, header, err := r.FormFile("file")
		if err != nil {
			log.Printf("UploadTheme: error getting file: %v", err)
			http.Error(w, "no file provided", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Validate file is a zip by checking the extension and content type
		if !strings.HasSuffix(strings.ToLower(header.Filename), ".zip") {
			http.Error(w, "only zip files are allowed", http.StatusBadRequest)
			return
		}

		// Validate content type
		contentType := header.Header.Get("Content-Type")
		if contentType != "application/zip" && contentType != "application/x-zip-compressed" && contentType != "application/octet-stream" {
			// Also validate by reading magic bytes
			buffer := make([]byte, 4)
			n, err := file.Read(buffer)
			if err != nil || n < 4 {
				http.Error(w, "invalid file", http.StatusBadRequest)
				return
			}
			// ZIP magic bytes: 0x50 0x4B 0x03 0x04
			if buffer[0] != 0x50 || buffer[1] != 0x4B || buffer[2] != 0x03 || buffer[3] != 0x04 {
				http.Error(w, "only zip files are allowed", http.StatusBadRequest)
				return
			}
			// Seek back to the beginning - file must implement Seeker to continue
			seeker, ok := file.(io.Seeker)
			if !ok {
				http.Error(w, "error processing file", http.StatusInternalServerError)
				return
			}
			if _, err := seeker.Seek(0, io.SeekStart); err != nil {
				http.Error(w, "error processing file", http.StatusInternalServerError)
				return
			}
		}

		// Extract theme name from filename (remove .zip extension)
		themeName := strings.TrimSuffix(header.Filename, ".zip")
		themeName = strings.TrimSuffix(themeName, ".ZIP")

		// Validate theme name - only allow alphanumeric, hyphens, and underscores
		if !isValidThemeName(themeName) {
			http.Error(w, "invalid theme name. only alphanumeric characters, hyphens, and underscores are allowed", http.StatusBadRequest)
			return
		}

		// Create a temporary file to store the uploaded zip
		tempFile, err := os.CreateTemp("", "theme-*.zip")
		if err != nil {
			log.Printf("UploadTheme: error creating temp file: %v", err)
			http.Error(w, "error processing file", http.StatusInternalServerError)
			return
		}
		defer os.Remove(tempFile.Name())
		defer tempFile.Close()

		// Copy the uploaded file to the temp file
		if _, err := io.Copy(tempFile, file); err != nil {
			log.Printf("UploadTheme: error copying file: %v", err)
			http.Error(w, "error processing file", http.StatusInternalServerError)
			return
		}

		// Extract the zip to the themes directory
		themePath := filepath.Join(themesPath, themeName)
		if err := extractZip(tempFile.Name(), themePath, themesPath); err != nil {
			log.Printf("UploadTheme: error extracting zip: %v", err)
			// Clean up partial extraction
			os.RemoveAll(themePath)
			http.Error(w, "error extracting theme", http.StatusBadRequest)
			return
		}

		// Verify the theme has an index.html file
		indexPath := filepath.Join(themePath, "index.html")
		if _, err := os.Stat(indexPath); os.IsNotExist(err) {
			// Clean up the extracted theme
			os.RemoveAll(themePath)
			http.Error(w, "invalid theme: missing index.html file", http.StatusBadRequest)
			return
		}

		log.Printf("UploadTheme: successfully uploaded theme '%s'", themeName)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "theme uploaded successfully",
			"theme":   themeName,
		})
	})))
}

// isValidThemeName validates that a theme name contains only safe characters
func isValidThemeName(name string) bool {
	if name == "" {
		return false
	}
	for _, c := range name {
		if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
			return false
		}
	}
	return true
}

// extractZip extracts a zip file to the destination directory with security checks
func extractZip(zipPath, destPath, themesPath string) error {
	// Open the zip file
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer reader.Close()

	// Get absolute paths for security checks
	absThemesPath, err := filepath.Abs(themesPath)
	if err != nil {
		return err
	}
	absDestPath, err := filepath.Abs(destPath)
	if err != nil {
		return err
	}

	// Verify destination is within themes directory
	rel, err := filepath.Rel(absThemesPath, absDestPath)
	if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
		return os.ErrPermission
	}

	// Create the destination directory
	if err := os.MkdirAll(absDestPath, 0755); err != nil {
		return err
	}

	for _, file := range reader.File {
		// Clean and validate the file path
		cleanName := filepath.Clean(file.Name)
		
		// Skip absolute paths and parent directory references
		if filepath.IsAbs(cleanName) || strings.HasPrefix(cleanName, "..") {
			continue
		}

		targetPath := filepath.Join(absDestPath, cleanName)

		// Get absolute path and verify it's within the destination
		absTargetPath, err := filepath.Abs(targetPath)
		if err != nil {
			continue
		}

		// Security check: ensure path stays within destination directory
		rel, err := filepath.Rel(absDestPath, absTargetPath)
		if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
			continue
		}

		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(absTargetPath, 0755); err != nil {
				return err
			}
			continue
		}

		// Create parent directories if needed
		if err := os.MkdirAll(filepath.Dir(absTargetPath), 0755); err != nil {
			return err
		}

		// Extract the file
		if err := extractFile(file, absTargetPath); err != nil {
			return err
		}
	}

	return nil
}

// extractFile extracts a single file from a zip archive
func extractFile(file *zip.File, destPath string) error {
	rc, err := file.Open()
	if err != nil {
		return err
	}
	defer rc.Close()

	outFile, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
	if err != nil {
		return err
	}
	defer outFile.Close()

	// Limit extraction size to prevent zip bombs (100MB per file)
	const maxFileSize = 100 * 1024 * 1024
	
	// Use LimitReader to limit the amount of data copied
	limitedReader := io.LimitReader(rc, maxFileSize+1)
	n, err := io.Copy(outFile, limitedReader)
	if err != nil {
		return err
	}
	
	// If we read more than maxFileSize, the file is too large
	if n > maxFileSize {
		return os.ErrInvalid // File too large
	}

	return nil
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

		// Handle special auth routes - map /login to login.html and /register to register.html
		if path == "/login" || path == "/login/" {
			path = "/login.html"
		}
		if path == "/register" || path == "/register/" {
			path = "/register.html"
		}

		// Clean the path and get absolute paths for security comparison
		cleanPath := filepath.Clean(path)
		filePath := filepath.Join(themePath, cleanPath)

		// Get absolute paths for robust comparison
		absThemePath, err := filepath.Abs(themePath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		absFilePath, err := filepath.Abs(filePath)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		// Security check: ensure path stays within theme directory
		// Use filepath.Rel to detect path traversal attempts
		rel, err := filepath.Rel(absThemePath, absFilePath)
		if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
			http.NotFound(w, r)
			return
		}

		// Check if file exists
		info, err := os.Stat(absFilePath)
		if err != nil {
			// If file doesn't exist and it's not an asset, serve index.html for SPA
			if os.IsNotExist(err) && !hasAssetExtension(path) {
				http.ServeFile(w, r, filepath.Join(absThemePath, "index.html"))
				return
			}
			http.NotFound(w, r)
			return
		}

		// If it's a directory, serve index.html from that directory
		if info.IsDir() {
			http.ServeFile(w, r, filepath.Join(absFilePath, "index.html"))
			return
		}

		http.ServeFile(w, r, absFilePath)
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
		
		// Validate theme name - only allow alphanumeric, hyphens, and underscores
		for _, c := range themeName {
			if !((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_') {
				http.Error(w, "invalid theme name", http.StatusBadRequest)
				return
			}
		}
		
		themePath := filepath.Join(themesPath, themeName)

		// Get absolute paths for security
		absThemesPath, err := filepath.Abs(themesPath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		absThemePath, err := filepath.Abs(themePath)
		if err != nil {
			http.NotFound(w, r)
			return
		}

		// Verify theme path is within themes directory
		rel, err := filepath.Rel(absThemesPath, absThemePath)
		if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
			http.NotFound(w, r)
			return
		}

		// Check theme exists
		if _, err := os.Stat(absThemePath); os.IsNotExist(err) {
			http.Error(w, "theme not found", http.StatusNotFound)
			return
		}

		// Get the rest of the path after the theme name
		rest := r.PathValue("rest")
		if rest == "" {
			rest = "index.html"
		}

		cleanRest := filepath.Clean(rest)
		absFilePath := filepath.Join(absThemePath, cleanRest)

		// Security check: ensure path stays within theme directory
		rel, err = filepath.Rel(absThemePath, absFilePath)
		if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
			http.NotFound(w, r)
			return
		}

		// Check if file exists
		info, err := os.Stat(absFilePath)
		if err != nil {
			if os.IsNotExist(err) && !hasAssetExtension(rest) {
				http.ServeFile(w, r, filepath.Join(absThemePath, "index.html"))
				return
			}
			http.NotFound(w, r)
			return
		}

		if info.IsDir() {
			http.ServeFile(w, r, filepath.Join(absFilePath, "index.html"))
			return
		}

		http.ServeFile(w, r, absFilePath)
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
			strings.HasPrefix(path, "/uploads/") {
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
