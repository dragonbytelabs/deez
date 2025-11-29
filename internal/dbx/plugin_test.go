package dbx

import (
	"context"
	"testing"
)

func TestGetAllPlugins(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	plugins, err := db.GetAllPlugins(ctx)
	if err != nil {
		t.Fatalf("GetAllPlugins() returned error: %v", err)
	}

	// After migrations, should have the dzforms plugin
	if len(plugins) == 0 {
		t.Error("GetAllPlugins() returned empty slice, expected at least one plugin")
	}

	// Check that dzforms plugin exists
	var found bool
	for _, p := range plugins {
		if p.Name == "dzforms" {
			found = true
			if p.DisplayName != "DragonByteForm" {
				t.Errorf("dzforms plugin has wrong display name: got %q, want %q", p.DisplayName, "DragonByteForm")
			}
			if p.IsActive {
				t.Error("dzforms plugin should not be active by default")
			}
			break
		}
	}
	if !found {
		t.Error("dzforms plugin not found in plugins list")
	}
}

func TestGetPluginByName(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("existing plugin", func(t *testing.T) {
		plugin, err := db.GetPluginByName(ctx, "dzforms")
		if err != nil {
			t.Fatalf("GetPluginByName() returned error: %v", err)
		}

		if plugin == nil {
			t.Fatal("GetPluginByName() returned nil for existing plugin")
		}

		if plugin.Name != "dzforms" {
			t.Errorf("plugin name = %q, want %q", plugin.Name, "dzforms")
		}
	})

	t.Run("non-existing plugin", func(t *testing.T) {
		plugin, err := db.GetPluginByName(ctx, "nonexistent")
		if err != nil {
			t.Fatalf("GetPluginByName() returned error: %v", err)
		}

		if plugin != nil {
			t.Errorf("GetPluginByName() returned %v for non-existing plugin, want nil", plugin)
		}
	})
}

func TestUpdatePluginStatus(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Get initial state
	plugin, err := db.GetPluginByName(ctx, "dzforms")
	if err != nil {
		t.Fatalf("GetPluginByName() returned error: %v", err)
	}
	if plugin.IsActive {
		t.Error("plugin should not be active initially")
	}

	// Activate plugin
	err = db.UpdatePluginStatus(ctx, "dzforms", true)
	if err != nil {
		t.Fatalf("UpdatePluginStatus(true) returned error: %v", err)
	}

	// Check it's active
	plugin, _ = db.GetPluginByName(ctx, "dzforms")
	if !plugin.IsActive {
		t.Error("plugin should be active after UpdatePluginStatus(true)")
	}

	// Deactivate plugin
	err = db.UpdatePluginStatus(ctx, "dzforms", false)
	if err != nil {
		t.Fatalf("UpdatePluginStatus(false) returned error: %v", err)
	}

	// Check it's inactive
	plugin, _ = db.GetPluginByName(ctx, "dzforms")
	if plugin.IsActive {
		t.Error("plugin should be inactive after UpdatePluginStatus(false)")
	}
}

func TestGetActivePlugins(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Initially no active plugins
	activePlugins, err := db.GetActivePlugins(ctx)
	if err != nil {
		t.Fatalf("GetActivePlugins() returned error: %v", err)
	}
	if len(activePlugins) != 0 {
		t.Errorf("GetActivePlugins() returned %d plugins, expected 0", len(activePlugins))
	}

	// Activate a plugin
	err = db.UpdatePluginStatus(ctx, "dzforms", true)
	if err != nil {
		t.Fatalf("UpdatePluginStatus() returned error: %v", err)
	}

	// Now should have one active plugin
	activePlugins, err = db.GetActivePlugins(ctx)
	if err != nil {
		t.Fatalf("GetActivePlugins() returned error: %v", err)
	}
	if len(activePlugins) != 1 {
		t.Errorf("GetActivePlugins() returned %d plugins, expected 1", len(activePlugins))
	}
	if activePlugins[0].Name != "dzforms" {
		t.Errorf("active plugin name = %q, want %q", activePlugins[0].Name, "dzforms")
	}
}
