# 🚀 Phase 2 Preparation - Ready for Execution

**Date:** 2025-11-14  
**Current Status:** Phase 1 Complete ✅  
**Next Phase:** Phase 2 - Tool System Implementation  
**Prepared By:** AI Assistant (Claude)  
**Status:** 🟢 **READY TO START**

---

## 📋 Quick Reference

When you return and say "**proceed to phase 2**", I will immediately begin with:

1. **Analyze Letta's tool system** (`libraries/letta/letta/schemas/tool.py`)
2. **Design SBF tool definitions** for entity operations
3. **Implement tool registry** and execution engine
4. **Build entity CRUD tools** (create, read, update, search, link)
5. **Integrate with EntityFileManager** from existing codebase
6. **Add tool validation** and parameter checking

**Estimated Duration:** 2-3 days  
**Expected Output:** ~800-1000 lines of new TypeScript code

---

## ✅ Phase 1 Achievements (Completed)

### What Was Built

**10 new files, ~1,265 lines of production TypeScript:**

```
packages/core/src/agent/
├── base-agent.ts              (100 LOC) - Abstract agent interface
├── memory.ts                  (250 LOC) - Block-based memory system  
├── sbf-agent.ts               (350 LOC) - Main agent implementation
├── schemas/
│   └── agent-state.ts         (150 LOC) - State schemas with Zod
├── managers/
│   ├── conversation-manager.ts (90 LOC) - Message history
│   └── state-manager.ts       (120 LOC) - State persistence
└── llm/
    ├── llm-client.ts          (75 LOC) - LLM abstraction
    ├── openai-client.ts       (85 LOC) - OpenAI integration
    └── llm-index.ts           (10 LOC) - Exports
```

### What Works Now

- ✅ **Agent Creation:** `SBFAgent.create()` with configuration
- ✅ **Conversations:** `.step()` method with GPT-4
- ✅ **Memory Blocks:** Persona, user, current focus, recent entities, active projects
- ✅ **State Persistence:** Save/load from `.sbf/agents/{agentId}.json`
- ✅ **Conversation History:** Full message tracking
- ✅ **Tool Framework:** Stub ready for Phase 2 implementation

### Dependencies Installed

```json
{
  "dependencies": {
    "openai": "^4.20.1",
    "@anthropic-ai/sdk": "^0.9.1",
    "zod": "^3.22.4"
  }
}
```

---

## 🎯 Phase 2 Objectives

### Primary Goals

1. **Tool Definition System**
   - Tool schema (name, description, parameters)
   - Parameter validation with Zod
   - Tool registry for discovery

2. **Entity CRUD Tools**
   - `create_entity` - Create new entities
   - `read_entity` - Retrieve entity by UID
   - `update_entity` - Update entity frontmatter/content
   - `search_entities` - Full-text and metadata search
   - `create_relationship` - Link entities together

3. **Tool Execution Engine**
   - Parse tool calls from LLM responses
   - Validate parameters
   - Execute tools with sandboxing
   - Return results to agent
   - Error handling

4. **Integration with EntityFileManager**
   - Use existing entity operations
   - Ensure consistency with current system
   - Maintain vault security boundaries

---

## 📚 Key Resources Available

### Documentation (All Ready)

```
Extraction-01/00-analysis/
├── LETTA-ANALYSIS.md              - Letta architecture deep-dive
├── LETTA-INTEGRATION-PLAN.md      - Phase-by-phase implementation guide
├── LETTA-INTEGRATION-ROADMAP.md   - Visual timeline and milestones
└── letta-typescript-refactoring-strategy.md
```

### Letta Source Code (In libraries/)

```
libraries/letta/letta/
├── schemas/
│   ├── tool.py                    - Tool schema definitions ⭐ START HERE
│   ├── agent.py                   - Agent patterns (already ported)
│   └── memory.py                  - Memory blocks (already ported)
├── agent.py                       - Agent step loop (already ported)
└── functions/                     - Tool execution patterns
```

### Existing SBF Code (To Integrate With)

