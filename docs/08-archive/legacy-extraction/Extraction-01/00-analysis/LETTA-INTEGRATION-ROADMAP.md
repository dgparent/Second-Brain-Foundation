# Letta → SBF Integration Roadmap (Visual)

**Date:** 2025-11-14  
**Status:** 🟢 Ready to Begin Phase 1  

---

## 📍 Where We Are Now

```
┌─────────────────────────────────────────────────────┐
│         Second Brain Foundation (SBF)                │
│                                                       │
│  ✅ Vault (filesystem operations)                    │
│  ✅ EntityFileManager (CRUD)                         │
│  ✅ Desktop Shell (Electron + React)                 │
│  ⏳ Agent (PLANNED - from Letta)                     │
│  ⏳ Graph (Phase 1.5)                                │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Integration Goal

```
┌───────────────────┐         ┌───────────────────┐
│      Letta        │         │       SBF         │
│   (Python)        │  ────>  │   (TypeScript)    │
│                   │         │                   │
│ • Agent System    │         │ • Agent Module    │
│ • Memory Blocks   │         │ • Memory System   │
│ • Tool Calling    │         │ • SBF Tools       │
│ • LLM Clients     │         │ • LLM Clients     │
└───────────────────┘         └───────────────────┘
```

---

## 🗺️ 6-Phase Implementation Plan

### Phase 0: Preparation ✅ COMPLETE
```
📋 Analysis
├── ✅ Analyze Letta codebase
├── ✅ Document patterns (LETTA-ANALYSIS.md)
└── ✅ Create integration plan (LETTA-INTEGRATION-PLAN.md)

⏱️ Time: 4-6 hours
📊 Progress: 100%
```

### Phase 1: Core Agent Foundation 🔥 NEXT (2-3 days)
```
🏗️ Core Classes
├── 🔲 BaseAgent (abstract class)
├── 🔲 Memory & Blocks
├── 🔲 AgentState schema
└── 🔲 Service managers
    ├── ConversationManager
    └── ToolManager

⏱️ Time: 2-3 days
📊 Progress: 0%
🎯 Deliverable: Working agent foundation
```

### Phase 2: Tool System (2-3 days)
```
🔧 SBF Tools
├── 🔲 Entity Tools
│   ├── create_entity()
│   ├── update_entity()
│   ├── get_entity()
│   └── search_entities()
├── 🔲 Graph Tools
│   ├── link_entities()
│   └── search_relationships()
└── 🔲 Tool execution sandbox

⏱️ Time: 2-3 days
📊 Progress: 0%
🎯 Deliverable: Agent can manipulate entities
```

### Phase 3: LLM Integration (1-2 days)
```
🤖 LLM Clients
├── 🔲 LLMClient (base)
├── 🔲 OpenAIClient
├── 🔲 AnthropicClient (optional)
└── 🔲 Tool calling support

⏱️ Time: 1-2 days
📊 Progress: 0%
🎯 Deliverable: Agent can call LLMs with tools
```

### Phase 4: Main Agent Implementation (1-2 days)
```
🧠 SBFAgent
├── 🔲 SBFAgent class
├── 🔲 Agent factory
├── 🔲 State persistence
└── 🔲 Memory management

⏱️ Time: 1-2 days
📊 Progress: 0%
🎯 Deliverable: Fully functional agent
```

### Phase 5: Testing & Integration (2-3 days)
```
🧪 Testing
├── 🔲 Unit tests
├── 🔲 Integration tests
├── 🔲 E2E tests
└── 🔲 UI integration

⏱️ Time: 2-3 days
📊 Progress: 0%
🎯 Deliverable: Production-ready agent
```

---

## 📦 What Gets Extracted from Letta

### ✅ Extract & Adapt
```
Letta Component         →  SBF Equivalent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BaseAgent (abstract)    →  BaseAgent.ts
Memory + Blocks         →  memory.ts
MessageManager          →  ConversationManager.ts
ToolManager             →  ToolManager.ts
LLMClient               →  llm/client.ts
OpenAI integration      →  llm/openai-client.ts
Tool schemas            →  schemas/tool.ts
AgentState              →  schemas/agent-state.ts
```

### ❌ Skip (Not Needed)
```
✗ server/ (FastAPI)      - Building our own
✗ client/ (SDK)          - Agents run in-process
✗ database_utils.py      - Using filesystem
✗ orm/                   - Not using SQL
```

---

## 🔄 Data Flow (How It Works)

### User Interaction Flow
```
┌─────────┐
│  User   │ "Create a project called 'AI Research'"
└────┬────┘
     │
     v
┌─────────────────────┐
│  Chat UI (React)    │
└──────────┬──────────┘
           │ IPC
           v
