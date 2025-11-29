package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// LocalStore implements the Store interface for local filesystem storage
type LocalStore struct {
	basePath string
	baseURL  string
}

// NewLocalStore creates a new local filesystem storage
func NewLocalStore(basePath, baseURL string) (*LocalStore, error) {
	// Ensure the storage directory exists
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create storage directory: %w", err)
	}
	return &LocalStore{
		basePath: basePath,
		baseURL:  baseURL,
	}, nil
}

// Save stores a file to the local filesystem
func (s *LocalStore) Save(filename string, content io.Reader) (string, string, error) {
	storagePath := filepath.Join(s.basePath, filename)

	// Create the file
	file, err := os.Create(storagePath)
	if err != nil {
		return "", "", fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	// Write content to file
	if _, err := io.Copy(file, content); err != nil {
		// Clean up on failure
		os.Remove(storagePath)
		return "", "", fmt.Errorf("failed to write file: %w", err)
	}

	url := fmt.Sprintf("%s/%s", s.baseURL, filename)
	return storagePath, url, nil
}

// Get retrieves a file from the local filesystem
func (s *LocalStore) Get(storagePath string) (io.ReadCloser, error) {
	file, err := os.Open(storagePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	return file, nil
}

// Delete removes a file from the local filesystem
func (s *LocalStore) Delete(storagePath string) error {
	if err := os.Remove(storagePath); err != nil {
		if os.IsNotExist(err) {
			// File already doesn't exist, not an error
			return nil
		}
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// Type returns the storage type identifier
func (s *LocalStore) Type() string {
	return "local"
}
