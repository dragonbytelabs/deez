UPDATE dz_plugins
SET is_active = :is_active, updated_at = CURRENT_TIMESTAMP
WHERE name = :name;
