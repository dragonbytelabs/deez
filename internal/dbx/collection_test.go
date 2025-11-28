package dbx

import (
	"context"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestDB_CreateCollection(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user first
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, err := db.CreateUser(ctx, "collection@example.com", string(hash), "Collection User")
	if err != nil {
		t.Fatalf("CreateUser() returned error: %v", err)
	}

	t.Run("creates collection successfully", func(t *testing.T) {
		description := "Test Description"
		collection, err := db.CreateCollection(ctx, user.ID, "Test Collection", &description)
		if err != nil {
			t.Fatalf("CreateCollection() returned error: %v", err)
		}

		if collection == nil {
			t.Fatal("CreateCollection() returned nil collection")
		}
		if collection.ID == 0 {
			t.Error("CreateCollection() returned collection with ID = 0")
		}
		if collection.UserID != user.ID {
			t.Errorf("CreateCollection() collection.UserID = %v, want %v", collection.UserID, user.ID)
		}
		if collection.Name != "Test Collection" {
			t.Errorf("CreateCollection() collection.Name = %v, want %v", collection.Name, "Test Collection")
		}
		if collection.Description == nil || *collection.Description != description {
			t.Errorf("CreateCollection() collection.Description = %v, want %v", collection.Description, description)
		}
	})

	t.Run("creates collection without description", func(t *testing.T) {
		collection, err := db.CreateCollection(ctx, user.ID, "No Description Collection", nil)
		if err != nil {
			t.Fatalf("CreateCollection() returned error: %v", err)
		}

		if collection.Description != nil {
			t.Errorf("CreateCollection() collection.Description = %v, want nil", collection.Description)
		}
	})

	t.Run("fails on duplicate name for same user", func(t *testing.T) {
		_, err := db.CreateCollection(ctx, user.ID, "Duplicate Name", nil)
		if err != nil {
			t.Fatalf("CreateCollection() first call returned error: %v", err)
		}

		_, err = db.CreateCollection(ctx, user.ID, "Duplicate Name", nil)
		if err == nil {
			t.Error("CreateCollection() should fail on duplicate name")
		}
		if err != ErrDuplicateCollectionName {
			t.Errorf("CreateCollection() error = %v, want %v", err, ErrDuplicateCollectionName)
		}
	})
}

func TestDB_GetCollectionByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user and collection
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "getcol@example.com", string(hash), "Get Col User")
	collection, _ := db.CreateCollection(ctx, user.ID, "Get By ID", nil)

	t.Run("returns collection when exists", func(t *testing.T) {
		result, err := db.GetCollectionByID(ctx, collection.ID, user.ID)
		if err != nil {
			t.Fatalf("GetCollectionByID() returned error: %v", err)
		}
		if result == nil {
			t.Fatal("GetCollectionByID() returned nil for existing collection")
		}
		if result.ID != collection.ID {
			t.Errorf("GetCollectionByID() result.ID = %v, want %v", result.ID, collection.ID)
		}
	})

	t.Run("returns nil for non-existent collection", func(t *testing.T) {
		result, err := db.GetCollectionByID(ctx, 99999, user.ID)
		if err != nil {
			t.Fatalf("GetCollectionByID() returned error: %v", err)
		}
		if result != nil {
			t.Error("GetCollectionByID() should return nil for non-existent collection")
		}
	})

	t.Run("returns nil for wrong user", func(t *testing.T) {
		result, err := db.GetCollectionByID(ctx, collection.ID, 99999)
		if err != nil {
			t.Fatalf("GetCollectionByID() returned error: %v", err)
		}
		if result != nil {
			t.Error("GetCollectionByID() should return nil for wrong user")
		}
	})
}

func TestDB_GetCollectionsByUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "listcol@example.com", string(hash), "List Col User")

	t.Run("returns empty slice for user with no collections", func(t *testing.T) {
		collections, err := db.GetCollectionsByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetCollectionsByUser() returned error: %v", err)
		}
		if collections == nil {
			t.Fatal("GetCollectionsByUser() returned nil")
		}
		if len(collections) != 0 {
			t.Errorf("GetCollectionsByUser() returned %d collections, want 0", len(collections))
		}
	})

	t.Run("returns all user collections", func(t *testing.T) {
		// Create some collections
		db.CreateCollection(ctx, user.ID, "Collection 1", nil)
		db.CreateCollection(ctx, user.ID, "Collection 2", nil)
		db.CreateCollection(ctx, user.ID, "Collection 3", nil)

		collections, err := db.GetCollectionsByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetCollectionsByUser() returned error: %v", err)
		}
		if len(collections) != 3 {
			t.Errorf("GetCollectionsByUser() returned %d collections, want 3", len(collections))
		}
	})
}

func TestDB_UpdateCollection(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create user and collection
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "update@example.com", string(hash), "Update User")
	collection, _ := db.CreateCollection(ctx, user.ID, "Original Name", nil)

	t.Run("updates collection successfully", func(t *testing.T) {
		newDescription := "New Description"
		updated, err := db.UpdateCollection(ctx, collection.ID, user.ID, "Updated Name", &newDescription)
		if err != nil {
			t.Fatalf("UpdateCollection() returned error: %v", err)
		}

		if updated.Name != "Updated Name" {
			t.Errorf("UpdateCollection() updated.Name = %v, want %v", updated.Name, "Updated Name")
		}
		if updated.Description == nil || *updated.Description != newDescription {
			t.Errorf("UpdateCollection() updated.Description = %v, want %v", updated.Description, newDescription)
		}
	})
}

func TestDB_DeleteCollection(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create user and collection
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "delete@example.com", string(hash), "Delete User")
	collection, _ := db.CreateCollection(ctx, user.ID, "To Delete", nil)

	t.Run("deletes collection successfully", func(t *testing.T) {
		err := db.DeleteCollection(ctx, collection.ID, user.ID)
		if err != nil {
			t.Fatalf("DeleteCollection() returned error: %v", err)
		}

		// Verify collection was deleted
		result, _ := db.GetCollectionByID(ctx, collection.ID, user.ID)
		if result != nil {
			t.Error("DeleteCollection() did not delete collection")
		}
	})

	t.Run("does not error on non-existent collection", func(t *testing.T) {
		err := db.DeleteCollection(ctx, 99999, user.ID)
		if err != nil {
			t.Errorf("DeleteCollection() returned error for non-existent collection: %v", err)
		}
	})
}
