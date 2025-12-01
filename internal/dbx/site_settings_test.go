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

		// Default should be 'default' theme
		if theme != "default" {
			t.Errorf("expected 'default' theme, got %q", theme)
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

		// Should be empty from previous test (deactivate theme)
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

func TestPublicAuthSettings(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	ctx := context.Background()

	t.Run("public login disabled by default", func(t *testing.T) {
		enabled, err := db.IsPublicLoginEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicLoginEnabled failed: %v", err)
		}

		if enabled {
			t.Error("expected public login to be disabled by default")
		}
	})

	t.Run("public register disabled by default", func(t *testing.T) {
		enabled, err := db.IsPublicRegisterEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicRegisterEnabled failed: %v", err)
		}

		if enabled {
			t.Error("expected public register to be disabled by default")
		}
	})

	t.Run("enable and disable public login", func(t *testing.T) {
		// Enable
		err := db.SetPublicLoginEnabled(ctx, true)
		if err != nil {
			t.Fatalf("SetPublicLoginEnabled(true) failed: %v", err)
		}

		enabled, err := db.IsPublicLoginEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicLoginEnabled failed: %v", err)
		}

		if !enabled {
			t.Error("expected public login to be enabled")
		}

		// Disable
		err = db.SetPublicLoginEnabled(ctx, false)
		if err != nil {
			t.Fatalf("SetPublicLoginEnabled(false) failed: %v", err)
		}

		enabled, err = db.IsPublicLoginEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicLoginEnabled failed: %v", err)
		}

		if enabled {
			t.Error("expected public login to be disabled")
		}
	})

	t.Run("enable and disable public register", func(t *testing.T) {
		// Enable
		err := db.SetPublicRegisterEnabled(ctx, true)
		if err != nil {
			t.Fatalf("SetPublicRegisterEnabled(true) failed: %v", err)
		}

		enabled, err := db.IsPublicRegisterEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicRegisterEnabled failed: %v", err)
		}

		if !enabled {
			t.Error("expected public register to be enabled")
		}

		// Disable
		err = db.SetPublicRegisterEnabled(ctx, false)
		if err != nil {
			t.Fatalf("SetPublicRegisterEnabled(false) failed: %v", err)
		}

		enabled, err = db.IsPublicRegisterEnabled(ctx)
		if err != nil {
			t.Fatalf("IsPublicRegisterEnabled failed: %v", err)
		}

		if enabled {
			t.Error("expected public register to be disabled")
		}
	})
}
