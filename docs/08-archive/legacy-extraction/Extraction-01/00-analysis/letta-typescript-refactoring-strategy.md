# Letta to TypeScript Refactoring Strategy

**Date:** 2025-11-14  
**Decision:** Partial Integration (Option B)  
**Goal:** Build TypeScript agentic AI framework inspired by Letta's architecture  
**Timeline:** +1 week (6-8 weeks total)

---

## Executive Summary

Extract Letta's **agentic auto-learning AI framework** patterns and refactor to TypeScript for SBF's single-language backend.

**Not Extracting:**
- ❌ Python runtime code
- ❌ Python dependencies
- ❌ Letta as service/library

**Extracting:**
- ✅ Agent architecture patterns
- ✅ Memory model design
- ✅ Auto-learning mechanisms
- ✅ UI components (React - direct reuse)
- ✅ API design patterns
- ✅ Agent state management

---

## What Makes Letta Pivotal for SBF

### Agentic Auto-Learning Framework

Letta provides a **framework** for AI agents that:

1. **Learn from User Interactions**
   - Remember past organization decisions
   - Adapt filing suggestions based on approvals/rejections
   - Build user preference models over time

2. **Maintain Stateful Context**
   - Core memory: User identity, preferences, organizational style
   - Archival memory: Long-term knowledge (SBF vault entities)
   - Recall memory: Recent conversations and decisions

3. **Execute Tools/Functions**
   - Call functions to organize notes
   - Extract entities from markdown
   - Suggest relationships based on content

4. **Self-Improve**
   - Confidence scoring improves with feedback
   - Filing patterns learned from user corrections
   - Relationship detection gets smarter over time

---

## Letta Architecture to Extract

### 1. Agent Core (Python → TypeScript)

**Letta's Agent Structure:**
```python
# letta/agent/agent.py
class Agent:
    def __init__(self, memory, functions, llm_config):
        self.core_memory = memory.core
        self.archival_memory = memory.archival
        self.recall_memory = memory.recall
        self.functions = functions
        
    def step(self, user_message):
        # Agent reasoning loop
        context = self.build_context()
        response = self.llm.generate(context, user_message)
        actions = self.parse_actions(response)
        return self.execute_actions(actions)
```

**Refactor to TypeScript:**
```typescript
// sbf-core/src/agent/agent.ts
export class SBFAgent {
  private coreMemory: CoreMemory;
  private archivalMemory: ArchivalMemory; // SBF vault
  private recallMemory: RecallMemory;     // Recent conversations
  private tools: AgentTools;
  
  constructor(config: AgentConfig) {
    this.coreMemory = new CoreMemory(config.userProfile);
    this.archivalMemory = new ArchivalMemory(config.vaultPath);
    this.recallMemory = new RecallMemory();
    this.tools = new AgentTools(config.tools);
  }
  
  async step(userMessage: string): Promise<AgentResponse> {
    const context = await this.buildContext();
    const response = await this.llm.generate(context, userMessage);
    const actions = this.parseActions(response);
    return await this.executeActions(actions);
  }
}
```

---

### 2. Memory Systems (Python → TypeScript)

**Letta's Memory Model:**
```python
# letta/memory/memory.py
class Memory:
    core_memory: CoreMemory      # Small, always loaded
    archival_memory: ArchivalMemory  # Large, retrieved as needed
    recall_memory: RecallMemory    # Conversation history
```

**Refactor to TypeScript:**
```typescript
// sbf-core/src/agent/memory/

// core-memory.ts - User preferences, organization style
export class CoreMemory {
  private persona: string;        // User identity
  private preferences: UserPrefs; // Organization preferences
  
  async update(field: string, value: string): Promise<void> {
    // Update core memory (always in context)
  }
}

// archival-memory.ts - SBF vault (entities, notes)
export class ArchivalMemory {
  private vaultPath: string;
  private index: FuseIndex;      // Search index
  
  async search(query: string): Promise<Entity[]> {
    // Search vault for relevant entities
  }
  
  async insert(entity: Entity): Promise<void> {
    // Add entity to archival memory
  }
}

// recall-memory.ts - Recent conversations
export class RecallMemory {
  private messages: ConversationMessage[];
  
  async add(message: ConversationMessage): Promise<void> {
    // Add to conversation history
  }
  
  async getRecent(count: number): Promise<ConversationMessage[]> {
    // Get recent messages for context
  }
}
```

**SBF Mapping:**
```yaml
Letta Memory → SBF Architecture:
  
  core_memory:
    persona: "User's identity and role"
    preferences:
      - organization_style: "how user likes to file notes"
      - sensitivity_defaults: "default privacy levels"
      - entity_preferences: "preferred entity types"
  
  archival_memory:
    vault_entities:
      - People/       # All person entities
      - Topics/       # All topic entities
      - Projects/     # All project entities
      - Places/       # All place entities
    search_index:     # fuse.js index for retrieval
  
  recall_memory:
    conversations:    # Recent AEI chat history
    decisions:        # Recent organization approvals/rejections
    daily_notes:      # Recent Daily/ entries
```

