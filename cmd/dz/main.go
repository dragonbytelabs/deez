package main

import (
	"fmt"
	"os"
)

// Command represents a CLI command with a name and description
type Command struct {
	Name        string
	Description string
}

// commands holds all available CLI commands
var commands = []Command{
	{Name: "admin", Description: "Open /_/admin/ in a browser."},
	{Name: "cache", Description: "Adds, removes, fetches, and flushes the dz Object Cache object."},
	{Name: "cap", Description: "Adds, removes, and lists capabilities of a user role."},
	{Name: "cli", Description: "Reviews current dz-CLI info, checks for updates, or views defined aliases."},
	{Name: "comment", Description: "Creates, updates, deletes, and moderates comments."},
	{Name: "config", Description: "Generates and reads the dz-config file."},
	{Name: "core", Description: "Downloads, installs, updates, and manages a WordPress installation."},
	{Name: "cron", Description: "Tests, runs, and deletes DZ-Cron events; manages DZ-Cron schedules."},
	{Name: "db", Description: "Performs basic database operations using credentials stored in dz-config."},
	{Name: "dist-archive", Description: "Create a distribution archive based on a project's .distignore file."},
	{Name: "embed", Description: "Inspects oEmbed providers, clears embed cache, and more."},
	{Name: "find", Description: "Find deez installations on the filesystem."},
	{Name: "help", Description: "Gets help on dz-CLI, or on a specific command."},
	{Name: "i18n", Description: "Provides internationalization tools for WordPress projects."},
	{Name: "language", Description: "Installs, activates, and manages language packs."},
	{Name: "maintenance-mode", Description: "Activates, deactivates or checks the status of the maintenance mode of a site."},
	{Name: "media", Description: "Imports files as attachments, regenerates thumbnails, or lists registered image sizes."},
	{Name: "menu", Description: "Lists, creates, assigns, and deletes the active theme's navigation menus."},
	{Name: "network", Description: "Perform network-wide operations."},
	{Name: "option", Description: "Retrieves and sets site options, including plugin and WordPress settings."},
	{Name: "package", Description: "Lists, installs, and removes dz-CLI packages."},
	{Name: "plugin", Description: "Manages plugins, including installs, activations, and updates."},
	{Name: "post", Description: "Manages posts, content, and meta."},
	{Name: "post-type", Description: "Retrieves details on the site's registered post types."},
	{Name: "profile", Description: "Quickly identify what's slow with WordPress."},
	{Name: "rewrite", Description: "Lists or flushes the site's rewrite rules, updates the permalink structure."},
	{Name: "role", Description: "Manages user roles, including creating new roles and resetting to defaults."},
	{Name: "scaffold", Description: "Generates code for post types, taxonomies, plugins, child themes, etc."},
	{Name: "search-replace", Description: "Searches/replaces strings in the database."},
	{Name: "sidebar", Description: "Lists registered sidebars."},
	{Name: "site", Description: "Creates, deletes, empties, moderates, and lists one or more sites on a multisite installation."},
	{Name: "super-admin", Description: "Lists, adds, or removes super admin users on a multisite installation."},
	{Name: "taxonomy", Description: "Retrieves information about registered taxonomies."},
	{Name: "term", Description: "Manages taxonomy terms and term meta, with create, delete, and list commands."},
	{Name: "theme", Description: "Manages themes, including installs, activations, and updates."},
	{Name: "transient", Description: "Adds, gets, and deletes entries in the WordPress Transient Cache."},
	{Name: "user", Description: "Manages users, along with their roles, capabilities, and meta."},
	{Name: "widget", Description: "Manages widgets, including adding and moving them within sidebars."},
}

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(0)
	}

	cmd := os.Args[1]

	switch cmd {
	case "help", "--help", "-h":
		if len(os.Args) > 2 {
			printCommandHelp(os.Args[2])
		} else {
			printUsage()
		}
	case "admin":
		runAdmin(os.Args[2:])
	case "cache":
		runCache(os.Args[2:])
	case "cap":
		runCap(os.Args[2:])
	case "cli":
		runCLI(os.Args[2:])
	case "comment":
		runComment(os.Args[2:])
	case "config":
		runConfig(os.Args[2:])
	case "core":
		runCore(os.Args[2:])
	case "cron":
		runCron(os.Args[2:])
	case "db":
		runDB(os.Args[2:])
	case "dist-archive":
		runDistArchive(os.Args[2:])
	case "embed":
		runEmbed(os.Args[2:])
	case "find":
		runFind(os.Args[2:])
	case "i18n":
		runI18n(os.Args[2:])
	case "language":
		runLanguage(os.Args[2:])
	case "maintenance-mode":
		runMaintenanceMode(os.Args[2:])
	case "media":
		runMedia(os.Args[2:])
	case "menu":
		runMenu(os.Args[2:])
	case "network":
		runNetwork(os.Args[2:])
	case "option":
		runOption(os.Args[2:])
	case "package":
		runPackage(os.Args[2:])
	case "plugin":
		runPlugin(os.Args[2:])
	case "post":
		runPost(os.Args[2:])
	case "post-type":
		runPostType(os.Args[2:])
	case "profile":
		runProfile(os.Args[2:])
	case "rewrite":
		runRewrite(os.Args[2:])
	case "role":
		runRole(os.Args[2:])
	case "scaffold":
		runScaffold(os.Args[2:])
	case "search-replace":
		runSearchReplace(os.Args[2:])
	case "sidebar":
		runSidebar(os.Args[2:])
	case "site":
		runSite(os.Args[2:])
	case "super-admin":
		runSuperAdmin(os.Args[2:])
	case "taxonomy":
		runTaxonomy(os.Args[2:])
	case "term":
		runTerm(os.Args[2:])
	case "theme":
		runTheme(os.Args[2:])
	case "transient":
		runTransient(os.Args[2:])
	case "user":
		runUser(os.Args[2:])
	case "widget":
		runWidget(os.Args[2:])
	default:
		fmt.Fprintf(os.Stderr, "Error: '%s' is not a dz command. See 'dz help'.\n", cmd)
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("dz - The command line interface for deez")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  dz <command> [options] [arguments]")
	fmt.Println()
	fmt.Println("Available commands:")
	for _, cmd := range commands {
		fmt.Printf("  %-20s %s\n", cmd.Name, cmd.Description)
	}
	fmt.Println()
	fmt.Println("Global options:")
	fmt.Println("  --help, -h           Display this help message")
	fmt.Println()
	fmt.Println("Run 'dz help <command>' for more information on a specific command.")
}

