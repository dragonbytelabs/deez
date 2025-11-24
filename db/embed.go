package db

import "embed"

//go:embed migrations/*.sql
var MigrationsFS embed.FS

//go:embed queries/*.sql
var QueriesFS embed.FS
