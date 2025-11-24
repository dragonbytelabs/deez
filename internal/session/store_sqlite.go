package session

import (
	"context"
	"encoding/json"
	"time"

	"dragonbytelabs/dz/internal/dbx"
)

// SQLiteStore stores sessions in SQLite database
type SQLiteStore struct {
	db *dbx.DB
}

// NewSQLiteStore creates a new SQLite session store
func NewSQLiteStore(db *dbx.DB) *SQLiteStore {
	return &SQLiteStore{db: db}
}

func (s *SQLiteStore) Read(id string) (*Session, error) {
	ctx := context.Background()

	dbSession, err := s.db.GetSessionById(ctx, id)
	if err != nil {
		return nil, err
	}
	if dbSession == nil {
		return nil, nil // Session not found
	}

	// Deserialize session data
	var data map[string]any
	if err := json.Unmarshal([]byte(dbSession.Data), &data); err != nil {
		return nil, err
	}

	// Convert dbx.Session to session.Session
	session := &Session{
		id:             dbSession.ID,
		data:           data,
		createdAt:      dbSession.CreatedAt,
		lastActivityAt: dbSession.LastActivityAt,
	}

	return session, nil
}

func (s *SQLiteStore) Write(session *Session) error {
	ctx := context.Background()

	session.mu.RLock()
	data := session.data
	createdAt := session.createdAt
	lastActivityAt := session.lastActivityAt
	id := session.id
	session.mu.RUnlock()

	return s.db.CreateSession(ctx, id, data, createdAt, lastActivityAt)
}

func (s *SQLiteStore) Destroy(id string) error {
	ctx := context.Background()
	return s.db.DeleteSession(ctx, id)
}

func (s *SQLiteStore) GC(idleExpiration, absoluteExpiration time.Duration) error {
	ctx := context.Background()

	idleThreshold := time.Now().Add(-idleExpiration)
	absoluteThreshold := time.Now().Add(-absoluteExpiration)

	return s.db.CleanExpiredSessions(ctx, idleThreshold, absoluteThreshold)
}
