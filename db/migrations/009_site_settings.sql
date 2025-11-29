-- Site settings table for storing active theme and other site-wide configurations
CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default active theme setting (empty means no theme active, admin will be served)
INSERT INTO site_settings (setting_key, setting_value) VALUES ('active_theme', '');
