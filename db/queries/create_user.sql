-- create user 
INSERT INTO users (email, password_hash, display_name, avatar_url, user_hash)
VALUES (:email, :password_hash, :display_name, :avatar_url, :user_hash)
RETURNING id, user_hash, email, display_name, avatar_url, created_at;