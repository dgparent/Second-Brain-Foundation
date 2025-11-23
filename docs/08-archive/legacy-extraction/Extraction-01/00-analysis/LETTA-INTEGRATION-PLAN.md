# Letta Integration Plan for Second Brain Foundation

**Date:** 2025-11-14  
**Status:** Ready for Execution  
**Dependency:** LETTA-ANALYSIS.md  
**Target:** Extraction-01/03-integration/sbf-app

---

## Overview

This document provides a **step-by-step execution plan** for integrating Letta's agent framework into Second Brain Foundation. The plan is designed to be implemented in phases, with each phase delivering working functionality.

---

## Phase Breakdown

### Phase 0: Preparation & Setup (4-6 hours)
**Goal:** Understand Letta codebase, set up extraction structure

### Phase 1: Core Agent Foundation (2-3 days)
**Goal:** Port base agent classes and memory system to TypeScript

### Phase 2: Tool System (2-3 days)
**Goal:** Implement SBF-specific tools and sandboxed execution

### Phase 3: LLM Integration (1-2 days)
**Goal:** Connect to LLM providers (OpenAI, Anthropic, local)

### Phase 4: State Management (1-2 days)
**Goal:** Persistent agent state and memory

### Phase 5: Testing & Refinement (2-3 days)
**Goal:** End-to-end testing and bug fixes

**Total Timeline:** 8-13 days for MVP agent functionality

---

## Phase 0: Preparation & Setup

### 0.1 Deep Dive into Letta Examples

**Time:** 2 hours

**Tasks:**
1. Review Letta examples in `libraries/letta/examples/`
2. Run example notebooks to understand agent workflows
3. Document key patterns and usage

**Deliverables:**
- [ ] `LETTA-EXAMPLES-SUMMARY.md` in `00-analysis/`

**Commands:**
```bash
cd libraries/letta/examples
# Review:
# - Building agents with Letta.ipynb
# - tutorials/
# - streaming/
```

### 0.2 Set Up Agent Module Structure

**Time:** 1 hour

**Tasks:**
1. Create agent module directory
2. Set up TypeScript configuration for agent code
3. Install necessary dependencies

**Deliverables:**
- [ ] Agent module structure created
- [ ] Dependencies installed

**Commands:**
```bash
cd Extraction-01/03-integration/sbf-app/packages/core

# Create agent module
mkdir -p src/agent/{managers,tools,llm,schemas}
mkdir -p src/agent/tools/{entity,graph,vault}

# Create index files
touch src/agent/index.ts
touch src/agent/base-agent.ts
touch src/agent/sbf-agent.ts
touch src/agent/memory.ts
```

### 0.3 Dependency Analysis

**Time:** 1 hour

**Tasks:**
1. Review Letta's dependencies (`pyproject.toml`)
2. Find TypeScript equivalents
3. Update `package.json`

**TypeScript Equivalents:**

| Python (Letta) | TypeScript (SBF) | Purpose |
|----------------|------------------|---------|
| `pydantic` | `zod` | Schema validation |
| `sqlalchemy` | `typeorm` (optional) | State management |
| `typer` | `commander` | CLI (if needed) |
| `rich` | `chalk` + `ora` | CLI formatting |
| `openai` | `openai` (npm) | OpenAI client |
| `anthropic` | `@anthropic-ai/sdk` | Anthropic client |
| `httpx` | `axios` | HTTP client |
| `opentelemetry-*` | `@opentelemetry/*` | Observability |

**Update package.json:**
```json
{
  "dependencies": {
    "zod": "^3.22.4",
    "openai": "^4.20.1",
    "@anthropic-ai/sdk": "^0.9.1",
    "axios": "^1.6.2",
    "gray-matter": "^4.0.3",
    "yaml": "^2.3.4"
  },
  "devDependencies": {
    "@opentelemetry/api": "^1.7.0",
    "@opentelemetry/sdk-node": "^0.45.1"
  }
}
```

**Deliverables:**
- [ ] `package.json` updated with agent dependencies

### 0.4 Create Agent Architecture Document

