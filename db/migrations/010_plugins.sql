-- Plugins table for storing plugin metadata and state
CREATE TABLE IF NOT EXISTS dz_plugins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  description   TEXT,
  version       TEXT NOT NULL DEFAULT '1.0.0',
  is_active     INTEGER NOT NULL DEFAULT 0,
  sidebar_icon  TEXT,
  sidebar_title TEXT,
  sidebar_link  TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert DZForms plugin
INSERT INTO dz_plugins (name, display_name, description, version, is_active, sidebar_icon, sidebar_title, sidebar_link) 
VALUES ('dzforms', 'DragonByteForm', 'A simple form builder plugin for Deez', '1.0.0', 0, '📝', 'DragonByteForm', '/_/admin/plugins/dzforms');
