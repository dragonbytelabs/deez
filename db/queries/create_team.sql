INSERT INTO teams (name, description)
VALUES (:name, :description)
RETURNING id, name, description, created_at, updated_at;