**Time:** 2 hours

**Tasks:**
1. Design SBF agent architecture
2. Map Letta patterns to SBF structure
3. Document data flow

**Deliverables:**
- [ ] `AGENT-ARCHITECTURE.md` in `Extraction-01/04-documentation/`

---

## Phase 1: Core Agent Foundation

### 1.1 Port Base Agent Class

**Time:** 4-6 hours

**File:** `packages/core/src/agent/base-agent.ts`

**Extract From:**
- `libraries/letta/letta/agent.py` (lines 79-93)

**Implementation:**

```typescript
// base-agent.ts
import { z } from 'zod';

// Schema definitions
export const MessageCreateSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime().optional(),
});

export type MessageCreate = z.infer<typeof MessageCreateSchema>;

export const UsageStatisticsSchema = z.object({
  total_tokens: z.number(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  step_count: z.number(),
});

export type UsageStatistics = z.infer<typeof UsageStatisticsSchema>;

/**
 * Base abstract class for all agents.
 * Inspired by Letta's BaseAgent pattern.
 */
export abstract class BaseAgent {
  /**
   * Top-level event message handler for the agent.
   * @param inputMessages - Array of messages to process
   * @returns Usage statistics for the step
   */
  abstract step(inputMessages: MessageCreate[]): Promise<UsageStatistics>;
  
  /**
   * Initialize agent state
   */
  abstract initialize(): Promise<void>;
  
  /**
   * Cleanup agent resources
   */
  abstract cleanup(): Promise<void>;
}
```

**Tasks:**
1. Create `base-agent.ts` with abstract class
2. Define core schemas (Message, UsageStats)
3. Add JSDoc documentation

**Deliverables:**
- [ ] `base-agent.ts` created
- [ ] Schemas validated with Zod

### 1.2 Implement Memory System

**Time:** 6-8 hours

**File:** `packages/core/src/agent/memory.ts`

**Extract From:**
- `libraries/letta/letta/schemas/memory.py`
- `libraries/letta/letta/memory.py`

**Implementation:**

```typescript
// memory.ts
import { z } from 'zod';

export const BlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  limit: z.number().default(2000),
  is_template: z.boolean().default(false),
});

export type Block = z.infer<typeof BlockSchema>;

export abstract class Memory {
  abstract getBlocks(): Block[];
  abstract updateBlock(label: string, value: string): void;
  abstract toJSON(): Record<string, any>;
  abstract fromJSON(data: Record<string, any>): void;
}

export class ChatMemory extends Memory {
  private persona: Block;
  private user: Block;
  
  constructor(personaValue: string, userValue: string) {
    super();
    this.persona = {
      id: 'persona-core',
      label: 'persona',
      value: personaValue,
      limit: 2000,
      is_template: false,
    };
    this.user = {
      id: 'user-core',
      label: 'human',
      value: userValue,
      limit: 2000,
      is_template: false,
    };
  }
  
  getBlocks(): Block[] {
    return [this.persona, this.user];
  }
  
  updateBlock(label: string, value: string): void {
    if (label === 'persona') {
      this.persona.value = value;
    } else if (label === 'human') {
      this.user.value = value;
    } else {
      throw new Error(`Unknown block label: ${label}`);
    }
  }
  
  getPersona(): string {
    return this.persona.value;
  }
  
  getUser(): string {
    return this.user.value;
  }
  
  toJSON(): Record<string, any> {
    return {
      type: 'ChatMemory',
      blocks: this.getBlocks(),
    };
  }
  
  fromJSON(data: Record<string, any>): void {
    const blocks = data.blocks as Block[];
    blocks.forEach(block => {
      if (block.label === 'persona') {
        this.persona = block;
      } else if (block.label === 'human') {
        this.user = block;
      }
    });
  }
}

/**
 * Extended memory for SBF with additional context blocks
 */
export class SBFMemory extends ChatMemory {
  private currentFocus: Block;
  private recentEntities: Block;
  
  constructor(personaValue: string, userValue: string) {
    super(personaValue, userValue);
    this.currentFocus = {
      id: 'current-focus',
      label: 'current_focus',
      value: 'No current focus',
      limit: 1000,
      is_template: false,
    };
    this.recentEntities = {
      id: 'recent-entities',
      label: 'recent_entities',
      value: '[]',
      limit: 500,
      is_template: false,
    };
  }
  
  getBlocks(): Block[] {
    return [
      ...super.getBlocks(),
      this.currentFocus,
      this.recentEntities,
    ];
  }
  
  setCurrentFocus(entityUid: string, entityTitle: string): void {
    this.currentFocus.value = `Currently focused on: ${entityTitle} (${entityUid})`;
  }
  
  addRecentEntity(entityUid: string): void {
    const recent = JSON.parse(this.recentEntities.value) as string[];
    recent.unshift(entityUid);
    if (recent.length > 5) recent.pop();
    this.recentEntities.value = JSON.stringify(recent);
  }
}
```

