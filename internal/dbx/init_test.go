package dbx

import (
	"context"
	"dragonbytelabs/dz/internal/config"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestIsFreshInstall(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("fresh install is true by default", func(t *testing.T) {
		isFresh, err := db.IsFreshInstall(ctx)
		if err != nil {
			t.Fatalf("IsFreshInstall() returned error: %v", err)
		}

		if !isFresh {
			t.Error("expected fresh_install to be true by default")
		}
	})

	t.Run("set fresh install to false", func(t *testing.T) {
		err := db.SetFreshInstall(ctx, false)
		if err != nil {
			t.Fatalf("SetFreshInstall(false) returned error: %v", err)
		}

		isFresh, err := db.IsFreshInstall(ctx)
		if err != nil {
			t.Fatalf("IsFreshInstall() returned error: %v", err)
		}

		if isFresh {
			t.Error("expected fresh_install to be false after setting it")
		}
	})

	t.Run("set fresh install to true", func(t *testing.T) {
		err := db.SetFreshInstall(ctx, true)
		if err != nil {
			t.Fatalf("SetFreshInstall(true) returned error: %v", err)
		}

		isFresh, err := db.IsFreshInstall(ctx)
		if err != nil {
			t.Fatalf("IsFreshInstall() returned error: %v", err)
		}

		if !isFresh {
			t.Error("expected fresh_install to be true after setting it")
		}
	})
}

func TestGenerateSecurePassword(t *testing.T) {
	t.Run("generates password of correct length", func(t *testing.T) {
		password, err := generateSecurePassword(32)
		if err != nil {
			t.Fatalf("generateSecurePassword() returned error: %v", err)
		}

		if len(password) != 32 {
			t.Errorf("expected password length 32, got %d", len(password))
		}
	})

	t.Run("generates unique passwords", func(t *testing.T) {
		password1, err := generateSecurePassword(32)
		if err != nil {
			t.Fatalf("generateSecurePassword() returned error: %v", err)
		}

		password2, err := generateSecurePassword(32)
		if err != nil {
			t.Fatalf("generateSecurePassword() returned error: %v", err)
		}

		if password1 == password2 {
			t.Error("expected unique passwords, got duplicates")
		}
	})
}

func TestWriteCredentialsFile(t *testing.T) {
	t.Run("writes credentials file", func(t *testing.T) {
		tmpDir := t.TempDir()
		cfg := &config.Config{
			CredentialsFileName: "test_credentials.txt",
		}
		credentialsFileName := cfg.CredentialsFileName

		err := writeCredentialsFile(cfg, tmpDir, "test@example.com", "testpassword123")
		if err != nil {
			t.Fatalf("writeCredentialsFile() returned error: %v", err)
		}

		filePath := filepath.Join(tmpDir, credentialsFileName)
		content, err := os.ReadFile(filePath)
		if err != nil {
			t.Fatalf("failed to read credentials file: %v", err)
		}

		expectedContent := "Username: test@example.com\nPassword: testpassword123\n"
		if string(content) != expectedContent {
			t.Errorf("expected content %q, got %q", expectedContent, string(content))
		}

		// Check file permissions
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			t.Fatalf("failed to stat credentials file: %v", err)
		}

		// File should be readable/writable only by owner (0600)
		expectedPerm := os.FileMode(0600)
		if fileInfo.Mode().Perm() != expectedPerm {
			t.Errorf("expected file permissions %o, got %o", expectedPerm, fileInfo.Mode().Perm())
		}
	})
}

