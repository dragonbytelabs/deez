SELECT id, user_id, name, description, created_at, updated_at
FROM collections
WHERE id = :id AND user_id = :user_id;
