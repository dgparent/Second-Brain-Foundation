# Phase 2 Integration - Quick Start Guide

**Status:** ✅ Backend + API + UI Connected  
**Date:** 2025-11-14  

---

## What's Built

### 1. IntegrationService (`packages/core/src/integration/`)
- Orchestrates Agent + Watcher + EntityManager
- Handles queue item processing
- Entity extraction via LLM
- Event-driven architecture

### 2. API Server (`packages/server/`)
- Express HTTP server
- RESTful endpoints for chat, queue, entities
- CORS enabled
- Error handling

### 3. API Client (`packages/ui/src/api/`)
- Fetch-based client
- Type-safe responses
- Error handling
- Singleton pattern

### 4. Connected UI (`packages/ui/src/App.tsx`)
- Real-time chat with agent
- Queue polling (2s interval)
- Approve/reject workflow
- Initialization flow

---

## Running the System

### Step 1: Install Dependencies

```bash
# From project root
cd Extraction-01/03-integration/sbf-app

# Install all packages
pnpm install
```

### Step 2: Start API Server

```bash
# In terminal 1
cd packages/server
pnpm dev

# Server starts on http://localhost:3001
```

### Step 3: Start UI

```bash
# In terminal 2
cd packages/ui
pnpm dev

# UI opens on http://localhost:3000
```

### Step 4: Initialize

1. UI will prompt for:
   - **Vault path** (e.g., `C:\!Projects\SecondBrainFoundation\vault`)
   - **OpenAI API key** (your key)

2. Click OK/Enter

3. Wait for initialization (~2-5 seconds)

4. Start chatting!

---

## How It Works

### Chat Flow

```
User types message in UI
    ↓
API Client → POST /api/chat
    ↓
API Server → IntegrationService.sendMessage()
    ↓
SBFAgent.step() → LLM call
    ↓
Tool execution (if tools called)
    ↓
Response → API → UI
    ↓
Message displayed
```

### File Watcher Flow

```
File changes in vault
    ↓
FileWatcher detects
    ↓
FileProcessor analyzes
    ↓
OrganizationQueue adds item
    ↓
UI polls /api/queue
    ↓
User sees pending item
    ↓
User clicks "Approve"
    ↓
POST /api/queue/:id/approve
    ↓
IntegrationService.handleQueueItem()
    ↓
LLM extracts entities
    ↓
EntityFileManager creates files
    ↓
Queue updated → UI refreshes
```

---

## API Endpoints

### POST /api/init
Initialize the service

**Request:**
```json
{
  "config": {
    "vaultPath": "C:\\vault",
    "agentConfig": {
      "userId": "user-001",
      "llmProvider": "openai",
      "openaiApiKey": "sk-..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Integration service initialized"
}
```

### POST /api/chat
Send message to agent

**Request:**
```json
{
  "message": "Create a topic about AI"
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "messages": [
      {
        "role": "assistant",
        "content": "Created topic: AI"
      }
    ],
    "usage": {
      "totalTokens": 150
    }
  }
}
```

### GET /api/queue
Get queue items

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": "queue-123",
      "event": {
        "type": "add",
        "path": "Daily/2025-11-14.md"
      },
      "status": "pending",
      "processingResult": {
        "action": "extract_entities",
        "reason": "New daily note"
      }
    }
  ]
}
```

### POST /api/queue/:id/approve
Approve queue item

**Response:**
```json
{
  "success": true,
  "message": "Queue item approved"
}
```

### GET /api/entities
List all entities

**Response:**
```json
{
  "success": true,
  "entities": [
    {
      "uid": "top-ai-001",
      "type": "Topic",
      "title": "Artificial Intelligence",
      "path": "Topics/Artificial-Intelligence.md"
    }
  ]
}
```

---

## Testing

### 1. Test Chat

```bash
# Start both server and UI
# Then in UI:
```

Type: "Create a topic about Machine Learning"

Expected:
- Agent responds
- Tool called: `create_entity`
- Entity created in vault
- Response shows success

### 2. Test File Watcher

```bash
# With server + UI running
# Create a file in vault:
```

`vault/Daily/2025-11-14.md`:
```markdown
# Today

I learned about React Hooks and TypeScript generics.
Also researched machine learning algorithms.
```

Expected:
- Watcher detects file
- Queue shows pending item
- Click "Approve"
- Entities extracted:
  - `Topics/React-Hooks.md`
  - `Topics/TypeScript-Generics.md`
  - `Topics/Machine-Learning-Algorithms.md`

### 3. Test Queue Workflow

1. Create multiple files
2. See multiple queue items
3. Click "Approve All"
4. Watch processing
5. Check vault for new entity files

---

## Configuration

### Environment Variables

Create `.env` in `packages/server/`:

```env
PORT=3001
```

Create `.env` in `packages/ui/`:

```env
VITE_API_URL=http://localhost:3001/api
```

### Default Settings

**LLM Provider:** OpenAI (GPT-4)  
**Watcher Debounce:** 500ms  
**Queue Poll Interval:** 2000ms (2s)  
**Auto-approve:** Disabled (manual approval required)  

---

## Troubleshooting

### "Service not initialized"
- Make sure API server is running
- Check UI initialization flow completed
- Verify vault path is correct

### "Failed to send message"
- Check OpenAI API key is valid
- Check server logs for errors
- Verify network connection

### Queue not updating
- Check watcher is running (server logs)
- Verify vault path is correct
- Check file is markdown (.md)

### No entities created
- Check approval was successful
- View server logs for LLM response
- Verify entities were created in vault

---

## What's Next

### Immediate Improvements
1. **Streaming responses** - Show LLM response in real-time
2. **WebSocket** - Replace polling with push updates
3. **Better error handling** - User-friendly error messages
4. **Configuration UI** - Don't use prompts for setup

### Phase 3 Features
1. **Entity visualization** - Graph view
2. **Search** - Full-text and semantic search
3. **Markdown rendering** - Rich message display
4. **File upload** - Drag-drop files to process

---

## File Structure

```
packages/
├── core/
│   └── src/
│       └── integration/
│           ├── integration-service.ts  (250 LOC)
│           └── index.ts
├── server/
│   ├── src/
│   │   └── index.ts                   (300 LOC)
│   ├── package.json
│   └── tsconfig.json
└── ui/
    └── src/
        ├── api/
        │   └── client.ts              (250 LOC)
        ├── App.tsx                    (200 LOC, updated)
        └── ...
```

---

## Status

✅ **Backend Integration** - IntegrationService working  
✅ **API Layer** - Express server with endpoints  
✅ **UI Connection** - React app calling API  
✅ **Chat** - Real messages to agent  
✅ **Queue** - Real-time updates  
⏳ **Entity Extraction** - Basic (needs improvement)  
⏳ **Streaming** - Not implemented yet  
⏳ **WebSocket** - Not implemented yet  

---

**Ready to test!** Start both server and UI, then try chatting and creating files.
