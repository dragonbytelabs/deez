package routes

import (
	"log"
	"net/http"

	"dragonbytelabs/dz/internal/session"
)

// RequireAuth middleware checks if user is authenticated
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)

		userID := sess.Get("user_id")
		if userID == nil {
			log.Printf("RequireAuth: user not authenticated, redirecting to login")
			http.Redirect(w, r, "/_/admin/login", http.StatusSeeOther)
			return
		}

		log.Printf("RequireAuth: user authenticated, user_id=%v", userID)
		next.ServeHTTP(w, r)
	})
}

// RequireGuest middleware checks if user is NOT authenticated (for login/register pages)
func RequireGuest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)

		userID := sess.Get("user_id")
		if userID != nil {
			log.Printf("RequireGuest: user already authenticated, redirecting to home")
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		next.ServeHTTP(w, r)
	})
}
