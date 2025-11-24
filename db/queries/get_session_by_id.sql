
-- get session by id 
SELECT id, data, created_at, last_activity_at 
FROM sessions 
WHERE id = :id
LIMIT 1;