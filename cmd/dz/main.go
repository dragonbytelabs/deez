package main

import (
	"fmt"
	"os"
)

// Command represents a CLI command with a name, usage syntax, and description
type Command struct {
	Name        string
	Usage       string
	Description string
}

// commands holds all available CLI commands
var commands = []Command{
	{Name: "admin", Usage: "dz admin", Description: "Open /_/admin/ in a browser."},
	{Name: "cache", Usage: "dz cache <add|delete|flush|get|list>", Description: "Adds, removes, fetches, and flushes the dz Object Cache object."},
	{Name: "cap", Usage: "dz cap <add|list|remove> <role> [<cap>...]", Description: "Adds, removes, and lists capabilities of a user role."},
	{Name: "cli", Usage: "dz cli <alias|check-update|info|version>", Description: "Reviews current dz-CLI info, checks for updates, or views defined aliases."},
	{Name: "comment", Usage: "dz comment <create|delete|get|list|update> [<id>]", Description: "Creates, updates, deletes, and moderates comments."},
	{Name: "config", Usage: "dz config <create|get|list|path|set>", Description: "Generates and reads the dz-config file."},
	{Name: "core", Usage: "dz core <download|install|update|version>", Description: "Downloads, installs, updates, and manages a WordPress installation."},
	{Name: "cron", Usage: "dz cron <event|schedule> <delete|list|run>", Description: "Tests, runs, and deletes DZ-Cron events; manages DZ-Cron schedules."},
	{Name: "db", Usage: "dz db <create|drop|export|import|query|reset>", Description: "Performs basic database operations using credentials stored in dz-config."},
	{Name: "dist-archive", Usage: "dz dist-archive <path> [<target>] [--format=<format>]", Description: "Create a distribution archive based on a project's .distignore file."},
	{Name: "embed", Usage: "dz embed <cache|fetch|provider> [<url>]", Description: "Inspects oEmbed providers, clears embed cache, and more."},
	{Name: "find", Usage: "dz find [<path>] [--field=<field>]", Description: "Find deez installations on the filesystem."},
	{Name: "help", Usage: "dz help [<command>]", Description: "Gets help on dz-CLI, or on a specific command."},
	{Name: "i18n", Usage: "dz i18n <make-pot|make-json|update-po>", Description: "Provides internationalization tools for WordPress projects."},
	{Name: "language", Usage: "dz language <core|plugin|theme> <install|list|update>", Description: "Installs, activates, and manages language packs."},
	{Name: "maintenance-mode", Usage: "dz maintenance-mode <activate|deactivate|status>", Description: "Activates, deactivates or checks the status of the maintenance mode of a site."},
	{Name: "media", Usage: "dz media <image-size|import|regenerate> [<file>...]", Description: "Imports files as attachments, regenerates thumbnails, or lists registered image sizes."},
	{Name: "menu", Usage: "dz menu <create|delete|item|list|location>", Description: "Lists, creates, assigns, and deletes the active theme's navigation menus."},
	{Name: "network", Usage: "dz network <meta>", Description: "Perform network-wide operations."},
	{Name: "option", Usage: "dz option <add|delete|get|list|update> [<key>] [<value>]", Description: "Retrieves and sets site options, including plugin and WordPress settings."},
	{Name: "package", Usage: "dz package <browse|install|list|uninstall|update>", Description: "Lists, installs, and removes dz-CLI packages."},
	{Name: "plugin", Usage: "dz plugin <activate|deactivate|delete|install|list|update> [<plugin>...]", Description: "Manages plugins, including installs, activations, and updates."},
	{Name: "post", Usage: "dz post <create|delete|get|list|update> [<id>]", Description: "Manages posts, content, and meta."},
	{Name: "post-type", Usage: "dz post-type <get|list> [<post-type>]", Description: "Retrieves details on the site's registered post types."},
	{Name: "profile", Usage: "dz profile <hook|stage> [--url=<url>]", Description: "Quickly identify what's slow with WordPress."},
	{Name: "rewrite", Usage: "dz rewrite <flush|list|structure> [--hard]", Description: "Lists or flushes the site's rewrite rules, updates the permalink structure."},
	{Name: "role", Usage: "dz role <create|delete|exists|list|reset> [<role>]", Description: "Manages user roles, including creating new roles and resetting to defaults."},
	{Name: "scaffold", Usage: "dz scaffold <block|child-theme|plugin|post-type|taxonomy|theme>", Description: "Generates code for post types, taxonomies, plugins, child themes, etc."},
	{Name: "search-replace", Usage: "dz search-replace <old> <new> [<table>...] [--dry-run]", Description: "Searches/replaces strings in the database."},
	{Name: "sidebar", Usage: "dz sidebar <list>", Description: "Lists registered sidebars."},
	{Name: "site", Usage: "dz site <activate|create|delete|empty|list>", Description: "Creates, deletes, empties, moderates, and lists one or more sites on a multisite installation."},
	{Name: "super-admin", Usage: "dz super-admin <add|list|remove> [<user>...]", Description: "Lists, adds, or removes super admin users on a multisite installation."},
	{Name: "taxonomy", Usage: "dz taxonomy <get|list> [<taxonomy>]", Description: "Retrieves information about registered taxonomies."},
	{Name: "term", Usage: "dz term <create|delete|get|list|update> <taxonomy> [<term>...]", Description: "Manages taxonomy terms and term meta, with create, delete, and list commands."},
	{Name: "theme", Usage: "dz theme <activate|delete|install|list|update> [<theme>...]", Description: "Manages themes, including installs, activations, and updates."},
	{Name: "transient", Usage: "dz transient <delete|get|set> [<key>] [<value>]", Description: "Adds, gets, and deletes entries in the WordPress Transient Cache."},
	{Name: "user", Usage: "dz user <create|delete|get|list|update> [<user>...] [--role=<role>]", Description: "Manages users, along with their roles, capabilities, and meta."},
	{Name: "widget", Usage: "dz widget <add|delete|list|move|reset> [<widget>]", Description: "Manages widgets, including adding and moving them within sidebars."},
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
			fmt.Printf("  %s\n", cmd.Usage)
			fmt.Println()
			fmt.Println("Run 'dz help' for more information on available commands.")
			return
		}
	}
	fmt.Fprintf(os.Stderr, "Error: '%s' is not a dz command. See 'dz help'.\n", cmdName)
	os.Exit(1)
}

