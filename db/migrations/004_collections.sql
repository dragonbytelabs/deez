-- Collections table to store user collection metadata
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient user collection lookups
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

-- Unique constraint to prevent duplicate collection names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_user_name ON collections(user_id, name);
