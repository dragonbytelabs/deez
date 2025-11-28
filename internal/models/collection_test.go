package models

import (
	"testing"
	"time"
)

func TestCollection_Struct(t *testing.T) {
	now := time.Now()
	description := "Test description"

	collection := Collection{
		ID:          1,
		UserID:      2,
		Name:        "Test Collection",
		Description: &description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if collection.ID != 1 {
		t.Errorf("Collection.ID = %v, want %v", collection.ID, 1)
	}
	if collection.UserID != 2 {
		t.Errorf("Collection.UserID = %v, want %v", collection.UserID, 2)
	}
	if collection.Name != "Test Collection" {
		t.Errorf("Collection.Name = %v, want %v", collection.Name, "Test Collection")
	}
	if *collection.Description != description {
		t.Errorf("Collection.Description = %v, want %v", *collection.Description, description)
	}
	if !collection.CreatedAt.Equal(now) {
		t.Errorf("Collection.CreatedAt = %v, want %v", collection.CreatedAt, now)
	}
	if !collection.UpdatedAt.Equal(now) {
		t.Errorf("Collection.UpdatedAt = %v, want %v", collection.UpdatedAt, now)
	}
}

func TestCollection_NilDescription(t *testing.T) {
	collection := Collection{
		ID:     1,
		UserID: 2,
		Name:   "Test Collection",
	}

	if collection.Description != nil {
		t.Errorf("Collection.Description = %v, want nil", collection.Description)
	}
}
