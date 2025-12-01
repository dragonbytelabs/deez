package dbx

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"golang.org/x/crypto/bcrypt"
)

const (
	defaultAdminUsername      = "dz_admin"
	defaultAdminEmail         = "dz_admin@localhost"
	credentialsFileName       = "dragonbyte_application_password"
	passwordLength            = 32
)

// generateSecurePassword generates a cryptographically secure random password
func generateSecurePassword(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random password: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(bytes)[:length], nil
}

// writeCredentialsFile writes the admin credentials to the specified file
func writeCredentialsFile(dir, username, password string) error {
	filePath := filepath.Join(dir, credentialsFileName)
	content := fmt.Sprintf("Username: %s\nPassword: %s\n", username, password)
	
	// Write file with restricted permissions (owner read/write only)
	if err := os.WriteFile(filePath, []byte(content), 0600); err != nil {
		return fmt.Errorf("failed to write credentials file: %w", err)
	}
	
	log.Printf("Admin credentials written to: %s", filePath)
	return nil
}

// InitializeDefaultAdmin creates the default admin user if this is a fresh install
func (d *DB) InitializeDefaultAdmin(ctx context.Context, appRootDir string) error {
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
	existingUser, err := d.GetUserByEmail(ctx, defaultAdminEmail)
	if err != nil {
		return fmt.Errorf("failed to check for existing admin user: %w", err)
	}
	
	if existingUser != nil {
		log.Println("Admin user already exists, skipping creation")
		return nil
	}
	
	// Generate secure password
	password, err := generateSecurePassword(passwordLength)
	if err != nil {
		return err
	}
	
	// Hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}
	
	// Create the admin user
	_, err = d.CreateUser(ctx, defaultAdminEmail, string(hash), defaultAdminUsername)
	if err != nil {
		return fmt.Errorf("failed to create admin user: %w", err)
	}
	
	log.Printf("Default admin user created: %s", defaultAdminUsername)
	
	// Write credentials to file
	if err := writeCredentialsFile(appRootDir, defaultAdminEmail, password); err != nil {
		return err
	}
	
	return nil
}
