# Phase 2: Full Integration - Implementation Plan

**Date:** 2025-11-14  
**Status:** 🟢 **READY TO START**  
**Prerequisites:** Tier 1 Complete ✅  

---

## Overview

**Goal:** Connect all Tier 1 components into a working system with LLM entity extraction

**Duration:** 2-3 days  
**Components:** Backend integration + UI connection + Entity extraction  

---

## What We Have (Tier 1 Complete)

### Backend ✅
- ✅ SBFAgent with 3 LLM providers (OpenAI, Anthropic, Ollama)
- ✅ 12 entity tools (create, read, update, search, link, etc.)
- ✅ FileWatcher system (monitoring, processing, queue)
- ✅ EntityFileManager (CRUD operations)
- ✅ Memory blocks (Letta-inspired)

### Frontend ✅
- ✅ React chat interface (ChatContainer, MessageInput)
- ✅ Queue panel (QueuePanel with approval controls)
- ✅ App shell with state management

### Not Connected ❌
- ❌ UI doesn't talk to agent
- ❌ Watcher doesn't trigger entity extraction
- ❌ Queue doesn't execute approved items
- ❌ No streaming responses
- ❌ No real entity extraction from files

---

## Phase 2 Objectives

### Epic 2.1: Backend Integration (Day 1)
**Goal:** Connect agent, watcher, and entity extraction

1. **Create Integration Service**
   - Orchestrates agent + watcher + entity manager
   - Handles file changes → entity extraction workflow
   - Manages queue processing

2. **Entity Extraction with LLM**
   - Tool: `extract_entities_from_file`
   - Read file content
   - Call LLM to extract entities
   - Create entities via tools
   - Update relationships

3. **Watcher → Agent Integration**
   - FileWatcher detects changes
   - Processor determines action
   - Queue adds items
   - Approved items → LLM extraction
   - Results → Entity creation

### Epic 2.2: API Layer (Day 1-2)
**Goal:** Create API for UI to communicate with backend

1. **HTTP Server** (Express/Fastify)
   - `POST /api/chat` - Send message to agent
   - `GET /api/queue` - Get queue items
   - `POST /api/queue/:id/approve` - Approve item
   - `POST /api/queue/:id/reject` - Reject item
   - `GET /api/entities` - List entities
   - WebSocket support for streaming

2. **Agent API Handler**
   - Parse user messages
   - Execute agent.step()
   - Stream responses
   - Return tool results

3. **Queue API Handler**
   - Get queue state
   - Approve/reject items
   - Trigger processing

### Epic 2.3: UI Integration (Day 2)
**Goal:** Connect React UI to backend API

1. **API Client**
   - Fetch wrapper for API calls
   - WebSocket for streaming
   - Error handling
   - Retry logic

2. **Connect ChatContainer**
   - Send messages to agent
   - Display responses
   - Show streaming messages
   - Handle errors

3. **Connect QueuePanel**
   - Fetch queue items
   - Approve/reject via API
   - Real-time updates
   - Show processing status

### Epic 2.4: Entity Extraction Pipeline (Day 2-3)
**Goal:** LLM-powered entity extraction from files

1. **Extraction Prompt Engineering**
   - System prompt for entity extraction
   - Few-shot examples
   - JSON schema for responses

2. **Entity Extraction Tool**
   - Read file content
   - Call LLM with extraction prompt
   - Parse entity data
   - Validate entities
   - Create via EntityFileManager

3. **Automatic Processing**
   - Watcher detects new daily note
   - Auto-approve (configurable)
   - LLM extracts entities
   - Create entity files
   - Update relationships
   - Update daily note with links

---

## Implementation Steps

### Step 1: Integration Service (2-3 hours)

**Create:** `packages/core/src/integration/integration-service.ts`

```typescript
/**
 * Integration Service
 * 
 * Orchestrates agent, watcher, and entity extraction
 */

import { SBFAgent } from '../agent/sbf-agent';
import { WatcherService } from '../watcher/watcher-service';
import { EntityFileManager } from '../entities/entity-file-manager';
import { Vault } from '../filesystem/vault';

export class IntegrationService {
  private agent: SBFAgent;
  private watcher: WatcherService;
  private entityManager: EntityFileManager;

  constructor(config: IntegrationConfig) {
    // Initialize all components
  }

  async start() {
    // Start watcher
    await this.watcher.start();

    // Connect watcher events to agent
    this.watcher.on('processing-needed', async (item) => {
      await this.handleQueueItem(item);
    });
  }

  private async handleQueueItem(item: QueueItem) {
    // Extract entities using agent
    // Create entities
    // Update queue
  }

  async sendMessage(message: string) {
    // Send to agent
    const response = await this.agent.step([{
      role: 'user',
      content: message,
    }]);

    return response;
  }
}
```

