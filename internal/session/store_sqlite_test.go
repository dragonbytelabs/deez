package session

import (
	"context"
	"testing"
	"time"

	"dragonbytelabs/dz/internal/dbx"
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

func TestNewSQLiteStore(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewSQLiteStore(db)
	if store == nil {
		t.Fatal("NewSQLiteStore() returned nil")
	}
	if store.db != db {
		t.Error("NewSQLiteStore() did not set db correctly")
	}
}

func TestSQLiteStore_Read(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewSQLiteStore(db)

	t.Run("returns nil for non-existent session", func(t *testing.T) {
		session, err := store.Read("nonexistent")
		if err != nil {
			t.Fatalf("Read() returned error: %v", err)
		}
		if session != nil {
			t.Error("Read() should return nil for non-existent session")
		}
	})

	t.Run("returns session after write", func(t *testing.T) {
		session := newSession()
		session.data["key"] = "value"

		err := store.Write(session)
		if err != nil {
			t.Fatalf("Write() returned error: %v", err)
		}

		readSession, err := store.Read(session.id)
		if err != nil {
			t.Fatalf("Read() returned error: %v", err)
		}
		if readSession == nil {
			t.Fatal("Read() returned nil for existing session")
		}
		if readSession.id != session.id {
			t.Errorf("Read() session.id = %v, want %v", readSession.id, session.id)
		}
	})
}

func TestSQLiteStore_Write(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewSQLiteStore(db)

	t.Run("writes session successfully", func(t *testing.T) {
		session := newSession()
		session.data["key"] = "value"

		err := store.Write(session)
		if err != nil {
			t.Fatalf("Write() returned error: %v", err)
		}

		// Verify by reading
		readSession, _ := store.Read(session.id)
		if readSession == nil {
			t.Error("Write() did not store session")
		}
	})

	t.Run("updates session on conflict", func(t *testing.T) {
		session := newSession()
		session.data["key"] = "value1"

		err := store.Write(session)
		if err != nil {
			t.Fatalf("Write() first call returned error: %v", err)
		}

		session.data["key"] = "value2"
		err = store.Write(session)
		if err != nil {
			t.Fatalf("Write() second call returned error: %v", err)
		}

		// Verify updated value
		readSession, _ := store.Read(session.id)
		if readSession.Get("key") != "value2" {
			t.Errorf("Write() did not update session, got %v", readSession.Get("key"))
		}
	})
}

func TestSQLiteStore_Destroy(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewSQLiteStore(db)

	session := newSession()
	store.Write(session)

	t.Run("destroys session successfully", func(t *testing.T) {
		err := store.Destroy(session.id)
		if err != nil {
			t.Fatalf("Destroy() returned error: %v", err)
		}

		// Verify session was deleted
		readSession, _ := store.Read(session.id)
		if readSession != nil {
			t.Error("Destroy() did not delete session")
		}
	})

	t.Run("does not error on non-existent session", func(t *testing.T) {
		err := store.Destroy("nonexistent")
		if err != nil {
			t.Errorf("Destroy() returned error for non-existent session: %v", err)
		}
	})
}

func TestSQLiteStore_GC(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	store := NewSQLiteStore(db)

	// Create valid session
	validSession := newSession()
	validSession.createdAt = time.Now()
	validSession.lastActivityAt = time.Now()
	store.Write(validSession)

	// Create idle-expired session
	idleExpiredSession := newSession()
	idleExpiredSession.createdAt = time.Now()
	idleExpiredSession.lastActivityAt = time.Now().Add(-2 * time.Hour)
	store.Write(idleExpiredSession)

	// Create absolute-expired session
	absoluteExpiredSession := newSession()
	absoluteExpiredSession.createdAt = time.Now().Add(-13 * time.Hour)
	absoluteExpiredSession.lastActivityAt = time.Now()
	store.Write(absoluteExpiredSession)

	// Run GC
	err := store.GC(1*time.Hour, 12*time.Hour)
	if err != nil {
		t.Fatalf("GC() returned error: %v", err)
	}

	// Valid session should still exist
	session, _ := store.Read(validSession.id)
	if session == nil {
		t.Error("GC() removed valid session")
	}

	// Idle-expired session should be removed
	session, _ = store.Read(idleExpiredSession.id)
	if session != nil {
		t.Error("GC() did not remove idle-expired session")
	}

	// Absolute-expired session should be removed
	session, _ = store.Read(absoluteExpiredSession.id)
	if session != nil {
		t.Error("GC() did not remove absolute-expired session")
	}
}
