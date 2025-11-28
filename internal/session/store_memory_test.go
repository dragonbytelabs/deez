package session

import (
	"testing"
	"time"
)

func TestInMemoryStore_Read(t *testing.T) {
	store := NewInMemoryStore()

	// Read non-existent session
	s, err := store.Read("nonexistent")
	if err != nil {
		t.Errorf("Read() returned error: %v", err)
	}
	if s != nil {
		t.Error("Read() should return nil for non-existent session")
	}

	// Write and read session
	session := newSession()
	session.data["key"] = "value"
	store.Write(session)

	s, err = store.Read(session.id)
	if err != nil {
		t.Errorf("Read() returned error: %v", err)
	}
	if s == nil {
		t.Fatal("Read() returned nil for existing session")
	}
	if s.id != session.id {
		t.Errorf("Read() returned session with id = %v, want %v", s.id, session.id)
	}
}

func TestInMemoryStore_Write(t *testing.T) {
	store := NewInMemoryStore()

	session := newSession()
	session.data["key"] = "value"

	err := store.Write(session)
	if err != nil {
		t.Errorf("Write() returned error: %v", err)
	}

	// Verify session was stored
	if _, exists := store.sessions[session.id]; !exists {
		t.Error("Write() did not store session")
	}
}

func TestInMemoryStore_Destroy(t *testing.T) {
	store := NewInMemoryStore()

	session := newSession()
	store.Write(session)

	err := store.Destroy(session.id)
	if err != nil {
		t.Errorf("Destroy() returned error: %v", err)
	}

	// Verify session was deleted
	if _, exists := store.sessions[session.id]; exists {
		t.Error("Destroy() did not delete session")
	}

	// Destroy non-existent session should not error
	err = store.Destroy("nonexistent")
	if err != nil {
		t.Errorf("Destroy() returned error for non-existent session: %v", err)
	}
}

func TestInMemoryStore_GC(t *testing.T) {
	store := NewInMemoryStore()

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

	// Run GC with 1 hour idle and 12 hour absolute
	err := store.GC(1*time.Hour, 12*time.Hour)
	if err != nil {
		t.Errorf("GC() returned error: %v", err)
	}

	// Valid session should still exist
	if _, exists := store.sessions[validSession.id]; !exists {
		t.Error("GC() removed valid session")
	}

	// Idle-expired session should be removed
	if _, exists := store.sessions[idleExpiredSession.id]; exists {
		t.Error("GC() did not remove idle-expired session")
	}

	// Absolute-expired session should be removed
	if _, exists := store.sessions[absoluteExpiredSession.id]; exists {
		t.Error("GC() did not remove absolute-expired session")
	}
}

func TestNewInMemoryStore(t *testing.T) {
	store := NewInMemoryStore()

	if store == nil {
		t.Fatal("NewInMemoryStore() returned nil")
	}
	if store.sessions == nil {
		t.Error("NewInMemoryStore() created store with nil sessions map")
	}
}
