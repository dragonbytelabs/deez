# Copilot Instructions for deez

This repository is a Go backend with a SolidJS/TypeScript frontend for a content management system.

## Tech Stack

### Backend
- **Language**: Go 1.24+
- **Database**: SQLite with `sqlx` for database operations
- **HTTP**: Standard library `net/http` with custom routing
- **Session**: Custom session management with cookies

### Frontend
- **Framework**: SolidJS with TypeScript
- **Build Tool**: Vite
- **Styling**: Linaria (CSS-in-JS)
- **Routing**: @solidjs/router
- **Linting/Formatting**: Biome

## Project Structure

```
├── cmd/                 # Application entry points
│   ├── cli/            # CLI commands
│   ├── dz/             # Main CLI entrypoint
│   └── server/         # HTTP server entrypoint
├── db/                  # Database migrations and queries
├── dz_content/          # Content storage
├── internal/            # Internal packages
│   ├── config/         # Configuration
│   ├── dbx/            # Database access layer
│   ├── models/         # Data models
│   ├── routes/         # HTTP route handlers
│   ├── session/        # Session management
│   └── storage/        # File storage
├── scripts/             # Build and deployment scripts
└── web/                 # Frontend SolidJS application
    └── src/            # Source code
        ├── components/ # Reusable components
        ├── __tests__/  # Test files
        └── server/     # Server-side rendering
```

## Coding Conventions

### Go
- Use standard Go formatting (`gofmt`)
- Follow Go naming conventions (camelCase for unexported, PascalCase for exported)
- Handle errors explicitly - never ignore errors
- Use `context.Context` for request-scoped values
- Route handlers use the pattern `mux.HandleFunc("METHOD /path", handler)`
- Database operations should use the `dbx.DB` wrapper

### TypeScript/SolidJS
- Use Biome for formatting with tabs and double quotes
- Follow SolidJS reactive patterns (signals, effects)
- Use TypeScript strict mode
- Component files use `.tsx` extension
- Test files are in `__tests__` directory using Vitest

## Testing

### Backend Tests
```bash
go test ./...
```

### Frontend Tests
```bash
cd web
npm run test
```

### Coverage
- Backend coverage threshold: 40%
- Frontend coverage threshold: 20%

## Building

### Development
```bash
# Backend (requires Go)
go run cmd/server/main.go

# Frontend (in web directory)
npm run dev
```

### Production
```bash
# Build frontend
cd web && npm ci && npm run build

# Build backend
go build -o server cmd/server/main.go
```

### Docker
```bash
docker build -t deez .
docker compose up
```

## Environment Variables

See `.env.example` for required environment variables:
- `PORT` - Server port (default: :3000)
- `DATABASE_PATH` - SQLite database file path
- `MEDIA_STORAGE_PATH` - Path for uploaded media files
- `SESSION_SECRET` - Secret for session encryption

## Pull Request Guidelines

- Ensure all tests pass before submitting
- Add tests for new functionality
- Follow existing code style and conventions
- Keep changes focused and minimal
