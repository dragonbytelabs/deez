package models

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestUser_CheckPassword(t *testing.T) {
	// Create a password hash
	password := "testpassword123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to generate hash: %v", err)
	}

	user := &User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: string(hash),
	}

	tests := []struct {
		name     string
		password string
		wantErr  bool
	}{
		{
			name:     "correct password",
			password: password,
			wantErr:  false,
		},
		{
			name:     "incorrect password",
			password: "wrongpassword",
			wantErr:  true,
		},
		{
			name:     "empty password",
			password: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := user.CheckPassword(tt.password)
			if (err != nil) != tt.wantErr {
				t.Errorf("CheckPassword(%q) error = %v, wantErr %v", tt.password, err, tt.wantErr)
			}
		})
	}
}

func TestUser_Struct(t *testing.T) {
	// Test that User struct can be instantiated with all fields
	displayName := "Test User"
	avatarURL := "http://example.com/avatar.png"

	user := User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: "hash",
		DisplayName:  &displayName,
		AvatarURL:    &avatarURL,
	}

	if user.ID != 1 {
		t.Errorf("User.ID = %v, want %v", user.ID, 1)
	}
	if user.Email != "test@example.com" {
		t.Errorf("User.Email = %v, want %v", user.Email, "test@example.com")
	}
	if *user.DisplayName != displayName {
		t.Errorf("User.DisplayName = %v, want %v", *user.DisplayName, displayName)
	}
	if *user.AvatarURL != avatarURL {
		t.Errorf("User.AvatarURL = %v, want %v", *user.AvatarURL, avatarURL)
	}
}

func TestUser_NilOptionalFields(t *testing.T) {
	user := User{
		ID:           1,
		Email:        "test@example.com",
		PasswordHash: "hash",
	}

	if user.DisplayName != nil {
		t.Errorf("User.DisplayName = %v, want nil", user.DisplayName)
	}
	if user.AvatarURL != nil {
		t.Errorf("User.AvatarURL = %v, want nil", user.AvatarURL)
	}
	if user.UpdatedAt != nil {
		t.Errorf("User.UpdatedAt = %v, want nil", user.UpdatedAt)
	}
}