**Tasks:**
1. Create `Block` type and schema
2. Implement `Memory` base class
3. Implement `ChatMemory` class
4. Implement `SBFMemory` with SBF-specific blocks
5. Add serialization methods

**Deliverables:**
- [ ] `memory.ts` created
- [ ] Memory classes tested in isolation

### 1.3 Create Agent State Schema

**Time:** 3-4 hours

**File:** `packages/core/src/agent/schemas/agent-state.ts`

**Extract From:**
- `libraries/letta/letta/schemas/agent.py`

**Implementation:**

```typescript
// schemas/agent-state.ts
import { z } from 'zod';
import { BlockSchema } from '../memory';

export const LLMConfigSchema = z.object({
  model: z.string().default('gpt-4-turbo-preview'),
  model_endpoint_type: z.enum(['openai', 'anthropic', 'openrouter', 'local']),
  context_window: z.number().default(128000),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

export const AgentStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  
  // Memory
  memory: z.object({
    blocks: z.array(BlockSchema),
  }),
  
  // LLM Config
  llm_config: LLMConfigSchema,
  
  // Tools
  tool_names: z.array(z.string()),
  
  // System prompt
  system_prompt: z.string(),
  
  // User context
  user_id: z.string(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;
```

**Tasks:**
1. Define `LLMConfig` schema
2. Define `AgentState` schema
3. Add validation helpers

**Deliverables:**
- [ ] `agent-state.ts` created
- [ ] Schemas validated

### 1.4 Implement Service Managers

**Time:** 6-8 hours

**Files:**
- `packages/core/src/agent/managers/conversation-manager.ts`
- `packages/core/src/agent/managers/tool-manager.ts`

**Extract From:**
- `libraries/letta/letta/services/message_manager.py`
- `libraries/letta/letta/services/tool_manager.py`

**Implementation:**

```typescript
// managers/conversation-manager.ts
import { MessageCreate } from '../base-agent';
import { z } from 'zod';

const MessageSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string().datetime(),
  tool_calls: z.array(z.any()).optional(),
});

type Message = z.infer<typeof MessageSchema>;

export class ConversationManager {
  private messages: Map<string, Message[]> = new Map();
  
  /**
   * Add messages to conversation history
   */
  async addMessages(agentId: string, messages: MessageCreate[]): Promise<Message[]> {
    const agentMessages = this.messages.get(agentId) || [];
    
    const newMessages = messages.map((msg, idx) => ({
      id: `msg-${Date.now()}-${idx}`,
      agent_id: agentId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
    }));
    
    agentMessages.push(...newMessages);
    this.messages.set(agentId, agentMessages);
    
    return newMessages;
  }
  
  /**
   * Get recent conversation history
   */
  async getMessages(agentId: string, limit: number = 50): Promise<Message[]> {
    const agentMessages = this.messages.get(agentId) || [];
    return agentMessages.slice(-limit);
  }
  
  /**
   * Clear conversation history
   */
  async clearMessages(agentId: string): Promise<void> {
    this.messages.delete(agentId);
  }
}
```

