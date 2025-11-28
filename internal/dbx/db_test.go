package dbx

import (
	"context"
	"os"
	"testing"
)

// setupTestDB creates a temporary in-memory database for testing
func setupTestDB(t *testing.T) *DB {
	t.Helper()

	// Use in-memory SQLite for tests
	db, err := OpenSQLite(":memory:")
	if err != nil {
		t.Fatalf("failed to open test database: %v", err)
	}

	// Apply migrations
	ctx := context.Background()
	if err := db.ApplyMigrations(ctx); err != nil {
		t.Fatalf("failed to apply migrations: %v", err)
	}

	return db
}

func TestOpenSQLite(t *testing.T) {
	t.Run("opens in-memory database", func(t *testing.T) {
		db, err := OpenSQLite(":memory:")
		if err != nil {
			t.Fatalf("OpenSQLite(:memory:) returned error: %v", err)
		}
		defer db.Close()

		if db.SQL == nil {
			t.Error("OpenSQLite() returned db with nil SQL")
		}
		if db.DBX == nil {
			t.Error("OpenSQLite() returned db with nil DBX")
		}
	})

	t.Run("opens file database", func(t *testing.T) {
		// Create temp file
		tmpFile, err := os.CreateTemp("", "test-*.db")
		if err != nil {
			t.Fatalf("failed to create temp file: %v", err)
		}
		tmpFile.Close()
		defer os.Remove(tmpFile.Name())

		db, err := OpenSQLite(tmpFile.Name())
		if err != nil {
			t.Fatalf("OpenSQLite(%q) returned error: %v", tmpFile.Name(), err)
		}
		defer db.Close()

		if db.SQL == nil {
			t.Error("OpenSQLite() returned db with nil SQL")
		}
	})
}

func TestDB_Close(t *testing.T) {
	db, err := OpenSQLite(":memory:")
	if err != nil {
		t.Fatalf("OpenSQLite() returned error: %v", err)
	}

	err = db.Close()
	if err != nil {
		t.Errorf("Close() returned error: %v", err)
	}
}

func TestDB_ApplyMigrations(t *testing.T) {
	db, err := OpenSQLite(":memory:")
	if err != nil {
		t.Fatalf("OpenSQLite() returned error: %v", err)
	}
	defer db.Close()

	ctx := context.Background()

	// First run - should apply migrations
	err = db.ApplyMigrations(ctx)
	if err != nil {
		t.Errorf("ApplyMigrations() returned error: %v", err)
	}

	// Second run - should skip already applied
	err = db.ApplyMigrations(ctx)
	if err != nil {
		t.Errorf("ApplyMigrations() second run returned error: %v", err)
	}

	// Verify tables were created
	tables, err := db.GetAllTables(ctx)
	if err != nil {
		t.Fatalf("GetAllTables() returned error: %v", err)
	}

	expectedTables := map[string]bool{
		"users":             true,
		"sessions":          true,
		"collections":       true,
		"schema_migrations": true,
	}

	for _, table := range tables {
		if expectedTables[table] {
			delete(expectedTables, table)
		}
	}

	for table := range expectedTables {
		t.Errorf("Expected table %q not found", table)
	}
}

func TestMustQuery(t *testing.T) {
	// Test that MustQuery returns valid queries
	query := MustQuery("get_user_by_email.sql")
	if query == "" {
		t.Error("MustQuery() returned empty string")
	}

	// Test that query contains expected content
	if len(query) < 10 {
		t.Errorf("MustQuery() returned unexpectedly short query: %q", query)
	}
}
