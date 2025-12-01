package dbx

import (
	"context"
)

// GetSiteSetting retrieves a site setting by key
func (d *DB) GetSiteSetting(ctx context.Context, key string) (string, error) {
	query := MustQuery("get_site_setting.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, query, map[string]interface{}{"setting_key": key})
	if err != nil {
		return "", err
	}
	defer rows.Close()

	var value string
	if rows.Next() {
		if err := rows.Scan(&value); err != nil {
			return "", err
		}
	}

	return value, nil
}

// UpdateSiteSetting updates a site setting value
func (d *DB) UpdateSiteSetting(ctx context.Context, key, value string) error {
	query := MustQuery("update_site_setting.sql")

	_, err := d.DBX.NamedExecContext(ctx, query, map[string]interface{}{
		"setting_key":   key,
		"setting_value": value,
	})
	return err
}

// GetActiveTheme retrieves the currently active theme
func (d *DB) GetActiveTheme(ctx context.Context) (string, error) {
	return d.GetSiteSetting(ctx, "active_theme")
}

// SetActiveTheme sets the active theme
func (d *DB) SetActiveTheme(ctx context.Context, themeName string) error {
	return d.UpdateSiteSetting(ctx, "active_theme", themeName)
}

// IsPublicLoginEnabled checks if public login is enabled
func (d *DB) IsPublicLoginEnabled(ctx context.Context) (bool, error) {
	value, err := d.GetSiteSetting(ctx, "public_login_enabled")
	if err != nil {
		return false, err
	}
	return value == "true", nil
}

// SetPublicLoginEnabled enables or disables public login
func (d *DB) SetPublicLoginEnabled(ctx context.Context, enabled bool) error {
	value := "false"
	if enabled {
		value = "true"
	}
	return d.UpdateSiteSetting(ctx, "public_login_enabled", value)
}

// IsPublicRegisterEnabled checks if public registration is enabled
func (d *DB) IsPublicRegisterEnabled(ctx context.Context) (bool, error) {
	value, err := d.GetSiteSetting(ctx, "public_register_enabled")
	if err != nil {
		return false, err
	}
	return value == "true", nil
}

// SetPublicRegisterEnabled enables or disables public registration
func (d *DB) SetPublicRegisterEnabled(ctx context.Context, enabled bool) error {
	value := "false"
	if enabled {
		value = "true"
	}
	return d.UpdateSiteSetting(ctx, "public_register_enabled", value)
}

// IsFreshInstall checks if this is a fresh install
func (d *DB) IsFreshInstall(ctx context.Context) (bool, error) {
	value, err := d.GetSiteSetting(ctx, "fresh_install")
	if err != nil {
		return false, err
	}
	return value == "true", nil
}

// SetFreshInstall sets the fresh install status
func (d *DB) SetFreshInstall(ctx context.Context, isFresh bool) error {
	value := "false"
	if isFresh {
		value = "true"
	}
	return d.UpdateSiteSetting(ctx, "fresh_install", value)
}
