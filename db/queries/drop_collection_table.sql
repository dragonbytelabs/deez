-- Drops a data table for a specific collection
-- Table name is dynamically generated as: collection_<id>_data
-- This query template uses a format placeholder for the collection ID
DROP TABLE IF EXISTS collection_%d_data;
