package dbx

import (
	"context"
	"encoding/base64"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestDB_CreateUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("creates user successfully", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		user, err := db.CreateUser(ctx, "test@example.com", string(hash), "Test User")
		if err != nil {
			t.Fatalf("CreateUser() returned error: %v", err)
		}

		if user == nil {
			t.Fatal("CreateUser() returned nil user")
		}
		if user.ID == 0 {
			t.Error("CreateUser() returned user with ID = 0")
		}
		if user.Email != "test@example.com" {
			t.Errorf("CreateUser() user.Email = %q, want %q", user.Email, "test@example.com")
		}
	})

	t.Run("fails on duplicate email", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		_, err := db.CreateUser(ctx, "duplicate@example.com", string(hash), "User 1")
		if err != nil {
			t.Fatalf("CreateUser() first call returned error: %v", err)
		}

		_, err = db.CreateUser(ctx, "duplicate@example.com", string(hash), "User 2")
		if err == nil {
			t.Error("CreateUser() should fail on duplicate email")
		}
	})
}

func TestDB_GetUserByEmail(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("returns nil for non-existent user", func(t *testing.T) {
		user, err := db.GetUserByEmail(ctx, "nonexistent@example.com")
		if err != nil {
			t.Fatalf("GetUserByEmail() returned error: %v", err)
		}
		if user != nil {
			t.Error("GetUserByEmail() should return nil for non-existent user")
		}
	})

	t.Run("returns user when exists", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		_, err := db.CreateUser(ctx, "findme@example.com", string(hash), "Find Me")
		if err != nil {
			t.Fatalf("CreateUser() returned error: %v", err)
		}

		user, err := db.GetUserByEmail(ctx, "findme@example.com")
		if err != nil {
			t.Fatalf("GetUserByEmail() returned error: %v", err)
		}
		if user == nil {
			t.Fatal("GetUserByEmail() returned nil for existing user")
		}
		if user.Email != "findme@example.com" {
			t.Errorf("GetUserByEmail() user.Email = %q, want %q", user.Email, "findme@example.com")
		}
	})
}

func TestDB_GetUserByHash(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("returns nil for non-existent hash", func(t *testing.T) {
		user, err := db.GetUserByHash(ctx, "nonexistent_hash_value")
		if err != nil {
			t.Fatalf("GetUserByHash() returned error: %v", err)
		}
		if user != nil {
			t.Error("GetUserByHash() should return nil for non-existent hash")
		}
	})

	t.Run("returns user when hash exists", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		createdUser, err := db.CreateUser(ctx, "findbyhash@example.com", string(hash), "Find By Hash")
		if err != nil {
			t.Fatalf("CreateUser() returned error: %v", err)
		}

		user, err := db.GetUserByHash(ctx, createdUser.UserHash)
		if err != nil {
			t.Fatalf("GetUserByHash() returned error: %v", err)
		}
		if user == nil {
			t.Fatal("GetUserByHash() returned nil for existing user")
		}
		if user.Email != "findbyhash@example.com" {
			t.Errorf("GetUserByHash() user.Email = %q, want %q", user.Email, "findbyhash@example.com")
		}
		if user.UserHash != createdUser.UserHash {
			t.Errorf("GetUserByHash() user.UserHash = %q, want %q", user.UserHash, createdUser.UserHash)
		}
	})

	t.Run("user_hash is generated on create", func(t *testing.T) {
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		user, err := db.CreateUser(ctx, "hashtest@example.com", string(hash), "Hash Test")
		if err != nil {
			t.Fatalf("CreateUser() returned error: %v", err)
		}

		if user.UserHash == "" {
			t.Error("CreateUser() returned user with empty UserHash")
		}
		// UserHash should be a long base64 string (64 bytes = 86 chars in base64)
		if len(user.UserHash) < 80 {
			t.Errorf("CreateUser() user.UserHash length = %d, want at least 80", len(user.UserHash))
		}
	})
}

func TestDB_UpdateUserAvatar(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user first
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, err := db.CreateUser(ctx, "avatar@example.com", string(hash), "Avatar User")
	if err != nil {
		t.Fatalf("CreateUser() returned error: %v", err)
	}

	t.Run("updates avatar successfully", func(t *testing.T) {
		newAvatarURL := "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4="
		updatedUser, err := db.UpdateUserAvatar(ctx, user.ID, newAvatarURL)
		if err != nil {
			t.Fatalf("UpdateUserAvatar() returned error: %v", err)
		}

		if updatedUser == nil {
			t.Fatal("UpdateUserAvatar() returned nil user")
		}
		if updatedUser.AvatarURL == nil || *updatedUser.AvatarURL != newAvatarURL {
			t.Errorf("UpdateUserAvatar() user.AvatarURL = %v, want %v", updatedUser.AvatarURL, newAvatarURL)
		}
	})
}

func TestGenerateInitialAvatar(t *testing.T) {
	tests := []struct {
		name         string
		displayName  string
		expectedChar string
	}{
		{
			name:         "extracts first letter",
			displayName:  "John",
			expectedChar: "J",
		},
		{
			name:         "handles lowercase",
			displayName:  "alice",
			expectedChar: "A",
		},
		{
			name:         "skips leading spaces",
			displayName:  "  Bob",
			expectedChar: "B",
		},
		{
			name:         "handles empty string",
			displayName:  "",
			expectedChar: "?",
		},
		{
			name:         "handles special chars",
			displayName:  "!!!Test",
			expectedChar: "T",
		},
		{
			name:         "handles digits",
			displayName:  "123User",
			expectedChar: "1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := generateInitialAvatar(tt.displayName)
			if result == "" {
				t.Error("generateInitialAvatar() returned empty string")
			}
			// Should be a data URL
			prefix := "data:image/svg+xml;base64,"
			if !strings.HasPrefix(result, prefix) {
				t.Errorf("generateInitialAvatar() should return a data URL, got %q", result[:min(50, len(result))])
				return
			}
			// Decode the base64 content and check for the expected character
			decoded, err := base64.StdEncoding.DecodeString(result[len(prefix):])
			if err != nil {
				t.Errorf("failed to decode base64: %v", err)
				return
			}
			if !strings.Contains(string(decoded), tt.expectedChar) {
				t.Errorf("generateInitialAvatar(%q) decoded SVG should contain %q, got %q", tt.displayName, tt.expectedChar, string(decoded))
			}
		})
	}
}

func containsString(s, substr string) bool {
	return strings.Contains(s, substr)
}
