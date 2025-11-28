package dbx

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"unicode"

	"dragonbytelabs/dz/internal/models"
	"log"

	_ "modernc.org/sqlite"
)

// generateInitialAvatar creates an SVG data URL for an avatar with the first initial of the display name
func generateInitialAvatar(displayName string) string {
	// Get the first letter, default to "?" if empty
	initial := "?"
	for _, r := range displayName {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			initial = strings.ToUpper(string(r))
			break
		}
	}

	// Create a simple SVG circle with the initial
	svg := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#4a1e79"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">%s</text>
</svg>`, initial)

	// Encode as base64 data URL
	encoded := base64.StdEncoding.EncodeToString([]byte(svg))
	return "data:image/svg+xml;base64," + encoded
}

// CreateUser (sqlx + named params)
func (d *DB) CreateUser(ctx context.Context, email, passwordHash, display string) (*models.User, error) {
	log.Printf("CreateUser called with email=%s, display=%s", email, display)
	q := MustQuery("create_user.sql")

	var u models.User
	// Use NamedExec or prepare a named statement for INSERT...RETURNING
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	// Generate initial avatar from display name
	avatarURL := generateInitialAvatar(display)

	args := map[string]any{
		"email":         email,
		"password_hash": passwordHash,
		"display_name":  display,
		"avatar_url":    avatarURL,
	}

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByEmail (sqlx + named params)
func (d *DB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	q := MustQuery("get_user_by_email.sql")

	var u models.User
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
