package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestIsGitURL(t *testing.T) {
	tests := []struct {
		name     string
		source   string
		expected bool
	}{
		{
			name:     "https URL",
			source:   "https://github.com/user/repo.git",
			expected: true,
		},
		{
			name:     "http URL",
			source:   "http://github.com/user/repo.git",
			expected: true,
		},
		{
			name:     "git@ URL",
			source:   "git@github.com:user/repo.git",
			expected: true,
		},
		{
			name:     "git:// URL",
			source:   "git://github.com/user/repo.git",
			expected: true,
		},
		{
			name:     "URL with .git suffix",
			source:   "someurl/repo.git",
			expected: true,
		},
		{
			name:     "local path",
			source:   "/home/user/theme",
			expected: false,
		},
		{
			name:     "relative path",
			source:   "./themes/my-theme",
			expected: false,
		},
		{
			name:     "windows path",
			source:   "C:\\Users\\theme",
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isGitURL(tt.source)
			if result != tt.expected {
				t.Errorf("isGitURL(%q) = %v, want %v", tt.source, result, tt.expected)
			}
		})
	}
}

func TestExtractThemeName(t *testing.T) {
	tests := []struct {
		name     string
		url      string
		expected string
	}{
		{
			name:     "https URL with .git",
			url:      "https://github.com/user/my-theme.git",
			expected: "my-theme",
		},
		{
			name:     "https URL without .git",
			url:      "https://github.com/user/my-theme",
			expected: "my-theme",
		},
		{
			name:     "git@ URL",
			url:      "git@github.com:user/awesome-theme.git",
			expected: "awesome-theme",
		},
		{
			name:     "simple repo name",
			url:      "theme-repo.git",
			expected: "theme-repo",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := extractThemeName(tt.url)
			if result != tt.expected {
				t.Errorf("extractThemeName(%q) = %q, want %q", tt.url, result, tt.expected)
			}
		})
	}
}

func TestCopyFile(t *testing.T) {
	t.Run("copies file correctly", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create source file
		srcPath := filepath.Join(tmpDir, "source.txt")
		content := "Hello, World!"
		if err := os.WriteFile(srcPath, []byte(content), 0644); err != nil {
			t.Fatalf("failed to create source file: %v", err)
		}

		// Copy file
		dstPath := filepath.Join(tmpDir, "dest.txt")
		if err := copyFile(srcPath, dstPath); err != nil {
			t.Fatalf("copyFile() returned error: %v", err)
		}

		// Verify content
		data, err := os.ReadFile(dstPath)
		if err != nil {
			t.Fatalf("failed to read dest file: %v", err)
		}
		if string(data) != content {
			t.Errorf("content = %q, want %q", string(data), content)
		}
	})

	t.Run("returns error for non-existent source", func(t *testing.T) {
		tmpDir := t.TempDir()
		srcPath := filepath.Join(tmpDir, "nonexistent.txt")
		dstPath := filepath.Join(tmpDir, "dest.txt")

		err := copyFile(srcPath, dstPath)
		if err == nil {
			t.Error("copyFile() expected error for non-existent source")
		}
	})
}

func TestCopyDir(t *testing.T) {
	t.Run("copies directory recursively", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create source directory structure
		srcDir := filepath.Join(tmpDir, "source")
		if err := os.MkdirAll(filepath.Join(srcDir, "subdir"), 0755); err != nil {
			t.Fatalf("failed to create source dir: %v", err)
		}

		// Create files
		files := map[string]string{
			"index.html":        "<html></html>",
			"style.css":         "body {}",
			"subdir/script.js": "console.log('hi')",
		}
		for path, content := range files {
			fullPath := filepath.Join(srcDir, path)
			if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
				t.Fatalf("failed to create file %s: %v", path, err)
			}
		}

		// Copy directory
		dstDir := filepath.Join(tmpDir, "dest")
		if err := copyDir(srcDir, dstDir); err != nil {
			t.Fatalf("copyDir() returned error: %v", err)
		}

		// Verify all files exist with correct content
		for path, expectedContent := range files {
			fullPath := filepath.Join(dstDir, path)
			data, err := os.ReadFile(fullPath)
			if err != nil {
				t.Errorf("file %s not found: %v", path, err)
				continue
			}
			if string(data) != expectedContent {
				t.Errorf("file %s content = %q, want %q", path, string(data), expectedContent)
			}
		}
	})
}

