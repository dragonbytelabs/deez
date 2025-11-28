package models

import "time"

type Media struct {
	ID           int64      `db:"id" json:"id"`
	UserID       int64      `db:"user_id" json:"user_id"`
	Filename     string     `db:"filename" json:"filename"`
	OriginalName string     `db:"original_name" json:"original_name"`
	MimeType     string     `db:"mime_type" json:"mime_type"`
	Size         int64      `db:"size" json:"size"`
	StorageType  string     `db:"storage_type" json:"storage_type"`
	StoragePath  string     `db:"storage_path" json:"storage_path"`
	URL          string     `db:"url" json:"url"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    *time.Time `db:"updated_at" json:"updated_at,omitempty"`
}
