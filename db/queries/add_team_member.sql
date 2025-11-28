INSERT INTO team_members (team_id, user_id, role)
VALUES (:team_id, :user_id, :role)
RETURNING team_id, user_id, role, joined_at;
