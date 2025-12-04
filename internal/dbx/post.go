package dbx

import (
	"context"
	"time"

	"dragonbytelabs/dz/internal/models"
)

// PostInput contains the input parameters for creating or updating a post
type PostInput struct {
	Title      string
	Content    string
	Status     string
	Visibility string
	Format     string
	Excerpt    string
	PublishAt  *time.Time
}

// postInputToArgs converts PostInput to a map for SQL queries
func postInputToArgs(input PostInput) map[string]any {
	return map[string]any{
		"title":      input.Title,
		"content":    input.Content,
		"status":     input.Status,
		"visibility": input.Visibility,
		"format":     input.Format,
		"excerpt":    input.Excerpt,
		"publish_at": input.PublishAt,
	}
}

// CreatePost creates a new post
func (d *DB) CreatePost(ctx context.Context, input PostInput) (*models.Post, error) {
	q := MustQuery("create_post.sql")

	var p models.Post
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := postInputToArgs(input)

	if err := stmt.GetContext(ctx, &p, args); err != nil {
		return nil, err
	}
	return &p, nil
}

// GetPostByID retrieves a post by ID
func (d *DB) GetPostByID(ctx context.Context, id int64) (*models.Post, error) {
	q := MustQuery("get_post_by_id.sql")

	rows, err := d.DBX.NamedQueryContext(ctx, q, map[string]interface{}{
		"id": id,
	})
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, nil // no post found
	}

	var p models.Post
	if err := rows.StructScan(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

// GetAllPosts retrieves all posts ordered by created_at desc
func (d *DB) GetAllPosts(ctx context.Context) ([]models.Post, error) {
	q := MustQuery("get_all_posts.sql")

	rows, err := d.DBX.QueryxContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := make([]models.Post, 0, 10)
	for rows.Next() {
		var p models.Post
		if err := rows.StructScan(&p); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

// UpdatePost updates an existing post
func (d *DB) UpdatePost(ctx context.Context, id int64, input PostInput) (*models.Post, error) {
	q := MustQuery("update_post.sql")

	var p models.Post
	stmt, err := d.DBX.PrepareNamedContext(ctx, q)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	args := postInputToArgs(input)
	args["id"] = id

	if err := stmt.GetContext(ctx, &p, args); err != nil {
		return nil, err
	}
	return &p, nil
}

// DeletePost deletes a post by ID
func (d *DB) DeletePost(ctx context.Context, id int64) error {
	q := MustQuery("delete_post.sql")

	_, err := d.DBX.NamedExecContext(ctx, q, map[string]interface{}{
		"id": id,
	})
	return err
}
