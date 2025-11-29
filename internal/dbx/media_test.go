package dbx

import (
	"context"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestDB_CreateMedia(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user first
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, err := db.CreateUser(ctx, "media@example.com", string(hash), "Media User")
	if err != nil {
		t.Fatalf("CreateUser() returned error: %v", err)
	}

	t.Run("creates media successfully", func(t *testing.T) {
		media, err := db.CreateMedia(ctx, user.ID, "abc123.jpg", "test.jpg", "image/jpeg", 1024, "local", "/uploads/abc123.jpg", "/uploads/abc123.jpg")
		if err != nil {
			t.Fatalf("CreateMedia() returned error: %v", err)
		}

		if media == nil {
			t.Fatal("CreateMedia() returned nil media")
		}
		if media.ID == 0 {
			t.Error("CreateMedia() returned media with ID = 0")
		}
		if media.UserID != user.ID {
			t.Errorf("CreateMedia() media.UserID = %v, want %v", media.UserID, user.ID)
		}
		if media.Filename != "abc123.jpg" {
			t.Errorf("CreateMedia() media.Filename = %v, want %v", media.Filename, "abc123.jpg")
		}
		if media.OriginalName != "test.jpg" {
			t.Errorf("CreateMedia() media.OriginalName = %v, want %v", media.OriginalName, "test.jpg")
		}
		if media.MimeType != "image/jpeg" {
			t.Errorf("CreateMedia() media.MimeType = %v, want %v", media.MimeType, "image/jpeg")
		}
		if media.Size != 1024 {
			t.Errorf("CreateMedia() media.Size = %v, want %v", media.Size, 1024)
		}
		if media.StorageType != "local" {
			t.Errorf("CreateMedia() media.StorageType = %v, want %v", media.StorageType, "local")
		}
	})
}

func TestDB_GetMediaByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user and media
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "getmedia@example.com", string(hash), "Get Media User")
	media, _ := db.CreateMedia(ctx, user.ID, "get123.jpg", "get.jpg", "image/jpeg", 512, "local", "/uploads/get123.jpg", "/uploads/get123.jpg")

	t.Run("returns media when exists", func(t *testing.T) {
		result, err := db.GetMediaByID(ctx, media.ID, user.ID)
		if err != nil {
			t.Fatalf("GetMediaByID() returned error: %v", err)
		}
		if result == nil {
			t.Fatal("GetMediaByID() returned nil for existing media")
		}
		if result.ID != media.ID {
			t.Errorf("GetMediaByID() result.ID = %v, want %v", result.ID, media.ID)
		}
	})

	t.Run("returns nil for non-existent media", func(t *testing.T) {
		result, err := db.GetMediaByID(ctx, 99999, user.ID)
		if err != nil {
			t.Fatalf("GetMediaByID() returned error: %v", err)
		}
		if result != nil {
			t.Error("GetMediaByID() should return nil for non-existent media")
		}
	})

	t.Run("returns nil for wrong user", func(t *testing.T) {
		result, err := db.GetMediaByID(ctx, media.ID, 99999)
		if err != nil {
			t.Fatalf("GetMediaByID() returned error: %v", err)
		}
		if result != nil {
			t.Error("GetMediaByID() should return nil for wrong user")
		}
	})
}

func TestDB_GetMediaByUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "listmedia@example.com", string(hash), "List Media User")

	t.Run("returns empty slice for user with no media", func(t *testing.T) {
		media, err := db.GetMediaByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetMediaByUser() returned error: %v", err)
		}
		if media == nil {
			t.Fatal("GetMediaByUser() returned nil")
		}
		if len(media) != 0 {
			t.Errorf("GetMediaByUser() returned %d media, want 0", len(media))
		}
	})

	t.Run("returns all user media", func(t *testing.T) {
		// Create some media
		db.CreateMedia(ctx, user.ID, "file1.jpg", "image1.jpg", "image/jpeg", 100, "local", "/uploads/file1.jpg", "/uploads/file1.jpg")
		db.CreateMedia(ctx, user.ID, "file2.png", "image2.png", "image/png", 200, "local", "/uploads/file2.png", "/uploads/file2.png")
		db.CreateMedia(ctx, user.ID, "file3.gif", "image3.gif", "image/gif", 300, "local", "/uploads/file3.gif", "/uploads/file3.gif")

		media, err := db.GetMediaByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetMediaByUser() returned error: %v", err)
		}
		if len(media) != 3 {
			t.Errorf("GetMediaByUser() returned %d media, want 3", len(media))
		}
	})
}

func TestDB_DeleteMedia(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create user and media
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "deletemedia@example.com", string(hash), "Delete Media User")
	media, _ := db.CreateMedia(ctx, user.ID, "delete.jpg", "todelete.jpg", "image/jpeg", 1024, "local", "/uploads/delete.jpg", "/uploads/delete.jpg")

	t.Run("deletes media successfully", func(t *testing.T) {
		err := db.DeleteMedia(ctx, media.ID, user.ID)
		if err != nil {
			t.Fatalf("DeleteMedia() returned error: %v", err)
		}

		// Verify media was deleted
		result, _ := db.GetMediaByID(ctx, media.ID, user.ID)
		if result != nil {
			t.Error("DeleteMedia() did not delete media")
		}
	})

	t.Run("does not error on non-existent media", func(t *testing.T) {
		err := db.DeleteMedia(ctx, 99999, user.ID)
		if err != nil {
			t.Errorf("DeleteMedia() returned error for non-existent media: %v", err)
		}
	})
}
