package models

import "time"

type Session struct {
	ID             string    `db:"id" json:"id"`
	Data           string    `db:"data" json:"data"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	LastActivityAt time.Time `db:"last_activity_at" json:"last_activity_at"`
}
