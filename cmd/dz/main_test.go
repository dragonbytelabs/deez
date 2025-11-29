package main

import (
	"reflect"
	"strings"
	"testing"
)

func TestCLIStructure(t *testing.T) {
	// Verify all expected top-level commands are present in CLI struct
	expectedCommands := []string{
		"Admin",
		"Cache",
		"Cap",
		"Cli",
		"Comment",
		"Config",
		"Core",
		"Cron",
		"Db",
		"DistArchive",
		"Embed",
		"Find",
		"I18n",
		"Language",
		"MaintenanceMode",
		"Media",
		"Menu",
		"Network",
		"Option",
		"Package",
		"Plugin",
		"Post",
		"PostType",
		"Profile",
		"Rewrite",
		"Role",
		"Scaffold",
		"SearchReplace",
		"Sidebar",
		"Site",
		"SuperAdmin",
		"Taxonomy",
		"Term",
		"Theme",
		"Transient",
		"User",
		"Widget",
	}

	cliType := reflect.TypeOf(CLI)

	// Check that each expected command exists as a field
	for _, expected := range expectedCommands {
		t.Run(expected, func(t *testing.T) {
			field, found := cliType.FieldByName(expected)
			if !found {
				t.Errorf("command %q not found in CLI struct", expected)
				return
			}
			// Verify it has the cmd tag (kong uses cmd:"" for commands)
			tag := string(field.Tag)
			if !strings.Contains(tag, "cmd:") {
				t.Errorf("command %q missing cmd tag", expected)
			}
		})
	}

	// Verify we have at least the expected number of command fields
	fieldCount := 0
	for i := 0; i < cliType.NumField(); i++ {
		field := cliType.Field(i)
		if strings.Contains(string(field.Tag), "cmd:") {
			fieldCount++
		}
	}
	if fieldCount < len(expectedCommands) {
		t.Errorf("CLI struct has %d command fields, expected at least %d", fieldCount, len(expectedCommands))
	}
}

func TestCLIHelpTags(t *testing.T) {
	// Verify all commands have help tags
	cliType := reflect.TypeOf(CLI)

	for i := 0; i < cliType.NumField(); i++ {
		field := cliType.Field(i)
		if strings.Contains(string(field.Tag), "cmd:") {
			t.Run(field.Name, func(t *testing.T) {
				help := field.Tag.Get("help")
				if help == "" {
					t.Errorf("command %q missing help tag", field.Name)
				}
			})
		}
	}
}
