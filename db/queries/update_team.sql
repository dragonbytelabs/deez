UPDATE teams
SET name = :name,
    description = :description,
    avatar_url = :avatar_url,
    updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id, name, description, avatar_url, created_at, updated_at;
