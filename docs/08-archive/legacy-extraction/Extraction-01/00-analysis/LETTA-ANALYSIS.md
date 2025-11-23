# Letta Integration Analysis for Second Brain Foundation

**Date:** 2025-11-14  
**Status:** Analysis Complete - Ready for Integration Planning  
**Letta Version:** 0.14.0  
**Location:** `libraries/letta`

---

## Executive Summary

Letta (formerly MemGPT) is a **stateful agent framework** with advanced memory management, perfect for Second Brain Foundation's agentic AI requirements. This analysis identifies key integration opportunities and extraction patterns.

### Key Capabilities Relevant to SBF

1. **Stateful Agents** - Long-term memory that persists across sessions
2. **Memory Management** - Core memory blocks (persona, human) + archival/recall storage
3. **Tool System** - Custom function calling with sandboxed execution
4. **Multi-Agent Communication** - Agent-to-agent messaging and collaboration
5. **Provider Abstraction** - Support for OpenAI, Anthropic, Google, local LLMs
6. **Observability** - OpenTelemetry tracing and logging

---

## Architecture Overview

### Core Components

```
letta/
├── agent.py              # Main Agent class (BaseAgent, Agent)
├── memory.py             # Memory management and summarization
├── config.py             # Configuration management
├── interface.py          # Agent interface abstraction
├── schemas/              # Pydantic schemas for all entities
│   ├── agent.py          # AgentState, AgentStepResponse
│   ├── memory.py         # Memory, ChatMemory, BasicBlockMemory
│   ├── message.py        # Message, MessageCreate
│   ├── tool.py           # Tool schemas
│   └── llm_config.py     # LLMConfig, provider settings
├── services/             # Service layer (managers)
│   ├── agent_manager.py
│   ├── message_manager.py
│   ├── tool_manager.py
│   ├── block_manager.py
│   └── tool_executor/    # Sandboxed tool execution
├── server/               # FastAPI server (optional)
├── client/               # Python/TypeScript SDKs
└── llm_api/              # LLM provider integrations
```

---

## Key Classes & Patterns

### 1. Agent System

**File:** `letta/agent.py`

```python
class BaseAgent(ABC):
    @abstractmethod
    def step(self, input_messages: List[MessageCreate]) -> LettaUsageStatistics:
        """Top-level event message handler"""
        pass

class Agent(BaseAgent):
    def __init__(self, interface, agent_state, user, mcp_clients=None):
        self.agent_state = agent_state  # AgentState (Pydantic model)
        self.user = user
        self.tool_rules_solver = ToolRulesSolver(tool_rules=agent_state.tool_rules)
        
        # Managers
        self.message_manager = MessageManager()
        self.passage_manager = PassageManager()
        self.tool_manager = ToolManager()
        self.block_manager = BlockManager()
        
        # Interface for output (CLI, streaming, etc.)
        self.interface = interface
```

**Integration Value:**
- **Manager pattern** - Separation of concerns (messages, tools, blocks)
- **State management** - `AgentState` as single source of truth
- **Interface abstraction** - Decouple agent logic from I/O

### 2. Memory System

**File:** `letta/schemas/memory.py`

```python
class Memory(LettaBase):
    """Base memory class"""
    def get_blocks(self) -> List[Block]:
        """Get all memory blocks"""
        pass
    
    def to_dict(self) -> dict:
        """Serialize memory"""
        pass

class ChatMemory(Memory):
    """Memory with persona and human blocks"""
    persona: Block  # Agent's self-concept
    human: Block    # Information about the user
    
class BasicBlockMemory(Memory):
    """Generic block-based memory"""
    blocks: List[Block]
```

**Memory Block Structure:**
```python
class Block(LettaBase):
    id: str
    label: str          # "persona", "human", "custom"
    value: str          # Actual memory content
    limit: int          # Character limit
    is_template: bool
```

**Integration Value:**
- **Block-based memory** - Aligns with SBF entity system
- **Modular design** - Can add custom memory types
- **Persistence** - Memory blocks stored and retrieved across sessions

### 3. Tool System

**File:** `letta/schemas/tool.py`

```python
class Tool(LettaBase):
    id: str
    name: str
    tags: List[str]
    source_code: str           # Function source code
    json_schema: dict          # OpenAI function calling schema
    source_type: ToolType      # python, langchain, etc.
```

