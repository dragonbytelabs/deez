-- Forms table for the DZForms plugin
CREATE TABLE IF NOT EXISTS dz_forms (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  description   TEXT,
  fields        TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial default form (first row in the database table)
INSERT INTO dz_forms (name, description, fields) 
VALUES ('Default Form', 'The default form created on plugin initialization', '[]');
