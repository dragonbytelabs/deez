package routes

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/session"
)

// getUserIDFromSession extracts user_id from session handling both int64 and float64 types
// (JSON unmarshalling converts numbers to float64)
func getUserIDFromSession(sess *session.Session) (int64, bool) {
	userIDRaw := sess.Get("user_id")
	if userIDRaw == nil {
		return 0, false
	}

	switch v := userIDRaw.(type) {
	case int64:
		return v, true
	case float64:
		return int64(v), true
	case int:
		return int64(v), true
	default:
		return 0, false
	}
}

func RegisterCollection(mux *http.ServeMux, db *dbx.DB) {
	// Create a new collection
	mux.Handle("POST /api/collections", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("CreateCollection: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		var in struct {
			Name        string  `json:"name"`
			Description *string `json:"description"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			log.Printf("CreateCollection: decode error: %v", err)
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.Name == "" {
			log.Printf("CreateCollection: name is required")
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		collection, err := db.CreateCollection(r.Context(), userID, in.Name, in.Description)
		if err != nil {
			log.Printf("CreateCollection: error creating collection: %v", err)
			if err == dbx.ErrDuplicateCollectionName {
				http.Error(w, "collection with this name already exists", http.StatusConflict)
				return
			}
			http.Error(w, "could not create collection", http.StatusInternalServerError)
			return
		}

		log.Printf("CreateCollection: created collection id=%d for user_id=%d", collection.ID, userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(collection)
	})))

	// Get all collections for the authenticated user
	mux.Handle("GET /api/collections", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("GetCollections: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		collections, err := db.GetCollectionsByUser(r.Context(), userID)
		if err != nil {
			log.Printf("GetCollections: error getting collections: %v", err)
			http.Error(w, "could not get collections", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"collections": collections,
		})
	})))

	// Get a specific collection by ID
	mux.Handle("GET /api/collections/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("GetCollection: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("GetCollection: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		collection, err := db.GetCollectionByID(r.Context(), id, userID)
		if err != nil {
			log.Printf("GetCollection: error getting collection: %v", err)
			http.Error(w, "could not get collection", http.StatusInternalServerError)
			return
		}

		if collection == nil {
			http.Error(w, "collection not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(collection)
	})))

	// Update a collection
	mux.Handle("PUT /api/collections/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("UpdateCollection: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("UpdateCollection: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		var in struct {
			Name        string  `json:"name"`
			Description *string `json:"description"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			log.Printf("UpdateCollection: decode error: %v", err)
			http.Error(w, "bad json", http.StatusBadRequest)
			return
		}

		if in.Name == "" {
			log.Printf("UpdateCollection: name is required")
			http.Error(w, "name is required", http.StatusBadRequest)
			return
		}

		collection, err := db.UpdateCollection(r.Context(), id, userID, in.Name, in.Description)
		if err != nil {
			log.Printf("UpdateCollection: error updating collection: %v", err)
			http.Error(w, "could not update collection", http.StatusInternalServerError)
			return
		}

		log.Printf("UpdateCollection: updated collection id=%d for user_id=%d", collection.ID, userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(collection)
	})))

	// Delete a collection
	mux.Handle("DELETE /api/collections/{id}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sess := session.GetSession(r)
		userID, ok := getUserIDFromSession(sess)
		if !ok {
			log.Printf("DeleteCollection: invalid user_id in session")
			http.Error(w, "invalid session", http.StatusUnauthorized)
			return
		}

		idStr := r.PathValue("id")
		id, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			log.Printf("DeleteCollection: invalid id: %v", err)
			http.Error(w, "invalid id", http.StatusBadRequest)
			return
		}

		if err := db.DeleteCollection(r.Context(), id, userID); err != nil {
			log.Printf("DeleteCollection: error deleting collection: %v", err)
			http.Error(w, "could not delete collection", http.StatusInternalServerError)
			return
		}

		log.Printf("DeleteCollection: deleted collection id=%d for user_id=%d", id, userID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
		})
	})))
}
