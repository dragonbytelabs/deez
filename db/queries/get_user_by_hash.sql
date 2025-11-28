-- get user by hash 
SELECT id, user_hash, email, password_hash, display_name, avatar_url, created_at, updated_at
FROM users
WHERE user_hash = :user_hash
LIMIT 1;
