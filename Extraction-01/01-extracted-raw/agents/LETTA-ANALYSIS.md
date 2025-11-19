# Letta Framework Analysis - Python to TypeScript Translation

**Date:** 2025-11-14  
**Purpose:** Extract agentic AI framework patterns from Letta for SBF integration  
**Source:** libraries/letta/  
**Target:** TypeScript-based agent system  
**Status:** Pattern extraction complete

---

## Executive Summary

Letta (formerly MemGPT) is a **stateful agent framework** with advanced memory management. It enables agents that:
- Learn and improve over time
- Maintain persistent memory across sessions
- Execute tools with approval workflows
- Manage context windows intelligently
- Support multi-modal interactions

**Key Innovation:** Memory-augmented agents with Core, Archival, and Recall memory systems.

---

## Core Architecture Patterns

### 1. Agent State Management

**Python Pattern (agent.py):**
```python
class Agent(BaseAgent):
    def __init__(
        self,
        interface: AgentInterface,
        agent_state: AgentState,
        user: User,
        tools: List[Tool],
    ):
        self.agent_state = agent_state  # Persisted state
        self.interface = interface      # UI/CLI interface
        self.user = user               # Owner
        self.tools = tools             # Available tools
        
    def step(self, input_messages: List[MessageCreate]) -> AgentStepResponse:
        """Main event loop - process message, think, execute tools, respond"""
        pass
```

**TypeScript Translation:**
```typescript
interface AgentState {
  id: string;
  name: string;
  agentType: AgentType;
  
  // Memory
  memory: Memory;
  messageIds: string[];
  
  // Configuration
  system: string;           // System prompt
  llmConfig: LLMConfig;
  embeddingConfig: EmbeddingConfig;
  
  // Tool management
  toolRules: ToolRule[];
  tools: Tool[];
  
  // Metadata
  createdAt: Date;
  metadata?: Record<string, any>;
}

class SBFAgent {
  constructor(
    private state: AgentState,
    private interface: AgentInterface,
    private toolExecutor: ToolExecutor,
  ) {}
  
  async step(input: MessageCreate[]): Promise<AgentStepResponse> {
    // 1. Add message to context
    // 2. Run LLM inference
    // 3. Execute tool calls
    // 4. Update memory
    // 5. Return response
  }
}
```

---

### 2. Memory System (CRITICAL)

**Letta's 3-Tier Memory:**

#### **Core Memory** (Always in context)
- Small, editable blocks (like system RAM)
- Examples: persona, user info, current task
- Limited size (~2000 chars per block)
- Tools can edit: `core_memory_append()`, `core_memory_replace()`

**Python Pattern:**
```python
class Memory(BaseModel):
    blocks: List[Block]          # Core memory blocks
    file_blocks: List[FileBlock] # File attachments
    
    def get_block(self, label: str) -> Optional[Block]:
        """Get block by label (e.g., 'persona', 'human')"""
        pass
    
    def update_block(self, label: str, value: str):
        """Update block content"""
        pass
```

**TypeScript Translation:**
```typescript
interface Block {
  id: string;
  label: string;          // e.g., "persona", "human", "current_task"
  value: string;          // The actual content
  limit: number;          // Character limit (e.g., 2000)
}

interface Memory {
  blocks: Block[];        // Core memory (always in context)
  fileBlocks: FileBlock[]; // Files currently in context
}

class MemoryManager {
  async getBlock(label: string): Promise<Block | null> {
    // Retrieve block
  }
  
  async updateBlock(label: string, value: string): Promise<void> {
    // Update with validation
  }
  
  async appendToBlock(label: string, content: string): Promise<void> {
    // Append content
  }
}
```

#### **Archival Memory** (Long-term storage)
- Vector database for semantic search
- Stores all past interactions, entities, notes
- Retrieved on-demand via `archival_memory_search()`
- Maps to: **SBF Entity Database**