```typescript
// managers/tool-manager.ts
import { z } from 'zod';

const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  handler: z.function(),
});

type Tool = z.infer<typeof ToolSchema>;

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  
  /**
   * Register a tool
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }
  
  /**
   * Get tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }
  
  /**
   * Get all tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }
  
  /**
   * Execute a tool
   */
  async executeTool(
    name: string,
    parameters: Record<string, any>
  ): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    // TODO: Add sandboxing here
    return await tool.handler(parameters);
  }
}
```

**Tasks:**
1. Implement `ConversationManager`
2. Implement `ToolManager`
3. Add in-memory storage (will persist to filesystem later)

**Deliverables:**
- [ ] `conversation-manager.ts` created
- [ ] `tool-manager.ts` created
- [ ] Manager tests pass

---

## Phase 2: Tool System

### 2.1 Create Tool Schema

**Time:** 2-3 hours

**File:** `packages/core/src/agent/schemas/tool.ts`

**Implementation:**

```typescript
// schemas/tool.ts
import { z } from 'zod';

export const ToolParameterSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean().default(false),
  enum: z.array(z.string()).optional(),
});

export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.record(ToolParameterSchema),
  handler: z.function().args(z.record(z.any())).returns(z.promise(z.any())),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Convert tool to OpenAI function calling format
 */
export function toolToOpenAIFunction(tool: Tool) {
  return {
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: Object.entries(tool.parameters).reduce((acc, [key, param]) => {
          acc[key] = {
            type: param.type,
            description: param.description,
            enum: param.enum,
          };
          return acc;
        }, {} as Record<string, any>),
        required: Object.entries(tool.parameters)
          .filter(([, param]) => param.required)
          .map(([key]) => key),
      },
    },
  };
}
```

### 2.2 Implement Entity Tools

**Time:** 6-8 hours

**File:** `packages/core/src/agent/tools/entity/entity-tools.ts`

**Implementation:**

```typescript
// tools/entity/entity-tools.ts
import { Tool } from '../../schemas/tool';
import { EntityFileManager } from '../../../entity-file-manager';
import { Entity, EntityType } from '../../../types';

export function createEntityTools(entityManager: EntityFileManager): Tool[] {
  return [
    {
      id: 'create-entity-tool',
      name: 'create_entity',
      description: 'Create a new entity (topic, project, person, place, or daily note)',
      parameters: {
        type: {
          type: 'string',
          description: 'Entity type',
          required: true,
          enum: ['topic', 'project', 'person', 'place', 'daily-note'],
        },
        title: {
          type: 'string',
          description: 'Entity title',
          required: true,
        },
        content: {
          type: 'string',
          description: 'Entity content (markdown)',
          required: false,
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata (tags, status, etc.)',
          required: false,
        },
      },
      handler: async (params) => {
        const entity = await entityManager.createEntity({
          type: params.type as EntityType,
          title: params.title,
          content: params.content || '',
          metadata: params.metadata || {},
        });
        return {
          success: true,
          uid: entity.uid,
          message: `Created ${params.type}: ${params.title}`,
        };
      },
    },
    
    {
      id: 'update-entity-tool',
      name: 'update_entity',
      description: 'Update an existing entity',
      parameters: {
        uid: {
          type: 'string',
          description: 'Entity UID',
          required: true,
        },
        updates: {
          type: 'object',
          description: 'Fields to update',
          required: true,
        },
      },
      handler: async (params) => {
        await entityManager.updateEntity(params.uid, params.updates);
        return {
          success: true,
          message: `Updated entity: ${params.uid}`,
        };
      },
    },
    
    {
      id: 'get-entity-tool',
      name: 'get_entity',
      description: 'Retrieve an entity by UID',
      parameters: {
        uid: {
          type: 'string',
          description: 'Entity UID',
          required: true,
        },
      },
      handler: async (params) => {
        const entity = await entityManager.getEntity(params.uid);
        if (!entity) {
          return { success: false, error: 'Entity not found' };
        }
        return {
          success: true,
          entity: {
            uid: entity.uid,
            type: entity.type,
            title: entity.title,
            content: entity.content,
            metadata: entity.metadata,
          },
        };
      },
    },
    
    {
      id: 'search-entities-tool',
      name: 'search_entities',
      description: 'Search for entities by query',
      parameters: {
        query: {
          type: 'string',
          description: 'Search query',
          required: true,
        },
        filters: {
          type: 'object',
          description: 'Optional filters (type, tags, etc.)',
          required: false,
        },
      },
      handler: async (params) => {
        const results = await entityManager.searchEntities(
          params.query,
          params.filters
        );
        return {
          success: true,
          count: results.length,
          entities: results.map(e => ({
            uid: e.uid,
            type: e.type,
            title: e.title,
          })),
        };
      },
    },
  ];
}
```

