SELECT id, title, content, status, visibility, format, excerpt, publish_at, created_at, updated_at
FROM posts
WHERE id = :id;
