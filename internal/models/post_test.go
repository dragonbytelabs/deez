package models

import (
	"testing"
	"time"
)

func TestPost_Struct(t *testing.T) {
	now := time.Now()

	post := Post{
		ID:        1,
		Title:     "Test Post",
		Content:   "Test content",
		CreatedAt: now,
		UpdatedAt: now,
	}

	if post.ID != 1 {
		t.Errorf("Post.ID = %v, want %v", post.ID, 1)
	}
	if post.Title != "Test Post" {
		t.Errorf("Post.Title = %v, want %v", post.Title, "Test Post")
	}
	if post.Content != "Test content" {
		t.Errorf("Post.Content = %v, want %v", post.Content, "Test content")
	}
	if !post.CreatedAt.Equal(now) {
		t.Errorf("Post.CreatedAt = %v, want %v", post.CreatedAt, now)
	}
	if !post.UpdatedAt.Equal(now) {
		t.Errorf("Post.UpdatedAt = %v, want %v", post.UpdatedAt, now)
	}
}

func TestPost_EmptyContent(t *testing.T) {
	post := Post{
		ID:      1,
		Title:   "Test Post",
		Content: "",
	}

	if post.Content != "" {
		t.Errorf("Post.Content = %v, want empty string", post.Content)
	}
}