// getCommandUsage returns the usage string for a command by name
func getCommandUsage(name string) string {
	for _, cmd := range commands {
		if cmd.Name == name {
			return cmd.Usage
		}
	}
	return ""
}

func runAdmin(args []string) {
	fmt.Println("Open /_/admin/ in a browser.")
	fmt.Printf("Usage: %s\n", getCommandUsage("admin"))
}

func runCache(args []string) {
	fmt.Println("Adds, removes, fetches, and flushes the dz Object Cache object.")
	fmt.Printf("Usage: %s\n", getCommandUsage("cache"))
}

func runCap(args []string) {
	fmt.Println("Adds, removes, and lists capabilities of a user role.")
	fmt.Printf("Usage: %s\n", getCommandUsage("cap"))
}

func runCLI(args []string) {
	fmt.Println("Reviews current dz-CLI info, checks for updates, or views defined aliases.")
	fmt.Printf("Usage: %s\n", getCommandUsage("cli"))
}

func runComment(args []string) {
	fmt.Println("Creates, updates, deletes, and moderates comments.")
	fmt.Printf("Usage: %s\n", getCommandUsage("comment"))
}

func runConfig(args []string) {
	fmt.Println("Generates and reads the dz-config file.")
	fmt.Printf("Usage: %s\n", getCommandUsage("config"))
}

func runCore(args []string) {
	fmt.Println("Downloads, installs, updates, and manages a WordPress installation.")
	fmt.Printf("Usage: %s\n", getCommandUsage("core"))
}

func runCron(args []string) {
	fmt.Println("Tests, runs, and deletes DZ-Cron events; manages DZ-Cron schedules.")
	fmt.Printf("Usage: %s\n", getCommandUsage("cron"))
}

func runDB(args []string) {
	fmt.Println("Performs basic database operations using credentials stored in dz-config.")
	fmt.Printf("Usage: %s\n", getCommandUsage("db"))
}

func runDistArchive(args []string) {
	fmt.Println("Create a distribution archive based on a project's .distignore file.")
	fmt.Printf("Usage: %s\n", getCommandUsage("dist-archive"))
}

func runEmbed(args []string) {
	fmt.Println("Inspects oEmbed providers, clears embed cache, and more.")
	fmt.Printf("Usage: %s\n", getCommandUsage("embed"))
}

func runFind(args []string) {
	fmt.Println("Find deez installations on the filesystem.")
	fmt.Printf("Usage: %s\n", getCommandUsage("find"))
}

func runI18n(args []string) {
	fmt.Println("Provides internationalization tools for WordPress projects.")
	fmt.Printf("Usage: %s\n", getCommandUsage("i18n"))
}

