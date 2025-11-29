package dbx

import (
	"context"

	"dragonbytelabs/dz/internal/models"
)

// DefaultPluginVersion is the default version assigned to new plugins
const DefaultPluginVersion = "1.0.0"

// GetAllPlugins returns all plugins
func (d *DB) GetAllPlugins(ctx context.Context) ([]models.Plugin, error) {
	query := MustQuery("get_all_plugins.sql")
	rows, err := d.DBX.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plugins []models.Plugin
	for rows.Next() {
		var plugin models.Plugin
		if err := rows.StructScan(&plugin); err != nil {
			return nil, err
		}
		plugins = append(plugins, plugin)
	}

	return plugins, nil
}

// GetActivePlugins returns all active plugins
func (d *DB) GetActivePlugins(ctx context.Context) ([]models.Plugin, error) {
	query := MustQuery("get_active_plugins.sql")
	rows, err := d.DBX.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plugins []models.Plugin
	for rows.Next() {
		var plugin models.Plugin
		if err := rows.StructScan(&plugin); err != nil {
			return nil, err
		}
		plugins = append(plugins, plugin)
	}

	return plugins, nil
}

// GetPluginByName returns a plugin by its name
func (d *DB) GetPluginByName(ctx context.Context, name string) (*models.Plugin, error) {
	query := MustQuery("get_plugin_by_name.sql")
	rows, err := d.DBX.NamedQueryContext(ctx, query, map[string]interface{}{"name": name})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if rows.Next() {
		var plugin models.Plugin
		if err := rows.StructScan(&plugin); err != nil {
			return nil, err
		}
		return &plugin, nil
	}

	return nil, nil
}

// UpdatePluginStatus activates or deactivates a plugin
func (d *DB) UpdatePluginStatus(ctx context.Context, name string, isActive bool) error {
	query := MustQuery("update_plugin_status.sql")
	_, err := d.DBX.NamedExecContext(ctx, query, map[string]interface{}{
		"name":      name,
		"is_active": isActive,
	})
	return err
}

// AddPlugin adds a new plugin to the database
func (d *DB) AddPlugin(ctx context.Context, name string) error {
	query := MustQuery("add_plugin.sql")
	_, err := d.DBX.NamedExecContext(ctx, query, map[string]interface{}{
		"name":         name,
		"display_name": name,
		"version":      DefaultPluginVersion,
	})
	return err
}
