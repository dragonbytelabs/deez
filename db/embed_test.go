package db

import (
	"io/fs"
	"testing"
)

func TestMigrationsFS(t *testing.T) {
	t.Run("contains migration files", func(t *testing.T) {
		entries, err := fs.ReadDir(MigrationsFS, "migrations")
		if err != nil {
			t.Fatalf("failed to read migrations directory: %v", err)
		}

		if len(entries) == 0 {
			t.Error("MigrationsFS should contain migration files")
		}

		// Check for expected migration files
		expectedMigrations := map[string]bool{
			"001_users.sql":       false,
			"002_sessions.sql":    false,
			"003_user_avatars.sql": false,
			"004_collections.sql": false,
		}

		for _, entry := range entries {
			if _, ok := expectedMigrations[entry.Name()]; ok {
				expectedMigrations[entry.Name()] = true
			}
		}

		for name, found := range expectedMigrations {
			if !found {
				t.Errorf("Expected migration %q not found", name)
			}
		}
	})

	t.Run("migration files are readable", func(t *testing.T) {
		content, err := MigrationsFS.ReadFile("migrations/001_users.sql")
		if err != nil {
			t.Fatalf("failed to read migration file: %v", err)
		}

		if len(content) == 0 {
			t.Error("migration file should not be empty")
		}

		// Should contain CREATE TABLE
		if !containsBytes(content, []byte("CREATE TABLE")) {
			t.Error("migration file should contain CREATE TABLE statement")
		}
	})
}

func TestQueriesFS(t *testing.T) {
	t.Run("contains query files", func(t *testing.T) {
		entries, err := fs.ReadDir(QueriesFS, "queries")
		if err != nil {
			t.Fatalf("failed to read queries directory: %v", err)
		}

		if len(entries) == 0 {
			t.Error("QueriesFS should contain query files")
		}

		// Check for some expected query files
		expectedQueries := map[string]bool{
			"create_user.sql":       false,
			"get_user_by_email.sql": false,
			"create_session.sql":    false,
			"create_collection.sql": false,
		}

		for _, entry := range entries {
			if _, ok := expectedQueries[entry.Name()]; ok {
				expectedQueries[entry.Name()] = true
			}
		}

		for name, found := range expectedQueries {
			if !found {
				t.Errorf("Expected query %q not found", name)
			}
		}
	})

	t.Run("query files are readable", func(t *testing.T) {
		content, err := QueriesFS.ReadFile("queries/create_user.sql")
		if err != nil {
			t.Fatalf("failed to read query file: %v", err)
		}

		if len(content) == 0 {
			t.Error("query file should not be empty")
		}

		// Should contain INSERT
		if !containsBytes(content, []byte("INSERT")) {
			t.Error("create_user.sql should contain INSERT statement")
		}
	})
}

func containsBytes(b, substr []byte) bool {
	for i := 0; i <= len(b)-len(substr); i++ {
		match := true
		for j := 0; j < len(substr); j++ {
			if b[i+j] != substr[j] {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}
