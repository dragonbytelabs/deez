SELECT team_id, user_id, role, joined_at
FROM team_members
WHERE team_id = :team_id
ORDER BY joined_at ASC;