**Tasks:**
1. Implement `create_entity` tool
2. Implement `update_entity` tool
3. Implement `get_entity` tool
4. Implement `search_entities` tool
5. Add error handling and validation

**Deliverables:**
- [ ] Entity tools created
- [ ] Tools integrated with EntityFileManager
- [ ] Tool tests pass

### 2.3 Implement Graph Tools

**Time:** 4-6 hours

**File:** `packages/core/src/agent/tools/graph/graph-tools.ts`

**Implementation:**

```typescript
// tools/graph/graph-tools.ts
import { Tool } from '../../schemas/tool';
// Import graph manager when available

export function createGraphTools(): Tool[] {
  return [
    {
      id: 'link-entities-tool',
      name: 'link_entities',
      description: 'Create a relationship between two entities',
      parameters: {
        source_uid: {
          type: 'string',
          description: 'Source entity UID',
          required: true,
        },
        target_uid: {
          type: 'string',
          description: 'Target entity UID',
          required: true,
        },
        relationship: {
          type: 'string',
          description: 'Relationship type (informs, uses, related_to, etc.)',
          required: true,
        },
      },
      handler: async (params) => {
        // TODO: Integrate with graph manager
        console.log('Creating link:', params);
        return {
          success: true,
          message: `Linked ${params.source_uid} --[${params.relationship}]--> ${params.target_uid}`,
        };
      },
    },
    
    {
      id: 'search-relationships-tool',
      name: 'search_relationships',
      description: 'Find relationships for an entity',
      parameters: {
        uid: {
          type: 'string',
          description: 'Entity UID',
          required: true,
        },
        relationship_type: {
          type: 'string',
          description: 'Optional relationship type filter',
          required: false,
        },
      },
      handler: async (params) => {
        // TODO: Integrate with graph manager
        return {
          success: true,
          relationships: [],
        };
      },
    },
  ];
}
```

**Tasks:**
1. Implement `link_entities` tool
2. Implement `search_relationships` tool
3. Defer full implementation until graph module exists

**Deliverables:**
- [ ] Graph tools stubbed
- [ ] Ready for graph integration in Phase 1.5

---

## Phase 3: LLM Integration

### 3.1 Create LLM Client Abstraction

**Time:** 4-6 hours

**File:** `packages/core/src/agent/llm/client.ts`

**Extract From:**
- `libraries/letta/letta/llm_api/llm_client.py`

**Implementation:**

```typescript
// llm/client.ts
import { LLMConfig } from '../schemas/agent-state';
import { MessageCreate, UsageStatistics } from '../base-agent';
import { Tool } from '../schemas/tool';

export interface LLMResponse {
  message: string;
  tool_calls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, any>;
  }>;
  usage: UsageStatistics;
}

export abstract class LLMClient {
  constructor(protected config: LLMConfig) {}
  
  abstract sendRequest(
    messages: MessageCreate[],
    tools: Tool[]
  ): Promise<LLMResponse>;
  
  static create(config: LLMConfig): LLMClient {
    switch (config.model_endpoint_type) {
      case 'openai':
        return new OpenAIClient(config);
      case 'anthropic':
        return new AnthropicClient(config);
      case 'local':
        return new LocalLLMClient(config);
      default:
        throw new Error(`Unsupported provider: ${config.model_endpoint_type}`);
    }
  }
}
```

