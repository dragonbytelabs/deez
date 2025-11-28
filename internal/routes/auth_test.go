package routes

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/session"

	"golang.org/x/crypto/bcrypt"
)

func TestRegisterAuth(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

	mux := http.NewServeMux()
	RegisterAuth(mux, db, sm)
	handler := sm.Handle(mux)

	t.Run("POST /api/register with mismatched passwords", func(t *testing.T) {
		body := strings.NewReader(`{"email":"test@example.com","password":"password1","confirmPassword":"password2"}`)
		req := httptest.NewRequest("POST", "/api/register", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("POST /api/register status = %v, want %v", rec.Code, http.StatusBadRequest)
		}
	})

	t.Run("POST /api/register with bad JSON", func(t *testing.T) {
		body := strings.NewReader(`{invalid json}`)
		req := httptest.NewRequest("POST", "/api/register", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("POST /api/register status = %v, want %v", rec.Code, http.StatusBadRequest)
		}
	})

	t.Run("POST /api/login with bad JSON", func(t *testing.T) {
		body := strings.NewReader(`{invalid json}`)
		req := httptest.NewRequest("POST", "/api/login", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusBadRequest {
			t.Errorf("POST /api/login status = %v, want %v", rec.Code, http.StatusBadRequest)
		}
	})

	t.Run("POST /api/login with non-existent user", func(t *testing.T) {
		body := strings.NewReader(`{"email":"nonexistent@example.com","password":"password"}`)
		req := httptest.NewRequest("POST", "/api/login", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("POST /api/login status = %v, want %v", rec.Code, http.StatusUnauthorized)
		}
	})

	t.Run("POST /api/login with wrong password", func(t *testing.T) {
		// Create a test user first
		ctx := context.Background()
		hash, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.MinCost)
		_, err := db.CreateUser(ctx, "logintest@example.com", string(hash), "Login Test")
		if err != nil {
			t.Fatalf("failed to create test user: %v", err)
		}

		body := strings.NewReader(`{"email":"logintest@example.com","password":"wrongpassword"}`)
		req := httptest.NewRequest("POST", "/api/login", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("POST /api/login status = %v, want %v", rec.Code, http.StatusUnauthorized)
		}
	})

	t.Run("POST /api/logout returns success", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/api/logout", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("POST /api/logout status = %v, want %v", rec.Code, http.StatusOK)
		}

		body := rec.Body.String()
		if !strings.Contains(body, `"success":true`) {
			t.Errorf("POST /api/logout body should contain success:true, got %v", body)
		}
	})
}
