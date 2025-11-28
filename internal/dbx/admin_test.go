package dbx

import (
	"context"
	"testing"
)

func TestDB_GetAllTables(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	tables, err := db.GetAllTables(ctx)
	if err != nil {
		t.Fatalf("GetAllTables() returned error: %v", err)
	}

	if tables == nil {
		t.Fatal("GetAllTables() returned nil")
	}

	// Should have at least the tables created by migrations
	expectedTables := map[string]bool{
		"users":             false,
		"sessions":          false,
		"collections":       false,
		"schema_migrations": false,
	}

	for _, table := range tables {
		if _, ok := expectedTables[table]; ok {
			expectedTables[table] = true
		}
	}

	for table, found := range expectedTables {
		if !found {
			t.Errorf("Expected table %q not found in GetAllTables() result", table)
		}
	}
}

func TestDB_GetTableData(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("returns data for existing table", func(t *testing.T) {
		data, err := db.GetTableData(ctx, "schema_migrations")
		if err != nil {
			t.Fatalf("GetTableData() returned error: %v", err)
		}

		if data == nil {
			t.Fatal("GetTableData() returned nil")
		}
		// Should have migration records
		if len(data) == 0 {
			t.Error("GetTableData() returned empty data for schema_migrations")
		}
	})

	t.Run("returns error for non-existent table", func(t *testing.T) {
		_, err := db.GetTableData(ctx, "nonexistent_table")
		if err == nil {
			t.Error("GetTableData() should return error for non-existent table")
		}
	})
}

func TestDB_checkTableExists(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("returns true for existing table", func(t *testing.T) {
		exists, err := db.checkTableExists(ctx, "users")
		if err != nil {
			t.Fatalf("checkTableExists() returned error: %v", err)
		}
		if !exists {
			t.Error("checkTableExists() returned false for existing table")
		}
	})

	t.Run("returns false for non-existent table", func(t *testing.T) {
		exists, err := db.checkTableExists(ctx, "nonexistent_table")
		if err != nil {
			t.Fatalf("checkTableExists() returned error: %v", err)
		}
		if exists {
			t.Error("checkTableExists() returned true for non-existent table")
		}
	})
}
