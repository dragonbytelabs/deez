package dbx

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
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

// generateUserHash creates a random 64-byte hash encoded as base64 URL-safe string
func generateUserHash() string {
	id := make([]byte, 64)
	_, err := io.ReadFull(rand.Reader, id)
	if err != nil {
		panic("failed to generate user hash")
	}
	return base64.RawURLEncoding.EncodeToString(id)
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
	// Generate user hash
	userHash := generateUserHash()

	args := map[string]any{
		"email":         email,
		"password_hash": passwordHash,
		"display_name":  display,
		"avatar_url":    avatarURL,
		"user_hash":     userHash,
	}

	log.Printf("CreateUser with avatar %v", args)

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}

	log.Printf("Returning user %v", u)
	return &u, nil
}

// GetUserByEmail (sqlx + named params)
func (d *DB) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	q := MustQuery("get_user_by_email.sql")

	var u models.User
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

// UpdateUserAvatar updates the avatar_url for a user
func (d *DB) UpdateUserAvatar(ctx context.Context, userID, avatarURL string) (*models.User, error) {
	q := MustQuery("update_user_avatar.sql")

	var u models.User
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"user_id":    userID,
		"avatar_url": avatarURL,
	}

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}
	return &u, nil
}

// UpdateUserDisplayName updates the display_name for a user
func (d *DB) UpdateUserDisplayName(ctx context.Context, userID, displayName string) (*models.User, error) {
	q := MustQuery("update_user_display_name.sql")

	var u models.User
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"user_id":      userID,
		"display_name": displayName,
	}

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}
	return &u, nil
}

// GetUserByHash retrieves a user by their user_hash (sqlx + named params)
func (d *DB) GetUserByHash(ctx context.Context, userHash string) (*models.User, error) {
	q := MustQuery("get_user_by_hash.sql")

	var u models.User
	args := map[string]interface{}{
		"user_hash": userHash,
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

// UpdateUserEmail updates the email for a user
func (d *DB) UpdateUserEmail(ctx context.Context, userID, email string) (*models.User, error) {
	q := MustQuery("update_user_email.sql")

	var u models.User
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"user_id": userID,
		"email":   email,
	}

	if err := stmt.GetContext(ctx, &u, args); err != nil {
		return nil, err
	}
	return &u, nil
}
