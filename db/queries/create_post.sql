INSERT INTO posts (title, content, status, visibility, format, excerpt, publish_at)
VALUES (:title, :content, :status, :visibility, :format, :excerpt, :publish_at)
RETURNING id, title, content, status, visibility, format, excerpt, publish_at, created_at, updated_at;
