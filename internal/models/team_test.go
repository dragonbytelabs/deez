package models

import (
	"testing"
	"time"
)

func TestTeam_Struct(t *testing.T) {
	now := time.Now()
	description := "Test description"

	team := Team{
		ID:          1,
		Name:        "Test Team",
		Description: &description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if team.ID != 1 {
		t.Errorf("Team.ID = %v, want %v", team.ID, 1)
	}
	if team.Name != "Test Team" {
		t.Errorf("Team.Name = %v, want %v", team.Name, "Test Team")
	}
	if *team.Description != description {
		t.Errorf("Team.Description = %v, want %v", *team.Description, description)
	}
	if !team.CreatedAt.Equal(now) {
		t.Errorf("Team.CreatedAt = %v, want %v", team.CreatedAt, now)
	}
	if !team.UpdatedAt.Equal(now) {
		t.Errorf("Team.UpdatedAt = %v, want %v", team.UpdatedAt, now)
	}
}

func TestTeam_NilDescription(t *testing.T) {
	team := Team{
		ID:   1,
		Name: "Test Team",
	}

	if team.Description != nil {
		t.Errorf("Team.Description = %v, want nil", team.Description)
	}
}

func TestTeamMember_Struct(t *testing.T) {
	now := time.Now()

	member := TeamMember{
		TeamID:   1,
		UserID:   2,
		Role:     "admin",
		JoinedAt: now,
	}

	if member.TeamID != 1 {
		t.Errorf("TeamMember.TeamID = %v, want %v", member.TeamID, 1)
	}
	if member.UserID != 2 {
		t.Errorf("TeamMember.UserID = %v, want %v", member.UserID, 2)
	}
	if member.Role != "admin" {
		t.Errorf("TeamMember.Role = %v, want %v", member.Role, "admin")
	}
	if !member.JoinedAt.Equal(now) {
		t.Errorf("TeamMember.JoinedAt = %v, want %v", member.JoinedAt, now)
	}
}
