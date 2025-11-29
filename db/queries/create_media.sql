INSERT INTO media (user_id, filename, original_name, mime_type, size, storage_type, storage_path, url)
VALUES (:user_id, :filename, :original_name, :mime_type, :size, :storage_type, :storage_path, :url)
RETURNING id, user_id, filename, original_name, mime_type, size, storage_type, storage_path, url, created_at, updated_at;
