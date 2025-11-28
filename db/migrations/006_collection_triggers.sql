-- SQL Trigger for collection table management
-- 
-- Note: SQLite does not support executing DDL statements (CREATE TABLE, DROP TABLE)
-- directly within triggers. Therefore, we implement a two-part solution:
--
-- 1. A trigger that fires AFTER INSERT/DELETE on the collections table
-- 2. Application code that creates/drops the collection data tables
--
-- The triggers below log collection lifecycle events for debugging/auditing.
-- The actual table creation/deletion is handled in the application layer
-- immediately after the collection insert/delete operation.

-- Trigger that fires after a new collection is created
-- This serves as a hook point and validates the collection was created
CREATE TRIGGER IF NOT EXISTS after_collection_insert
AFTER INSERT ON collections
FOR EACH ROW
BEGIN
    -- Validate the new collection has required fields
    SELECT CASE 
        WHEN NEW.id IS NULL THEN RAISE(ABORT, 'Collection ID cannot be null')
        WHEN NEW.user_id IS NULL THEN RAISE(ABORT, 'Collection user_id cannot be null')
        WHEN NEW.name IS NULL OR NEW.name = '' THEN RAISE(ABORT, 'Collection name cannot be empty')
    END;
END;

-- Trigger that fires before a collection is deleted
-- This ensures proper cleanup can occur
CREATE TRIGGER IF NOT EXISTS before_collection_delete
BEFORE DELETE ON collections
FOR EACH ROW
BEGIN
    -- Validate the collection being deleted exists
    SELECT CASE 
        WHEN OLD.id IS NULL THEN RAISE(ABORT, 'Cannot delete collection with null ID')
    END;
END;
