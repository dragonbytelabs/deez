SELECT t.id, t.name, t.description, t.created_at, t.updated_at
FROM teams t
INNER JOIN team_members tm ON t.id = tm.team_id
WHERE tm.user_id = :user_id
ORDER BY t.created_at DESC;
