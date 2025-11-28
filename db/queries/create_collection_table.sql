-- Creates a data table for a specific collection
-- Table name is dynamically generated as: collection_<id>_data
-- This query template uses a format placeholder for the collection ID
CREATE TABLE IF NOT EXISTS collection_%d_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
