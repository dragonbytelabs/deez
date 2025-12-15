package config

import (
	"os"
	"path/filepath"
	"strings"
)

func AppDir(appName string) (string, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	// Normalize name a bit
	appName = strings.TrimSpace(appName)
	if appName == "" {
		appName = "deez"
	}
	dir := filepath.Join(base, appName)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return dir, nil
}

func ResolveInAppDir(appDir, p string) string {
	if p == "" {
		return ""
	}
	if filepath.IsAbs(p) {
		return p
	}
	return filepath.Join(appDir, p)
}
