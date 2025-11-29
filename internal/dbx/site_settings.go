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
