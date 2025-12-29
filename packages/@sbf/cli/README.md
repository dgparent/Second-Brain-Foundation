# @sbf/cli

Command-line interface for Second Brain Foundation - a power-user tool for managing your knowledge system.

## Installation

```bash
# Global installation
npm install -g @sbf/cli

# Or with pnpm
pnpm add -g @sbf/cli
```

## Quick Start

```bash
# Initialize SBF in current directory
sbf init

# Create an entity
sbf entity create -t note -T "My First Note" -c "Content here"

# Search your knowledge base
sbf search "machine learning"

# Start an interactive chat
sbf chat
```

## Commands

### `sbf init`

Initialize SBF in the current directory.

```bash
sbf init
```

This will:
- Prompt for API URL and key
- Create `.sbf/` directory with config
- Set up folder structure (notes/, projects/, people/, etc.)
- Add `.gitignore` entries

### `sbf entity`

CRUD operations for entities.

```bash
# Create
sbf entity create -t note -T "Title" -c "Content"
sbf entity create -t project -T "My Project" --tags "work,important"

# List
sbf entity list
sbf entity list --type note --limit 20

# Get
sbf entity get <uid>
sbf entity get <uid> --json

# Update
sbf entity update <uid> -T "New Title"
sbf entity update <uid> -c "New content"

# Delete
sbf entity delete <uid>
sbf entity delete <uid> --force
```

### `sbf search`

Search your knowledge base.

```bash
# Basic search
sbf search "query"

# With filters
sbf search "query" --type note
sbf search "query" --limit 20

# Hybrid search (semantic + keyword)
sbf search "query" --hybrid
```

### `sbf chat`

Interactive AI chat with your knowledge base.

```bash
sbf chat

# In chat mode:
# /help     - Show commands
# /sources  - Show sources for last response
# /add      - Add entity to context
# /clear    - Clear chat history
# /exit     - Exit chat
```

### `sbf sync`

Synchronize local files with SBF.

```bash
# Full sync
sbf sync

# Upload only
sbf sync --direction up

# Download only
sbf sync --direction down

# Preview changes
sbf sync --dry-run
```

### `sbf migrate`

Import from or export to other tools.

#### Import

```bash
# Interactive
sbf migrate import

# From Obsidian vault
sbf migrate import --source obsidian --path /path/to/vault

# From Notion export (ZIP)
sbf migrate import --source notion --path ./notion-export.zip

# From Roam export (JSON)
sbf migrate import --source roam --path ./roam-export.json

# Preview without importing
sbf migrate import --source obsidian --path /vault --dry-run
```

#### Export

```bash
# Export for NotebookLM
sbf migrate export --format notebooklm --output ./export

# Export as markdown
sbf migrate export --format markdown --output ./export

# Export as JSON
sbf migrate export --format json --output ./export

# Export specific entities
sbf migrate export --format notebooklm --sources uid1,uid2,uid3
```

## Configuration

Configuration is stored in `.sbf/config.json`:

```json
{
  "apiUrl": "http://localhost:3000/api",
  "apiKey": "your-api-key",
  "defaultType": "note",
  "editor": "code",
  "outputFormat": "table",
  "syncOnSave": false,
  "excludePatterns": ["node_modules/**", ".git/**"]
}
```

### Environment Variables

```bash
SBF_API_URL=http://localhost:3000/api
SBF_API_KEY=your-api-key
SBF_DEBUG=true
```

## Folder Structure

After initialization:

```
your-project/
├── .sbf/
│   └── config.json
├── notes/
├── projects/
├── people/
├── resources/
├── tags/
└── templates/
```

## Frontmatter

Files sync with YAML frontmatter:

```yaml
---
uid: entity-unique-id
title: My Note
type: note
tags: [tag1, tag2]
created: 2024-01-01T00:00:00Z
modified: 2024-01-02T00:00:00Z
---

Your content here...
```

## Import Formats

### Obsidian

- Scans `.md` files
- Parses YAML frontmatter
- Extracts `[[wikilinks]]`
- Extracts `#tags`
- Preserves folder structure as metadata

### Notion

- Reads ZIP export from Notion
- Converts HTML to Markdown
- Extracts properties as metadata
- Handles nested pages

### Roam

- Reads JSON export
- Converts block structure to markdown
- Handles `[[page refs]]` and `((block refs))`
- Converts `{{TODO}}` checkboxes
- Preserves daily notes

## Export Formats

### NotebookLM

Optimized for NotebookLM consumption:
- Plain markdown files
- Citation headers with source info
- Cross-reference annotations
- Master index file

### Markdown

Standard markdown with YAML frontmatter.

### JSON

Single JSON file with all entities.

## Development

```bash
# Clone and install
git clone <repo>
cd packages/@sbf/cli
pnpm install

# Build
pnpm build

# Link for local development
pnpm link --global

# Run locally
pnpm dev -- init
```

## License

MIT
