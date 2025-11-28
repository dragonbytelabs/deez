package models

import (
	"testing"
	"time"
)

func TestSession_Struct(t *testing.T) {
	now := time.Now()
	session := Session{
		ID:             "test-session-id",
		Data:           `{"key": "value"}`,
		CreatedAt:      now,
		LastActivityAt: now,
	}

	if session.ID != "test-session-id" {
		t.Errorf("Session.ID = %v, want %v", session.ID, "test-session-id")
	}
	if session.Data != `{"key": "value"}` {
		t.Errorf("Session.Data = %v, want %v", session.Data, `{"key": "value"}`)
	}
	if !session.CreatedAt.Equal(now) {
		t.Errorf("Session.CreatedAt = %v, want %v", session.CreatedAt, now)
	}
	if !session.LastActivityAt.Equal(now) {
		t.Errorf("Session.LastActivityAt = %v, want %v", session.LastActivityAt, now)
	}
}

func TestSession_EmptyData(t *testing.T) {
	session := Session{
		ID:   "test-session-id",
		Data: "",
	}

	if session.Data != "" {
		t.Errorf("Session.Data = %v, want empty string", session.Data)
	}
}
