package session

import (
	"testing"
	"time"
)

func TestSession_Get(t *testing.T) {
	s := newSession()
	s.data["key1"] = "value1"
	s.data["key2"] = 123

	tests := []struct {
		name     string
		key      string
		expected any
	}{
		{
			name:     "get string value",
			key:      "key1",
			expected: "value1",
		},
		{
			name:     "get int value",
			key:      "key2",
			expected: 123,
		},
		{
			name:     "get non-existent key",
			key:      "nonexistent",
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := s.Get(tt.key)
			if result != tt.expected {
				t.Errorf("Get(%q) = %v, want %v", tt.key, result, tt.expected)
			}
		})
	}
}

func TestSession_Put(t *testing.T) {
	s := newSession()

	s.Put("key1", "value1")
	s.Put("key2", 123)

	if s.data["key1"] != "value1" {
		t.Errorf("Put() did not set key1 correctly, got %v", s.data["key1"])
	}
	if s.data["key2"] != 123 {
		t.Errorf("Put() did not set key2 correctly, got %v", s.data["key2"])
	}
}

func TestSession_Delete(t *testing.T) {
	s := newSession()
	s.data["key1"] = "value1"

	s.Delete("key1")

	if _, exists := s.data["key1"]; exists {
		t.Error("Delete() did not remove key1")
	}

	// Deleting non-existent key should not panic
	s.Delete("nonexistent")
}

func TestNewSession(t *testing.T) {
	s := newSession()

	if s.id == "" {
		t.Error("newSession() created session with empty id")
	}
	if s.data == nil {
		t.Error("newSession() created session with nil data")
	}
	if s.createdAt.IsZero() {
		t.Error("newSession() created session with zero createdAt")
	}
	if s.lastActivityAt.IsZero() {
		t.Error("newSession() created session with zero lastActivityAt")
	}
}

func TestGenerateSessionID(t *testing.T) {
	id1 := generateSessionID()
	id2 := generateSessionID()

	if id1 == "" {
		t.Error("generateSessionID() returned empty string")
	}
	if id1 == id2 {
		t.Error("generateSessionID() returned same id twice")
	}
	if len(id1) < 40 {
		t.Errorf("generateSessionID() returned short id: %d chars", len(id1))
	}
}

func TestNewSessionManager(t *testing.T) {
	store := NewInMemoryStore()
	sm := NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

	if sm == nil {
		t.Fatal("NewSessionManager() returned nil")
	}
	if sm.store != store {
		t.Error("NewSessionManager() did not set store correctly")
	}
	if sm.idleExpiration != 1*time.Hour {
		t.Errorf("NewSessionManager() idleExpiration = %v, want %v", sm.idleExpiration, 1*time.Hour)
	}
	if sm.absoluteExpiration != 12*time.Hour {
		t.Errorf("NewSessionManager() absoluteExpiration = %v, want %v", sm.absoluteExpiration, 12*time.Hour)
	}
	if sm.cookieName != "session_id" {
		t.Errorf("NewSessionManager() cookieName = %v, want %v", sm.cookieName, "session_id")
	}
}

func TestSessionManager_Validate(t *testing.T) {
	store := NewInMemoryStore()
	sm := NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

	tests := []struct {
		name           string
		createdAt      time.Time
		lastActivityAt time.Time
		valid          bool
	}{
		{
			name:           "valid session",
			createdAt:      time.Now(),
			lastActivityAt: time.Now(),
			valid:          true,
		},
		{
			name:           "expired by idle",
			createdAt:      time.Now(),
			lastActivityAt: time.Now().Add(-2 * time.Hour),
			valid:          false,
		},
		{
			name:           "expired by absolute",
			createdAt:      time.Now().Add(-13 * time.Hour),
			lastActivityAt: time.Now(),
			valid:          false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := newSession()
			s.createdAt = tt.createdAt
			s.lastActivityAt = tt.lastActivityAt
			store.Write(s)

			result := sm.validate(s)
			if result != tt.valid {
				t.Errorf("validate() = %v, want %v", result, tt.valid)
			}
		})
	}
}

func TestSessionManager_Migrate(t *testing.T) {
	store := NewInMemoryStore()
	sm := NewSessionManager(store, 30*time.Minute, 1*time.Hour, 12*time.Hour, "session_id")

	s := newSession()
	originalID := s.id
	store.Write(s)

	err := sm.Migrate(s)
	if err != nil {
		t.Errorf("Migrate() returned error: %v", err)
	}

	if s.id == originalID {
		t.Error("Migrate() did not change session id")
	}

	// Original session should be destroyed
	old, _ := store.Read(originalID)
	if old != nil {
		t.Error("Migrate() did not destroy original session")
	}
}
