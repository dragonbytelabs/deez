-- Drops a data table for a specific collection
-- Table name is dynamically generated as: collection_<id>_data
-- This query template uses a format placeholder for the collection ID
-- SAFETY: The placeholder is only used with int64 values in application code,
-- which prevents SQL injection (integers cannot contain malicious SQL characters)
DROP TABLE IF EXISTS collection_%d_data;
