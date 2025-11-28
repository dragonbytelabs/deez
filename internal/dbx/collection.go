package dbx

import (
	"context"
	"dragonbytelabs/dz/internal/models"
)

// CreateCollection creates a new collection for a user
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
		return nil, err
	}
	return &c, nil
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

	var collections []models.Collection
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

// DeleteCollection deletes a collection by ID for a specific user
func (d *DB) DeleteCollection(ctx context.Context, id int64, userID int64) error {
	q := MustQuery("delete_collection.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"id":      id,
		"user_id": userID,
	})
	return err
}
