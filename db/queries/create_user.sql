-- create user 
INSERT INTO users (email, password_hash, display_name)
VALUES (:email, :password_hash, :display_name)
RETURNING id, email, display_name, created_at;