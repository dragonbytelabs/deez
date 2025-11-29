package main

import (
	"testing"
)

func TestCommands(t *testing.T) {
	// Verify all expected commands are present
	expectedCommands := []string{
		"admin",
		"cache",
		"cap",
		"cli",
		"comment",
		"config",
		"core",
		"cron",
		"db",
		"dist-archive",
		"embed",
		"find",
		"help",
		"i18n",
		"language",
		"maintenance-mode",
		"media",
		"menu",
		"network",
		"option",
		"package",
		"plugin",
		"post",
		"post-type",
		"profile",
		"rewrite",
		"role",
		"scaffold",
		"search-replace",
		"sidebar",
		"site",
		"super-admin",
		"taxonomy",
		"term",
		"theme",
		"transient",
		"user",
		"widget",
	}

	// Create a map for fast lookup
	commandMap := make(map[string]bool)
	for _, cmd := range commands {
		commandMap[cmd.Name] = true
	}

	// Verify each expected command exists
	for _, expected := range expectedCommands {
		t.Run(expected, func(t *testing.T) {
			if !commandMap[expected] {
				t.Errorf("command %q not found in commands list", expected)
			}
		})
	}

	// Verify we have the expected number of commands
	if len(commands) != len(expectedCommands) {
		t.Errorf("commands count mismatch: got %d, want %d", len(commands), len(expectedCommands))
	}
}

func TestCommandDescriptions(t *testing.T) {
	// Verify all commands have non-empty descriptions
	for _, cmd := range commands {
		t.Run(cmd.Name, func(t *testing.T) {
			if cmd.Description == "" {
				t.Errorf("command %q has empty description", cmd.Name)
			}
		})
	}
}
