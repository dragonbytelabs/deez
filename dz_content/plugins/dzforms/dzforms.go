// Package dzforms provides a form builder plugin for the deez CMS.
// This plugin allows administrators to create and manage custom forms.
package dzforms

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"dragonbytelabs/dz/internal/plugins"
)

// Plugin implements the DragonByteForm plugin
type Plugin struct{}

// New creates a new instance of the DragonByteForm plugin
func New() *Plugin {
	return &Plugin{}
}

// Name returns the unique identifier for the plugin
func (p *Plugin) Name() string {
	return "dzforms"
}

// DisplayName returns the human-readable name for the plugin
func (p *Plugin) DisplayName() string {
	return "DragonByteForm"
}

// Description returns a brief description of what the plugin does
func (p *Plugin) Description() string {
	return "A simple form builder plugin for Deez"
}

// Version returns the semantic version of the plugin
func (p *Plugin) Version() string {
	return "1.0.0"
}

// Register registers the plugin routes and resources
func (p *Plugin) Register(ctx *plugins.PluginContext) error {
	mux := ctx.Mux
	db := ctx.DB
	requireAuth := ctx.RequireAuth

	// Get all forms
	mux.Handle("GET /api/dzforms/forms", requireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		forms, err := db.GetAllForms(r.Context())
		if err != nil {
			http.Error(w, "failed to get forms", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"forms": forms,
		})
	})))

	// Get single form by ID
	mux.Handle("GET /api/dzforms/forms/{id}", requireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		form, err := db.GetFormByID(r.Context(), id)
		if err != nil {
			http.Error(w, "failed to get form", http.StatusInternalServerError)
			return
		}
		if form == nil {
			http.Error(w, "form not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"form": form,
		})
	})))

	// Create new form
	mux.Handle("POST /api/dzforms/forms", requireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Fields      string `json:"fields"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.Name == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		id, err := db.CreateForm(r.Context(), in.Name, in.Description, in.Fields)
		if err != nil {
			http.Error(w, "failed to create form", http.StatusInternalServerError)
			return
		}

		form, err := db.GetFormByID(r.Context(), id)
		if err != nil {
			http.Error(w, "failed to get created form", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"form":    form,
		})
	})))

	// Update form
	mux.Handle("PUT /api/dzforms/forms/{id}", requireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		var in struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Fields      string `json:"fields"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.Name == "" {
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		// Check if form exists
		existing, err := db.GetFormByID(r.Context(), id)
		if err != nil {
			http.Error(w, "failed to get form", http.StatusInternalServerError)
			return
		}
		if existing == nil {
			http.Error(w, "form not found", http.StatusNotFound)
			return
		}

		if err := db.UpdateForm(r.Context(), id, in.Name, in.Description, in.Fields); err != nil {
			http.Error(w, "failed to update form", http.StatusInternalServerError)
			return
		}

		form, err := db.GetFormByID(r.Context(), id)
		if err != nil {
			http.Error(w, "failed to get updated form", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"form":    form,
		})
	})))

	return nil
}

// OnActivate is called when the plugin is activated
func (p *Plugin) OnActivate(ctx context.Context) error {
	// Nothing special needed on activation
	return nil
}

// OnDeactivate is called when the plugin is deactivated
func (p *Plugin) OnDeactivate(ctx context.Context) error {
	// Nothing special needed on deactivation
	return nil
}

// Ensure Plugin implements the plugins.Plugin interface
var _ plugins.Plugin = (*Plugin)(nil)
