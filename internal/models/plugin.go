package models

import "time"

type Plugin struct {
	ID           int64      `db:"id" json:"id"`
	Name         string     `db:"name" json:"name"`
	DisplayName  string     `db:"display_name" json:"display_name"`
	Description  *string    `db:"description" json:"description,omitempty"`
	Version      string     `db:"version" json:"version"`
	IsActive     bool       `db:"is_active" json:"is_active"`
	SidebarIcon  *string    `db:"sidebar_icon" json:"sidebar_icon,omitempty"`
	SidebarTitle *string    `db:"sidebar_title" json:"sidebar_title,omitempty"`
	SidebarLink  *string    `db:"sidebar_link" json:"sidebar_link,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    *time.Time `db:"updated_at" json:"updated_at,omitempty"`
}

type Form struct {
	ID          int64      `db:"id" json:"id"`
	Name        string     `db:"name" json:"name"`
	Description *string    `db:"description" json:"description,omitempty"`
	Fields      string     `db:"fields" json:"fields"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   *time.Time `db:"updated_at" json:"updated_at,omitempty"`
}
