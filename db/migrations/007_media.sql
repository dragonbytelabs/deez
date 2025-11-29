-- Media table to store uploaded file metadata
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    storage_type TEXT NOT NULL DEFAULT 'local',
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for efficient user media lookups
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);

-- Index for filename lookups
CREATE INDEX IF NOT EXISTS idx_media_filename ON media(filename);
