SELECT COUNT(*) FROM sqlite_master 
WHERE type='table' 
AND name = :table_name
AND name NOT LIKE 'sqlite_%'