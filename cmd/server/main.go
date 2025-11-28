package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"dragonbytelabs/dz/internal/config"
	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/routes"
	"dragonbytelabs/dz/internal/session"
)

func main() {
	cfg := config.MustLoad()

	db := setupDB(cfg.Database)
	defer db.Close()
	// Create session manager
	sessionManager := session.NewSessionManager(
		session.NewSQLiteStore(db),
		cfg.Session.GCInterval,
		cfg.Session.IdleExpiration,
		cfg.Session.AbsoluteExpiration,
		cfg.Session.CookieName,
	)
	mux := http.NewServeMux()
	setupRoutes(mux, db, sessionManager)
	handler := sessionManager.Handle(mux)

	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Println("listening on " + addr)
	log.Fatal(http.ListenAndServe(cfg.Server.Port, handler))
}

func setupDB(cfg config.DatabaseConfig) *dbx.DB {
	ctx := context.Background()
	db, err := dbx.OpenSQLite(cfg.Path)
	if err != nil {
		log.Fatal(err)
	}
	if err := db.ApplyMigrations(ctx); err != nil {
		log.Fatal(err)
	}
	return db
}

func setupRoutes(mux *http.ServeMux, db *dbx.DB, sm *session.SessionManager) {
	routes.RegisterStatic(mux)
	routes.RegisterAPI(mux, db)
	routes.RegisterAuth(mux, db, sm)
	routes.RegisterAdmin(mux, db)
	routes.RegisterAdminUserProfile(mux, db)
	routes.RegisterCollection(mux, db)
}
