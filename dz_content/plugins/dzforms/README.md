# DragonByteForm Plugin

A simple form builder plugin for the Deez CMS.

## Overview

DragonByteForm is a self-contained plugin that allows administrators to create and manage custom forms within the Deez CMS.

## Features

- Create custom forms with various field types
- Edit existing forms
- JSON-based field definitions
- RESTful API for form management

## API Endpoints

The plugin registers the following API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dzforms/forms` | Get all forms |
| GET | `/api/dzforms/forms/{id}` | Get a specific form by ID |
| POST | `/api/dzforms/forms` | Create a new form |
| PUT | `/api/dzforms/forms/{id}` | Update an existing form |

## Plugin Interface

This plugin implements the `plugins.Plugin` interface, which includes:

- `Name()` - Returns the unique identifier "dzforms"
- `DisplayName()` - Returns "DragonByteForm"
- `Description()` - Returns a brief description
- `Version()` - Returns the semantic version
- `Register(ctx *PluginContext)` - Registers HTTP routes
- `OnActivate(ctx context.Context)` - Called when the plugin is activated
- `OnDeactivate(ctx context.Context)` - Called when the plugin is deactivated

## Database Schema

The plugin uses the `dz_forms` table created by the migration `011_dzforms.sql`:

```sql
CREATE TABLE IF NOT EXISTS dz_forms (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  description   TEXT,
  fields        TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Creating Your Own Plugin

To create a new plugin for Deez, follow these steps:

1. Create a new folder in `dz_content/plugins/` with your plugin name
2. Implement the `plugins.Plugin` interface
3. Register your plugin in `cmd/server/main.go`
4. Add any required database migrations

Example plugin structure:

```go
package myplugin

import (
    "context"
    "dragonbytelabs/dz/internal/plugins"
)

type Plugin struct{}

func New() *Plugin {
    return &Plugin{}
}

func (p *Plugin) Name() string        { return "myplugin" }
func (p *Plugin) DisplayName() string { return "My Plugin" }
func (p *Plugin) Description() string { return "A custom plugin" }
func (p *Plugin) Version() string     { return "1.0.0" }

func (p *Plugin) Register(ctx *plugins.PluginContext) error {
    // Register your routes here using ctx.Mux
    // Access the database using ctx.DB
    // Use ctx.RequireAuth to protect routes
    return nil
}

func (p *Plugin) OnActivate(ctx context.Context) error {
    return nil
}

func (p *Plugin) OnDeactivate(ctx context.Context) error {
    return nil
}
```

## License

This plugin is part of the Deez CMS and is subject to the same license terms.
