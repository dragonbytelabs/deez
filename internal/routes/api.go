package routes

import (
	"encoding/json"
	"log"
	"net/http"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"
)

func RegisterAPI(mux *http.ServeMux, db *dbx.DB) {
	mux.HandleFunc("GET /api/me", func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)

		userID := sess.Get("user_id")
		email := sess.Get("email")

		w.Header().Set("Content-Type", "application/json")
		if userID == nil {
			// Not authenticated
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}

		user, err := db.GetUserByHash(r.Context(), userID.(string))
		if err != nil {
			log.Printf("error fetching user: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		if user == nil {
			// User not found, session may be stale
			json.NewEncoder(w).Encode(map[string]interface{}{
				"authenticated": false,
			})
			return
		}

		// Authenticated
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"email":         email,
			"avatar_url":    user.AvatarURL,
		})
	})
}