### 3.2 Implement OpenAI Client

**Time:** 3-4 hours

**File:** `packages/core/src/agent/llm/openai-client.ts`

**Implementation:**

```typescript
// llm/openai-client.ts
import OpenAI from 'openai';
import { LLMClient, LLMResponse } from './client';
import { MessageCreate } from '../base-agent';
import { Tool, toolToOpenAIFunction } from '../schemas/tool';

export class OpenAIClient extends LLMClient {
  private client: OpenAI;
  
  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async sendRequest(
    messages: MessageCreate[],
    tools: Tool[]
  ): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      tools: tools.map(toolToOpenAIFunction),
      temperature: this.config.temperature,
      max_tokens: this.config.max_tokens,
    });
    
    const choice = response.choices[0];
    const message = choice.message;
    
    return {
      message: message.content || '',
      tool_calls: message.tool_calls?.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      })),
      usage: {
        total_tokens: response.usage?.total_tokens || 0,
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        step_count: 1,
      },
    };
  }
}
```

**Tasks:**
1. Implement OpenAI client
2. Handle tool calls
3. Parse responses
4. Add error handling

**Deliverables:**
- [ ] OpenAI client working
- [ ] Tool calling tested

### 3.3 Implement Anthropic Client (Optional)

**Time:** 3-4 hours

**File:** `packages/core/src/agent/llm/anthropic-client.ts`

**Tasks:**
1. Similar to OpenAI but using Anthropic SDK
2. Handle tool use pattern (different from OpenAI)

**Deliverables:**
- [ ] Anthropic client working (optional for MVP)

---

## Phase 4: Main Agent Implementation

### 4.1 Implement SBFAgent Class

**Time:** 8-10 hours

**File:** `packages/core/src/agent/sbf-agent.ts`

**Extract From:**
- `libraries/letta/letta/agent.py` (lines 96-300)

**Implementation:**

```typescript
// sbf-agent.ts
import { BaseAgent, MessageCreate, UsageStatistics } from './base-agent';
import { AgentState } from './schemas/agent-state';
import { SBFMemory } from './memory';
import { ConversationManager } from './managers/conversation-manager';
import { ToolManager } from './managers/tool-manager';
import { LLMClient } from './llm/client';
import { createEntityTools } from './tools/entity/entity-tools';
import { createGraphTools } from './tools/graph/graph-tools';

export class SBFAgent extends BaseAgent {
  private state: AgentState;
  private memory: SBFMemory;
  private conversationManager: ConversationManager;
  private toolManager: ToolManager;
  private llmClient: LLMClient;
  
  constructor(
    state: AgentState,
    entityManager: any // EntityFileManager
  ) {
    super();
    this.state = state;
    
    // Initialize memory from state
    const memoryBlocks = state.memory.blocks;
    const personaBlock = memoryBlocks.find(b => b.label === 'persona');
    const userBlock = memoryBlocks.find(b => b.label === 'human');
    
    this.memory = new SBFMemory(
      personaBlock?.value || 'I am your Second Brain assistant.',
      userBlock?.value || 'The user prefers organized, clear responses.'
    );
    
    // Initialize managers
    this.conversationManager = new ConversationManager();
    this.toolManager = new ToolManager();
    
    // Register tools
    this.registerTools(entityManager);
    
    // Initialize LLM client
    this.llmClient = LLMClient.create(state.llm_config);
  }
  
  private registerTools(entityManager: any): void {
    const entityTools = createEntityTools(entityManager);
    const graphTools = createGraphTools();
    
    [...entityTools, ...graphTools].forEach(tool => {
      this.toolManager.registerTool(tool);
    });
  }
  
  async initialize(): Promise<void> {
    console.log(`Agent ${this.state.name} initialized`);
  }
  
  async step(inputMessages: MessageCreate[]): Promise<UsageStatistics> {
    // 1. Add messages to conversation history
    await this.conversationManager.addMessages(this.state.id, inputMessages);
    
    // 2. Get recent conversation context
    const recentMessages = await this.conversationManager.getMessages(
      this.state.id,
      20
    );
    
    // 3. Build prompt with memory
    const systemMessage: MessageCreate = {
      role: 'system',
      content: this.buildSystemPrompt(),
    };
    
    const allMessages = [systemMessage, ...recentMessages];
    
    // 4. Send to LLM with tools
    const tools = this.toolManager.getAllTools();
    const response = await this.llmClient.sendRequest(allMessages, tools);
    
    // 5. Handle tool calls
    if (response.tool_calls) {
      for (const toolCall of response.tool_calls) {
        const result = await this.toolManager.executeTool(
          toolCall.name,
          toolCall.arguments
        );
        
        // Add tool result to conversation
        await this.conversationManager.addMessages(this.state.id, [
          {
            role: 'assistant',
            content: JSON.stringify({
              tool_call: toolCall.name,
              result,
            }),
          },
        ]);
      }
    }
    
    // 6. Add assistant response to conversation
    if (response.message) {
      await this.conversationManager.addMessages(this.state.id, [
        {
          role: 'assistant',
          content: response.message,
        },
      ]);
    }
    
    return response.usage;
  }
  
  private buildSystemPrompt(): string {
    const memoryBlocks = this.memory.getBlocks();
    const memoryContext = memoryBlocks
      .map(b => `[${b.label}]: ${b.value}`)
      .join('\n\n');
    
    return `${this.state.system_prompt}

