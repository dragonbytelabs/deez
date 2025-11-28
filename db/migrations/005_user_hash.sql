-- Add user_hash column to users table
ALTER TABLE users ADD COLUMN user_hash TEXT;

-- Generate unique hashes for existing users using hex(randomblob(64))
UPDATE users SET user_hash = hex(randomblob(64)) WHERE user_hash IS NULL;

-- Add NOT NULL constraint after populating
-- SQLite doesn't support modifying columns, so we rely on the application to always set user_hash

-- Create index for user_hash lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_hash ON users(user_hash);
