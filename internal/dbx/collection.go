package dbx

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"dragonbytelabs/dz/internal/models"
)

// ErrDuplicateCollectionName is returned when a collection name already exists for the user
var ErrDuplicateCollectionName = errors.New("collection with this name already exists")

// CreateCollection creates a new collection for a user and its associated data table
func (d *DB) CreateCollection(ctx context.Context, userID int64, name string, description *string) (*models.Collection, error) {
	q := MustQuery("create_collection.sql")

	var c models.Collection
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"user_id":     userID,
		"name":        name,
		"description": description,
	}

	if err := stmt.GetContext(ctx, &c, args); err != nil {
		// Check for unique constraint violation
		if strings.Contains(err.Error(), "UNIQUE constraint failed") {
			return nil, ErrDuplicateCollectionName
		}
		return nil, err
	}

	// Create the collection's data table immediately after the collection is created
	// This implements the "trigger" behavior requested - when a row is added to collections,
	// a corresponding data table is created in the database
	if err := d.createCollectionDataTable(ctx, c.ID); err != nil {
		// If table creation fails, we should delete the collection to maintain consistency
		// Use direct delete to avoid potential recursion through DeleteCollection
		deleteQuery := MustQuery("delete_collection.sql")
		_, _ = d.DBX.NamedExecContext(ctx, deleteQuery, map[string]interface{}{
			"id":      c.ID,
			"user_id": userID,
		})
		return nil, fmt.Errorf("failed to create collection data table: %w", err)
	}

	return &c, nil
}

// createCollectionDataTable creates a data table for a specific collection.
// collectionID is validated as an int64 which prevents SQL injection when used with fmt.Sprintf.
func (d *DB) createCollectionDataTable(ctx context.Context, collectionID int64) error {
	queryTemplate := MustQuery("create_collection_table.sql")
	// Safe: collectionID is int64, which cannot contain SQL injection characters
	query := fmt.Sprintf(queryTemplate, collectionID)

	_, err := d.DBX.ExecContext(ctx, query)
	return err
}

// GetCollectionByID retrieves a collection by ID for a specific user
func (d *DB) GetCollectionByID(ctx context.Context, id int64, userID int64) (*models.Collection, error) {
	q := MustQuery("get_collection_by_id.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"id":      id,
		"user_id": userID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil // no collection found
	}

	var c models.Collection
	if err := rows.StructScan(&c); err != nil {
		return nil, err
	}
	return &c, nil
}

// GetCollectionsByUser retrieves all collections for a specific user
func (d *DB) GetCollectionsByUser(ctx context.Context, userID int64) ([]models.Collection, error) {
	q := MustQuery("get_collections_by_user.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"user_id": userID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	collections := make([]models.Collection, 0, 10) // Pre-allocate with reasonable capacity
	for rows.Next() {
		var c models.Collection
		if err := rows.StructScan(&c); err != nil {
			return nil, err
		}
		collections = append(collections, c)
	}
	return collections, nil
}

// UpdateCollection updates an existing collection
func (d *DB) UpdateCollection(ctx context.Context, id int64, userID int64, name string, description *string) (*models.Collection, error) {
	q := MustQuery("update_collection.sql")

	var c models.Collection
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"id":          id,
		"user_id":     userID,
		"name":        name,
		"description": description,
	}

	if err := stmt.GetContext(ctx, &c, args); err != nil {
		return nil, err
	}
	return &c, nil
}

// DeleteCollection deletes a collection by ID for a specific user and drops its data table
func (d *DB) DeleteCollection(ctx context.Context, id int64, userID int64) error {
	// First, drop the collection's data table
	// This implements the "trigger" behavior - when a collection is deleted,
	// its associated data table is also deleted
	if err := d.dropCollectionDataTable(ctx, id); err != nil {
		return fmt.Errorf("failed to drop collection data table: %w", err)
	}

	q := MustQuery("delete_collection.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"id":      id,
		"user_id": userID,
	})
	return err
}

// dropCollectionDataTable drops the data table for a specific collection.
// collectionID is validated as an int64 which prevents SQL injection when used with fmt.Sprintf.
func (d *DB) dropCollectionDataTable(ctx context.Context, collectionID int64) error {
	queryTemplate := MustQuery("drop_collection_table.sql")
	// Safe: collectionID is int64, which cannot contain SQL injection characters
	query := fmt.Sprintf(queryTemplate, collectionID)

	_, err := d.DBX.ExecContext(ctx, query)
	return err
}
