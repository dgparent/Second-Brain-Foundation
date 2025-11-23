# SBF Activepieces Piece

Connect Second Brain Foundation to Activepieces for powerful automation.

## Features

- **Create Tasks**: Automatically create VA tasks from any trigger
- **Create Meetings**: Log meetings from calendar events
- **Query Entities**: Search and retrieve SBF data
- **Webhook Triggers**: Receive real-time notifications

## Installation

```bash
npm install
npm run build
```

## Usage

1. Add SBF piece to your Activepieces instance
2. Configure authentication (API Base URL + API Key)
3. Create workflows using SBF actions and triggers

## Actions

### Create Task
Create a new task in SBF with client isolation.

**Inputs:**
- `client_uid` - Client identifier (required)
- `title` - Task title (required)
- `description` - Task details (optional)
- `priority` - low | normal | high | urgent (required)
- `due_date` - When task is due (optional)
- `tags` - Task labels (optional)

**Output:**
```json
{
  "success": true,
  "task": {
    "uid": "va-task-12345",
    "client_uid": "va-client-001",
    "title": "Follow up call",
    "status": "pending"
  }
}
```

## Triggers

### New Entity
Triggers when a new entity is created in SBF.

**Configuration:**
- `entity_type` - Filter by type (va.task, va.meeting, etc.)
- `client_uid` - Filter by specific client (optional)

## Authentication

The piece uses custom authentication:

1. **API Base URL**: Your SBF instance URL (e.g., `https://sbf.yourdomain.com`)
2. **API Key**: Generate in SBF Settings > API Keys

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```

## License

MIT
