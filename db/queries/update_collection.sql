UPDATE collections
SET name = :name, description = :description, updated_at = CURRENT_TIMESTAMP
WHERE id = :id AND user_id = :user_id
RETURNING id, user_id, name, description, created_at, updated_at;