func TestInitializeDefaultAdmin(t *testing.T) {
	t.Run("creates admin user on fresh install", func(t *testing.T) {
		db := setupTestDB(t)
		defer db.Close()
		ctx := context.Background()
		tmpDir := t.TempDir()
		cfg := &config.Config{
			DefaultAdminEmail:    "tesUsert@email.com",
			DefaultAdminUsername: "testUser",
			AdminPasswordLength:  32,
			CredentialsFileName:  "test_credentials.txt",
		}
		defaultAdminEmail := cfg.DefaultAdminEmail

		err := db.InitializeDefaultAdmin(ctx, tmpDir, cfg)
		if err != nil {
			t.Fatalf("InitializeDefaultAdmin() returned error: %v", err)
		}

		// Check admin user was created
		user, err := db.GetUserByEmail(ctx, defaultAdminEmail)
		if err != nil {
			t.Fatalf("GetUserByEmail() returned error: %v", err)
		}

		if user == nil {
			t.Fatal("expected admin user to be created")
		}

		if user.Email != defaultAdminEmail {
			t.Errorf("expected email %q, got %q", defaultAdminEmail, user.Email)
		}

		defaultAdminUsername := cfg.DefaultAdminUsername
		if user.DisplayName == nil || *user.DisplayName != defaultAdminUsername {
			t.Errorf("expected display name %q, got %v", defaultAdminUsername, user.DisplayName)
		}

		// Check credentials file was created
		credentialsFileName := cfg.CredentialsFileName
		filePath := filepath.Join(tmpDir, credentialsFileName)
		content, err := os.ReadFile(filePath)
		if err != nil {
			t.Fatalf("failed to read credentials file: %v", err)
		}

		if !strings.Contains(string(content), "Username: "+defaultAdminEmail) {
			t.Error("expected credentials file to contain admin email")
		}

		if !strings.Contains(string(content), "Password: ") {
			t.Error("expected credentials file to contain password")
		}
	})

	t.Run("skips admin creation when not fresh install", func(t *testing.T) {
		db := setupTestDB(t)
		defer db.Close()
		ctx := context.Background()
		tmpDir := t.TempDir()

		cfg := &config.Config{
			DefaultAdminEmail:    "tesUsert@email.com",
			DefaultAdminUsername: "testUser",
			AdminPasswordLength:  32,
			CredentialsFileName:  "test_credentials.txt",
		}

		// Set fresh_install to false
		if err := db.SetFreshInstall(ctx, false); err != nil {
			t.Fatalf("SetFreshInstall() returned error: %v", err)
		}

		err := db.InitializeDefaultAdmin(ctx, tmpDir, cfg)
		if err != nil {
			t.Fatalf("InitializeDefaultAdmin() returned error: %v", err)
		}

		// Check admin user was not created
		defaultAdminEmail := cfg.DefaultAdminEmail
		user, err := db.GetUserByEmail(ctx, defaultAdminEmail)
		if err != nil {
			t.Fatalf("GetUserByEmail() returned error: %v", err)
		}

		if user != nil {
			t.Error("expected admin user to not be created when not a fresh install")
		}

		// Check credentials file was not created
		credentialsFileName := cfg.CredentialsFileName
		filePath := filepath.Join(tmpDir, credentialsFileName)
		if _, err := os.Stat(filePath); !os.IsNotExist(err) {
			t.Error("expected credentials file to not exist when not a fresh install")
		}
	})

	t.Run("skips admin creation if admin already exists", func(t *testing.T) {
		db := setupTestDB(t)
		defer db.Close()
		ctx := context.Background()
		tmpDir := t.TempDir()

		cfg := &config.Config{
			DefaultAdminEmail:    "tesUsert@email.com",
			DefaultAdminUsername: "testUser",
			AdminPasswordLength:  32,
			CredentialsFileName:  "test_credentials.txt",
		}

		// Create admin user first

		defaultAdminEmail := cfg.DefaultAdminEmail
		defaultAdminUsername := cfg.DefaultAdminUsername
		_, err := db.CreateUser(ctx, defaultAdminEmail, "existinghash", defaultAdminUsername)
		if err != nil {
			t.Fatalf("CreateUser() returned error: %v", err)
		}

		err = db.InitializeDefaultAdmin(ctx, tmpDir, cfg)
		if err != nil {
			t.Fatalf("InitializeDefaultAdmin() returned error: %v", err)
		}

		// Check credentials file was not created (since admin already exists)
		credentialsFileName := cfg.CredentialsFileName
		filePath := filepath.Join(tmpDir, credentialsFileName)
		if _, err := os.Stat(filePath); !os.IsNotExist(err) {
			t.Error("expected credentials file to not exist when admin already exists")
		}
	})
}
