package main

import (
	"context"
	"fmt"
	"os"

	"dragonbytelabs/dz/internal/config"
	"dragonbytelabs/dz/internal/dbx"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	switch os.Args[1] {
	case "plugin":
		handlePlugin(os.Args[2:])
	case "help", "-h", "--help":
		printUsage()
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n", os.Args[1])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage: dz <command> [arguments]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  plugin    Manage plugins")
	fmt.Println("  help      Show this help message")
	fmt.Println()
	fmt.Println("Use \"dz <command> help\" for more information about a command.")
}

func handlePlugin(args []string) {
	if len(args) < 1 {
		printPluginUsage()
		os.Exit(1)
	}

	switch args[0] {
	case "add":
		handlePluginAdd(args[1:])
	case "help", "-h", "--help":
		printPluginUsage()
	default:
		fmt.Fprintf(os.Stderr, "Unknown plugin command: %s\n", args[0])
		printPluginUsage()
		os.Exit(1)
	}
}

func printPluginUsage() {
	fmt.Println("Usage: dz plugin <command> [arguments]")
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  add <name>    Add a plugin to the application")
	fmt.Println("  help          Show this help message")
}

func handlePluginAdd(args []string) {
	if len(args) < 1 {
		fmt.Fprintln(os.Stderr, "Error: plugin name is required")
		fmt.Println()
		fmt.Println("Usage: dz plugin add <name>")
		os.Exit(1)
	}

	pluginName := args[0]

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading config: %v\n", err)
		os.Exit(1)
	}

	// Open database
	db, err := dbx.OpenSQLite(cfg.Database.Path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error opening database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	ctx := context.Background()

	// Check if plugin already exists
	existing, err := db.GetPluginByName(ctx, pluginName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error checking plugin: %v\n", err)
		os.Exit(1)
	}
	if existing != nil {
		fmt.Fprintf(os.Stderr, "Error: plugin %q already exists\n", pluginName)
		os.Exit(1)
	}

	// Add the plugin
	err = db.AddPlugin(ctx, pluginName)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error adding plugin: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Plugin %q added successfully\n", pluginName)
}
