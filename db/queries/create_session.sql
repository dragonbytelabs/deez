INSERT INTO sessions (id, data, created_at, last_activity_at)
VALUES (:id, :data, :created_at, :last_activity_at)
ON CONFLICT(id) DO UPDATE SET
    data = excluded.data,
    last_activity_at = excluded.last_activity_at