```
Extraction-01/02-refactored/sbf-core/src/
├── entity/
│   └── entity-file-manager.ts    - Entity CRUD operations ⭐ USE THIS
├── vault/
│   └── vault.ts                  - File operations
└── agent/
    └── sbf-agent.ts              - Agent (add tool execution here)
```

---

## 🔧 Phase 2 Implementation Plan

### Step 1: Analyze Letta's Tool System (30 min)

**Read:**
- `libraries/letta/letta/schemas/tool.py` - Tool schema
- `libraries/letta/letta/functions/` - Tool examples

**Extract:**
- Tool definition pattern
- Parameter schema pattern
- Registry pattern
- Execution pattern

### Step 2: Design Tool Schema (1 hour)

**Create:** `packages/core/src/agent/schemas/tool.ts`

```typescript
import { z } from 'zod';

export const ToolParameterSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean(),
  default: z.any().optional(),
});

export const ToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(ToolParameterSchema),
  handler: z.function(),
});

export type Tool = z.infer<typeof ToolSchema>;
export type ToolParameter = z.infer<typeof ToolParameterSchema>;
```

### Step 3: Implement Tool Registry (2 hours)

**Create:** `packages/core/src/agent/managers/tool-manager.ts`

```typescript
export class ToolManager {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    ToolSchema.parse(tool); // Validate
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    
    // Validate parameters
    // Execute handler
    // Return result
  }
}
```

### Step 4: Create Entity Tools (4-6 hours)

**Create:** `packages/core/src/agent/tools/entity-tools.ts`

**Implement 5 tools:**

1. **create_entity**
   ```typescript
   {
     name: 'create_entity',
     description: 'Create a new entity in the vault',
     parameters: [
       { name: 'type', type: 'string', required: true },
       { name: 'title', type: 'string', required: true },
       { name: 'content', type: 'string', required: false },
       { name: 'metadata', type: 'object', required: false }
     ],
     handler: async (params) => {
       const entityManager = new EntityFileManager(vaultPath);
       return await entityManager.createEntity(params);
     }
   }
   ```

2. **read_entity**
3. **update_entity**
4. **search_entities**
5. **create_relationship**

### Step 5: Integrate with Agent (2 hours)

**Update:** `packages/core/src/agent/sbf-agent.ts`

```typescript
class SBFAgent extends BaseAgent {
  private toolManager: ToolManager;

  async step(inputMessages: MessageCreate[]): Promise<AgentResponse> {
    // ... existing code ...
    
    // NEW: Tool execution
    if (response.tool_calls) {
      for (const toolCall of response.tool_calls) {
        const result = await this.toolManager.executeTool(
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );
        
        // Add tool result to conversation
        this.conversationManager.addMessage({
          role: 'tool',
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        });
      }
      
      // Continue conversation with tool results
      return this.step([]);
    }
    
    return response;
  }
}
```

### Step 6: Add Tool Validation (1 hour)

**Create:** `packages/core/src/agent/tools/tool-validator.ts`

```typescript
export class ToolValidator {
  static validateParameters(
    tool: Tool, 
    params: any
  ): { valid: boolean; errors?: string[] } {
    // Check required parameters
    // Validate types
    // Check constraints
    // Return validation result
  }
}
```

### Step 7: Testing (2-3 hours)

**Create:** `packages/core/src/agent/tools/__tests__/entity-tools.test.ts`

**Test:**
- Tool registration
- Parameter validation
- Entity creation
- Entity retrieval
- Search functionality
- Error handling

---

## 📝 Success Criteria for Phase 2

### Functional Requirements

- [ ] Tool schema defined with Zod validation
- [ ] Tool registry implemented
- [ ] All 5 entity tools working
- [ ] Tool execution integrated in agent step loop
- [ ] Parameters validated before execution
- [ ] Errors handled gracefully
- [ ] Results returned to LLM correctly

### Code Quality

- [ ] TypeScript with full typing
- [ ] Clean separation of concerns
- [ ] Well-documented code
- [ ] Error handling for all edge cases
- [ ] Consistent with Letta patterns

### Integration

- [ ] Works with existing EntityFileManager
- [ ] Respects vault security boundaries
- [ ] Saves tool calls in conversation history
- [ ] Updates memory after tool execution