### Step 2: Entity Extraction Tool (3-4 hours)

**Create:** `packages/core/src/agent/tools/extract-entities.ts`

```typescript
/**
 * Entity Extraction Tool
 * 
 * Extracts entities from file content using LLM
 */

import { Tool } from '../schemas/tool';

export const extractEntitiesFromFile: Tool = {
  name: 'extract_entities_from_file',
  description: 'Extract entities from a markdown file using LLM analysis',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to extract entities from',
      },
      entityTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Types of entities to extract (Topic, Project, Person, etc.)',
      },
    },
    required: ['filePath'],
  },
  handler: async (params, context) => {
    // 1. Read file content
    const content = await context.vault.readFile(params.filePath);

    // 2. Call LLM with extraction prompt
    const extractionPrompt = `
You are an expert at extracting structured entities from text.

Extract the following entities from this content:
- Topics (concepts, subjects, ideas)
- Projects (tasks, goals, initiatives)
- People (names mentioned)
- Places (locations mentioned)

Content:
${content.content}

Return JSON array of entities:
[{
  "type": "Topic" | "Project" | "Person" | "Place",
  "title": "Entity title",
  "description": "Brief description",
  "mentions": ["context where mentioned"]
}]
`;

    const llmResponse = await context.llm.chat([
      { role: 'system', content: 'You extract entities in JSON format.' },
      { role: 'user', content: extractionPrompt },
    ]);

    // 3. Parse entities
    const entities = JSON.parse(llmResponse.content);

    // 4. Create entities
    const created = [];
    for (const entity of entities) {
      const uid = await context.entityManager.create({
        type: entity.type,
        title: entity.title,
        content: entity.description,
      });
      created.push({ ...entity, uid });
    }

    // 5. Create relationships to source file
    for (const entity of created) {
      await context.entityManager.createRelationship({
        fromUid: entity.uid,
        toPath: params.filePath,
        type: 'mentioned_in',
      });
    }

    return {
      success: true,
      entitiesCreated: created.length,
      entities: created,
    };
  },
};
```

### Step 3: API Server (2-3 hours)

**Create:** `packages/server/src/api/server.ts`

```typescript
/**
 * API Server
 * 
 * Express server for UI <-> Backend communication
 */

import express from 'express';
import cors from 'cors';
import { IntegrationService } from '@sbf/core';

const app = express();
app.use(cors());
app.use(express.json());

let service: IntegrationService;

// Initialize service
app.post('/api/init', async (req, res) => {
  service = new IntegrationService(req.body.config);
  await service.start();
  res.json({ success: true });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const response = await service.sendMessage(message);
  res.json(response);
});

// Queue endpoints
app.get('/api/queue', (req, res) => {
  const items = service.getQueueItems();
  res.json(items);
});

app.post('/api/queue/:id/approve', (req, res) => {
  service.approveQueueItem(req.params.id);
  res.json({ success: true });
});

app.post('/api/queue/:id/reject', (req, res) => {
  service.rejectQueueItem(req.params.id);
  res.json({ success: true });
});

// Entity endpoints
app.get('/api/entities', async (req, res) => {
  const entities = await service.listEntities();
  res.json(entities);
});

app.listen(3001, () => {
  console.log('API server running on http://localhost:3001');
});
```

### Step 4: UI API Client (1-2 hours)

**Create:** `packages/ui/src/api/client.ts`

```typescript
/**
 * API Client
 * 
 * Client for communicating with backend API
 */

const API_BASE = 'http://localhost:3001/api';

export class APIClient {
  async sendMessage(message: string) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return response.json();
  }

  async getQueueItems() {
    const response = await fetch(`${API_BASE}/queue`);
    return response.json();
  }

  async approveQueueItem(id: string) {
    const response = await fetch(`${API_BASE}/queue/${id}/approve`, {
      method: 'POST',
    });
    return response.json();
  }

  async rejectQueueItem(id: string) {
    const response = await fetch(`${API_BASE}/queue/${id}/reject`, {
      method: 'POST',
    });
    return response.json();
  }

  async getEntities() {
    const response = await fetch(`${API_BASE}/entities`);
    return response.json();
  }
}
```

