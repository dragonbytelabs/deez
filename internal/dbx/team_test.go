package dbx

import (
	"context"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestDB_CreateTeam(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	t.Run("creates team successfully", func(t *testing.T) {
		description := "Test Description"
		team, err := db.CreateTeam(ctx, "Test Team", &description, nil)
		if err != nil {
			t.Fatalf("CreateTeam() returned error: %v", err)
		}

		if team == nil {
			t.Fatal("CreateTeam() returned nil team")
		}
		if team.ID == 0 {
			t.Error("CreateTeam() returned team with ID = 0")
		}
		if team.Name != "Test Team" {
			t.Errorf("CreateTeam() team.Name = %v, want %v", team.Name, "Test Team")
		}
		if team.Description == nil || *team.Description != description {
			t.Errorf("CreateTeam() team.Description = %v, want %v", team.Description, description)
		}
	})

	t.Run("creates team without description", func(t *testing.T) {
		team, err := db.CreateTeam(ctx, "No Description Team", nil, nil)
		if err != nil {
			t.Fatalf("CreateTeam() returned error: %v", err)
		}

		if team.Description != nil {
			t.Errorf("CreateTeam() team.Description = %v, want nil", team.Description)
		}
	})

	t.Run("creates team with avatar_url", func(t *testing.T) {
		avatarURL := "https://example.com/team-avatar.png"
		team, err := db.CreateTeam(ctx, "Team With Avatar", nil, &avatarURL)
		if err != nil {
			t.Fatalf("CreateTeam() returned error: %v", err)
		}

		if team.AvatarURL == nil || *team.AvatarURL != avatarURL {
			t.Errorf("CreateTeam() team.AvatarURL = %v, want %v", team.AvatarURL, avatarURL)
		}
	})
}

func TestDB_GetTeamByID(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a team
	team, _ := db.CreateTeam(ctx, "Get By ID Team", nil, nil)

	t.Run("returns team when exists", func(t *testing.T) {
		result, err := db.GetTeamByID(ctx, team.ID)
		if err != nil {
			t.Fatalf("GetTeamByID() returned error: %v", err)
		}
		if result == nil {
			t.Fatal("GetTeamByID() returned nil for existing team")
		}
		if result.ID != team.ID {
			t.Errorf("GetTeamByID() result.ID = %v, want %v", result.ID, team.ID)
		}
	})

	t.Run("returns nil for non-existent team", func(t *testing.T) {
		result, err := db.GetTeamByID(ctx, 99999)
		if err != nil {
			t.Fatalf("GetTeamByID() returned error: %v", err)
		}
		if result != nil {
			t.Error("GetTeamByID() should return nil for non-existent team")
		}
	})
}

func TestDB_GetTeamsByUser(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "teamuser@example.com", string(hash), "Team User")

	t.Run("returns empty slice for user with no teams", func(t *testing.T) {
		teams, err := db.GetTeamsByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetTeamsByUser() returned error: %v", err)
		}
		if teams == nil {
			t.Fatal("GetTeamsByUser() returned nil")
		}
		if len(teams) != 0 {
			t.Errorf("GetTeamsByUser() returned %d teams, want 0", len(teams))
		}
	})

	t.Run("returns all user teams", func(t *testing.T) {
		// Create some teams and add user to them
		team1, _ := db.CreateTeam(ctx, "Team 1", nil, nil)
		team2, _ := db.CreateTeam(ctx, "Team 2", nil, nil)
		team3, _ := db.CreateTeam(ctx, "Team 3", nil, nil)

		db.AddTeamMember(ctx, team1.ID, user.ID, "member")
		db.AddTeamMember(ctx, team2.ID, user.ID, "admin")
		db.AddTeamMember(ctx, team3.ID, user.ID, "member")

		teams, err := db.GetTeamsByUser(ctx, user.ID)
		if err != nil {
			t.Fatalf("GetTeamsByUser() returned error: %v", err)
		}
		if len(teams) != 3 {
			t.Errorf("GetTeamsByUser() returned %d teams, want 3", len(teams))
		}
	})
}

func TestDB_UpdateTeam(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a team
	team, _ := db.CreateTeam(ctx, "Original Name", nil, nil)

	t.Run("updates team successfully", func(t *testing.T) {
		newDescription := "New Description"
		updated, err := db.UpdateTeam(ctx, team.ID, "Updated Name", &newDescription, nil)
		if err != nil {
			t.Fatalf("UpdateTeam() returned error: %v", err)
		}

		if updated.Name != "Updated Name" {
			t.Errorf("UpdateTeam() updated.Name = %v, want %v", updated.Name, "Updated Name")
		}
		if updated.Description == nil || *updated.Description != newDescription {
			t.Errorf("UpdateTeam() updated.Description = %v, want %v", updated.Description, newDescription)
		}
	})
}