---

## 🚨 Known Challenges & Solutions

### Challenge 1: Tool Call Parsing

**Problem:** OpenAI returns tool calls in specific JSON format  
**Solution:** Use OpenAI's tool calling API format, parse `tool_calls` array

### Challenge 2: Async Tool Execution

**Problem:** Some tools may take time (search, file I/O)  
**Solution:** All tool handlers are async, use `await` properly

### Challenge 3: Tool Hallucination

**Problem:** LLM may call tools with invalid parameters  
**Solution:** Validate all parameters with Zod before execution, return clear errors

### Challenge 4: State Consistency

**Problem:** Tools modify vault, need to update agent memory  
**Solution:** After tool execution, update memory blocks (current_focus, recent_entities)

### Challenge 5: Error Handling

**Problem:** Tools can fail (file not found, invalid UID, etc.)  
**Solution:** Try-catch all tool execution, return structured error messages to LLM

---

## 📦 Expected Deliverables

### New Files (8 files)

```
packages/core/src/agent/
├── schemas/
│   └── tool.ts                     (~100 LOC) - Tool schemas
├── managers/
│   └── tool-manager.ts             (~150 LOC) - Tool registry & execution
├── tools/
│   ├── entity-tools.ts             (~350 LOC) - 5 entity tools
│   ├── tool-validator.ts           (~80 LOC) - Parameter validation
│   └── __tests__/
│       └── entity-tools.test.ts    (~200 LOC) - Tests
└── utils/
    └── tool-utils.ts               (~50 LOC) - Helper functions
```

**Total New Code:** ~930 lines

### Updated Files (2 files)

```
packages/core/src/agent/
├── sbf-agent.ts                    (+50 LOC) - Tool execution integration
└── index.ts                        (+10 LOC) - Export tool manager
```

---

## 🎯 Phase 2 Timeline

### Day 1 (4-6 hours)
- ✅ Analyze Letta tool system (30 min)
- ✅ Design tool schema (1 hour)
- ✅ Implement tool registry (2 hours)
- ✅ Start entity tools (1-2 hours)

### Day 2 (4-6 hours)
- ✅ Complete entity tools (3-4 hours)
- ✅ Integrate with agent (2 hours)

### Day 3 (2-4 hours)
- ✅ Add validation (1 hour)
- ✅ Write tests (2-3 hours)
- ✅ Documentation (1 hour)

**Total:** 2-3 days (10-16 hours)

---

## 🔗 Dependencies Ready

### From Phase 1 (All Available)

- ✅ `BaseAgent` - Tool execution will extend this
- ✅ `SBFAgent` - Will add tool execution logic
- ✅ `LLMClient` - Already supports tool calling
- ✅ `OpenAIClient` - Returns tool_calls in responses
- ✅ `StateManager` - Will save tool call history

### From Existing Code (All Available)

- ✅ `EntityFileManager` - CRUD operations for entities
- ✅ `VaultFiles` - File operations with security
- ✅ `UID` - Entity UID generation
- ✅ `FrontmatterManager` - Metadata handling

---

## 💡 Quick Start Commands

When you're ready to begin Phase 2:

### 1. Start Analysis

```bash
# Read Letta's tool system
view libraries/letta/letta/schemas/tool.py

# Read existing entity manager
view Extraction-01/02-refactored/sbf-core/src/entity/entity-file-manager.ts

# Review integration plan
view Extraction-01/00-analysis/LETTA-INTEGRATION-PLAN.md
```

### 2. Create Files

```bash
# Tool schema
create packages/core/src/agent/schemas/tool.ts

# Tool manager
create packages/core/src/agent/managers/tool-manager.ts

# Entity tools
create packages/core/src/agent/tools/entity-tools.ts
```

### 3. Run Tests

```bash
# After implementation
npm test agent/tools
```

---

## 🎓 Key Patterns to Follow

### 1. Tool Definition Pattern (from Letta)

```typescript
const tool: Tool = {
  name: 'function_name',
  description: 'Clear description for LLM',
  parameters: [
    {
      name: 'param1',
      type: 'string',
      description: 'What this parameter does',
      required: true,
    }
  ],
  handler: async (params) => {
    // Implementation
    return result;
  }
};
```

