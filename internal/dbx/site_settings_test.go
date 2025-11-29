package dbx

import (
	"context"
	"testing"
)

func TestSiteSettings(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("get default active theme", func(t *testing.T) {
		theme, err := db.GetActiveTheme(ctx)
		if err != nil {
			t.Fatalf("GetActiveTheme failed: %v", err)
		}

		// Default should be empty string
		if theme != "" {
			t.Errorf("expected empty theme, got %q", theme)
		}
	})

	t.Run("set and get active theme", func(t *testing.T) {
		err := db.SetActiveTheme(ctx, "test-theme")
		if err != nil {
			t.Fatalf("SetActiveTheme failed: %v", err)
		}

		theme, err := db.GetActiveTheme(ctx)
		if err != nil {
			t.Fatalf("GetActiveTheme failed: %v", err)
		}

		if theme != "test-theme" {
			t.Errorf("expected 'test-theme', got %q", theme)
		}
	})

	t.Run("deactivate theme", func(t *testing.T) {
		// First set a theme
		err := db.SetActiveTheme(ctx, "another-theme")
		if err != nil {
			t.Fatalf("SetActiveTheme failed: %v", err)
		}

		// Then deactivate
		err = db.SetActiveTheme(ctx, "")
		if err != nil {
			t.Fatalf("SetActiveTheme (deactivate) failed: %v", err)
		}

		theme, err := db.GetActiveTheme(ctx)
		if err != nil {
			t.Fatalf("GetActiveTheme failed: %v", err)
		}

		if theme != "" {
			t.Errorf("expected empty theme after deactivation, got %q", theme)
		}
	})

	t.Run("get and update site setting", func(t *testing.T) {
		// Test with a custom setting key (using active_theme as it exists)
		value, err := db.GetSiteSetting(ctx, "active_theme")
		if err != nil {
			t.Fatalf("GetSiteSetting failed: %v", err)
		}

		// Should be empty from previous test
		if value != "" {
			t.Errorf("expected empty value, got %q", value)
		}

		// Update it
		err = db.UpdateSiteSetting(ctx, "active_theme", "custom-value")
		if err != nil {
			t.Fatalf("UpdateSiteSetting failed: %v", err)
		}

		// Verify the update
		value, err = db.GetSiteSetting(ctx, "active_theme")
		if err != nil {
			t.Fatalf("GetSiteSetting failed: %v", err)
		}

		if value != "custom-value" {
			t.Errorf("expected 'custom-value', got %q", value)
		}
	})
}