---

### 3. Agent Functions/Tools (Python → TypeScript)

**Letta's Function System:**
```python
# letta/functions/functions.py
def core_memory_append(agent, field, content):
    """Add information to core memory"""
    agent.core_memory[field] += content

def archival_memory_search(agent, query):
    """Search archival memory"""
    return agent.archival_memory.search(query)

def send_message(agent, message):
    """Send message to user"""
    return {"role": "assistant", "content": message}
```

**Refactor to TypeScript:**
```typescript
// sbf-core/src/agent/tools/

export interface AgentTool {
  name: string;
  description: string;
  schema: z.ZodSchema;
  execute: (params: any) => Promise<any>;
}

// entity-extraction-tool.ts
export const extractEntitiesFromNote: AgentTool = {
  name: "extract_entities",
  description: "Extract entities (people, topics, projects) from markdown note",
  schema: z.object({
    notePath: z.string(),
    entityTypes: z.array(z.string())
  }),
  execute: async ({ notePath, entityTypes }) => {
    // Extract entities using NLP/LLM
    const note = await readMarkdown(notePath);
    const entities = await extractEntities(note, entityTypes);
    return entities;
  }
};

// file-organization-tool.ts
export const suggestFiling: AgentTool = {
  name: "suggest_filing",
  description: "Suggest where to file a transitional note",
  schema: z.object({
    notePath: z.string()
  }),
  execute: async ({ notePath }) => {
    // Use memory to suggest filing based on content & history
    const note = await readMarkdown(notePath);
    const similar = await archivalMemory.search(note.content);
    const suggestion = await generateFilingSuggestion(note, similar);
    return suggestion;
  }
};

// relationship-detection-tool.ts
export const detectRelationships: AgentTool = {
  name: "detect_relationships",
  description: "Detect relationships between entities",
  schema: z.object({
    entityUid: z.string()
  }),
  execute: async ({ entityUid }) => {
    // Find related entities using embeddings/content similarity
    const entity = await getEntity(entityUid);
    const related = await findRelatedEntities(entity);
    return related.map(r => ({ type: r.relationType, target: r.uid }));
  }
};
```

---

### 4. Auto-Learning Mechanism (Python → TypeScript)

**Letta's Learning Pattern:**
```python
# Agent learns from user feedback
class Agent:
    def learn_from_feedback(self, action, feedback):
        if feedback == "approved":
            self.increase_confidence(action)
        else:
            self.decrease_confidence(action)
            self.update_strategy(action, feedback)
```

**Refactor to TypeScript:**
```typescript
// sbf-core/src/agent/learning/

export class AgentLearning {
  private confidenceScores: Map<string, number>;
  private userPreferences: UserPreferenceModel;
  
  async learnFromApproval(suggestion: EntitySuggestion): Promise<void> {
    // Increase confidence in this pattern
    const pattern = this.extractPattern(suggestion);
    this.confidenceScores.set(pattern, 
      Math.min(1.0, this.getConfidence(pattern) + 0.05)
    );
    
    // Update user preference model
    await this.userPreferences.reinforce(pattern);
  }
  
  async learnFromRejection(
    suggestion: EntitySuggestion, 
    correction: EntityCorrection
  ): Promise<void> {
    // Decrease confidence in rejected pattern
    const rejectedPattern = this.extractPattern(suggestion);
    this.confidenceScores.set(rejectedPattern, 
      Math.max(0.0, this.getConfidence(rejectedPattern) - 0.1)
    );
    
    // Learn from correction
    const correctPattern = this.extractPattern(correction);
    await this.userPreferences.learn(correctPattern);
  }
  
  private extractPattern(suggestion: EntitySuggestion): string {
    // Extract pattern from suggestion for learning
    return `${suggestion.entityType}:${suggestion.context}`;
  }
}

// User preference model (simple ML)
export class UserPreferenceModel {
  private patterns: Map<string, number>; // Pattern → frequency
  
  async reinforce(pattern: string): Promise<void> {
    // Increase weight for this pattern
    const current = this.patterns.get(pattern) || 0;
    this.patterns.set(pattern, current + 1);
  }
  
  async learn(pattern: string): Promise<void> {
    // Learn new pattern from correction
    this.patterns.set(pattern, 1);
  }
  
  async predict(context: string): Promise<string> {
    // Predict best action based on learned patterns
    // Use simple frequency-based or cosine similarity
    return this.findBestMatch(context);
  }
}
```

---

### 5. UI Components (React - Direct Extraction)

**Letta has React web UI** - we can extract directly!

**Extract from:**
```
letta-app/src/
├── components/
│   ├── ChatInterface/       → sbf-ui/src/components/chat/
│   ├── MemoryViewer/        → sbf-ui/src/components/agent/
│   ├── AgentConfig/         → sbf-ui/src/components/settings/
│   └── FunctionCalls/       → sbf-ui/src/components/queue/
```

