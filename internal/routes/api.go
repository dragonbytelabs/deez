package routes

import (
	"encoding/json"
	"log"
	"net/http"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/models"
	"dragonbytelabs/dz/internal/session"
)

func RegisterAPI(mux *http.ServeMux, db *dbx.DB) {
	// Public endpoint to check if public auth is enabled (for themes)
	mux.HandleFunc("GET /api/public-auth", func(w http.ResponseWriter, r *http.Request) {
		loginEnabled, err := db.IsPublicLoginEnabled(r.Context())
		if err != nil {
			log.Printf("error checking public login status: %v", err)
			loginEnabled = false
		}

		registerEnabled, err := db.IsPublicRegisterEnabled(r.Context())
		if err != nil {
			log.Printf("error checking public register status: %v", err)
			registerEnabled = false
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"login_enabled":    loginEnabled,
			"register_enabled": registerEnabled,
		})
	})

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

		// Get user's teams
		teams, err := db.GetTeamsByUser(r.Context(), user.ID)
		if err != nil {
			log.Printf("error fetching teams: %v", err)
			// Don't fail the request, just return empty teams
			teams = []models.Team{}
		}

		// Build teams response with proper nullable handling
		teamsResponse := make([]map[string]interface{}, len(teams))
		for i, team := range teams {
			teamsResponse[i] = map[string]interface{}{
				"id":          team.ID,
				"name":        team.Name,
				"description": team.Description,
				"avatar_url":  team.AvatarURL,
			}
		}

		// Authenticated
		json.NewEncoder(w).Encode(map[string]interface{}{
			"authenticated": true,
			"user": map[string]interface{}{
				"email":        email,
				"avatar_url":   user.AvatarURL,
				"user_id":      user.UserHash,
				"display_name": user.DisplayName,
			},
			"teams": teamsResponse,
		})
	})
}
