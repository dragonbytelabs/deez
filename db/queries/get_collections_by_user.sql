SELECT id, user_id, name, description, created_at, updated_at
FROM collections
WHERE user_id = :user_id
ORDER BY created_at DESC;