**Adaptation:**
```typescript
// letta-app ChatInterface → sbf-ui ChatContainer
// Key features to extract:
// - Stateful conversation display
// - Function call visualization
// - Memory state indicators
// - Agent "thinking" display
```

---

## TypeScript Agent Architecture for SBF

### Core Architecture

```
sbf-core/src/agent/
├── agent.ts                  # Main SBFAgent class
├── memory/
│   ├── core-memory.ts        # User preferences
│   ├── archival-memory.ts    # Vault entities
│   └── recall-memory.ts      # Conversations
├── tools/
│   ├── entity-extraction.ts  # Extract entities
│   ├── relationship-detection.ts
│   ├── filing-suggestion.ts
│   └── entity-creation.ts
├── learning/
│   ├── agent-learning.ts     # Learning from feedback
│   └── preference-model.ts   # User preference ML
├── llm/
│   ├── llm-client.ts         # LLM integration
│   ├── local-llm.ts          # Ollama/LMStudio
│   └── cloud-llm.ts          # OpenAI/Anthropic (privacy-aware)
└── types/
    ├── agent.types.ts
    ├── memory.types.ts
    └── tool.types.ts
```

---

## Extraction Plan for Letta

### Week 1: Letta Analysis & Pattern Extraction

**Day 1-2: Clone & Architecture Analysis**
- ✅ Clone Letta repository (in progress)
- [ ] Analyze `letta/agent/` architecture
- [ ] Study memory systems (`letta/memory/`)
- [ ] Document function/tool patterns
- [ ] Review learning mechanisms

**Day 3-4: UI Component Extraction**
- [ ] Extract React components from `letta-app/`
- [ ] Identify reusable chat interface patterns
- [ ] Document memory visualization components
- [ ] Copy to `01-extracted-raw/letta/`

**Day 5: TypeScript Architecture Design**
- [ ] Design TypeScript agent architecture
- [ ] Create interface definitions
- [ ] Plan memory system implementation
- [ ] Document learning algorithm

### Week 2-3: Implement TypeScript Agent Core

**Parallel with UI Extraction:**
- Implement `SBFAgent` class
- Build memory systems (core, archival, recall)
- Create agent tools (entity extraction, filing, relationships)
- Implement learning mechanism

### Week 4-5: Integration with SBF

**During P0+P1 Component Extraction:**
- Connect agent to chat interface
- Integrate with organization queue
- Link archival memory to vault
- Test auto-learning with mock data

---

## Key Letta Patterns to Extract

### 1. Agent Reasoning Loop
```
User Input → Build Context (memories + tools) → LLM Generation → 
Parse Actions → Execute Tools → Update Memory → Response
```

### 2. Memory Context Building
```
Core Memory (always included) +
Archival Search Results (relevant entities) +
Recall Memory (recent conversation) =
LLM Context Window
```

### 3. Tool Execution Pattern
```
LLM returns: "I should use extract_entities tool with params..."
→ Parse tool call
→ Validate params
→ Execute tool
→ Return result to LLM
→ LLM integrates result into response
```

### 4. Learning Pattern
```
Agent makes suggestion →
User approves/rejects →
Update confidence scores →
Adjust preference model →
Future suggestions improve
```

---

## Success Criteria

**TypeScript Agent Complete When:**
- [ ] Agent can maintain stateful conversations
- [ ] Core memory stores user preferences
- [ ] Archival memory searches SBF vault
- [ ] Recall memory tracks conversation history
- [ ] Tools can extract entities from notes
- [ ] Agent suggests filing based on learned patterns
- [ ] Confidence scores improve with feedback
- [ ] Privacy controls route to local vs cloud LLM

---

## Integration with Existing Plan

### Updated Timeline (6-8 weeks)

| Week | Activity | Letta Integration |
|------|----------|-------------------|
| **1** | Letta analysis + Desktop Shell | Extract Letta architecture |
| **2** | Chat Interface + Editor | Extract Letta UI components |
| **3** | Queue + Entity Management | Implement TypeScript agent |
| **4** | P1 Components | Integrate agent with UI |
| **5** | File Browser + Settings | Connect agent to vault |
| **6** | Search + Command | Implement learning |
| **7-8** | Integration + Testing | Full agent testing |

---

## Benefits of Partial Integration

**Advantages:**
- ✅ Single-language backend (TypeScript)
- ✅ Full control over agent behavior
- ✅ No Python runtime dependency
- ✅ Easier Electron integration
- ✅ Learn from Letta's proven patterns
- ✅ Extract React UI components directly

**Trade-offs:**
- ⚠️ Need to reimplement agent logic (not copy)
- ⚠️ Learning curve for agent architecture
- ⚠️ +1 week timeline

**Overall:** Worth the extra week for unified stack + full control

---

**Prepared By:** Winston (Architect)  
**Decision:** Partial Integration (Option B) ✅  
**Status:** Ready to Proceed with Updated Plan  
**Timeline Impact:** +1 week (6-8 weeks total)  
**Next:** Update main extraction plan with Letta integration
