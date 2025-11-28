-- create user 
INSERT INTO users (email, password_hash, display_name, avatar_url)
VALUES (:email, :password_hash, :display_name, :avatar_url)
RETURNING id, email, display_name, avatar_url, created_at;