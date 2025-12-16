# DEEZ

Distributed Embedable Extensible Zettlekasten note-taking system

## Features

### ✅ Core Features (Implemented)

#### File Management
- **File Tree Navigation**: Browse and organize notes in a hierarchical folder structure
- **Multi-tab Editor**: Open multiple files simultaneously with tab management
- **Auto-save**: Automatic draft saving with manual save (Cmd+S)
- **File Operations**: Create, rename, delete files and folders
- **Smart Tab Cleanup**: Automatically closes tabs when files/folders are deleted

#### Search & Discovery
- **Command Palette** (Cmd+P): Quick access to files and actions
- **Link Search** (Cmd+K): Insert wiki-style links with fuzzy search
- **Advanced Query DSL**: Search with operators:
  - `type:note` - Filter by frontmatter type
  - `status:active` - Filter by status field
  - `tag:project` - Search by tags
  - `linkto:filename` - Find notes linking to a file
  - `linkedby:filename` - Find notes linked from a file
  - `links:5` - Notes with at least N outgoing links
  - `backlinks:3` - Notes with at least N incoming links
- **Smart Search Scoring**: Weighted results (title 90-100, filename 50-100, ID 60, aliases 30, tags 20, body 5)

#### Note Creation
- **New Note**: Basic note creation with template support
- **New Zettel**: Structured note with auto-generated ID (YYYYMMDDhhmmss-xxx format)
  - Prompts for title and tags
  - Auto-populated frontmatter
- **Daily Notes**: Create/open date-based notes (YYYY-MM-DD.md)
  - Built-in template with Tasks/Notes/Log sections
- **Quick Capture**: Fast note creation filed to Inbox folder
  - Auto-creates Inbox directory
  - Timestamped filenames

#### Markdown Support
- **Frontmatter Parsing**: YAML frontmatter with metadata
- **Wiki Links**: `[[filename]]` and `[[filename|alias]]` syntax
- **Syntax Highlighting**: Code blocks with language detection
- **Rich Preview**: Rendered markdown preview

#### Plugin System
- **Plugin Registry**: Extensible architecture for custom functionality
- **Lifecycle Hooks**:
  - `onCreateNote`: Execute when new notes are created
  - `onSave`: Process content before saving
  - `onDelete`: Handle file deletion events
  - `onParse`: Transform markdown during parsing
- **Active Plugin Management**: Enable/disable plugins via settings

#### Sync & Storage
- **Local-first**: All data stored locally by default
- **Sync Queue**: Background synchronization system
- **Remote Sync**: Optional remote storage provider support
- **Conflict Resolution**: Handles sync conflicts

#### User Management
- **Authentication**: User login and session management
- **Team Support**: Multi-user teams and permissions
- **User Profiles**: Avatars, display names, email management

### 🚧 Planned Features (Roadmap)

#### Plugin Extensions (Tasks 6-9)
- [ ] **Plugin Commands**: Custom commands in command palette
- [ ] **Plugin Panels**: Side widgets and custom UI panels
- [ ] **Plugin Render Hooks**: Custom markdown transforms and syntax
- [ ] **Extensible Metadata Schema**: Plugin-defined frontmatter fields

#### Publishing & Sharing (Task 10)
- [ ] **Export to HTML**: Static site generation from notes
- [ ] **Share Links**: Generate shareable links for individual notes
- [ ] **Password Protection**: Optional access control for published content
- [ ] **Selective Publishing**: Per-note permissions and allowlists

#### Advanced Features (Future)
- [ ] **Graph View**: Visual representation of note connections
- [ ] **Tag Browser**: Hierarchical tag navigation
- [ ] **Backlinks Panel**: Show incoming links to current note
- [ ] **Template Library**: Reusable note templates
- [ ] **Export/Import**: Backup and migration tools
- [ ] **Mobile App**: iOS/Android companion apps

## Tech Stack

### Backend
- **Language**: Go 1.24+
- **Database**: SQLite with `sqlx`
- **HTTP**: Standard library `net/http`
- **Session**: Custom cookie-based session management

### Frontend
- **Framework**: SolidJS with TypeScript
- **Build Tool**: Vite
- **Styling**: Linaria (CSS-in-JS)
- **Routing**: @solidjs/router
- **Linting**: Biome

## Quick Start

### Prerequisites
- Go 1.24+
- Node.js 18+
- npm or pnpm

### Development

```bash
# Backend
go run cmd/server/main.go

# Frontend (in separate terminal)
cd web
npm install
npm run dev
```

### Production Build

```bash
# Build frontend
cd web && npm ci && npm run build

# Build backend
go build -o server cmd/server/main.go

# Run
./server
```

### Docker

```bash
docker build -t deez .
docker compose up
```

## Configuration

See `.env.example` for required environment variables:
- `PORT` - Server port (default: :3000)
- `DATABASE_PATH` - SQLite database file path
- `MEDIA_STORAGE_PATH` - Path for uploaded media files
- `SESSION_SECRET` - Secret for session encryption

## Testing

```bash
# Backend
go test ./...

# Frontend
cd web
npm run test
```

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
└── web/                 # Frontend SolidJS application
    └── src/
        ├── components/ # Reusable components
        └── __tests__/  # Test files
```

## Contributing

The repo is currently undergoing massive iteration. Please check back later on how to contribute

## License

See [LICENSE](LICENSE) for details.
