package dbx

import (
	"context"
	"database/sql"
	"fmt"
	"io/fs"
	"log"
	"path/filepath"
	"sort"
	"strings"

	db "dragonbytelabs/dz/db"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

type DB struct {
	SQL *sql.DB
	DBX *sqlx.DB
}

func (d *DB) Close() error { return d.SQL.Close() }

// OpenSQLite opens SQLite with sane defaults for server use.
func OpenSQLite(path string) (*DB, error) {
	// modernc driver name is "sqlite"
	// Busy timeout + WAL via pragmas in first migration; we can also pass flags in DSN.
	// For example: file:app.db?_pragma=busy_timeout(5000)
	dsn := fmt.Sprintf(
		"file:%s?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_pragma=foreign_keys(ON)",
		path,
	)
	sqlDB, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	// Connection pool tuning — SQLite is single file; keep modest limits.
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetConnMaxLifetime(0)

	dbx := sqlx.NewDb(sqlDB, "sqlite")
	return &DB{SQL: sqlDB, DBX: dbx}, nil
}

// ensureMigrationsTable creates the migrations tracking table if it doesn't exist
func (d *DB) ensureMigrationsTable(ctx context.Context) error {
	// Check if schema_migrations table exists
	checkQuery := MustQuery("ensure_migrations_table.sql")
	var count int
	if err := d.SQL.QueryRowContext(ctx, checkQuery).Scan(&count); err != nil {
		return fmt.Errorf("failed to check for schema_migrations table: %w", err)
	}

	// If table exists, we're done
	if count > 0 {
		return nil
	}

	log.Println("creating schema_migrations table...")

	// Create the table
	createQuery := MustQuery("create_migrations_table.sql")
	if _, err := d.SQL.ExecContext(ctx, createQuery); err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	log.Println("schema_migrations table created")
	return nil
}

// isMigrationApplied checks if a migration has already been applied
func (d *DB) isMigrationApplied(ctx context.Context, version string) (bool, error) {
	query := MustQuery("is_migration_applied.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, query, map[string]interface{}{"version": version})
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

// recordMigration records that a migration has been applied
func (d *DB) recordMigration(ctx context.Context, tx *sql.Tx, version string) error {
	query := MustQuery("record_migration.sql")

	// Convert to use tx instead of d.DBX since we're in a transaction
	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.ExecContext(ctx, version)
	return err
}

// ApplyMigrations runs embedded DDL in lexical order (001_*.sql, 002_*.sql, ...).
func (d *DB) ApplyMigrations(ctx context.Context) error {
	if err := d.ensureMigrationsTable(ctx); err != nil {
		return err
	}

	dir := "migrations"
	entries, err := fs.ReadDir(db.MigrationsFS, dir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}
	fmt.Printf("entries: %v\n", entries)

	// Collect migration files
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		name := e.Name()
		if !strings.HasSuffix(name, ".sql") {
			continue
		}
		names = append(names, name)
	}
	sort.Strings(names)
	if len(names) == 0 {
		log.Println("no migrations to apply")
		return nil
	}

	appliedCount := 0
	skippedCount := 0

	for i, name := range names {
		// Check if migration already applied
		applied, err := d.isMigrationApplied(ctx, name)
		if err != nil {
			return fmt.Errorf("failed to check migration status for %s: %w", name, err)
		}

		if applied {
			log.Printf("skipping migration %d/%d: %s (already applied)", i+1, len(names), name)
			skippedCount++
			continue
		}

		// Read migration file
		path := filepath.Join(dir, name)
		b, readErr := db.MigrationsFS.ReadFile(path)
		if readErr != nil {
			return fmt.Errorf("read migration %s: %w", name, readErr)
		}

		log.Printf("applying migration %d/%d: %s (%d bytes)", i+1, len(names), name, len(b))

		// Apply migration in a transaction
		tx, err := d.SQL.BeginTx(ctx, &sql.TxOptions{})
		if err != nil {
			return fmt.Errorf("failed to begin transaction for %s: %w", name, err)
		}

		// Execute migration
		if _, execErr := tx.ExecContext(ctx, string(b)); execErr != nil {
			_ = tx.Rollback()
			return fmt.Errorf("migration %s failed: %w", name, execErr)
		}

		// Record migration
		if err := d.recordMigration(ctx, tx, name); err != nil {
			_ = tx.Rollback()
			return fmt.Errorf("failed to record migration %s: %w", name, err)
		}

		// Commit transaction
		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit migration %s: %w", name, err)
		}

		log.Printf("✓ applied migration: %s", name)
		appliedCount++
	}

	if appliedCount > 0 {
		log.Printf("✓ successfully applied %d new migration(s)", appliedCount)
	}
	if skippedCount > 0 {
		log.Printf("→ skipped %d already-applied migration(s)", skippedCount)
	}
	if appliedCount == 0 && skippedCount == 0 {
		log.Println("✓ database is up to date")
	}

	return nil
}

// Helpers to read query text
func MustQuery(name string) string {
	path := filepath.Join("queries", name)
	b, err := db.QueriesFS.ReadFile(path)
	if err != nil {
		log.Fatalf("query %s not found: %v", name, err)
	}
	return string(b)
}