func TestCopyTheme(t *testing.T) {
	t.Run("copies valid theme", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create source theme
		srcDir := filepath.Join(tmpDir, "my-theme")
		if err := os.MkdirAll(srcDir, 0755); err != nil {
			t.Fatalf("failed to create source dir: %v", err)
		}
		if err := os.WriteFile(filepath.Join(srcDir, "index.html"), []byte("<html></html>"), 0644); err != nil {
			t.Fatalf("failed to create index.html: %v", err)
		}

		// Create themes path
		themesPath := filepath.Join(tmpDir, "themes")
		if err := os.MkdirAll(themesPath, 0755); err != nil {
			t.Fatalf("failed to create themes dir: %v", err)
		}

		// Copy theme
		if err := copyTheme(srcDir, themesPath); err != nil {
			t.Fatalf("copyTheme() returned error: %v", err)
		}

		// Verify theme was copied
		destPath := filepath.Join(themesPath, "my-theme", "index.html")
		if _, err := os.Stat(destPath); os.IsNotExist(err) {
			t.Error("theme was not copied correctly")
		}
	})

	t.Run("rejects theme without index.html", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create source without index.html
		srcDir := filepath.Join(tmpDir, "bad-theme")
		if err := os.MkdirAll(srcDir, 0755); err != nil {
			t.Fatalf("failed to create source dir: %v", err)
		}
		if err := os.WriteFile(filepath.Join(srcDir, "style.css"), []byte("body {}"), 0644); err != nil {
			t.Fatalf("failed to create style.css: %v", err)
		}

		// Create themes path
		themesPath := filepath.Join(tmpDir, "themes")

		// Copy theme should fail
		err := copyTheme(srcDir, themesPath)
		if err == nil {
			t.Error("copyTheme() should have returned error for invalid theme")
		}
	})

	t.Run("rejects duplicate theme", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create source theme
		srcDir := filepath.Join(tmpDir, "my-theme")
		if err := os.MkdirAll(srcDir, 0755); err != nil {
			t.Fatalf("failed to create source dir: %v", err)
		}
		if err := os.WriteFile(filepath.Join(srcDir, "index.html"), []byte("<html></html>"), 0644); err != nil {
			t.Fatalf("failed to create index.html: %v", err)
		}

		// Create themes path with existing theme
		themesPath := filepath.Join(tmpDir, "themes")
		existingTheme := filepath.Join(themesPath, "my-theme")
		if err := os.MkdirAll(existingTheme, 0755); err != nil {
			t.Fatalf("failed to create existing theme dir: %v", err)
		}

		// Copy theme should fail
		err := copyTheme(srcDir, themesPath)
		if err == nil {
			t.Error("copyTheme() should have returned error for duplicate theme")
		}
	})

	t.Run("rejects non-existent source", func(t *testing.T) {
		tmpDir := t.TempDir()

		themesPath := filepath.Join(tmpDir, "themes")

		err := copyTheme("/nonexistent/path", themesPath)
		if err == nil {
			t.Error("copyTheme() should have returned error for non-existent source")
		}
	})

	t.Run("rejects file as source", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Create a file instead of directory
		srcFile := filepath.Join(tmpDir, "not-a-dir.txt")
		if err := os.WriteFile(srcFile, []byte("content"), 0644); err != nil {
			t.Fatalf("failed to create source file: %v", err)
		}

		themesPath := filepath.Join(tmpDir, "themes")

		err := copyTheme(srcFile, themesPath)
		if err == nil {
			t.Error("copyTheme() should have returned error for file source")
		}
	})
}
