-- get user by email 
SELECT id, email, password_hash, display_name, avatar_url, created_at, updated_at
FROM users
WHERE email = :email
LIMIT 1;