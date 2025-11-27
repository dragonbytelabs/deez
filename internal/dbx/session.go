package dbx

import (
	"context"
	"encoding/json"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

type Session struct {
	ID             string    `db:"id" json:"id"`
	Data           string    `db:"data" json:"data"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	LastActivityAt time.Time `db:"last_activity_at" json:"last_activity_at"`
}

// GetSessionById
func (d *DB) GetSessionById(ctx context.Context, id string) (*Session, error) {
	q := MustQuery("get_session_by_id.sql")

	var s Session
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]interface{}{
		"id": id,
	}

	rows, err := d.DBX.NamedQueryContext(ctx, q, args)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, nil // no user found
	}
	if err := rows.StructScan(&s); err != nil {
		return nil, err
	}
	return &s, nil
}

// WriteSession creates or updates a session
func (d *DB) CreateSession(ctx context.Context, id string, data map[string]any, createdAt, lastActivityAt time.Time) error {
	q := MustQuery("create_session.sql")

	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}

	log.Printf("WriteSession: id=%s, data=%s, created=%v, lastActivity=%v",
		id, string(dataJSON), createdAt, lastActivityAt) // Add logging

	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return err
	}
	defer stmt.Close()

	args := map[string]interface{}{
		"id":               id,
		"data":             string(dataJSON),
		"created_at":       createdAt,
		"last_activity_at": lastActivityAt,
	}

	result, err := stmt.ExecContext(ctx, args)
	if err != nil {
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	log.Printf("WriteSession: affected %d rows", rowsAffected) // Add logging

	return nil
}

// DeleteSession removes a session by ID
func (d *DB) DeleteSession(ctx context.Context, id string) error {
	q := MustQuery("delete_session.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{"id": id})
	return err
}

// CleanExpiredSessions removes expired sessions
func (d *DB) CleanExpiredSessions(ctx context.Context, idleThreshold, absoluteThreshold time.Time) error {
	q := MustQuery("clean_expired_sessions.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"idle_threshold":     idleThreshold,
		"absolute_threshold": absoluteThreshold,
	})
	return err
}
