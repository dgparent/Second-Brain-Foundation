# API Documentation

**Second Brain Foundation API Reference** for developers and integrators.

---

## 📖 Table of Contents

- [Agent API](#agent-api)
- [Entity API](#entity-api)
- [Tool API](#tool-api)
- [LLM Provider API](#llm-provider-api)
- [File Watcher API](#file-watcher-api)
- [REST API](#rest-api-future)

---

## 🤖 Agent API

### SBFAgent Class

The main AI agent that orchestrates conversation and tool execution.

**Location:** `aei-core/agent.py`

#### Constructor

```python
from agent import SBFAgent

agent = SBFAgent(
    provider="anthropic",           # "openai" | "anthropic" | "ollama"
    api_key="sk-ant-...",          # Required for cloud providers
    model="claude-3-5-sonnet-20241022",  # Model name
    vault_path="/path/to/vault",   # Path to markdown vault
    memory=None,                   # Optional Memory instance
    tools=None,                    # Optional custom tools list
    max_iterations=10,             # Max tool execution loops
    debug=False                    # Enable debug logging
)
```

#### Methods

##### `step(user_input: str) -> dict`

Process a single user input and return agent response.

```python
response = agent.step("Create a topic about Machine Learning")

# Returns:
{
    "content": "I've created a topic for Machine Learning...",
    "tool_calls": [
        {
            "name": "create_entity",
            "args": {"name": "Machine Learning", "type": "topic"},
            "result": {...}
        }
    ],
    "thinking": "The user wants to create a topic...",
    "status": "success"
}
```

**Parameters:**
- `user_input` (str): The user's message or command

**Returns:**
- `dict` with keys:
  - `content`: Agent's text response
  - `tool_calls`: List of tools executed
  - `thinking`: Agent's internal reasoning (if available)
  - `status`: "success" | "error" | "max_iterations"

---

##### `get_state() -> dict`

Get current agent state.

```python
state = agent.get_state()

# Returns:
{
    "conversation_history": [...],
    "memory": {...},
    "iteration_count": 3,
    "tools_available": ["create_entity", "search_entities", ...]
}
```

---

##### `update_memory(key: str, value: Any) -> None`

Update agent's working memory.

```python
agent.update_memory("current_topic", "Machine Learning")
agent.update_memory("user_preferences", {"theme": "dark"})
```

---

##### `reset() -> None`

Reset conversation history and iteration count.

```python
agent.reset()
# Starts fresh conversation, keeps memory
```

---

### Example Usage

```python
from agent import SBFAgent

# Initialize agent
agent = SBFAgent(
    provider="anthropic",
    api_key="sk-ant-...",
    model="claude-3-5-sonnet-20241022",
    vault_path="C:/vault"
)

# Single interaction
response = agent.step("What entities do I have about AI?")
print(response["content"])

# Multi-turn conversation
messages = [
    "Create a project called 'AI Research'",
    "Add a topic about Neural Networks",
    "Link them together"
]

for msg in messages:
    response = agent.step(msg)
    print(f"User: {msg}")
    print(f"Agent: {response['content']}\n")

# Check state
state = agent.get_state()
print(f"Conversation turns: {len(state['conversation_history'])}")
```

---

## 📚 Entity API

### EntityFileManager Class

Manages CRUD operations for entity files.

**Location:** `packages/core/src/entities/EntityFileManager.ts`

#### Constructor

```typescript
import { EntityFileManager } from '@sbf/core/entities';

const entityManager = new EntityFileManager({
  vaultPath: 'C:/vault',
  entitiesDir: 'entities',  // Relative to vault
  indexEnabled: true,        // Enable in-memory index
});
```

---

#### Methods

##### `createEntity(data: CreateEntityInput): Promise<Entity>`

Create a new entity file.

```typescript
const entity = await entityManager.createEntity({
  name: 'Machine Learning',
  type: 'topic',
  content: 'An overview of ML concepts...',
  metadata: {
    tags: ['ai', 'cs'],
    status: 'active',
  },
  relationships: [
    {
      type: 'related-to',
      target: 'Artificial Intelligence',
    },
  ],
});

// Returns Entity object
console.log(entity.id);          // "topic-machine-learning"
console.log(entity.filePath);    // "entities/topics/machine-learning.md"
```

**Parameters:**
- `name` (string): Entity display name
- `type` (EntityType): "topic" | "project" | "person" | "place" | "event" | "resource" | "custom"
- `content` (string, optional): Markdown content
- `metadata` (object, optional): Custom metadata fields
- `relationships` (array, optional): Links to other entities

**Returns:** Promise<Entity>

---

##### `getEntity(id: string): Promise<Entity | null>`

Get entity by ID.

```typescript
const entity = await entityManager.getEntity('topic-machine-learning');

if (entity) {
  console.log(entity.name);      // "Machine Learning"
  console.log(entity.type);      // "topic"
  console.log(entity.content);   // Markdown content
}
```

---

##### `updateEntity(id: string, updates: Partial<Entity>): Promise<Entity>`

Update existing entity.

```typescript
const updated = await entityManager.updateEntity(
  'topic-machine-learning',
  {
    content: 'Updated content...',
    metadata: {
      status: 'completed',
      tags: ['ai', 'cs', 'ml'],
    },
  }
);
```

---

##### `deleteEntity(id: string): Promise<void>`

Delete entity file.

```typescript
await entityManager.deleteEntity('topic-machine-learning');
```

---

##### `searchEntities(query: string, filters?: EntityFilters): Promise<Entity[]>`

Search entities by text and filters.

```typescript
const results = await entityManager.searchEntities('neural', {
  type: 'topic',
  tags: ['ai'],
  createdAfter: '2024-01-01',
});

results.forEach(entity => {
  console.log(entity.name);
});
```

**Filters:**
- `type`: Filter by entity type
- `tags`: Filter by tags (AND logic)
- `createdAfter` / `createdBefore`: Date range
- `updatedAfter` / `updatedBefore`: Update date range
- `metadata`: Custom metadata filters

---

##### `listEntities(options?: ListOptions): Promise<Entity[]>`

List all entities with pagination and sorting.

```typescript
const entities = await entityManager.listEntities({
  limit: 50,
  offset: 0,
  sortBy: 'updated',
  sortOrder: 'desc',
  type: 'project',
});
```

---

### Entity Schema

```typescript
interface Entity {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: EntityType;              // Entity type
  content: string;               // Markdown content
  filePath: string;              // Relative file path
  metadata: {
    created: string;             // ISO timestamp
    updated: string;             // ISO timestamp
    tags: string[];              // Tags
    [key: string]: any;          // Custom fields
  };
  relationships: Relationship[]; // Links to other entities
}

type EntityType = 
  | 'topic' 
  | 'project' 
  | 'person' 
  | 'place' 
  | 'event' 
  | 'resource'
  | 'custom';

interface Relationship {
  type: string;                  // Relationship type
  target: string;                // Target entity ID or name
  metadata?: Record<string, any>;
}
```

---

## 🛠️ Tool API

### Available Tools

Tools are functions that the AI agent can call to interact with the system.

**Location:** `aei-core/tools/` and `packages/core/src/tools/`

---

### create_entity

Create a new entity file.

```python
{
  "name": "create_entity",
  "description": "Create a new entity file in the vault",
  "parameters": {
    "name": "Entity name",
    "type": "Entity type (topic, project, person, etc.)",
    "content": "Optional markdown content",
    "metadata": "Optional metadata dict"
  }
}
```

**Example:**
```python
result = tools.create_entity(
    name="Machine Learning",
    type="topic",
    content="Overview of ML...",
    metadata={"tags": ["ai", "cs"]}
)
```

---

### update_entity

Update an existing entity.

```python
{
  "name": "update_entity",
  "description": "Update entity content or metadata",
  "parameters": {
    "entity_id": "Entity ID to update",
    "content": "New markdown content (optional)",
    "metadata": "Metadata updates (optional)"
  }
}
```

---

### search_entities

Search for entities.

```python
{
  "name": "search_entities",
  "description": "Search entities by text query and filters",
  "parameters": {
    "query": "Search query string",
    "type": "Optional entity type filter",
    "limit": "Max results (default 20)"
  }
}
```

**Example:**
```python
results = tools.search_entities(
    query="neural networks",
    type="topic",
    limit=10
)
```

---

### create_relationship

Link two entities together.

```python
{
  "name": "create_relationship",
  "description": "Create a relationship between entities",
  "parameters": {
    "source": "Source entity ID",
    "target": "Target entity ID",
    "type": "Relationship type (related-to, part-of, etc.)"
  }
}
```

**Relationship Types:**
- `related-to`: General relationship
- `part-of`: Hierarchical (child → parent)
- `depends-on`: Dependency
- `references`: Citation or mention
- `inspired-by`: Inspiration
- Custom types allowed

---

### get_context

Retrieve relevant context for a query.

```python
{
  "name": "get_context",
  "description": "Get relevant entities and notes for context",
  "parameters": {
    "query": "Context query",
    "limit": "Max items to return"
  }
}
```

---

### Creating Custom Tools

**Tool Schema:**
```python
from typing import Any, Callable

def my_custom_tool(param1: str, param2: int) -> dict:
    """
    Tool description for the AI.
    
    Args:
        param1: First parameter description
        param2: Second parameter description
        
    Returns:
        Result dictionary
    """
    # Implementation
    return {"success": True, "data": ...}

# Register tool
agent.register_tool(
    name="my_custom_tool",
    func=my_custom_tool,
    description="What this tool does",
    parameters={
        "param1": {"type": "string", "description": "..."},
        "param2": {"type": "number", "description": "..."},
    }
)
```

---

## 🧠 LLM Provider API

### Provider Interface

All LLM providers implement a common interface.

**Location:** `aei-core/providers/`

#### OpenAI Provider

```python
from providers.openai_provider import OpenAIProvider

provider = OpenAIProvider(
    api_key="sk-...",
    model="gpt-4-turbo-preview",
    temperature=0.7,
    max_tokens=4096,
)

response = provider.generate(
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello!"}
    ],
    tools=tools_list,  # Optional
)
```

#### Anthropic Provider

```python
from providers.anthropic_provider import AnthropicProvider

provider = AnthropicProvider(
    api_key="sk-ant-...",
    model="claude-3-5-sonnet-20241022",
    temperature=0.7,
    max_tokens=4096,
)

response = provider.generate(
    messages=[...],
    tools=tools_list,
)
```

#### Ollama Provider

```python
from providers.ollama_provider import OllamaProvider

provider = OllamaProvider(
    base_url="http://localhost:11434",
    model="llama3.2:latest",
    temperature=0.7,
)

response = provider.generate(messages=[...])
```

---

### Response Format

```python
{
    "content": "Assistant's text response",
    "tool_calls": [
        {
            "name": "create_entity",
            "arguments": {"name": "...", "type": "..."},
        }
    ],
    "finish_reason": "stop" | "tool_calls" | "length",
    "usage": {
        "prompt_tokens": 123,
        "completion_tokens": 456,
        "total_tokens": 579,
    }
}
```

---

### Custom Provider

Implement the `LLMProvider` interface:

```python
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class LLMProvider(ABC):
    @abstractmethod
    def generate(
        self,
        messages: List[Dict[str, str]],
        tools: List[Dict] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate completion from messages."""
        pass

class MyCustomProvider(LLMProvider):
    def generate(self, messages, tools=None, **kwargs):
        # Your implementation
        return {
            "content": "...",
            "tool_calls": [],
            "finish_reason": "stop",
        }
```

---

## 👁️ File Watcher API

### FileWatcherService

Monitors vault for file changes and queues organization tasks.

**Location:** `packages/core/src/watcher/FileWatcherService.ts`

#### Constructor

```typescript
import { FileWatcherService } from '@sbf/core/watcher';

const watcher = new FileWatcherService({
  vaultPath: 'C:/vault',
  ignoredPatterns: ['node_modules', '.git', '*.tmp'],
  debounceMs: 1000,              // Wait 1s before processing
  autoApprove: false,            // Require manual approval
  onQueueUpdate: (items) => {    // Callback
    console.log('Queue updated:', items);
  },
});
```

---

#### Methods

##### `start(): void`

Start watching for file changes.

```typescript
watcher.start();
console.log('File watcher started');
```

---

##### `stop(): void`

Stop watching.

```typescript
watcher.stop();
```

---

##### `getQueue(): QueueItem[]`

Get current organization queue.

```typescript
const queue = watcher.getQueue();

queue.forEach(item => {
  console.log(item.type);        // 'create' | 'update' | 'delete'
  console.log(item.filePath);
  console.log(item.suggestion);  // AI suggestion
});
```

---

##### `approveQueueItem(id: string): Promise<void>`

Approve and execute a queue item.

```typescript
await watcher.approveQueueItem('queue-item-123');
```

---

##### `rejectQueueItem(id: string): void`

Reject and remove a queue item.

```typescript
watcher.rejectQueueItem('queue-item-123');
```

---

### QueueItem Schema

```typescript
interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  filePath: string;
  timestamp: string;
  suggestion: {
    action: string;
    entityName?: string;
    entityType?: string;
    relationships?: Relationship[];
    reasoning: string;
  };
  status: 'pending' | 'approved' | 'rejected';
}
```

---

## 🌐 REST API (Future)

**Status:** Planned for v2.1

### Planned Endpoints

```
POST   /api/chat              Send chat message
GET    /api/entities          List entities
POST   /api/entities          Create entity
GET    /api/entities/:id      Get entity
PUT    /api/entities/:id      Update entity
DELETE /api/entities/:id      Delete entity
GET    /api/queue             Get organization queue
POST   /api/queue/:id/approve Approve queue item
POST   /api/queue/:id/reject  Reject queue item
GET    /api/search            Search entities
POST   /api/agent/step        Execute agent step
```

### Example (Future)

```typescript
// Create entity via REST API
const response = await fetch('http://localhost:3001/api/entities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Machine Learning',
    type: 'topic',
    content: '...',
  }),
});

const entity = await response.json();
```

---

## 🔌 Integration Examples

### Python Integration

```python
from agent import SBFAgent
from entities import EntityManager

# Initialize
agent = SBFAgent(provider="anthropic", api_key="...")
entities = EntityManager(vault_path="C:/vault")

# Create entity via agent
response = agent.step("Create a topic about Python")

# Or create directly
entity = entities.create_entity(
    name="Python",
    type="topic",
    content="Python is a programming language..."
)

# Search
results = entities.search("programming", type="topic")
```

---

### TypeScript Integration

```typescript
import { SBFAgent } from '@sbf/core/agent';
import { EntityFileManager } from '@sbf/core/entities';

// Initialize
const agent = new SBFAgent({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

const entities = new EntityFileManager({
  vaultPath: 'C:/vault',
});

// Use agent
const response = await agent.step('Create a project');

// Use entity manager
const entity = await entities.createEntity({
  name: 'My Project',
  type: 'project',
});
```

---

## 📚 Additional Resources

- **Developer Guide:** [developer-guide.md](./developer-guide.md)
- **Architecture:** [docs/03-architecture/](../03-architecture/)
- **Troubleshooting:** [troubleshooting.md](./troubleshooting.md)

---

**Questions?** Open an issue on GitHub!

Last Updated: 2025-11-15