## Your Memory:
${memoryContext}

## Instructions:
- Use tools to help the user organize their knowledge
- Always create entities with proper metadata
- Link related entities to build the knowledge graph
- Be concise and actionable
`;
  }
  
  async cleanup(): Promise<void> {
    console.log(`Agent ${this.state.name} cleanup complete`);
  }
  
  /**
   * Public API methods
   */
  
  async chat(userMessage: string): Promise<string> {
    const usage = await this.step([
      {
        role: 'user',
        content: userMessage,
      },
    ]);
    
    const messages = await this.conversationManager.getMessages(this.state.id, 1);
    return messages[0]?.content || '';
  }
  
  async suggestFiling(dailyNoteUid: string): Promise<any> {
    // TODO: Implement auto-filing logic
    return { suggestions: [] };
  }
}
```

**Tasks:**
1. Implement core agent logic
2. Wire up managers
3. Implement step() method
4. Add system prompt building
5. Handle tool execution loop

**Deliverables:**
- [ ] `SBFAgent` class complete
- [ ] Can process messages
- [ ] Can execute tools
- [ ] Returns proper responses

### 4.2 Create Agent Factory

**Time:** 2-3 hours

**File:** `packages/core/src/agent/factory.ts`

**Implementation:**

```typescript
// factory.ts
import { SBFAgent } from './sbf-agent';
import { AgentState, LLMConfig } from './schemas/agent-state';
import { EntityFileManager } from '../entity-file-manager';

export interface CreateAgentOptions {
  name: string;
  userId: string;
  llmConfig?: Partial<LLMConfig>;
  systemPrompt?: string;
}

export class AgentFactory {
  constructor(private entityManager: EntityFileManager) {}
  
  createAgent(options: CreateAgentOptions): SBFAgent {
    const defaultPrompt = `You are a helpful AI assistant for the Second Brain Foundation.
Your role is to help users organize their knowledge by creating entities, linking them, and maintaining their knowledge graph.`;
    
    const state: AgentState = {
      id: `agent-${Date.now()}`,
      name: options.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      memory: {
        blocks: [
          {
            id: 'persona-core',
            label: 'persona',
            value: 'I am your Second Brain assistant, helping you organize knowledge.',
            limit: 2000,
            is_template: false,
          },
          {
            id: 'user-core',
            label: 'human',
            value: `User prefers clear, organized responses.`,
            limit: 2000,
            is_template: false,
          },
        ],
      },
      llm_config: {
        model: 'gpt-4-turbo-preview',
        model_endpoint_type: 'openai',
        context_window: 128000,
        temperature: 0.7,
        ...options.llmConfig,
      },
      tool_names: [
        'create_entity',
        'update_entity',
        'get_entity',
        'search_entities',
        'link_entities',
      ],
      system_prompt: options.systemPrompt || defaultPrompt,
      user_id: options.userId,
    };
    
    return new SBFAgent(state, this.entityManager);
  }
}
```

