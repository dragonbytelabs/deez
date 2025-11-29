package dbx

import (
	"context"
	"fmt"
)

// GetAllTables returns all table names in the database
func (d *DB) GetAllTables(ctx context.Context) ([]string, error) {
	query := MustQuery("admin_get_all_tables.sql")
	rows, err := d.DBX.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tables []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		tables = append(tables, name)
	}

	return tables, nil
}

// tableExists checks if a specific table exists in the database
func (d *DB) checkTableExists(ctx context.Context, tableName string) (bool, error) {
	query := MustQuery("admin_check_table_exists.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, query, map[string]interface{}{
		"table_name": tableName,
	})
	if err != nil {
		return false, err
	}
	defer rows.Close()

	var count int
	if rows.Next() {
		if err := rows.Scan(&count); err != nil {
			return false, err
		}
	}

	return count > 0, nil
}

// GetTableData returns all rows from a table
func (d *DB) GetTableData(ctx context.Context, tableName string) ([]map[string]interface{}, error) {
	exists, err := d.checkTableExists(ctx, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to check table existence: %w", err)
	}

	if !exists {
		return nil, fmt.Errorf("table %s does not exist", tableName)
	}

	// Load query template and inject validated table name
	queryTemplate := MustQuery("admin_get_table_data.sql")
	query := fmt.Sprintf(queryTemplate, tableName)

	rows, err := d.DBX.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]map[string]interface{}, 0)
	for rows.Next() {
		row := make(map[string]interface{})
		if err := rows.MapScan(row); err != nil {
			return nil, err
		}
		results = append(results, row)
	}

	return results, nil
}