┌─────────────────────┐
│   SBFAgent.chat()   │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│   LLMClient         │ OpenAI/Anthropic
│   "What should      │
│    I do?"           │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  LLM Response       │
│  Tool: create_entity│
│  {                  │
│    type: "project", │
│    title: "AI..."   │
│  }                  │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  ToolManager        │
│  .executeTool()     │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│ EntityFileManager   │
│ .createEntity()     │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Filesystem         │
│  Projects/          │
│  AI-Research.md     │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Response to User   │
│  "✅ Created        │
│   project-ai-       │
│   research-001"     │
└─────────────────────┘
```

---

## 🏗️ New Code Structure

```
sbf-app/packages/core/src/
├── vault/                    # ✅ Existing
├── entity-file-manager/      # ✅ Existing
├── ipc-handlers/             # ✅ Existing
│
└── agent/                    # 🆕 NEW (from Letta)
    ├── index.ts
    ├── base-agent.ts         # Abstract base class
    ├── sbf-agent.ts          # Main agent implementation
    ├── memory.ts             # Memory + Blocks
    ├── factory.ts            # Agent factory
    │
    ├── schemas/
    │   ├── agent-state.ts    # AgentState, LLMConfig
    │   └── tool.ts           # Tool definitions
    │
    ├── managers/
    │   ├── conversation-manager.ts
    │   ├── tool-manager.ts
    │   └── state-manager.ts  # Persist agent state
    │
    ├── tools/
    │   ├── entity/
    │   │   └── entity-tools.ts
    │   └── graph/
    │       └── graph-tools.ts
    │
    └── llm/
        ├── client.ts         # Abstract LLM client
        ├── openai-client.ts
        └── anthropic-client.ts
```

---

## 💡 Key Concepts

### Memory Blocks
```typescript
interface Block {
  id: string;
  label: string;    // "persona", "human", "current_focus"
  value: string;    // Actual memory content
  limit: number;    // Character limit
}

// Example:
{
  label: "persona",
  value: "I am your Second Brain assistant. I help organize knowledge.",
  limit: 2000
}
```

### Tools
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: {...};
  handler: async (params) => {...}
}

// Example:
{
  name: "create_entity",
  description: "Create a new entity",
  handler: async (params) => {
    return await entityManager.createEntity(params);
  }
}
```

### Agent Step Loop
```
1. User sends message
2. Agent adds to conversation history
3. Agent builds prompt (system + memory + messages)
4. Agent sends to LLM with available tools
5. LLM responds with tool calls
6. Agent executes tools
7. Agent adds results to conversation
8. Agent sends response to user
```

---

## 📊 Timeline Summary

```
┌──────────────┬──────────────┬──────────────┐
│   Phase      │   Duration   │   Status     │
├──────────────┼──────────────┼──────────────┤
│ Phase 0      │   4-6 hrs    │   ✅ DONE    │
│ Phase 1      │   2-3 days   │   🔥 NEXT    │
│ Phase 2      │   2-3 days   │   ⏳ QUEUE   │
│ Phase 3      │   1-2 days   │   ⏳ QUEUE   │
│ Phase 4      │   1-2 days   │   ⏳ QUEUE   │
│ Phase 5      │   2-3 days   │   ⏳ QUEUE   │
├──────────────┼──────────────┼──────────────┤
│ TOTAL        │  8-13 days   │   15% done   │
└──────────────┴──────────────┴──────────────┘
```

---

## ✅ Success Criteria

### Phase 1 Done When:
- [ ] BaseAgent class exists
- [ ] Memory system works
- [ ] Managers implemented
- [ ] Tests pass

### Phase 2 Done When:
- [ ] Tools registered
- [ ] create_entity works
- [ ] search_entities works
- [ ] Tools execute safely

### Phase 3 Done When:
- [ ] OpenAI client works
- [ ] Agent can call tools via LLM
- [ ] Responses are coherent

### Phase 4 Done When:
- [ ] SBFAgent fully functional
- [ ] State persists across sessions
- [ ] Agent factory works

### Phase 5 Done When:
- [ ] Tests pass (>80% coverage)
- [ ] UI can chat with agent
- [ ] Agent creates entities from chat
- [ ] Documentation updated

---

## 🚀 Next Action

**START HERE:**

1. Read `00-analysis/LETTA-INTEGRATION-SUMMARY.md` (5 min)
2. Review `00-analysis/LETTA-INTEGRATION-PLAN.md` Phase 1 (15 min)
3. Begin Phase 1.1: Port BaseAgent class (2-4 hours)

**Command:**
```bash
cd Extraction-01/03-integration/sbf-app/packages/core
mkdir -p src/agent/{managers,tools,llm,schemas}
touch src/agent/base-agent.ts
```

---

**Ready to Build the Future of Knowledge Management! 🧠✨**
