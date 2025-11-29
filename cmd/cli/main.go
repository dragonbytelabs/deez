package main

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"dragonbytelabs/dz/internal/config"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	switch command {
	case "theme":
		handleTheme(os.Args[2:])
	case "help", "-h", "--help":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("dz - CLI tool for managing deez")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  dz <command> [arguments]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  theme add <source>  Add a theme from a git URL or local path")
	fmt.Println("  help                Show this help message")
}

func handleTheme(args []string) {
	if len(args) < 1 {
		fmt.Fprintln(os.Stderr, "Usage: dz theme <subcommand>")
		fmt.Fprintln(os.Stderr, "")
		fmt.Fprintln(os.Stderr, "Subcommands:")
		fmt.Fprintln(os.Stderr, "  add <source>  Add a theme from a git URL or local path")
		os.Exit(1)
	}

	subcommand := args[0]

	switch subcommand {
	case "add":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Usage: dz theme add <source>")
			fmt.Fprintln(os.Stderr, "")
			fmt.Fprintln(os.Stderr, "Source can be:")
			fmt.Fprintln(os.Stderr, "  - A git URL (e.g., https://github.com/user/theme.git)")
			fmt.Fprintln(os.Stderr, "  - A local path to a theme directory")
			os.Exit(1)
		}
		source := args[1]
		if err := addTheme(source); err != nil {
			fmt.Fprintf(os.Stderr, "Error adding theme: %v\n", err)
			os.Exit(1)
		}
	default:
		fmt.Fprintf(os.Stderr, "Unknown theme subcommand: %s\n", subcommand)
		os.Exit(1)
	}
}

// addTheme adds a theme from a git URL or local path
func addTheme(source string) error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	// Ensure themes directory exists
	if err := os.MkdirAll(cfg.Content.ThemesPath, 0755); err != nil {
		return fmt.Errorf("failed to create themes directory: %w", err)
	}

	// Determine if source is a git URL or local path
	if isGitURL(source) {
		return cloneTheme(source, cfg.Content.ThemesPath)
	}

	// Treat as local path
	return copyTheme(source, cfg.Content.ThemesPath)
}

// isGitURL checks if the source looks like a git URL
func isGitURL(source string) bool {
	return strings.HasPrefix(source, "https://") ||
		strings.HasPrefix(source, "http://") ||
		strings.HasPrefix(source, "git@") ||
		strings.HasPrefix(source, "git://") ||
		strings.HasSuffix(source, ".git")
}

// cloneTheme clones a theme from a git URL
func cloneTheme(url string, themesPath string) error {
	// Extract theme name from URL
	themeName := extractThemeName(url)
	if themeName == "" {
		return fmt.Errorf("could not extract theme name from URL: %s", url)
	}

	destPath := filepath.Join(themesPath, themeName)

	// Check if theme already exists
	if _, err := os.Stat(destPath); err == nil {
		return fmt.Errorf("theme '%s' already exists at %s", themeName, destPath)
	}

	fmt.Printf("Cloning theme '%s' from %s...\n", themeName, url)

	cmd := exec.Command("git", "clone", "--depth", "1", url, destPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("failed to clone theme: %w", err)
	}

	// Remove .git directory to make it a standalone copy
	gitDir := filepath.Join(destPath, ".git")
	if err := os.RemoveAll(gitDir); err != nil {
		fmt.Printf("Warning: could not remove .git directory: %v\n", err)
	}

	// Verify theme has index.html
	indexPath := filepath.Join(destPath, "index.html")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		// Clean up invalid theme
		os.RemoveAll(destPath)
		return fmt.Errorf("invalid theme: missing index.html")
	}

	fmt.Printf("Theme '%s' added successfully to %s\n", themeName, destPath)
	return nil
}

// extractThemeName extracts the theme name from a git URL
func extractThemeName(url string) string {
	// Remove trailing .git if present
	url = strings.TrimSuffix(url, ".git")

	// Get the last part of the path
	parts := strings.Split(url, "/")
	if len(parts) == 0 {
		return ""
	}

	return parts[len(parts)-1]
}

// copyTheme copies a theme from a local path
func copyTheme(source string, themesPath string) error {
	// Validate source exists and is a directory
	info, err := os.Stat(source)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("source path does not exist: %s", source)
		}
		return fmt.Errorf("failed to stat source: %w", err)
	}

	if !info.IsDir() {
		return fmt.Errorf("source must be a directory: %s", source)
	}

	// Verify theme has index.html
	indexPath := filepath.Join(source, "index.html")
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		return fmt.Errorf("invalid theme: missing index.html in %s", source)
	}

	// Extract theme name from source path
	themeName := filepath.Base(source)
	destPath := filepath.Join(themesPath, themeName)

	// Check if theme already exists
	if _, err := os.Stat(destPath); err == nil {
		return fmt.Errorf("theme '%s' already exists at %s", themeName, destPath)
	}

	fmt.Printf("Copying theme '%s' from %s...\n", themeName, source)

	// Copy directory recursively
	if err := copyDir(source, destPath); err != nil {
		// Clean up on error
		os.RemoveAll(destPath)
		return fmt.Errorf("failed to copy theme: %w", err)
	}

	fmt.Printf("Theme '%s' added successfully to %s\n", themeName, destPath)
	return nil
}

// copyDir recursively copies a directory
func copyDir(src, dst string) error {
	// Get source directory info
	srcInfo, err := os.Stat(src)
	if err != nil {
		return err
	}

	// Create destination directory
	if err := os.MkdirAll(dst, srcInfo.Mode()); err != nil {
		return err
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}

	return nil
}

// copyFile copies a single file
func copyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	srcInfo, err := srcFile.Stat()
	if err != nil {
		return err
	}

	dstFile, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, srcInfo.Mode())
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	return err
}
