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

// ApplyMigrations runs embedded DDL in lexical order (001_*.sql, 002_*.sql, ...).
func (d *DB) ApplyMigrations(ctx context.Context) error {
	dir := "migrations"
	entries, err := fs.ReadDir(db.MigrationsFS, dir)
	if err != nil {
		return err
	}
	fmt.Printf("entries: %v\n", entries)

	// Ensure deterministic order
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

	tx, err := d.SQL.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	for i, name := range names {
		path := filepath.Join(dir, name)
		b, readErr := db.MigrationsFS.ReadFile(path)
		if readErr != nil {
			return fmt.Errorf("read migration %s: %w", name, readErr)
		}

		log.Printf("applying migration %d/%d: %s (%d bytes)", i+1, len(names), name, len(b))

		if _, execErr := tx.ExecContext(ctx, string(b)); execErr != nil {
			// Surface the *real* DB error so you can see the cause
			return fmt.Errorf("migration %s failed: %w", name, execErr)
		}

		log.Printf("applied migration: %s", name)
	}

	if err != nil {
		return err
	}
	return tx.Commit()
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
