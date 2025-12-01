package dbx

import (
	"context"
	"crypto/rand"
	"dragonbytelabs/dz/internal/config"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"golang.org/x/crypto/bcrypt"
)

// generateSecurePassword generates a cryptographically secure random password
// It generates enough random bytes to ensure the resulting base64 string is at least
// the desired length, then returns exactly that many characters.
func generateSecurePassword(length int) (string, error) {
	// Calculate bytes needed: base64 encodes 3 bytes to 4 characters
	// So we need at least (length * 3 / 4) + 1 bytes to get the desired length
	bytesNeeded := (length*3 + 3) / 4
	bytes := make([]byte, bytesNeeded)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random password: %w", err)
	}
	encoded := base64.RawURLEncoding.EncodeToString(bytes)
	if len(encoded) < length {
		return "", fmt.Errorf("failed to generate password of required length")
	}
	return encoded[:length], nil
}

// writeCredentialsFile writes the admin credentials to the specified file
func writeCredentialsFile(cfg *config.Config, dir, username, password string) error {
	filePath := filepath.Join(dir, cfg.CredentialsFileName)
	content := fmt.Sprintf("Username: %s\nPassword: %s\n", username, password)

	// Write file with restricted permissions (owner read/write only)
	if err := os.WriteFile(filePath, []byte(content), 0600); err != nil {
		return fmt.Errorf("failed to write credentials file: %w", err)
	}

	log.Printf("Admin credentials written to: %s", filePath)
	return nil
}

// InitializeDefaultAdmin creates the default admin user if this is a fresh install
func (d *DB) InitializeDefaultAdmin(ctx context.Context, appRootDir string, cfg *config.Config) error {
	// Check if this is a fresh install
	isFresh, err := d.IsFreshInstall(ctx)
	if err != nil {
		return fmt.Errorf("failed to check fresh install status: %w", err)
	}

	if !isFresh {
		log.Println("Not a fresh install, skipping admin user creation")
		return nil
	}

	// Check if admin user already exists
	existingUser, err := d.GetUserByEmail(ctx, cfg.DefaultAdminEmail)
	if err != nil {
		return fmt.Errorf("failed to check for existing admin user: %w", err)
	}

	if existingUser != nil {
		log.Println("Admin user already exists, skipping creation")
		return nil
	}

	// Generate secure password
	password, err := generateSecurePassword(cfg.AdminPasswordLength)
	if err != nil {
		return fmt.Errorf("failed to generate secure password: %w", err)
	}

	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Create the admin user
	_, err = d.CreateUser(ctx, cfg.DefaultAdminEmail, string(hash), cfg.DefaultAdminUsername)
	if err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}

	log.Printf("Default admin user created: %s", cfg.DefaultAdminUsername)

	// Write credentials to file
	if err := writeCredentialsFile(cfg, appRootDir, cfg.DefaultAdminEmail, password); err != nil {
		return fmt.Errorf("failed to write admin credentials: %w", err)
	}

	return nil
}
