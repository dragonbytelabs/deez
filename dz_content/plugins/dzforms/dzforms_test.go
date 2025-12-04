package dzforms

import (
	"context"
	"net/http"
	"testing"

	"dragonbytelabs/dz/internal/plugins"
)

func mockRequireAuth(h http.Handler) http.Handler {
	return h
}

func TestPluginImplementsInterface(t *testing.T) {
	// Ensure Plugin implements the plugins.Plugin interface
	var _ plugins.Plugin = (*Plugin)(nil)
}

func TestNew(t *testing.T) {
	p := New()
	if p == nil {
		t.Fatal("expected non-nil plugin")
	}
}

func TestPluginName(t *testing.T) {
	p := New()
	if p.Name() != "dzforms" {
		t.Errorf("expected name 'dzforms', got '%s'", p.Name())
	}
}

func TestPluginDisplayName(t *testing.T) {
	p := New()
	if p.DisplayName() != "DragonByteForm" {
		t.Errorf("expected display name 'DragonByteForm', got '%s'", p.DisplayName())
	}
}

func TestPluginDescription(t *testing.T) {
	p := New()
	if p.Description() == "" {
		t.Error("expected non-empty description")
	}
}

func TestPluginVersion(t *testing.T) {
	p := New()
	if p.Version() != "1.0.0" {
		t.Errorf("expected version '1.0.0', got '%s'", p.Version())
	}
}

func TestPluginRegister(t *testing.T) {
	p := New()
	mux := http.NewServeMux()
	ctx := &plugins.PluginContext{
		Mux:         mux,
		DB:          nil, // Will be nil for this test
		RequireAuth: mockRequireAuth,
	}

	err := p.Register(ctx)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestPluginOnActivate(t *testing.T) {
	p := New()
	ctx := context.Background()

	err := p.OnActivate(ctx)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestPluginOnDeactivate(t *testing.T) {
	p := New()
	ctx := context.Background()

	err := p.OnDeactivate(ctx)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
