UPDATE teams
SET name = :name,
    description = :description,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id, name, description, created_at, updated_at;
