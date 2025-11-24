package routes

import (
	"encoding/json"
	"net/http"

	"dragonbytelabs/dz/internal/session"
)

func RegisterAPI(mux *http.ServeMux) {
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

		// Authenticated
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"user_id":       userID,
			"email":         email,
		})
	})

	mux.Handle("GET /api/game", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "TODO: This is protected data",
			"user_id": sess.Get("user_id"),
		})
	})))
}