### 2. Tool Execution Pattern

```typescript
// 1. Parse tool call from LLM
const toolCall = response.tool_calls[0];

// 2. Validate parameters
const validation = ToolValidator.validateParameters(tool, params);
if (!validation.valid) throw new Error('Invalid parameters');

// 3. Execute
const result = await tool.handler(params);

// 4. Return to LLM
conversationManager.addMessage({
  role: 'tool',
  content: JSON.stringify(result),
  tool_call_id: toolCall.id,
});
```

### 3. Error Handling Pattern

```typescript
try {
  const result = await toolManager.executeTool(name, params);
  return { success: true, result };
} catch (error) {
  return { 
    success: false, 
    error: error.message,
    code: 'TOOL_EXECUTION_ERROR'
  };
}
```

---

## 📊 Progress Tracking

When Phase 2 is complete, we'll have:

### Agent Capabilities

```
Before Phase 2:
- ✅ Conversations with memory
- ✅ State persistence
- ❌ Cannot interact with vault

After Phase 2:
- ✅ Conversations with memory
- ✅ State persistence
- ✅ Create entities via natural language
- ✅ Search entities
- ✅ Link entities together
- ✅ Update entities
```

### MVP Progress

```
Before Phase 2: 60% complete
After Phase 2:  80% complete ⭐

Remaining:
- Phase 3: Additional LLM providers (optional)
- Phase 4: UI integration
- Phase 5: Testing & polish
```

---

## ✅ Pre-Flight Checklist

Before starting Phase 2, verify:

- [x] Phase 1 code is working
- [x] Dependencies installed (`openai`, `zod`, etc.)
- [x] Letta source code available in `libraries/letta/`
- [x] Documentation reviewed
- [x] Integration plan understood
- [x] EntityFileManager code reviewed
- [x] Time allocated (2-3 days)

**Status:** 🟢 **ALL CHECKS PASSED - READY TO START**

---

## 🚀 When You Say "Proceed to Phase 2"

I will immediately:

1. **Read** `libraries/letta/letta/schemas/tool.py` (Letta's tool schema)
2. **Create** `packages/core/src/agent/schemas/tool.ts` (Tool schema)
3. **Create** `packages/core/src/agent/managers/tool-manager.ts` (Registry)
4. **Create** `packages/core/src/agent/tools/entity-tools.ts` (CRUD tools)
5. **Update** `packages/core/src/agent/sbf-agent.ts` (Tool execution)
6. **Test** all components
7. **Report** completion with summary

**No further questions needed - the plan is complete and ready to execute.**

---

## 📚 Additional Resources

### Documentation to Keep Open

1. **LETTA-INTEGRATION-PLAN.md** - Phase 2 details
2. **LETTA-ANALYSIS.md** - Letta architecture reference
3. **architecture-v2-enhanced.md** - SBF architecture
4. **entity-file-manager.ts** - Existing entity operations

### Letta Files to Reference

1. **schemas/tool.py** - Tool definition pattern
2. **functions/** - Tool implementation examples
3. **agent.py** - Tool execution in step loop

### SBF Files to Integrate

1. **entity-file-manager.ts** - Entity CRUD
2. **vault.ts** - File operations
3. **frontmatter-manager.ts** - Metadata handling

---

## 🎉 Summary

**Phase 1 Status:** ✅ **COMPLETE**  
**Phase 2 Status:** 🟡 **READY TO START**  
**Preparation Level:** 🟢 **100% PREPARED**  

**When you return, simply say:**

> **"proceed to phase 2"**

And we'll immediately begin implementing the tool system. No further planning needed - everything is ready.

---

**Prepared by:** AI Assistant (Claude)  
**Date:** 2025-11-14  
**Next Action:** Awaiting your "proceed to phase 2" command  
**Status:** 🟢 **STANDING BY - READY FOR PHASE 2**  

---

**Sleep well! The agent foundation is solid, and Phase 2 is fully planned and ready to execute. 🚀🧠✨**