func printCommandHelp(cmdName string) {
	for _, cmd := range commands {
		if cmd.Name == cmdName {
			fmt.Printf("dz %s - %s\n", cmd.Name, cmd.Description)
			fmt.Println()
			fmt.Println("Usage:")
			fmt.Printf("  dz %s [options] [arguments]\n", cmd.Name)
			fmt.Println()
			fmt.Println("Run 'dz help' for more information on available commands.")
			return
		}
	}
	fmt.Fprintf(os.Stderr, "Error: '%s' is not a dz command. See 'dz help'.\n", cmdName)
	os.Exit(1)
}

func runAdmin(args []string) {
	fmt.Println("Open /_/admin/ in a browser.")
	fmt.Println("Usage: dz admin")
}

func runCache(args []string) {
	fmt.Println("Adds, removes, fetches, and flushes the dz Object Cache object.")
	fmt.Println("Usage: dz cache <subcommand>")
}

func runCap(args []string) {
	fmt.Println("Adds, removes, and lists capabilities of a user role.")
	fmt.Println("Usage: dz cap <subcommand>")
}

func runCLI(args []string) {
	fmt.Println("Reviews current dz-CLI info, checks for updates, or views defined aliases.")
	fmt.Println("Usage: dz cli <subcommand>")
}

func runComment(args []string) {
	fmt.Println("Creates, updates, deletes, and moderates comments.")
	fmt.Println("Usage: dz comment <subcommand>")
}

func runConfig(args []string) {
	fmt.Println("Generates and reads the dz-config file.")
	fmt.Println("Usage: dz config <subcommand>")
}

func runCore(args []string) {
	fmt.Println("Downloads, installs, updates, and manages a WordPress installation.")
	fmt.Println("Usage: dz core <subcommand>")
}

func runCron(args []string) {
	fmt.Println("Tests, runs, and deletes DZ-Cron events; manages DZ-Cron schedules.")
	fmt.Println("Usage: dz cron <subcommand>")
}

func runDB(args []string) {
	fmt.Println("Performs basic database operations using credentials stored in dz-config.")
	fmt.Println("Usage: dz db <subcommand>")
}

func runDistArchive(args []string) {
	fmt.Println("Create a distribution archive based on a project's .distignore file.")
	fmt.Println("Usage: dz dist-archive <path>")
}

func runEmbed(args []string) {
	fmt.Println("Inspects oEmbed providers, clears embed cache, and more.")
	fmt.Println("Usage: dz embed <subcommand>")
}