**Tool Execution:**
- Sandboxed execution environment (`services/tool_executor/`)
- Support for Python functions, Composio actions, MCP tools
- Automatic schema generation from function signatures

**Integration Value:**
- **Sandboxed execution** - Security for user-defined tools
- **Schema-based tools** - Compatible with OpenAI function calling
- **Extensible** - Easy to add custom tools

### 4. Service Layer (Managers)

**Pattern:** Each manager handles CRUD + business logic for a domain

```python
class MessageManager:
    def create_many_messages(self, messages: List[MessageCreate]) -> List[Message]:
        """Persist messages to database"""
        
    def get_messages_by_agent(self, agent_id: str, limit: int) -> List[Message]:
        """Retrieve agent conversation history"""

class ToolManager:
    def create_tool(self, tool: ToolCreate) -> Tool:
        """Register a new tool"""
        
    def get_tool_by_name(self, name: str) -> Tool:
        """Lookup tool by name"""
        
class BlockManager:
    def update_block(self, block_id: str, update: BlockUpdate) -> Block:
        """Update memory block"""
```

**Integration Value:**
- **Separation of concerns** - Database operations isolated
- **Reusable pattern** - Apply to SBF entities (topics, projects, etc.)
- **Testing** - Easy to mock managers for unit tests

### 5. LLM Provider Abstraction

**File:** `letta/llm_api/llm_client.py`

```python
class LLMClient:
    @staticmethod
    def create(provider_type: ProviderType, actor: User):
        """Factory for LLM clients"""
        if provider_type == ProviderType.OPENAI:
            return OpenAILLMClient(actor)
        elif provider_type == ProviderType.ANTHROPIC:
            return AnthropicLLMClient(actor)
        # ... etc
    
    def send_llm_request(self, agent_type, messages, llm_config):
        """Send request to LLM provider"""
        pass
```

**Integration Value:**
- **Provider agnostic** - Swap providers without code changes
- **Local LLM support** - For privacy-sensitive operations
- **Fallback support** - Primary + fallback providers

---

## Integration Strategy for SBF

### Phase 1: Core Extraction (Immediate)

**Extract These Components:**

1. **Agent Base Class** (`agent.py`)
   - Adapt `BaseAgent` → `SBFAgent` 
   - Keep manager pattern (message, tool, block managers)
   - Replace Letta's database layer with SBF's filesystem

2. **Memory System** (`schemas/memory.py`, `memory.py`)
   - Use `Block` concept for entity frontmatter
   - `ChatMemory` → conversation context
   - Memory summarization for long conversations

3. **Tool System** (`schemas/tool.py`, `services/tool_executor/`)
   - Sandboxed tool execution
   - Custom tools for SBF operations:
     - `create_entity(type, title, ...)`
     - `link_entities(source_uid, target_uid, relationship)`
     - `search_entities(query)`
     - `update_entity(uid, updates)`

4. **Service Managers** (`services/`)
   - `EntityManager` (adapted from `BlockManager`)
   - `ConversationManager` (adapted from `MessageManager`)
   - `ToolManager` (as-is, with custom tools)

### Phase 2: Advanced Features (Post-MVP)

5. **Multi-Agent** (`agents/`, `groups/`)
   - Specialist agents (filing, research, summarization)
   - Agent collaboration for complex tasks

6. **Observability** (`otel/`, `log.py`)
   - Structured logging
   - OpenTelemetry tracing
   - Usage analytics

7. **Streaming** (`streaming_interface.py`, `streaming_utils.py`)
   - Real-time agent responses
   - WebSocket support for UI

---

## Critical Dependencies

### Must Extract
- `schemas/` - Pydantic models for type safety
- `llm_api/` - Provider abstraction
- `services/tool_executor/` - Sandboxed execution
- `helpers/` - Utility functions (datetime, JSON, etc.)

### Can Ignore (SBF Alternatives)
- `server/` - We'll build our own FastAPI server
- `client/` - Not needed (agents run in-process)
- `database_utils.py` - Using filesystem instead
- `orm/` - Not using SQL database