func runLanguage(args []string) {
	fmt.Println("Installs, activates, and manages language packs.")
	fmt.Printf("Usage: %s\n", getCommandUsage("language"))
}

func runMaintenanceMode(args []string) {
	fmt.Println("Activates, deactivates or checks the status of the maintenance mode of a site.")
	fmt.Printf("Usage: %s\n", getCommandUsage("maintenance-mode"))
}

func runMedia(args []string) {
	fmt.Println("Imports files as attachments, regenerates thumbnails, or lists registered image sizes.")
	fmt.Printf("Usage: %s\n", getCommandUsage("media"))
}

func runMenu(args []string) {
	fmt.Println("Lists, creates, assigns, and deletes the active theme's navigation menus.")
	fmt.Printf("Usage: %s\n", getCommandUsage("menu"))
}

func runNetwork(args []string) {
	fmt.Println("Perform network-wide operations.")
	fmt.Printf("Usage: %s\n", getCommandUsage("network"))
}

func runOption(args []string) {
	fmt.Println("Retrieves and sets site options, including plugin and WordPress settings.")
	fmt.Printf("Usage: %s\n", getCommandUsage("option"))
}

func runPackage(args []string) {
	fmt.Println("Lists, installs, and removes dz-CLI packages.")
	fmt.Printf("Usage: %s\n", getCommandUsage("package"))
}

func runPlugin(args []string) {
	fmt.Println("Manages plugins, including installs, activations, and updates.")
	fmt.Printf("Usage: %s\n", getCommandUsage("plugin"))
}

func runPost(args []string) {
	fmt.Println("Manages posts, content, and meta.")
	fmt.Printf("Usage: %s\n", getCommandUsage("post"))
}

func runPostType(args []string) {
	fmt.Println("Retrieves details on the site's registered post types.")
	fmt.Printf("Usage: %s\n", getCommandUsage("post-type"))
}

func runProfile(args []string) {
	fmt.Println("Quickly identify what's slow with WordPress.")
	fmt.Printf("Usage: %s\n", getCommandUsage("profile"))
}

func runRewrite(args []string) {
	fmt.Println("Lists or flushes the site's rewrite rules, updates the permalink structure.")
	fmt.Printf("Usage: %s\n", getCommandUsage("rewrite"))
}

func runRole(args []string) {
	fmt.Println("Manages user roles, including creating new roles and resetting to defaults.")
	fmt.Printf("Usage: %s\n", getCommandUsage("role"))
}

func runScaffold(args []string) {
	fmt.Println("Generates code for post types, taxonomies, plugins, child themes, etc.")
	fmt.Printf("Usage: %s\n", getCommandUsage("scaffold"))
}

func runSearchReplace(args []string) {
	fmt.Println("Searches/replaces strings in the database.")
	fmt.Printf("Usage: %s\n", getCommandUsage("search-replace"))
}

func runSidebar(args []string) {
	fmt.Println("Lists registered sidebars.")
	fmt.Printf("Usage: %s\n", getCommandUsage("sidebar"))
}

func runSite(args []string) {
	fmt.Println("Creates, deletes, empties, moderates, and lists one or more sites on a multisite installation.")
	fmt.Printf("Usage: %s\n", getCommandUsage("site"))
}

func runSuperAdmin(args []string) {
	fmt.Println("Lists, adds, or removes super admin users on a multisite installation.")
	fmt.Printf("Usage: %s\n", getCommandUsage("super-admin"))
}

func runTaxonomy(args []string) {
	fmt.Println("Retrieves information about registered taxonomies.")
	fmt.Printf("Usage: %s\n", getCommandUsage("taxonomy"))
}

func runTerm(args []string) {
	fmt.Println("Manages taxonomy terms and term meta, with create, delete, and list commands.")
	fmt.Printf("Usage: %s\n", getCommandUsage("term"))
}

func runTheme(args []string) {
	fmt.Println("Manages themes, including installs, activations, and updates.")
	fmt.Printf("Usage: %s\n", getCommandUsage("theme"))
}

func runTransient(args []string) {
	fmt.Println("Adds, gets, and deletes entries in the WordPress Transient Cache.")
	fmt.Printf("Usage: %s\n", getCommandUsage("transient"))
}

func runUser(args []string) {
	fmt.Println("Manages users, along with their roles, capabilities, and meta.")
	fmt.Printf("Usage: %s\n", getCommandUsage("user"))
}

func runWidget(args []string) {
	fmt.Println("Manages widgets, including adding and moving them within sidebars.")
	fmt.Printf("Usage: %s\n", getCommandUsage("widget"))
}
