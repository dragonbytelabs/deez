package routes

import (
	"encoding/json"
	"net/http"

	"dragonbytelabs/dz/internal/dbx"
)

func RegisterPlugins(mux *http.ServeMux, db *dbx.DB) {
	// Get all plugins
	mux.Handle("GET /api/plugins", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		plugins, err := db.GetAllPlugins(r.Context())
		if err != nil {
			http.Error(w, "failed to get plugins", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"plugins": plugins,
		})
	})))

	// Get active plugins (for sidebar menu)
	mux.Handle("GET /api/plugins/active", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		plugins, err := db.GetActivePlugins(r.Context())
		if err != nil {
			http.Error(w, "failed to get active plugins", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"plugins": plugins,
		})
	})))

	// Get single plugin by name
	mux.Handle("GET /api/plugins/{name}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")
		plugin, err := db.GetPluginByName(r.Context(), name)
		if err != nil {
			http.Error(w, "failed to get plugin", http.StatusInternalServerError)
			return
		}

		if plugin == nil {
			http.Error(w, "plugin not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"plugin": plugin,
		})
	})))

	// Activate/deactivate plugin
	mux.Handle("PUT /api/plugins/{name}/status", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		var in struct {
			IsActive bool `json:"is_active"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		// Check if plugin exists
		plugin, err := db.GetPluginByName(r.Context(), name)
		if err != nil {
			http.Error(w, "failed to get plugin", http.StatusInternalServerError)
			return
		}
		if plugin == nil {
			http.Error(w, "plugin not found", http.StatusNotFound)
			return
		}

		if err := db.UpdatePluginStatus(r.Context(), name, in.IsActive); err != nil {
			http.Error(w, "failed to update plugin status", http.StatusInternalServerError)
			return
		}

		// Get updated plugin
		updatedPlugin, err := db.GetPluginByName(r.Context(), name)
		if err != nil {
			http.Error(w, "failed to get updated plugin", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"plugin":  updatedPlugin,
		})
	})))

	// Check for plugin updates (placeholder - returns current version)
	mux.Handle("GET /api/plugins/{name}/check-updates", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		plugin, err := db.GetPluginByName(r.Context(), name)
		if err != nil {
			http.Error(w, "failed to get plugin", http.StatusInternalServerError)
			return
		}
		if plugin == nil {
			http.Error(w, "plugin not found", http.StatusNotFound)
			return
		}

		// Placeholder: In a real implementation, this would check an external source
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"plugin":           plugin,
			"current_version":  plugin.Version,
			"latest_version":   plugin.Version,
			"update_available": false,
		})
	})))
}