### Step 5: Connect UI to API (2 hours)

**Update:** `packages/ui/src/App.tsx`

```typescript
import { useEffect, useState } from 'react';
import { APIClient } from './api/client';

const api = new APIClient();

export const App = () => {
  const [messages, setMessages] = useState([]);
  const [queueItems, setQueueItems] = useState([]);

  // Load queue items
  useEffect(() => {
    const loadQueue = async () => {
      const items = await api.getQueueItems();
      setQueueItems(items);
    };
    loadQueue();
    
    // Poll every 2 seconds
    const interval = setInterval(loadQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }]);

    // Send to API
    const response = await api.sendMessage(message);

    // Add assistant response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    }]);
  };

  const handleApprove = async (id: string) => {
    await api.approveQueueItem(id);
    // Refresh queue
    const items = await api.getQueueItems();
    setQueueItems(items);
  };

  return (
    <div className="flex h-screen">
      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
      />
      <QueuePanel
        items={queueItems}
        onApprove={handleApprove}
        onReject={async (id) => {
          await api.rejectQueueItem(id);
          const items = await api.getQueueItems();
          setQueueItems(items);
        }}
      />
    </div>
  );
};
```

---

## Testing Strategy

### Unit Tests
1. **IntegrationService** - Component orchestration
2. **Entity extraction** - LLM parsing
3. **API endpoints** - Request/response
4. **UI components** - API integration

### Integration Tests
1. **File change → Entity creation** - End-to-end
2. **Chat → Tool execution** - Agent workflow
3. **Queue approval → Processing** - Workflow
4. **Streaming responses** - Real-time updates

### Manual Testing
1. Create daily note → See entities extracted
2. Chat "Create topic about AI" → See entity created
3. Approve queue item → See processing
4. Check vault for new files

---

## Success Criteria

### Functional
- [ ] UI sends messages to agent
- [ ] Agent responds with tool calls
- [ ] Entities created via chat
- [ ] File watcher detects changes
- [ ] Queue shows pending items
- [ ] Approve triggers entity extraction
- [ ] Extracted entities saved to vault
- [ ] Queue updates in real-time

### Code Quality
- [ ] TypeScript strict mode
- [ ] Error handling
- [ ] Clean separation
- [ ] Well-documented
- [ ] Tests passing

### User Experience
- [ ] Responsive UI
- [ ] Clear error messages
- [ ] Loading states
- [ ] Success feedback

---

## Deliverables

### New Files (~1,500 LOC)

```
packages/core/src/integration/
└── integration-service.ts       (250 LOC)

packages/core/src/agent/tools/
└── extract-entities.ts          (200 LOC)

packages/server/
├── src/
│   └── api/
│       └── server.ts            (300 LOC)
└── package.json

packages/ui/src/
└── api/
    └── client.ts                (150 LOC)

__tests__/
└── integration/
    └── e2e.test.ts              (200 LOC)
```

### Updated Files
- `packages/ui/src/App.tsx` (+100 LOC)
- `packages/core/src/agent/sbf-agent.ts` (+50 LOC)
- `packages/core/src/watcher/watcher-service.ts` (+30 LOC)

---

## Timeline

### Day 1 (6-8 hours)
- ✅ Morning: Integration service + entity extraction tool
- ✅ Afternoon: API server + endpoints

### Day 2 (6-8 hours)
- ✅ Morning: UI API client + connection
- ✅ Afternoon: Testing + bug fixes

### Day 3 (4-6 hours)
- ✅ Morning: Streaming + real-time updates
- ✅ Afternoon: Polish + documentation

**Total:** 16-22 hours over 2-3 days

---

## Ready to Start?

**Prerequisites:**
- ✅ Tier 1 complete
- ✅ All components working independently
- ✅ Plan documented
- ✅ Time allocated

**Next:** Say **"start phase 2"** and I'll begin with IntegrationService!

---

**Status:** 🟢 **READY - AWAITING START COMMAND**
