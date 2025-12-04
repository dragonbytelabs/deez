-- Add additional options to posts table
ALTER TABLE posts ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE posts ADD COLUMN format TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE posts ADD COLUMN excerpt TEXT NOT NULL DEFAULT '';
ALTER TABLE posts ADD COLUMN publish_at DATETIME;
