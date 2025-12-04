UPDATE posts
SET title = :title, content = :content, status = :status, visibility = :visibility, format = :format, excerpt = :excerpt, publish_at = :publish_at, updated_at = CURRENT_TIMESTAMP
WHERE id = :id
RETURNING id, title, content, status, visibility, format, excerpt, publish_at, created_at, updated_at;
