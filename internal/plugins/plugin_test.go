package plugins

import (
	"context"
	"net/http"
	"testing"

	"dragonbytelabs/dz/internal/dbx"
)

// testPlugin is a mock plugin for testing
type testPlugin struct {
	name        string
	displayName string
	description string
	version     string
	registered  bool
	activated   bool
	deactivated bool
}

func (p *testPlugin) Name() string        { return p.name }
func (p *testPlugin) DisplayName() string { return p.displayName }
func (p *testPlugin) Description() string { return p.description }
func (p *testPlugin) Version() string     { return p.version }

func (p *testPlugin) Register(ctx *PluginContext) error {
	p.registered = true
	return nil
}

func (p *testPlugin) OnActivate(ctx context.Context) error {
	p.activated = true
	return nil
}

func (p *testPlugin) OnDeactivate(ctx context.Context) error {
	p.deactivated = true
	return nil
}

func newTestPlugin() *testPlugin {
	return &testPlugin{
		name:        "test-plugin",
		displayName: "Test Plugin",
		description: "A test plugin",
		version:     "1.0.0",
	}
}

func mockRequireAuth(h http.Handler) http.Handler {
	return h
}

func TestNewRegistry(t *testing.T) {
	mux := http.NewServeMux()
	registry := NewRegistry(mux, nil, mockRequireAuth)

	if registry == nil {
		t.Fatal("expected non-nil registry")
	}

	if registry.ctx == nil {
		t.Fatal("expected non-nil context")
	}

	if registry.ctx.Mux != mux {
		t.Error("expected mux to be set")
	}
}

func TestRegisterPlugin(t *testing.T) {
	mux := http.NewServeMux()
	registry := NewRegistry(mux, nil, mockRequireAuth)
	plugin := newTestPlugin()

	err := registry.Register(plugin)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !plugin.registered {
		t.Error("expected plugin to be registered")
	}
}

func TestGetPlugin(t *testing.T) {
	mux := http.NewServeMux()
	registry := NewRegistry(mux, nil, mockRequireAuth)
	plugin := newTestPlugin()

	if err := registry.Register(plugin); err != nil {
		t.Fatalf("failed to register plugin: %v", err)
	}

	retrieved := registry.Get("test-plugin")
	if retrieved == nil {
		t.Fatal("expected to retrieve plugin")
	}

	if retrieved.Name() != "test-plugin" {
		t.Errorf("expected name 'test-plugin', got '%s'", retrieved.Name())
	}
}

func TestGetPluginNotFound(t *testing.T) {
	mux := http.NewServeMux()
	registry := NewRegistry(mux, nil, mockRequireAuth)

	retrieved := registry.Get("nonexistent")
	if retrieved != nil {
		t.Error("expected nil for nonexistent plugin")
	}
}

func TestListPlugins(t *testing.T) {
	mux := http.NewServeMux()
	registry := NewRegistry(mux, nil, mockRequireAuth)

	plugin1 := &testPlugin{
		name:        "plugin-1",
		displayName: "Plugin 1",
		description: "First plugin",
		version:     "1.0.0",
	}
	plugin2 := &testPlugin{
		name:        "plugin-2",
		displayName: "Plugin 2",
		description: "Second plugin",
		version:     "2.0.0",
	}

	if err := registry.Register(plugin1); err != nil {
		t.Fatalf("failed to register plugin1: %v", err)
	}
	if err := registry.Register(plugin2); err != nil {
		t.Fatalf("failed to register plugin2: %v", err)
	}

	list := registry.List()
	if len(list) != 2 {
		t.Fatalf("expected 2 plugins, got %d", len(list))
	}

	// Check that both plugins are in the list
	names := make(map[string]bool)
	for _, info := range list {
		names[info.Name] = true
	}

	if !names["plugin-1"] {
		t.Error("expected plugin-1 in list")
	}
	if !names["plugin-2"] {
		t.Error("expected plugin-2 in list")
	}
}

func TestPluginInterface(t *testing.T) {
	// Ensure testPlugin implements Plugin interface
	var _ Plugin = (*testPlugin)(nil)
}

func TestPluginContext(t *testing.T) {
	mux := http.NewServeMux()
	var db *dbx.DB

	ctx := &PluginContext{
		Mux:         mux,
		DB:          db,
		RequireAuth: mockRequireAuth,
	}

	if ctx.Mux == nil {
		t.Error("expected Mux to be set")
	}

	if ctx.RequireAuth == nil {
		t.Error("expected RequireAuth to be set")
	}
}