### Dependencies to Install
```toml
# From letta/pyproject.toml (relevant subset)
pydantic = ">=2.10.6"
openai = ">=1.99.9"
anthropic = ">=0.49.0"
httpx = ">=0.28.0"
pyyaml = ">=6.0.1"
sqlalchemy = ">=2.0.41"  # For in-memory state management
rich = ">=13.9.4"  # For CLI output
typer = ">=0.15.2"  # For CLI commands
```

---

## Code Extraction Plan

### Step 1: Create SBF Agent Module

**Location:** `Extraction-01/03-integration/sbf-app/packages/core/src/agent/`

```
agent/
├── base.ts              # Port of BaseAgent (TypeScript)
├── sbf-agent.ts         # Main SBF agent class
├── memory.ts            # Memory management
├── tools/               # SBF-specific tools
│   ├── entity-tools.ts  # create_entity, update_entity, etc.
│   ├── graph-tools.ts   # link_entities, search_graph
│   └── vault-tools.ts   # search_vault, file operations
├── managers/            # Service layer
│   ├── entity-manager.ts
│   ├── conversation-manager.ts
│   └── tool-manager.ts
└── llm/                 # LLM client abstraction
    ├── client.ts
    ├── openai.ts
    └── anthropic.ts
```

### Step 2: Python → TypeScript Translation

**Key Translations:**

| Python (Letta) | TypeScript (SBF) |
|----------------|------------------|
| `class Agent(BaseAgent)` | `class SBFAgent extends BaseAgent` |
| `Pydantic models` | `Zod schemas` or `class-validator` |
| `@trace_method` | Custom decorator with OpenTelemetry |
| `async def step()` | `async step(): Promise<UsageStats>` |
| `MessageManager` | `ConversationManager` (better naming) |

**Example Translation:**

```python
# Letta (Python)
class Agent(BaseAgent):
    def step(self, input_messages: List[MessageCreate]) -> LettaUsageStatistics:
        # Process messages
        pass
```

```typescript
// SBF (TypeScript)
class SBFAgent extends BaseAgent {
  async step(inputMessages: MessageCreate[]): Promise<UsageStatistics> {
    // Process messages
  }
}
```

### Step 3: Integrate with Existing SBF Code

**Map Letta Concepts → SBF Entities:**

| Letta | SBF |
|-------|-----|
| `Block` (memory) | Entity frontmatter fields |
| `Message` | Conversation message in daily note |
| `Tool` | Agent actions (create entity, link, search) |
| `AgentState` | Stored in `.sbf/agent-state.json` |
| `Passage` (archival) | Full-text search of vault |

**Integration Points:**

1. **EntityFileManager** → Use as persistence layer
   - `agent.create_entity()` → `entityFileManager.createEntity()`
   
2. **Vault** → Agent's file storage
   - `agent.search_vault()` → `vault.searchEntities()`
   
3. **Graph** → Relationship management
   - `agent.link_entities()` → `graph.addEdge()`

---

## Recommended Tools for SBF Agent

### Core Tools (Phase 0)

1. **Entity Management**
   ```typescript
   async function create_entity(
     type: EntityType,
     title: string,
     content: string,
     metadata: Record<string, any>
   ): Promise<string> {
     // Returns UID of created entity
   }
   
   async function update_entity(
     uid: string,
     updates: Partial<Entity>
   ): Promise<void> {}
   
   async function get_entity(uid: string): Promise<Entity> {}
   ```

2. **Search Tools**
   ```typescript
   async function search_entities(
     query: string,
     filters?: { type?: EntityType, tags?: string[] }
   ): Promise<Entity[]> {}
   
   async function search_relationships(
     uid: string,
     relationship_type?: string
   ): Promise<Edge[]> {}
   ```

3. **Relationship Tools**
   ```typescript
   async function link_entities(
     source_uid: string,
     target_uid: string,
     relationship: string
   ): Promise<void> {}
   ```

4. **Memory Tools**
   ```typescript
   async function update_agent_memory(
     block_label: string,
     content: string
   ): Promise<void> {}
   
   async function search_conversation_history(
     query: string,
     days_back?: number
   ): Promise<Message[]> {}
   ```

### Advanced Tools (Post-MVP)

5. **Automation Tools**
   - `schedule_review(uid, date)` - Schedule entity review
   - `auto_file_note(daily_note_uid)` - Trigger auto-filing
   - `suggest_links(uid)` - Suggest relationships

