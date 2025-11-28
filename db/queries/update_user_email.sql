-- update user email
UPDATE users SET email = :email, updated_at = CURRENT_TIMESTAMP
WHERE user_hash = :user_id
RETURNING id, user_hash, email, display_name, avatar_url, created_at, updated_at;
