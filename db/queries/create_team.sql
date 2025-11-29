INSERT INTO teams (name, description, avatar_url)
VALUES (:name, :description, :avatar_url)
RETURNING id, name, description, avatar_url, created_at, updated_at;
