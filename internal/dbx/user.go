package dbx

import (
	"context"
	"log"

	_ "modernc.org/sqlite"
)

type User struct {
	ID           int64   `db:"id" json:"id"`
	Email        string  `db:"email" json:"email"`
	PasswordHash string  `db:"password_hash" json:"-"`
	DisplayName  *string `db:"display_name" json:"display_name,omitempty"`
	CreatedAt    string  `db:"created_at" json:"created_at"`
	UpdatedAt    *string `db:"updated_at" json:"updated_at,omitempty"`
}

// CreateUser (sqlx + named params)
func (d *DB) CreateUser(ctx context.Context, email, passwordHash, display string) (*User, error) {
	log.Printf("CreateUser called with email=%s, display=%s", email, display)
	q := MustQuery("create_user.sql")

	var u User
	// Use NamedExec or prepare a named statement for INSERT...RETURNING
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"email":         email,
		"password_hash": passwordHash,
		"display_name":  display,
	}

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByEmail (sqlx + named params)
func (d *DB) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	q := MustQuery("get_user_by_email.sql")

	var u User
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]interface{}{
		"email": email,
	}

	rows, err := d.DBX.NamedQueryContext(ctx, q, args)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, nil // no user found
	}
	if err := rows.StructScan(&u); err != nil {
		return nil, err
	}
	return &u, nil
}
