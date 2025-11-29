INSERT INTO posts (title, content)
VALUES (:title, :content)
RETURNING id, title, content, created_at, updated_at;
