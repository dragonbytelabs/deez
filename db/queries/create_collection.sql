INSERT INTO collections (user_id, name, description)
VALUES (:user_id, :name, :description)
RETURNING id, user_id, name, description, created_at, updated_at;
