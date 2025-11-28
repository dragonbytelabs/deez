package dbx

import (
	"context"
	"testing"
	"time"
)

func TestDB_CreateSession(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("creates session successfully", func(t *testing.T) {
		id := "test-session-id-1"
		data := map[string]any{"key": "value"}
		now := time.Now()

		err := db.CreateSession(ctx, id, data, now, now)
		if err != nil {
			t.Fatalf("CreateSession() returned error: %v", err)
		}

		// Verify session exists
		session, err := db.GetSessionById(ctx, id)
		if err != nil {
			t.Fatalf("GetSessionById() returned error: %v", err)
		}
		if session == nil {
			t.Fatal("GetSessionById() returned nil for created session")
		}
		if session.ID != id {
			t.Errorf("session.ID = %v, want %v", session.ID, id)
		}
	})

	t.Run("updates session on conflict", func(t *testing.T) {
		id := "test-session-id-2"
		data1 := map[string]any{"key": "value1"}
		data2 := map[string]any{"key": "value2"}
		now := time.Now()

		// Create first
		err := db.CreateSession(ctx, id, data1, now, now)
		if err != nil {
			t.Fatalf("CreateSession() first call returned error: %v", err)
		}

		// Update with same ID
		err = db.CreateSession(ctx, id, data2, now, now)
		if err != nil {
			t.Fatalf("CreateSession() second call returned error: %v", err)
		}

		// Verify updated data
		session, err := db.GetSessionById(ctx, id)
		if err != nil {
			t.Fatalf("GetSessionById() returned error: %v", err)
		}
		if session.Data != `{"key":"value2"}` {
			t.Errorf("session.Data = %v, want %v", session.Data, `{"key":"value2"}`)
		}
	})
}

func TestDB_GetSessionById(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("returns nil for non-existent session", func(t *testing.T) {
		session, err := db.GetSessionById(ctx, "nonexistent")
		if err != nil {
			t.Fatalf("GetSessionById() returned error: %v", err)
		}
		if session != nil {
			t.Error("GetSessionById() should return nil for non-existent session")
		}
	})
}

func TestDB_DeleteSession(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a session first
	id := "session-to-delete"
	data := map[string]any{"key": "value"}
	now := time.Now()
	err := db.CreateSession(ctx, id, data, now, now)
	if err != nil {
		t.Fatalf("CreateSession() returned error: %v", err)
	}

	t.Run("deletes session successfully", func(t *testing.T) {
		err := db.DeleteSession(ctx, id)
		if err != nil {
			t.Fatalf("DeleteSession() returned error: %v", err)
		}

		// Verify session was deleted
		session, err := db.GetSessionById(ctx, id)
		if err != nil {
			t.Fatalf("GetSessionById() returned error: %v", err)
		}
		if session != nil {
			t.Error("DeleteSession() did not delete session")
		}
	})

	t.Run("does not error on non-existent session", func(t *testing.T) {
		err := db.DeleteSession(ctx, "nonexistent")
		if err != nil {
			t.Errorf("DeleteSession() returned error for non-existent session: %v", err)
		}
	})
}

func TestDB_CleanExpiredSessions(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create sessions with different timestamps
	now := time.Now()

	// Valid session
	err := db.CreateSession(ctx, "valid-session", map[string]any{}, now, now)
	if err != nil {
		t.Fatalf("CreateSession() returned error: %v", err)
	}

	// Idle-expired session (old last activity)
	oldActivity := now.Add(-2 * time.Hour)
	err = db.CreateSession(ctx, "idle-expired", map[string]any{}, now, oldActivity)
	if err != nil {
		t.Fatalf("CreateSession() returned error: %v", err)
	}

	// Absolute-expired session (old creation)
	oldCreation := now.Add(-13 * time.Hour)
	err = db.CreateSession(ctx, "absolute-expired", map[string]any{}, oldCreation, now)
	if err != nil {
		t.Fatalf("CreateSession() returned error: %v", err)
	}

	// Run cleanup
	idleThreshold := now.Add(-1 * time.Hour)
	absoluteThreshold := now.Add(-12 * time.Hour)
	err = db.CleanExpiredSessions(ctx, idleThreshold, absoluteThreshold)
	if err != nil {
		t.Fatalf("CleanExpiredSessions() returned error: %v", err)
	}

	// Verify valid session still exists
	session, _ := db.GetSessionById(ctx, "valid-session")
	if session == nil {
		t.Error("CleanExpiredSessions() removed valid session")
	}

	// Verify idle-expired session was removed
	session, _ = db.GetSessionById(ctx, "idle-expired")
	if session != nil {
		t.Error("CleanExpiredSessions() did not remove idle-expired session")
	}

	// Verify absolute-expired session was removed
	session, _ = db.GetSessionById(ctx, "absolute-expired")
	if session != nil {
		t.Error("CleanExpiredSessions() did not remove absolute-expired session")
	}
}