**SBF Integration:**
```typescript
interface ArchivalMemory {
  // In SBF, this is our Entity system
  async search(query: string, limit?: number): Promise<Entity[]>;
  async insert(content: string, metadata?: any): Promise<void>;
}

class SBFArchivalMemory implements ArchivalMemory {
  constructor(private entityService: EntityService) {}
  
  async search(query: string, limit = 10): Promise<Entity[]> {
    // Use existing entity search (fuse.js + vector similarity)
    return this.entityService.searchEntities(query, { limit });
  }
  
  async insert(content: string, metadata?: any): Promise<void> {
    // Create entity from AI suggestion
    await this.entityService.createEntityFromAI(content, metadata);
  }
}
```

#### **Recall Memory** (Conversation history)
- Chronological message history
- Summarized when context window fills
- Retrieved via `conversation_search()`

---

### 3. Tool Execution with Approval

**Key Pattern:** Tools can require user approval before execution.

**Python Pattern:**
```python
class Tool(BaseTool):
    name: str
    description: str
    json_schema: Dict          # OpenAI function schema
    source_code: str           # Actual Python code
    default_requires_approval: bool
    
async def execute_tool(tool: Tool, args: Dict) -> ToolExecutionResult:
    if tool.default_requires_approval:
        # Send to approval queue
        await interface.request_approval(tool, args)
    
    # Execute in sandbox
    result = await sandbox.run(tool.source_code, args)
    return result
```

**TypeScript Translation:**
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  
  // Function signature
  jsonSchema: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: JSONSchema;
    };
  };
  
  // Execution
  sourceCode?: string;
  handler?: ToolHandler;
  requiresApproval: boolean;
}

