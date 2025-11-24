DELETE FROM sessions 
WHERE last_activity_at < :idle_threshold 
   OR created_at < :absolute_threshold