func runFind(args []string) {
	fmt.Println("Find deez installations on the filesystem.")
	fmt.Println("Usage: dz find <path>")
}

func runI18n(args []string) {
	fmt.Println("Provides internationalization tools for WordPress projects.")
	fmt.Println("Usage: dz i18n <subcommand>")
}

func runLanguage(args []string) {
	fmt.Println("Installs, activates, and manages language packs.")
	fmt.Println("Usage: dz language <subcommand>")
}

func runMaintenanceMode(args []string) {
	fmt.Println("Activates, deactivates or checks the status of the maintenance mode of a site.")
	fmt.Println("Usage: dz maintenance-mode <subcommand>")
}

func runMedia(args []string) {
	fmt.Println("Imports files as attachments, regenerates thumbnails, or lists registered image sizes.")
	fmt.Println("Usage: dz media <subcommand>")
}

func runMenu(args []string) {
	fmt.Println("Lists, creates, assigns, and deletes the active theme's navigation menus.")
	fmt.Println("Usage: dz menu <subcommand>")
}

func runNetwork(args []string) {
	fmt.Println("Perform network-wide operations.")
	fmt.Println("Usage: dz network <subcommand>")
}

func runOption(args []string) {
	fmt.Println("Retrieves and sets site options, including plugin and WordPress settings.")
	fmt.Println("Usage: dz option <subcommand>")
}

func runPackage(args []string) {
	fmt.Println("Lists, installs, and removes dz-CLI packages.")
	fmt.Println("Usage: dz package <subcommand>")
}

func runPlugin(args []string) {
	fmt.Println("Manages plugins, including installs, activations, and updates.")
	fmt.Println("Usage: dz plugin <subcommand>")
}

func runPost(args []string) {
	fmt.Println("Manages posts, content, and meta.")
	fmt.Println("Usage: dz post <subcommand>")
}

func runPostType(args []string) {
	fmt.Println("Retrieves details on the site's registered post types.")
	fmt.Println("Usage: dz post-type <subcommand>")
}

func runProfile(args []string) {
	fmt.Println("Quickly identify what's slow with WordPress.")
	fmt.Println("Usage: dz profile <subcommand>")
}

func runRewrite(args []string) {
	fmt.Println("Lists or flushes the site's rewrite rules, updates the permalink structure.")
	fmt.Println("Usage: dz rewrite <subcommand>")
}

func runRole(args []string) {
	fmt.Println("Manages user roles, including creating new roles and resetting to defaults.")
	fmt.Println("Usage: dz role <subcommand>")
}

func runScaffold(args []string) {
	fmt.Println("Generates code for post types, taxonomies, plugins, child themes, etc.")
	fmt.Println("Usage: dz scaffold <subcommand>")
}

func runSearchReplace(args []string) {
	fmt.Println("Searches/replaces strings in the database.")
	fmt.Println("Usage: dz search-replace <search> <replace>")
}

func runSidebar(args []string) {
	fmt.Println("Lists registered sidebars.")
	fmt.Println("Usage: dz sidebar <subcommand>")
}

func runSite(args []string) {
	fmt.Println("Creates, deletes, empties, moderates, and lists one or more sites on a multisite installation.")
	fmt.Println("Usage: dz site <subcommand>")
}

func runSuperAdmin(args []string) {
	fmt.Println("Lists, adds, or removes super admin users on a multisite installation.")
	fmt.Println("Usage: dz super-admin <subcommand>")
}

func runTaxonomy(args []string) {
	fmt.Println("Retrieves information about registered taxonomies.")
	fmt.Println("Usage: dz taxonomy <subcommand>")
}

func runTerm(args []string) {
	fmt.Println("Manages taxonomy terms and term meta, with create, delete, and list commands.")
	fmt.Println("Usage: dz term <subcommand>")
}

func runTheme(args []string) {
	fmt.Println("Manages themes, including installs, activations, and updates.")
	fmt.Println("Usage: dz theme <subcommand>")
}

func runTransient(args []string) {
	fmt.Println("Adds, gets, and deletes entries in the WordPress Transient Cache.")
	fmt.Println("Usage: dz transient <subcommand>")
}

func runUser(args []string) {
	fmt.Println("Manages users, along with their roles, capabilities, and meta.")
	fmt.Println("Usage: dz user <subcommand>")
}

func runWidget(args []string) {
	fmt.Println("Manages widgets, including adding and moving them within sidebars.")
	fmt.Println("Usage: dz widget <subcommand>")
}