func TestDB_DeleteTeam(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a team
	team, _ := db.CreateTeam(ctx, "To Delete", nil, nil)

	t.Run("deletes team successfully", func(t *testing.T) {
		err := db.DeleteTeam(ctx, team.ID)
		if err != nil {
			t.Fatalf("DeleteTeam() returned error: %v", err)
		}

		// Verify team was deleted
		result, _ := db.GetTeamByID(ctx, team.ID)
		if result != nil {
			t.Error("DeleteTeam() did not delete team")
		}
	})

	t.Run("does not error on non-existent team", func(t *testing.T) {
		err := db.DeleteTeam(ctx, 99999)
		if err != nil {
			t.Errorf("DeleteTeam() returned error for non-existent team: %v", err)
		}
	})
}

func TestDB_AddTeamMember(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user and team
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "addmember@example.com", string(hash), "Add Member User")
	team, _ := db.CreateTeam(ctx, "Add Member Team", nil, nil)

	t.Run("adds member successfully", func(t *testing.T) {
		member, err := db.AddTeamMember(ctx, team.ID, user.ID, "admin")
		if err != nil {
			t.Fatalf("AddTeamMember() returned error: %v", err)
		}

		if member == nil {
			t.Fatal("AddTeamMember() returned nil member")
		}
		if member.TeamID != team.ID {
			t.Errorf("AddTeamMember() member.TeamID = %v, want %v", member.TeamID, team.ID)
		}
		if member.UserID != user.ID {
			t.Errorf("AddTeamMember() member.UserID = %v, want %v", member.UserID, user.ID)
		}
		if member.Role != "admin" {
			t.Errorf("AddTeamMember() member.Role = %v, want %v", member.Role, "admin")
		}
	})
}

func TestDB_RemoveTeamMember(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a user and team
	hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
	user, _ := db.CreateUser(ctx, "removemember@example.com", string(hash), "Remove Member User")
	team, _ := db.CreateTeam(ctx, "Remove Member Team", nil, nil)
	db.AddTeamMember(ctx, team.ID, user.ID, "member")

	t.Run("removes member successfully", func(t *testing.T) {
		err := db.RemoveTeamMember(ctx, team.ID, user.ID)
		if err != nil {
			t.Fatalf("RemoveTeamMember() returned error: %v", err)
		}

		// Verify member was removed
		members, _ := db.GetTeamMembers(ctx, team.ID)
		for _, m := range members {
			if m.UserID == user.ID {
				t.Error("RemoveTeamMember() did not remove member")
			}
		}
	})

	t.Run("does not error on non-existent member", func(t *testing.T) {
		err := db.RemoveTeamMember(ctx, team.ID, 99999)
		if err != nil {
			t.Errorf("RemoveTeamMember() returned error for non-existent member: %v", err)
		}
	})
}

func TestDB_GetTeamMembers(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	ctx := context.Background()

	// Create a team
	team, _ := db.CreateTeam(ctx, "Members Team", nil, nil)

	t.Run("returns empty slice for team with no members", func(t *testing.T) {
		members, err := db.GetTeamMembers(ctx, team.ID)
		if err != nil {
			t.Fatalf("GetTeamMembers() returned error: %v", err)
		}
		if members == nil {
			t.Fatal("GetTeamMembers() returned nil")
		}
		if len(members) != 0 {
			t.Errorf("GetTeamMembers() returned %d members, want 0", len(members))
		}
	})

	t.Run("returns all team members", func(t *testing.T) {
		// Create some users and add them to the team
		hash, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.MinCost)
		user1, _ := db.CreateUser(ctx, "member1@example.com", string(hash), "Member 1")
		user2, _ := db.CreateUser(ctx, "member2@example.com", string(hash), "Member 2")
		user3, _ := db.CreateUser(ctx, "member3@example.com", string(hash), "Member 3")

		db.AddTeamMember(ctx, team.ID, user1.ID, "admin")
		db.AddTeamMember(ctx, team.ID, user2.ID, "member")
		db.AddTeamMember(ctx, team.ID, user3.ID, "member")

		members, err := db.GetTeamMembers(ctx, team.ID)
		if err != nil {
			t.Fatalf("GetTeamMembers() returned error: %v", err)
		}
		if len(members) != 3 {
			t.Errorf("GetTeamMembers() returned %d members, want 3", len(members))
		}
	})
}
