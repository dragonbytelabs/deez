package storage

import (
	"bytes"
	"io"
	"os"
	"path/filepath"
	"testing"
)

func TestLocalStore(t *testing.T) {
	tempDir := t.TempDir()
	baseURL := "/uploads"

	store, err := NewLocalStore(tempDir, baseURL)
	if err != nil {
		t.Fatalf("NewLocalStore() error = %v", err)
	}

	t.Run("Type returns local", func(t *testing.T) {
		if store.Type() != "local" {
			t.Errorf("Type() = %v, want %v", store.Type(), "local")
		}
	})

	t.Run("Save stores file correctly", func(t *testing.T) {
		content := []byte("test file content")
		filename := "test.txt"

		storagePath, url, err := store.Save(filename, bytes.NewReader(content))
		if err != nil {
			t.Fatalf("Save() error = %v", err)
		}

		// Check storage path
		expectedPath := filepath.Join(tempDir, filename)
		if storagePath != expectedPath {
			t.Errorf("Save() storagePath = %v, want %v", storagePath, expectedPath)
		}

		// Check URL
		expectedURL := baseURL + "/" + filename
		if url != expectedURL {
			t.Errorf("Save() url = %v, want %v", url, expectedURL)
		}

		// Verify file exists and has correct content
		savedContent, err := os.ReadFile(storagePath)
		if err != nil {
			t.Fatalf("Failed to read saved file: %v", err)
		}
		if !bytes.Equal(savedContent, content) {
			t.Errorf("Saved content = %q, want %q", savedContent, content)
		}
	})

	t.Run("Get retrieves file correctly", func(t *testing.T) {
		content := []byte("retrievable content")
		filename := "retrieve.txt"

		storagePath, _, err := store.Save(filename, bytes.NewReader(content))
		if err != nil {
			t.Fatalf("Save() error = %v", err)
		}

		reader, err := store.Get(storagePath)
		if err != nil {
			t.Fatalf("Get() error = %v", err)
		}
		defer reader.Close()

		retrieved, err := io.ReadAll(reader)
		if err != nil {
			t.Fatalf("ReadAll() error = %v", err)
		}

		if !bytes.Equal(retrieved, content) {
			t.Errorf("Retrieved content = %q, want %q", retrieved, content)
		}
	})

	t.Run("Get returns error for non-existent file", func(t *testing.T) {
		_, err := store.Get(filepath.Join(tempDir, "nonexistent.txt"))
		if err == nil {
			t.Error("Get() expected error for non-existent file")
		}
	})

	t.Run("Delete removes file correctly", func(t *testing.T) {
		content := []byte("deletable content")
		filename := "delete.txt"

		storagePath, _, err := store.Save(filename, bytes.NewReader(content))
		if err != nil {
			t.Fatalf("Save() error = %v", err)
		}

		// Verify file exists
		if _, err := os.Stat(storagePath); os.IsNotExist(err) {
			t.Fatal("File should exist before deletion")
		}

		// Delete the file
		if err := store.Delete(storagePath); err != nil {
			t.Fatalf("Delete() error = %v", err)
		}

		// Verify file is deleted
		if _, err := os.Stat(storagePath); !os.IsNotExist(err) {
			t.Error("File should not exist after deletion")
		}
	})

	t.Run("Delete returns nil for non-existent file", func(t *testing.T) {
		err := store.Delete(filepath.Join(tempDir, "nonexistent.txt"))
		if err != nil {
			t.Errorf("Delete() error = %v, want nil for non-existent file", err)
		}
	})
}

func TestNewLocalStore_CreatesDirectory(t *testing.T) {
	tempDir := t.TempDir()
	newDir := filepath.Join(tempDir, "nested", "uploads")

	_, err := NewLocalStore(newDir, "/uploads")
	if err != nil {
		t.Fatalf("NewLocalStore() error = %v", err)
	}

	// Verify directory was created
	if _, err := os.Stat(newDir); os.IsNotExist(err) {
		t.Error("NewLocalStore() should create the directory")
	}
}
