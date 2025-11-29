package dbx

import (
	"context"
	"testing"
)

func TestGetAllForms(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	forms, err := db.GetAllForms(ctx)
	if err != nil {
		t.Fatalf("GetAllForms() returned error: %v", err)
	}

	// After migrations, should have the default form
	if len(forms) == 0 {
		t.Error("GetAllForms() returned empty slice, expected at least one form")
	}

	// Check that default form exists with id starting from 1 (SQLite autoincrement)
	if forms[0].Name != "Default Form" {
		t.Errorf("first form name = %q, want %q", forms[0].Name, "Default Form")
	}
}

func TestGetFormByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Get all forms first to find the ID
	forms, err := db.GetAllForms(ctx)
	if err != nil || len(forms) == 0 {
		t.Fatalf("GetAllForms() returned error or empty: %v", err)
	}

	t.Run("existing form", func(t *testing.T) {
		form, err := db.GetFormByID(ctx, forms[0].ID)
		if err != nil {
			t.Fatalf("GetFormByID() returned error: %v", err)
		}

		if form == nil {
			t.Fatal("GetFormByID() returned nil for existing form")
		}

		if form.Name != "Default Form" {
			t.Errorf("form name = %q, want %q", form.Name, "Default Form")
		}
	})

	t.Run("non-existing form", func(t *testing.T) {
		form, err := db.GetFormByID(ctx, 99999)
		if err != nil {
			t.Fatalf("GetFormByID() returned error: %v", err)
		}

		if form != nil {
			t.Errorf("GetFormByID() returned %v for non-existing form, want nil", form)
		}
	})
}

func TestCreateForm(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	id, err := db.CreateForm(ctx, "Test Form", "A test form", `[{"name":"email","type":"text"}]`)
	if err != nil {
		t.Fatalf("CreateForm() returned error: %v", err)
	}

	if id == 0 {
		t.Error("CreateForm() returned id 0")
	}

	// Verify the form was created
	form, err := db.GetFormByID(ctx, id)
	if err != nil {
		t.Fatalf("GetFormByID() returned error: %v", err)
	}

	if form == nil {
		t.Fatal("GetFormByID() returned nil for newly created form")
	}

	if form.Name != "Test Form" {
		t.Errorf("form name = %q, want %q", form.Name, "Test Form")
	}
}

func TestUpdateForm(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a form first
	id, err := db.CreateForm(ctx, "Original Name", "Original description", "[]")
	if err != nil {
		t.Fatalf("CreateForm() returned error: %v", err)
	}

	// Update the form
	err = db.UpdateForm(ctx, id, "Updated Name", "Updated description", `[{"name":"name","type":"text"}]`)
	if err != nil {
		t.Fatalf("UpdateForm() returned error: %v", err)
	}

	// Verify the update
	form, err := db.GetFormByID(ctx, id)
	if err != nil {
		t.Fatalf("GetFormByID() returned error: %v", err)
	}

	if form.Name != "Updated Name" {
		t.Errorf("form name = %q, want %q", form.Name, "Updated Name")
	}

	if *form.Description != "Updated description" {
		t.Errorf("form description = %q, want %q", *form.Description, "Updated description")
	}

	if form.Fields != `[{"name":"name","type":"text"}]` {
		t.Errorf("form fields = %q, want %q", form.Fields, `[{"name":"name","type":"text"}]`)
	}
}
