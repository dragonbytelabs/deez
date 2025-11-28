package routes

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"

	"golang.org/x/crypto/bcrypt"
)

// setupTestDB creates a temporary in-memory database for testing
func setupTestDB(t *testing.T) *dbx.DB {
	t.Helper()

	// Use in-memory SQLite for tests
	db, err := dbx.OpenSQLite(":memory:")
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	// Apply migrations
	ctx := context.Background()
	if err := db.ApplyMigrations(ctx); err != nil {
		t.Fatalf("failed to apply migrations: %v", err)
	}

	return db
}

func TestRegisterCollection(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mux := http.NewServeMux()
	RegisterCollection(mux, db)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*60*1000000000, 60*60*1000000000, 12*60*60*1000000000, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/collections requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/collections", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/collections status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("POST /api/collections requires authentication", func(t *testing.T) {
		body := strings.NewReader(`{"name":"Test Collection"}`)
		req := httptest.NewRequest("POST", "/api/collections", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("POST /api/collections status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("GET /api/collections/{id} requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/collections/1", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/collections/1 status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("PUT /api/collections/{id} requires authentication", func(t *testing.T) {
		body := strings.NewReader(`{"name":"Updated Collection"}`)
		req := httptest.NewRequest("PUT", "/api/collections/1", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("PUT /api/collections/1 status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("DELETE /api/collections/{id} requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("DELETE", "/api/collections/1", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("DELETE /api/collections/1 status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}

func TestRegisterAdmin(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	mux := http.NewServeMux()
	RegisterAdmin(mux, db)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*60*1000000000, 60*60*1000000000, 12*60*60*1000000000, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/admin/tables requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/tables", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/admin/tables status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("GET /api/admin/table/{name} requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/table/users", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/admin/table/users status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}

func TestRegisterAdminUserProfile(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	// Create a test user
	ctx := context.Background()
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	_, err := db.CreateUser(ctx, "test@example.com", string(hash), "Test User")
	if err != nil {
		t.Fatalf("failed to create test user: %v", err)
	}

	mux := http.NewServeMux()
	RegisterAdminUserProfile(mux, db)

	// Create session manager for testing
	store := session.NewInMemoryStore()
	sm := session.NewSessionManager(store, 30*60*1000000000, 60*60*1000000000, 12*60*60*1000000000, "session_id")
	handler := sm.Handle(mux)

	t.Run("GET /api/admin/user/profile requires authentication", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/api/admin/user/profile", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("GET /api/admin/user/profile status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})

	t.Run("PUT /api/admin/user/avatar requires authentication", func(t *testing.T) {
		body := strings.NewReader(`{"avatar_url":"data:image/svg+xml;base64,dGVzdA=="}`)
		req := httptest.NewRequest("PUT", "/api/admin/user/avatar", body)
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		// Should redirect to login
		if rec.Code != http.StatusSeeOther {
			t.Errorf("PUT /api/admin/user/avatar status = %v, want %v", rec.Code, http.StatusSeeOther)
		}
	})
}
