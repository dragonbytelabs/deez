-- Add user_hash column to users table
ALTER TABLE users ADD COLUMN user_hash TEXT NOT NULL DEFAULT '';

-- Create index for user_hash lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_hash ON users(user_hash);
