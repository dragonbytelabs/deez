package routes

import (
	"encoding/json"
	"net/http"

	"dragonbytelabs/dz/internal/dbx"
)

func RegisterAdmin(mux *http.ServeMux, db *dbx.DB) {
	// Get all table names
	mux.Handle("GET /api/admin/tables", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tables, err := db.GetAllTables(r.Context())
		if err != nil {
			http.Error(w, "failed to get tables", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"tables": tables,
		})
	})))

	// Get table data
	mux.Handle("GET /api/admin/table/{name}", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tableName := r.PathValue("name")

		data, err := db.GetTableData(r.Context(), tableName)
		if err != nil {
			http.Error(w, "failed to get table data", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"table": tableName,
			"data":  data,
		})
	})))
}

func RegisterAdminUserProfile(mux *http.ServeMux, db *dbx.DB) {
	// Get user profile
	mux.Handle("GET /api/admin/user/profile", RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "user profile endpoint",
		})
	})))
}
