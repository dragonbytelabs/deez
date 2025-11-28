package routes

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"

	"golang.org/x/crypto/bcrypt"
)

func RegisterAuth(mux *http.ServeMux, db *dbx.DB, sm *session.SessionManager) {
	mux.HandleFunc("POST /api/register", func(w http.ResponseWriter, r *http.Request) {
		const duration = 1 * time.Second
		startTime := time.Now()

		log.Println("=== Register endpoint hit ===")
		var in struct {
			Email           string `json:"email"`
			Password        string `json:"password"`
			ConfirmPassword string `json:"confirmPassword"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			log.Printf("Register: decode error: %v", err)
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}
		log.Printf("Register: email=%s, password_len=%d, confirm_len=%d", in.Email, len(in.Password), len(in.ConfirmPassword))

		if in.Password != in.ConfirmPassword {
			time.Sleep(duration - time.Since(startTime))
			log.Println("Register: passwords do not match")
			http.Error(w, "passwords do not match", http.StatusBadRequest)
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
		if err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Register: bcrypt error: %v", err)
			http.Error(w, "server error", 500)
			return
		}
		log.Printf("Register: hash generated, length=%d", len(hash))
		displayName := strings.Split(in.Email, "@")[0]

		u, err := db.CreateUser(r.Context(), in.Email, string(hash), displayName)
		if err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Register: CreateUser error: %v", err)
			http.Error(w, "could not create user", 500)
			return
		}
		log.Printf("Register: user created successfully, id=%d", u.ID)

		// Get session and migrate it
		sess := session.GetSession(r)
		if err := sm.Migrate(sess); err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Register: migrate error: %v", err)
			http.Error(w, "server error", 500)
			return
		}

		// Store user in session
		sess.Put("email", u.Email)
		sess.Put("user_id", u.UserHash)

		// Ensure timing
		if time.Since(startTime) < duration {
			time.Sleep(duration - time.Since(startTime))
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"redirect": "/login",
		})
	})

	mux.HandleFunc("POST /api/login", func(w http.ResponseWriter, r *http.Request) {
		const duration = 1 * time.Second
		startTime := time.Now()

		log.Println("=== Login endpoint hit ===")
		var in struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Login: decode error: %v", err)
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}
		log.Printf("Login: attempting login for email=%s", in.Email)

		u, err := db.GetUserByEmail(r.Context(), in.Email)
		if err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Login: GetUserByEmail error: %v", err)
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}
		if u == nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Login: user not found for email=%s", in.Email)
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}
		log.Printf("Login: found user id=%d, checking password", u.ID)

		if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(in.Password)); err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Login: password mismatch: %v", err)
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Get session and migrate it
		sess := session.GetSession(r)
		if err := sm.Migrate(sess); err != nil {
			time.Sleep(duration - time.Since(startTime))
			log.Printf("Login: migrate error: %v", err)
			http.Error(w, "server error", 500)
			return
		}

		// Store user in session
		sess.Put("email", u.Email)
		sess.Put("user_id", u.UserHash)

		// Ensure timing
		if time.Since(startTime) < duration {
			time.Sleep(duration - time.Since(startTime))
		}

		log.Printf("Login: successful for user id=%d", u.ID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"redirect": "/_/admin",
		})
	})

	mux.HandleFunc("POST /api/logout", func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)

		// Migrate to clear session
		if err := sm.Migrate(sess); err != nil {
			log.Printf("Logout: migrate error: %v", err)
			http.Error(w, "logout failed", http.StatusInternalServerError)
			return
		}

		// Clear user data
		sess.Delete("email")
		sess.Delete("user_id")

		log.Println("Logout: successful")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":  true,
			"redirect": "/login",
		})
	})
}
