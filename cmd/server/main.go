package main

import (
	"log"
	"net"
	"net/http"

	"dragonbytelabs/dz/internal/config"
	"dragonbytelabs/dz/internal/dbx"
	"dragonbytelabs/dz/internal/routes"
	"dragonbytelabs/dz/internal/vault"

	webview "github.com/webview/webview_go"
)

func main() {
	cfg := config.MustLoad()
	appDir, err := config.AppDir("deez")
	if err != nil {
		log.Fatal(err)
	}
	// Resolve relative DB path into appDir
	cfg.Database.Path = config.ResolveInAppDir(appDir, cfg.Database.Path)

	db := setupDB(*cfg)
	defer db.Close()

	mux := http.NewServeMux()
	vault, err := vault.New(cfg.Content.VaultPath)
	if err != nil {
		log.Fatal(err)
	}
	setupRoutes(mux, vault)

	ln, err := net.Listen("tcp", "127.0.0.1:3000")
	// ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	url := "http://" + ln.Addr().String() + "/"
	log.Println("serving UI at", url)

	// Start HTTP server in background
	srv := &http.Server{Handler: mux}
	log.Fatal(srv.Serve(ln))
	// go func() {
	// 	// Serve returns http.ErrServerClosed on normal shutdown
	// 	if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
	// 		log.Fatal(err)
	// 	}
	// }()

	// createWindow(url)

	// // When window closes, shut down server
	// _ = srv.Shutdown(context.Background())
}

func setupDB(cfg config.Config) *dbx.DB {
	// ctx := context.Background()
	db, err := dbx.OpenSQLite(cfg.Database.Path)

	if err != nil {
		log.Fatal(err)
	}
	// if err := db.ApplyMigrations(ctx); err != nil {
	// 	log.Fatal(err)
	// }
	return db
}

func setupRoutes(mux *http.ServeMux, vault *vault.Vault) {
	routes.RegisterApi(mux, vault)
	routes.RegisterStatic(mux)
}

func createWindow(url string) {
	// Open the native window
	w := webview.New(true) // debug=true
	defer w.Destroy()
	w.SetTitle("DEEZ / dz")
	w.SetSize(1200, 800, webview.HintNone)
	w.Navigate(url)
	w.Run()

}
