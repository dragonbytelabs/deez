package routes

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"dragonbytelabs/dz/internal/dbx"
)

// Allowed values for post fields
var (
	allowedStatuses     = map[string]bool{"draft": true, "published": true}
	allowedVisibilities = map[string]bool{"public": true, "private": true, "password": true}
	allowedFormats      = map[string]bool{"standard": true, "aside": true, "image": true, "video": true, "audio": true, "quote": true, "link": true, "gallery": true}
)

// validatePostStatus returns a valid status or the default "draft"
func validatePostStatus(status string) string {
	if allowedStatuses[status] {
		return status
	}
	return "draft"
}

// validatePostVisibility returns a valid visibility or the default "public"
func validatePostVisibility(visibility string) string {
	if allowedVisibilities[visibility] {
		return visibility
	}
	return "public"
}

// validatePostFormat returns a valid format or the default "standard"
func validatePostFormat(format string) string {
	if allowedFormats[format] {
		return format
	}
	return "standard"
}

// RegisterPosts registers all posts-related routes
func RegisterPosts(mux *http.ServeMux, db *dbx.DB) {
	// Get all posts
	mux.Handle("GET /api/posts", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		posts, err := db.GetAllPosts(r.Context())
		if err != nil {
			log.Printf("GetPosts: error getting posts: %v", err)
			http.Error(w, "could not get posts", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"posts": posts,
		})
	})))

	// Get a specific post by ID
	mux.Handle("GET /api/posts/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("GetPostByID: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		post, err := db.GetPostByID(r.Context(), id)
		if err != nil {
			log.Printf("GetPostByID: error getting post: %v", err)
			http.Error(w, "could not get post", http.StatusInternalServerError)
			return
		}

		if post == nil {
			http.Error(w, "post not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	})))

	// Create a new post
	mux.Handle("POST /api/posts", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var in struct {
			Title      string  `json:"title"`
			Content    string  `json:"content"`
			Status     string  `json:"status"`
			Visibility string  `json:"visibility"`
			Format     string  `json:"format"`
			Excerpt    string  `json:"excerpt"`
			PublishAt  *string `json:"publish_at"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		// Validate title
		title := strings.TrimSpace(in.Title)
		if title == "" {
			http.Error(w, "title is required", http.StatusBadRequest)
			return
		}

		// Parse publish_at if provided
		var publishAt *time.Time
		if in.PublishAt != nil && *in.PublishAt != "" {
			t, err := time.Parse(time.RFC3339, *in.PublishAt)
			if err != nil {
				http.Error(w, "invalid publish_at format, use RFC3339", http.StatusBadRequest)
				return
			}
			publishAt = &t
		}

		post, err := db.CreatePost(r.Context(), dbx.PostInput{
			Title:      title,
			Content:    in.Content,
			Status:     validatePostStatus(in.Status),
			Visibility: validatePostVisibility(in.Visibility),
			Format:     validatePostFormat(in.Format),
			Excerpt:    in.Excerpt,
			PublishAt:  publishAt,
		})
		if err != nil {
			log.Printf("CreatePost: error creating post: %v", err)
			http.Error(w, "could not create post", http.StatusInternalServerError)
			return
		}

		log.Printf("CreatePost: created post id=%d", post.ID)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)
	})))

	// Update an existing post
	mux.Handle("PUT /api/posts/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("UpdatePost: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		var in struct {
			Title      string  `json:"title"`
			Content    string  `json:"content"`
			Status     string  `json:"status"`
			Visibility string  `json:"visibility"`
			Format     string  `json:"format"`
			Excerpt    string  `json:"excerpt"`
			PublishAt  *string `json:"publish_at"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		// Validate title
		title := strings.TrimSpace(in.Title)
		if title == "" {
			http.Error(w, "title is required", http.StatusBadRequest)
			return
		}

		// Parse publish_at if provided
		var publishAt *time.Time
		if in.PublishAt != nil && *in.PublishAt != "" {
			t, err := time.Parse(time.RFC3339, *in.PublishAt)
			if err != nil {
				http.Error(w, "invalid publish_at format, use RFC3339", http.StatusBadRequest)
				return
			}
			publishAt = &t
		}

		post, err := db.UpdatePost(r.Context(), id, dbx.PostInput{
			Title:      title,
			Content:    in.Content,
			Status:     validatePostStatus(in.Status),
			Visibility: validatePostVisibility(in.Visibility),
			Format:     validatePostFormat(in.Format),
			Excerpt:    in.Excerpt,
			PublishAt:  publishAt,
		})
		if err != nil {
			log.Printf("UpdatePost: error updating post: %v", err)
			http.Error(w, "could not update post", http.StatusInternalServerError)
			return
		}

		log.Printf("UpdatePost: updated post id=%d", post.ID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	})))

	// Delete a post
	mux.Handle("DELETE /api/posts/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("DeletePost: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		// Check if post exists
		post, err := db.GetPostByID(r.Context(), id)
		if err != nil {
			log.Printf("DeletePost: error getting post: %v", err)
			http.Error(w, "could not get post", http.StatusInternalServerError)
			return
		}

		if post == nil {
			http.Error(w, "post not found", http.StatusNotFound)
			return
		}

		if err := db.DeletePost(r.Context(), id); err != nil {
			log.Printf("DeletePost: error deleting post: %v", err)
			http.Error(w, "could not delete post", http.StatusInternalServerError)
			return
		}

		log.Printf("DeletePost: deleted post id=%d", id)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
		})
	})))
}
