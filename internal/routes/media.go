package routes

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strconv"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"
	"dragonbytelabs/dz/internal/storage"
)

// allowedMimeTypes defines the allowed file types for upload
var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
	"image/svg+xml": true,
}

// generateRandomFilename creates a unique filename for storage
func generateRandomFilename(ext string) (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes) + ext, nil
}

// RegisterMedia registers all media-related routes
func RegisterMedia(mux *http.ServeMux, db *dbx.DB, store storage.Store, maxFileSize int64) {
	// Upload a new media file
	mux.Handle("POST /api/media/upload", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("UploadMedia: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		// Limit the request body size
		r.Body = http.MaxBytesReader(w, r.Body, maxFileSize)

		// Parse the multipart form
		if err := r.ParseMultipartForm(maxFileSize); err != nil {
			log.Printf("UploadMedia: error parsing form: %v", err)
			http.Error(w, "file too large", http.StatusRequestEntityTooLarge)
			return
		}

		// Get the file from the form
		file, header, err := r.FormFile("file")
		if err != nil {
			log.Printf("UploadMedia: error getting file: %v", err)
			http.Error(w, "no file provided", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Validate file type by reading the first 512 bytes to detect content type
		buffer := make([]byte, 512)
		n, err := file.Read(buffer)
		if err != nil && err != io.EOF {
			log.Printf("UploadMedia: error reading file: %v", err)
			http.Error(w, "error reading file", http.StatusInternalServerError)
			return
		}

		// Detect content type from file content
		contentType := http.DetectContentType(buffer[:n])
		
		// Also check the Content-Type header as a fallback for SVGs
		headerContentType := header.Header.Get("Content-Type")
		if headerContentType == "image/svg+xml" {
			contentType = "image/svg+xml"
		}

		if !allowedMimeTypes[contentType] {
			log.Printf("UploadMedia: invalid file type: %s", contentType)
			http.Error(w, "invalid file type, only images are allowed", http.StatusBadRequest)
			return
		}

		// Seek back to the beginning of the file
		if seeker, ok := file.(io.Seeker); ok {
			if _, err := seeker.Seek(0, io.SeekStart); err != nil {
				log.Printf("UploadMedia: error seeking file: %v", err)
				http.Error(w, "error processing file", http.StatusInternalServerError)
				return
			}
		}

		// Generate a unique filename
		ext := filepath.Ext(header.Filename)
		if ext == "" {
			// Try to determine extension from mime type
			ext = getExtensionFromMimeType(contentType)
		}
		filename, err := generateRandomFilename(ext)
		if err != nil {
			log.Printf("UploadMedia: error generating filename: %v", err)
			http.Error(w, "error processing file", http.StatusInternalServerError)
			return
		}

		// Save the file to storage
		storagePath, url, err := store.Save(filename, file)
		if err != nil {
			log.Printf("UploadMedia: error saving file: %v", err)
			http.Error(w, "error saving file", http.StatusInternalServerError)
			return
		}

		// Create the media record in the database
		media, err := db.CreateMedia(r.Context(), userID, filename, header.Filename, contentType, header.Size, store.Type(), storagePath, url)
		if err != nil {
			log.Printf("UploadMedia: error creating media record: %v", err)
			// Clean up the stored file
			store.Delete(storagePath)
			http.Error(w, "error creating media record", http.StatusInternalServerError)
			return
		}

		log.Printf("UploadMedia: created media id=%d for user_id=%d", media.ID, userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(media)
	})))

	// Get all media for the authenticated user
	mux.Handle("GET /api/media", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("GetMedia: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		media, err := db.GetMediaByUser(r.Context(), userID)
		if err != nil {
			log.Printf("GetMedia: error getting media: %v", err)
			http.Error(w, "could not get media", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"media": media,
		})
	})))

	// Get a specific media item by ID
	mux.Handle("GET /api/media/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("GetMediaByID: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("GetMediaByID: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		media, err := db.GetMediaByID(r.Context(), id, userID)
		if err != nil {
			log.Printf("GetMediaByID: error getting media: %v", err)
			http.Error(w, "could not get media", http.StatusInternalServerError)
			return
		}

		if media == nil {
			http.Error(w, "media not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(media)
	})))

	// Delete a media item
	mux.Handle("DELETE /api/media/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("DeleteMedia: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("DeleteMedia: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		// Get the media record to find the storage path
		media, err := db.GetMediaByID(r.Context(), id, userID)
		if err != nil {
			log.Printf("DeleteMedia: error getting media: %v", err)
			http.Error(w, "could not get media", http.StatusInternalServerError)
			return
		}

		if media == nil {
			http.Error(w, "media not found", http.StatusNotFound)
			return
		}

		// Delete the file from storage
		if err := store.Delete(media.StoragePath); err != nil {
			log.Printf("DeleteMedia: error deleting file: %v", err)
			// Continue to delete the database record even if file deletion fails
		}

		// Delete the database record
		if err := db.DeleteMedia(r.Context(), id, userID); err != nil {
			log.Printf("DeleteMedia: error deleting media record: %v", err)
			http.Error(w, "could not delete media", http.StatusInternalServerError)
			return
		}

		log.Printf("DeleteMedia: deleted media id=%d for user_id=%d", id, userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
		})
	})))
}

// getExtensionFromMimeType returns the file extension for a given mime type
func getExtensionFromMimeType(mimeType string) string {
	switch mimeType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "image/svg+xml":
		return ".svg"
	default:
		return ""
	}
}

// ServeMediaFiles serves static files from the media storage
func ServeMediaFiles(mux *http.ServeMux, storagePath string) {
	// Serve uploaded files
	fs := http.FileServer(http.Dir(storagePath))
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", fs))
}
