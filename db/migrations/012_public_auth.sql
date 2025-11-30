-- Add settings for enabling public login and registration in themes
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES ('public_login_enabled', 'false');
INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES ('public_register_enabled', 'false');
