-- update user avatar
UPDATE users SET avatar_url = :avatar_url, updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id, email, display_name, avatar_url, created_at, updated_at;
