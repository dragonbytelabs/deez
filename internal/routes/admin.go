package routes

import (
	"encoding/json"
	"net/http"
	"strings"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"
)

func RegisterAdmin(mux *http.ServeMux, db *dbx.DB) {
	// Get all table names
	mux.Handle("GET /api/admin/tables", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tables, err := db.GetAllTables(r.Context())
		if err != nil {
			http.Error(w, "failed to get tables", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"tables": tables,
		})
	})))

	// Get table data
	mux.Handle("GET /api/admin/table/{name}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tableName := r.PathValue("name")

		data, err := db.GetTableData(r.Context(), tableName)
		if err != nil {
			http.Error(w, "failed to get table data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"table": tableName,
			"data":  data,
		})
	})))
}

func RegisterAdminUserProfile(mux *http.ServeMux, db *dbx.DB) {
	// Get user profile
	mux.Handle("GET /api/admin/user/profile", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "user profile endpoint",
		})
	})))

	// Update user avatar
	mux.Handle("PUT /api/admin/user/avatar", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID := sess.Get("user_id")
		if userID == nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var in struct {
			AvatarURL string `json:"avatar_url"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.AvatarURL == "" {
			http.Error(w, "avatar_url is required", http.StatusBadRequest)
			return
		}

		// Validate that avatar URL is a valid image data URI
		validPrefixes := []string{
			"data:image/svg+xml;base64,",
			"data:image/png;base64,",
			"data:image/jpeg;base64,",
			"data:image/gif;base64,",
			"data:image/webp;base64,",
		}
		isValidPrefix := false
		for _, prefix := range validPrefixes {
			if strings.HasPrefix(in.AvatarURL, prefix) {
				isValidPrefix = true
				break
			}
		}
		if !isValidPrefix {
			http.Error(w, "avatar_url must be a valid image data URI", http.StatusBadRequest)
			return
		}

		user, err := db.UpdateUserAvatar(r.Context(), userID.(string), in.AvatarURL)
		if err != nil {
			http.Error(w, "failed to update avatar", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"user":    user,
		})
	})))

	// Update user email
	mux.Handle("PUT /api/admin/user/email", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID := sess.Get("user_id")
		if userID == nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		var in struct {
			Email string `json:"email"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.Email == "" {
			http.Error(w, "email is required", http.StatusBadRequest)
			return
		}

		// Basic email validation
		if !strings.Contains(in.Email, "@") || !strings.Contains(in.Email, ".") {
			http.Error(w, "invalid email format", http.StatusBadRequest)
			return
		}

		user, err := db.UpdateUserEmail(r.Context(), userID.(string), in.Email)
		if err != nil {
			// Check if it's a unique constraint violation
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				http.Error(w, "email already in use", http.StatusConflict)
				return
			}
			http.Error(w, "failed to update email", http.StatusInternalServerError)
			return
		}

		// Update the session with the new email
		sess.Put("email", user.Email)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"user":    user,
		})
	})))
}