class ToolExecutor {
  async executeTool(
    tool: Tool,
    args: Record<string, any>,
    approvalService: ApprovalService
  ): Promise<ToolExecutionResult> {
    if (tool.requiresApproval) {
      // Add to Organization Queue
      const approved = await approvalService.requestApproval({
        type: 'tool_execution',
        tool: tool.name,
        args,
      });
      
      if (!approved) {
        return { success: false, error: 'User rejected' };
      }
    }
    
    // Execute tool
    const result = await tool.handler(args);
    return { success: true, result };
  }
}
```

---

### 4. SBF-Specific Tools

**Entity Extraction Tool:**
```typescript
const extractEntityTool: Tool = {
  name: "extract_entity",
  description: "Extract a person, project, or organization from the conversation and create an entity",
  jsonSchema: {
    type: "function",
    function: {
      name: "extract_entity",
      parameters: {
        type: "object",
        properties: {
          entityType: { 
            type: "string", 
            enum: ["person", "project", "organization", "concept"] 
          },
          name: { type: "string" },
          description: { type: "string" },
          sensitivity: { 
            type: "string", 
            enum: ["public", "internal", "private", "confidential"] 
          },
          suggestedRelationships: {
            type: "array",
            items: {
              type: "object",
              properties: {
                targetEntity: { type: "string" },
                relationshipType: { type: "string" }
              }
            }
          }
        },
        required: ["entityType", "name", "description"]
      }
    }
  },
  requiresApproval: true,
  handler: async (args) => {
    // Add to Organization Queue for approval
    return await organizationQueue.addEntitySuggestion(args);
  }
};
```

**File Organization Tool:**
```typescript
const suggestFileLocationTool: Tool = {
  name: "suggest_file_location",
  description: "Suggest where to file a document based on its content and entities",
  jsonSchema: {
    type: "function",
    function: {
      name: "suggest_file_location",
      parameters: {
        type: "object",
        properties: {
          filePath: { type: "string" },
          suggestedPath: { type: "string" },
          reasoning: { type: "string" },
          relatedEntities: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["filePath", "suggestedPath", "reasoning"]
      }
    }
  },
  requiresApproval: true,
  handler: async (args) => {
    return await organizationQueue.addFilingSuggestion(args);
  }
};
```

---

### 5. Learning from Feedback

**Pattern:** Agent learns from user approvals/rejections

**Python Pattern (implicit in Letta):**
```python
# When user approves/rejects, agent can update its memory
async def process_approval_feedback(
    agent: Agent,
    suggestion: ToolCall,
    approved: bool,
    user_feedback: str
):
    if approved:
        # Execute the tool
        await execute_tool(suggestion.tool, suggestion.args)
        
        # Update memory with success pattern
        await agent.update_memory(
            f"User approved {suggestion.tool.name} with args {suggestion.args}. "
            f"This pattern was successful."
        )
    else:
        # Learn from rejection
        await agent.update_memory(
            f"User rejected {suggestion.tool.name}. Reason: {user_feedback}. "
            f"Avoid similar suggestions in the future."
        )
```

**TypeScript Implementation:**
```typescript
class LearningService {
  async processFeedback(
    agentId: string,
    suggestion: Suggestion,
    approved: boolean,
    feedback?: string
  ): Promise<void> {
    const agent = await this.agentService.getAgent(agentId);
    
    // Update learning metrics
    const learningData = {
      suggestionType: suggestion.type,
      parameters: suggestion.parameters,
      approved,
      feedback,
      timestamp: new Date(),
    };
    
    await this.storeLearningData(agentId, learningData);
    
    // Update agent memory
    const memoryUpdate = approved
      ? `Successfully ${suggestion.type}: ${suggestion.summary}. User approved this pattern.`
      : `Rejected ${suggestion.type}: ${suggestion.summary}. Reason: ${feedback}. Improve future suggestions.`;
    
    await this.memoryService.appendToBlock(agentId, 'learning', memoryUpdate);
    
    // Adjust confidence scores
    await this.adjustConfidenceScores(agentId, suggestion.type, approved);
  }
  
  private async adjustConfidenceScores(
    agentId: string,
    suggestionType: string,
    approved: boolean
  ): Promise<void> {
    // Bayesian updating of confidence scores
    // More approvals → higher confidence
    // More rejections → lower confidence
  }
}
```

---

### 6. Context Window Management

**Pattern:** Summarize old messages when context is full

**Python Pattern:**
```python
def handle_context_overflow(
    agent: Agent,
    new_message: Message
) -> List[Message]:
    # Calculate current tokens
    current_tokens = count_tokens(agent.messages)
    context_limit = agent.llm_config.context_window
    
    if current_tokens + count_tokens(new_message) > context_limit * 0.8:
        # Summarize oldest messages
        summary = summarize_messages(
            agent.messages[:10],  # Oldest 10 messages
            agent.llm_config
        )
        
        # Replace old messages with summary
        agent.messages = [
            Message(role="system", content=summary)
        ] + agent.messages[10:]
    
    agent.messages.append(new_message)
    return agent.messages
```

**TypeScript Translation:**
```typescript
class ContextManager {
  private readonly CONTEXT_WARNING_THRESHOLD = 0.8; // 80% full
  
  async addMessage(
    agentId: string,
    message: Message
  ): Promise<void> {
    const agent = await this.getAgent(agentId);
    const messages = await this.getMessages(agent.messageIds);
    
    // Calculate token usage
    const currentTokens = this.countTokens(messages);
    const newMessageTokens = this.countTokens([message]);
    const contextLimit = agent.llmConfig.contextWindow;
    
    if ((currentTokens + newMessageTokens) > contextLimit * this.CONTEXT_WARNING_THRESHOLD) {
      // Trigger summarization
      await this.summarizeAndCompact(agentId);
    }
    
    // Add new message
    const messageId = await this.messageService.create(message);
    agent.messageIds.push(messageId);
    await this.saveAgent(agent);
  }
  
  private async summarizeAndCompact(agentId: string): Promise<void> {
    const agent = await this.getAgent(agentId);
    const messages = await this.getMessages(agent.messageIds);
    
    // Summarize oldest 20% of messages
    const cutoff = Math.floor(messages.length * 0.2);
    const toSummarize = messages.slice(0, cutoff);
    const toKeep = messages.slice(cutoff);
    
    // Generate summary
    const summary = await this.llmService.summarize(toSummarize);
    
    // Create summary message
    const summaryMessage = await this.messageService.create({
      role: 'system',
      content: `[Summary of ${cutoff} messages]: ${summary}`,
    });
    
    // Update agent message list
    agent.messageIds = [summaryMessage.id, ...toKeep.map(m => m.id)];
    await this.saveAgent(agent);
  }
}
```

---

## SBF Integration Strategy

### Phase 1: Core Agent (Week 1-2)

**Create:**
```
sbf-core/src/agent/
├── Agent.ts              # Main agent class
├── AgentState.ts         # State management
├── ContextManager.ts     # Context window handling
└── types.ts              # TypeScript interfaces
```

**Implement:**
- Basic agent initialization
- State persistence
- Message handling
- Context window management

---

### Phase 2: Memory System (Week 2-3)

**Create:**
```
sbf-core/src/agent/memory/
├── MemoryManager.ts      # Core memory
├── BlockManager.ts       # Memory blocks
├── ArchivalMemory.ts     # Entity integration
└── RecallMemory.ts       # Conversation history
```

**Implement:**
- Core memory (blocks)
- Archival memory (entity search)
- Recall memory (message history)
- Memory tools (update, search)

---

### Phase 3: Tool System (Week 3-4)

**Create:**
```
sbf-core/src/agent/tools/
├── ToolExecutor.ts       # Tool execution engine
├── ToolRegistry.ts       # Available tools
├── sbf-tools/
│   ├── entityExtraction.ts
│   ├── fileOrganization.ts
│   ├── relationshipSuggestion.ts
│   └── memoryTools.ts
└── approval/
    └── ApprovalQueue.ts  # Integration with Organization Queue
```

**Implement:**
- Tool execution with approval
- SBF-specific tools
- Organization Queue integration

---

### Phase 4: Learning System (Week 4-5)

**Create:**
```
sbf-core/src/agent/learning/
├── LearningService.ts    # Feedback processing
├── ConfidenceScoring.ts  # Confidence metrics
└── PatternStorage.ts     # Learning data persistence
```

**Implement:**
- Approval/rejection tracking
- Confidence score adjustment
- Pattern recognition improvement

---

### Phase 5: LLM Integration (Week 5-6)

**Create:**
```
sbf-core/src/agent/llm/
├── LLMClient.ts          # Unified LLM interface
├── providers/
│   ├── OpenAIProvider.ts
│   ├── AnthropicProvider.ts
│   ├── LlamaProvider.ts  # Local models
│   └── LettaProvider.ts  # Letta Cloud
└── PromptBuilder.ts      # Prompt construction
```

**Implement:**
- Provider abstraction
- Streaming responses
- Function calling
- Local + cloud support

---

## Key Files Extracted

**From `libraries/letta/`:**

1. **letta/agent.py** (89KB)
   - Main agent loop
   - Tool execution
   - Context management

2. **letta/memory.py** (4KB)
   - Memory summarization
   - Memory functions

3. **letta/schemas/agent.py** (26KB)
   - AgentState definition
   - AgentType enum
   - Configuration schemas

4. **letta/schemas/memory.py** (20KB)
   - Memory class
   - Block definitions
   - Context window overview

5. **letta/schemas/tool.py** (11KB)
   - Tool definition
   - JSON schema handling
   - Tool types

6. **letta/schemas/message.py** (97KB)
   - Message schemas
   - MessageCreate
   - Tool calls/returns

7. **letta/schemas/block.py** (8KB)
   - Block definitions
   - FileBlock for attachments

---

## Adaptation Notes

### Python → TypeScript Challenges

**1. Pydantic → TypeScript**
- Use Zod for runtime validation
- Or use class-validator decorators
- Or plain interfaces (rely on compile-time checking)

**2. Async Patterns**
- Python: `async def` / `await`
- TypeScript: Same! (`async`/`await`)
- ✅ Direct translation

**3. Dependency Injection**
- Letta uses: Constructor injection
- SBF should use: Same pattern (or NestJS if using)

**4. Database ORM**
- Letta uses: SQLAlchemy
- SBF should use: TypeORM or Prisma

---

## Critical Decisions for SBF

### 1. Memory Block Design

**Letta Default Blocks:**
- `persona` - Agent's self-description
- `human` - Info about user

**SBF Recommended Blocks:**
```typescript
const SBF_DEFAULT_BLOCKS: Block[] = [
  {
    label: 'persona',
    value: 'I am an AI assistant helping with knowledge organization. I extract entities, suggest filing locations, and identify relationships.',
    limit: 2000
  },
  {
    label: 'user',
    value: 'User preferences and organizational style will be learned over time.',
    limit: 2000
  },
  {
    label: 'current_task',
    value: 'Currently helping organize knowledge vault.',
    limit: 1000
  },
  {
    label: 'learning',
    value: 'Approved patterns and user feedback will be recorded here.',
    limit: 3000
  }
];
```

### 2. Archival Memory = Entity Database

**Direct Mapping:**
- Letta's archival memory ↔ SBF's Entity system
- `archival_memory_search()` ↔ `entityService.search()`
- `archival_memory_insert()` ↔ `entityService.create()`

**Benefit:** Leverage existing entity infrastructure!

### 3. Tool Approval = Organization Queue

**Direct Integration:**
- When agent calls `extract_entity()` → Add to Organization Queue
- User approves/rejects in Queue UI
- Feedback loop trains agent

### 4. Conversation Recall = Chat History

**Simple Mapping:**
- Store all chat messages
- Index with fuse.js for search
- `conversation_search()` ↔ `messageService.search()`

---

## Estimated Implementation Effort

| Component | Complexity | Effort | Dependencies |
|-----------|-----------|--------|--------------|
| Agent Core | Medium | 3 days | None |
| Memory System | Medium | 4 days | Entity service |
| Tool Execution | Medium | 3 days | Approval queue |
| Learning Service | Hard | 5 days | Database |
| LLM Integration | Medium | 3 days | API clients |
| **TOTAL** | | **18 days** (~4 weeks) | |

---

## Success Criteria

**Agent is "Letta-Grade" when:**
- ✅ Maintains persistent memory across sessions
- ✅ Executes tools with approval workflow
- ✅ Learns from user feedback
- ✅ Manages context window automatically
- ✅ Searches entity database (archival memory)
- ✅ Suggests entity extractions
- ✅ Improves accuracy over time

---

## Next Steps

**Immediate (this session):**
1. ✅ Extract Letta patterns (DONE)
2. ⏳ Extract text-generation-webui queue patterns
3. ⏳ Extract SurfSense/trilium file browser UI

**Week 1-2:**
1. Scaffold `sbf-core/src/agent/` structure
2. Implement Agent and AgentState classes
3. Build MemoryManager with blocks
4. Create ContextManager

**Week 3-4:**
1. Implement ToolExecutor
2. Create SBF-specific tools
3. Integrate with Organization Queue
4. Build LearningService

**Week 5-6:**
1. LLM provider integration
2. End-to-end testing
3. UI integration (chat + queue)
4. Performance optimization

---

**Analysis by:** Architect Agent  
**Framework:** Letta → SBF TypeScript  
**Date:** 2025-11-14  
**Status:** ✅ Pattern extraction complete, ready for implementation  
**Next:** Extract remaining UI components (queue, file browser)
