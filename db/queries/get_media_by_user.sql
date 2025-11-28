SELECT id, user_id, filename, original_name, mime_type, size, storage_type, storage_path, url, created_at, updated_at
FROM media
WHERE user_id = :user_id
ORDER BY created_at DESC;