6. **Analysis Tools**
   - `analyze_graph_patterns()` - Detect patterns
   - `summarize_project(uid)` - Project summary
   - `identify_orphans()` - Find unlinked entities

---

## Memory Architecture for SBF

### Proposed Memory Blocks

```typescript
interface SBFAgentMemory {
  // Core blocks (always present)
  persona: Block;      // "I am your Second Brain assistant..."
  user: Block;         // User preferences, context
  
  // Context blocks (session-specific)
  current_focus: Block;  // Current project/entity being discussed
  recent_entities: Block; // Last 5 entities user interacted with
  
  // Persistent blocks (stored in .sbf/)
  knowledge_graph_summary: Block;  // High-level graph structure
  recurring_patterns: Block;        // User patterns agent has learned
}
```

### Memory Management Strategy

1. **Short-term (Session):** Current conversation context
2. **Medium-term (Archival):** Full conversation history in daily notes
3. **Long-term (Knowledge Graph):** Entities and relationships

---

## API Design for SBF Agent

### Agent Interface

```typescript
class SBFAgent {
  // Primary method
  async step(userMessage: string): Promise<AgentResponse> {
    // 1. Parse user intent
    // 2. Select tools to use
    // 3. Execute tools
    // 4. Generate response
  }
  
  // Utility methods
  async suggestFiling(dailyNoteUid: string): Promise<FilingSuggestion[]> {}
  async answerQuestion(query: string): Promise<string> {}
  async createFromTemplate(templateUid: string, params: any): Promise<string> {}
}

interface AgentResponse {
  message: string;           // Response text
  thoughts: string;          // Internal reasoning
  toolCalls: ToolCall[];     // Tools executed
  entitiesCreated: string[]; // UIDs of new entities
  entitiesLinked: [string, string, string][]; // [source, target, rel]
  usage: UsageStatistics;
}
```

---

## Risk Assessment

### High Risk
❌ **Python → TypeScript translation complexity**
- Letta is heavily Python-centric (SQLAlchemy, Pydantic)
- **Mitigation:** Extract patterns/concepts, not direct ports

### Medium Risk
⚠️ **Dependency bloat**
- Letta has 70+ dependencies
- **Mitigation:** Cherry-pick only essential code

⚠️ **Agent hallucination/errors**
- LLMs can make mistakes when calling tools
- **Mitigation:** Validation layer before tool execution

### Low Risk
✅ **Integration with existing SBF code**
- Manager pattern aligns well with current architecture
- **Mitigation:** Write integration tests

---

## Success Metrics

### Phase 1 (Core Integration)
- [ ] Agent can create entities via natural language
- [ ] Agent can search and retrieve entities
- [ ] Agent can link entities with relationships
- [ ] Agent memory persists across sessions
- [ ] Sandboxed tool execution works

### Phase 2 (Advanced Features)
- [ ] Agent can auto-file daily notes
- [ ] Agent can suggest entity creation from conversation
- [ ] Multi-turn conversations maintain context
- [ ] Streaming responses work in UI
- [ ] Agent learns user preferences

---

## Next Steps

1. **Extract Core Patterns** (1-2 days)
   - Create `packages/core/src/agent/` structure
   - Port BaseAgent, Memory, Tool schemas to TypeScript
   
2. **Build SBF Tools** (2-3 days)
   - Implement entity management tools
   - Implement search tools
   - Implement relationship tools
   
3. **LLM Client Integration** (1-2 days)
   - Port LLMClient abstraction
   - Integrate OpenAI, Anthropic providers
   - Add local LLM support (Ollama)
   
4. **Agent State Management** (1-2 days)
   - Design AgentState schema
   - Implement persistence (`.sbf/agent-state.json`)
   - Memory block management
   
5. **Testing & Refinement** (2-3 days)
   - Unit tests for managers
   - Integration tests with entity system
   - E2E test: conversation → entity creation

**Total Estimate:** 7-12 days for core agent functionality

---

## References

- **Letta Docs:** https://docs.letta.com
- **Letta GitHub:** https://github.com/letta-ai/letta
- **SBF Architecture:** `docs/03-architecture/architecture-v2-enhanced.md`
- **SBF Extraction Guide:** `libraries/EXTRACTION-GUIDE.md`

---

**Analysis Complete - Ready for Integration Planning** ✅
