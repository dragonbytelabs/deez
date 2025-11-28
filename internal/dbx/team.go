package dbx

import (
	"context"

	"dragonbytelabs/dz/internal/models"
)

// CreateTeam creates a new team
func (d *DB) CreateTeam(ctx context.Context, name string, description *string) (*models.Team, error) {
	q := MustQuery("create_team.sql")

	var t models.Team
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"name":        name,
		"description": description,
	}

	if err := stmt.GetContext(ctx, &t, args); err != nil {
		return nil, err
	}
	return &t, nil
}

// GetTeamByID retrieves a team by ID
func (d *DB) GetTeamByID(ctx context.Context, id int64) (*models.Team, error) {
	q := MustQuery("get_team_by_id.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"id": id,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil // no team found
	}

	var t models.Team
	if err := rows.StructScan(&t); err != nil {
		return nil, err
	}
	return &t, nil
}

// GetTeamsByUser retrieves all teams for a specific user
func (d *DB) GetTeamsByUser(ctx context.Context, userID int64) ([]models.Team, error) {
	q := MustQuery("get_teams_by_user.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"user_id": userID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	teams := make([]models.Team, 0, 10)
	for rows.Next() {
		var t models.Team
		if err := rows.StructScan(&t); err != nil {
			return nil, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}

// UpdateTeam updates an existing team
func (d *DB) UpdateTeam(ctx context.Context, id int64, name string, description *string) (*models.Team, error) {
	q := MustQuery("update_team.sql")

	var t models.Team
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"id":          id,
		"name":        name,
		"description": description,
	}

	if err := stmt.GetContext(ctx, &t, args); err != nil {
		return nil, err
	}
	return &t, nil
}

// DeleteTeam deletes a team by ID
func (d *DB) DeleteTeam(ctx context.Context, id int64) error {
	q := MustQuery("delete_team.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"id": id,
	})
	return err
}

// AddTeamMember adds a user to a team with a specific role
func (d *DB) AddTeamMember(ctx context.Context, teamID int64, userID int64, role string) (*models.TeamMember, error) {
	q := MustQuery("add_team_member.sql")

	var tm models.TeamMember
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := map[string]any{
		"team_id": teamID,
		"user_id": userID,
		"role":    role,
	}

	if err := stmt.GetContext(ctx, &tm, args); err != nil {
		return nil, err
	}
	return &tm, nil
}

// RemoveTeamMember removes a user from a team
func (d *DB) RemoveTeamMember(ctx context.Context, teamID int64, userID int64) error {
	q := MustQuery("remove_team_member.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"team_id": teamID,
		"user_id": userID,
	})
	return err
}

// GetTeamMembers retrieves all members of a team
func (d *DB) GetTeamMembers(ctx context.Context, teamID int64) ([]models.TeamMember, error) {
	q := MustQuery("get_team_members.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"team_id": teamID,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	members := make([]models.TeamMember, 0, 10)
	for rows.Next() {
		var tm models.TeamMember
		if err := rows.StructScan(&tm); err != nil {
			return nil, err
		}
		members = append(members, tm)
	}
	return members, nil
}
