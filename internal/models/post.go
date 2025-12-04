package models

import "time"

type Post struct {
	ID         int64      `db:"id" json:"id"`
	Title      string     `db:"title" json:"title"`
	Content    string     `db:"content" json:"content"`
	Status     string     `db:"status" json:"status"`
	Visibility string     `db:"visibility" json:"visibility"`
	Format     string     `db:"format" json:"format"`
	Excerpt    string     `db:"excerpt" json:"excerpt"`
	PublishAt  *time.Time `db:"publish_at" json:"publish_at"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at" json:"updated_at"`
}
