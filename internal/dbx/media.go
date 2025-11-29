package dbx

import (
	"context"

	"dragonbytelabs/dz/internal/models"
)

// CreateMedia creates a new media record for a user
func (d *DB) CreateMedia(ctx context.Context, userID int64, filename, originalName, mimeType string, size int64, storageType, storagePath, url string) (*models.Media, error) {
	q := MustQuery("create_media.sql")

	var m models.Media
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"user_id":       userID,
		"filename":      filename,
		"original_name": originalName,
		"mime_type":     mimeType,
		"size":          size,
		"storage_type":  storageType,
		"storage_path":  storagePath,
		"url":           url,
	}

	if err := stmt.GetContext(ctx, &m, args); err != nil {
		return nil, err
	}
	return &m, nil
}

// GetMediaByID retrieves a media record by ID for a specific user
func (d *DB) GetMediaByID(ctx context.Context, id int64, userID int64) (*models.Media, error) {
	q := MustQuery("get_media_by_id.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"id":      id,
		"user_id": userID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil // no media found
	}

	var m models.Media
	if err := rows.StructScan(&m); err != nil {
		return nil, err
	}
	return &m, nil
}

// GetMediaByUser retrieves all media for a specific user
func (d *DB) GetMediaByUser(ctx context.Context, userID int64) ([]models.Media, error) {
	q := MustQuery("get_media_by_user.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"user_id": userID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	media := make([]models.Media, 0, 10) // Pre-allocate with reasonable capacity
	for rows.Next() {
		var m models.Media
		if err := rows.StructScan(&m); err != nil {
			return nil, err
		}
		media = append(media, m)
	}
	return media, nil
}

// DeleteMedia deletes a media record by ID for a specific user
func (d *DB) DeleteMedia(ctx context.Context, id int64, userID int64) error {
	q := MustQuery("delete_media.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"id":      id,
		"user_id": userID,
	})
	return err
}
