UPDATE dz_forms
SET name = :name, description = :description, fields = :fields, updated_at = CURRENT_TIMESTAMP
WHERE id = :id;