**Tasks:**
1. Create factory for agent instantiation
2. Handle default configurations
3. Add convenience methods

**Deliverables:**
- [ ] Agent factory working
- [ ] Easy agent creation

---

## Phase 5: State Persistence

### 5.1 Implement State Manager

**Time:** 4-6 hours

**File:** `packages/core/src/agent/managers/state-manager.ts`

**Implementation:**

```typescript
// managers/state-manager.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { AgentState } from '../schemas/agent-state';

export class StateManager {
  private statePath: string;
  
  constructor(vaultPath: string) {
    this.statePath = path.join(vaultPath, '.sbf', 'agents');
  }
  
  async saveState(state: AgentState): Promise<void> {
    await fs.mkdir(this.statePath, { recursive: true });
    const filePath = path.join(this.statePath, `${state.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(state, null, 2));
  }
  
  async loadState(agentId: string): Promise<AgentState | null> {
    const filePath = path.join(this.statePath, `${agentId}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as AgentState;
    } catch (error) {
      return null;
    }
  }
  
  async listAgents(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.statePath);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }
}
```

**Tasks:**
1. Implement file-based state persistence
2. Save/load agent state
3. List available agents

**Deliverables:**
- [ ] State persistence working
- [ ] Agents survive restarts

---

## Phase 6: Testing & Integration

### 6.1 Unit Tests

**Time:** 4-6 hours

**Files:**
- `packages/core/src/agent/__tests__/memory.test.ts`
- `packages/core/src/agent/__tests__/tool-manager.test.ts`
- `packages/core/src/agent/__tests__/sbf-agent.test.ts`

**Tasks:**
1. Test memory system
2. Test tool execution
3. Test agent step() method
4. Mock LLM responses

**Deliverables:**
- [ ] >80% code coverage for agent module

### 6.2 Integration Tests

**Time:** 4-6 hours

**File:** `packages/core/src/agent/__tests__/integration.test.ts`

**Test Scenarios:**
1. Create agent → chat → create entity
2. Search entities via agent
3. Link entities via agent
4. Agent memory persistence

**Deliverables:**
- [ ] E2E agent workflows tested

### 6.3 UI Integration

**Time:** 6-8 hours

**Tasks:**
1. Connect chat UI to agent
2. Display tool calls in UI
3. Show created entities
4. Update IPC handlers

**Deliverables:**
- [ ] Chat UI connected to agent backend
- [ ] Users can interact with agent

---

## Success Criteria

### Phase 1 Complete
- [ ] Agent can be instantiated
- [ ] Memory system works
- [ ] Managers implemented

### Phase 2 Complete
- [ ] Tools registered and executable
- [ ] Entity tools work (create, update, get, search)
- [ ] Graph tools stubbed

### Phase 3 Complete
- [ ] OpenAI integration works
- [ ] Agent can call tools via LLM
- [ ] Responses are coherent

### Phase 4 Complete
- [ ] SBFAgent fully functional
- [ ] Agent factory works
- [ ] State persists

### Phase 5 Complete
- [ ] Tests pass
- [ ] UI integration complete
- [ ] Documentation updated

---

## Risk Mitigation

### High Priority
1. **LLM costs** - Start with smaller models (gpt-3.5-turbo) for testing
2. **Tool errors** - Validate all tool parameters before execution
3. **State corruption** - Backup agent state before modifications

### Medium Priority
4. **Memory overflow** - Implement message summarization
5. **Tool hallucination** - Require user confirmation for destructive operations

---

## Next Actions

1. **Review this plan** with team
2. **Start Phase 1.1** - Port BaseAgent class
3. **Set up testing framework** for agent module
4. **Configure OpenAI API key** in environment

---

**Ready to Begin Implementation** 🚀

