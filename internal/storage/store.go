package storage

import (
	"io"
)

// Store defines the interface for media storage backends
type Store interface {
	// Save stores a file and returns the storage path and URL
	Save(filename string, content io.Reader) (storagePath string, url string, err error)
	// Get retrieves a file by its storage path
	Get(storagePath string) (io.ReadCloser, error)
	// Delete removes a file from storage
	Delete(storagePath string) error
	// Type returns the storage type identifier
	Type() string
}
