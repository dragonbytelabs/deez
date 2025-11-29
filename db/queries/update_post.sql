UPDATE posts
SET title = :title, content = :content, updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id, title, content, created_at, updated_at;
