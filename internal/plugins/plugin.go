// Package plugins provides the core plugin system interfaces and types
// that allow plugins to extend the deez server functionality.
package plugins

import (
	"context"
	"net/http"

	"dragonbytelabs/dz/internal/dbx"
)

// Plugin defines the interface that all plugins must implement
// to extend the core deez server functionality.
type Plugin interface {
	// Name returns the unique identifier for the plugin
	Name() string

	// DisplayName returns the human-readable name for the plugin
	DisplayName() string

	// Description returns a brief description of what the plugin does
	Description() string

	// Version returns the semantic version of the plugin
	Version() string

	// Register is called when the plugin is loaded and should register
	// any HTTP routes, database migrations, or other resources needed.
	// The PluginContext provides access to core server functionality.
	Register(ctx *PluginContext) error

	// OnActivate is called when a plugin is activated by the admin
	OnActivate(ctx context.Context) error

	// OnDeactivate is called when a plugin is deactivated by the admin
	OnDeactivate(ctx context.Context) error
}

// PluginContext provides plugins access to core server functionality
type PluginContext struct {
	// Mux is the HTTP request multiplexer for registering routes
	Mux *http.ServeMux

	// DB provides database access
	DB *dbx.DB

	// RequireAuth is a middleware function to protect routes
	RequireAuth func(http.Handler) http.Handler
}

// PluginInfo contains metadata about a registered plugin
type PluginInfo struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Description string `json:"description"`
	Version     string `json:"version"`
}

// Registry manages the registration and lifecycle of plugins
type Registry struct {
	plugins map[string]Plugin
	ctx     *PluginContext
}

// NewRegistry creates a new plugin registry
func NewRegistry(mux *http.ServeMux, db *dbx.DB, requireAuth func(http.Handler) http.Handler) *Registry {
	return &Registry{
		plugins: make(map[string]Plugin),
		ctx: &PluginContext{
			Mux:         mux,
			DB:          db,
			RequireAuth: requireAuth,
		},
	}
}

// Register adds a plugin to the registry and calls its Register method
func (r *Registry) Register(plugin Plugin) error {
	name := plugin.Name()
	r.plugins[name] = plugin
	return plugin.Register(r.ctx)
}

// Get returns a plugin by name, or nil if not found
func (r *Registry) Get(name string) Plugin {
	return r.plugins[name]
}

// List returns info about all registered plugins
func (r *Registry) List() []PluginInfo {
	result := make([]PluginInfo, 0, len(r.plugins))
	for _, p := range r.plugins {
		result = append(result, PluginInfo{
			Name:        p.Name(),
			DisplayName: p.DisplayName(),
			Description: p.Description(),
			Version:     p.Version(),
		})
	}
	return result
}
