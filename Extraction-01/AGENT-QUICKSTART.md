# Phase 1 - Agent Foundation Quick Start

This guide shows you how to use the newly implemented Letta-inspired agent foundation.

## Prerequisites

```bash
cd Extraction-01/03-integration/sbf-app/packages/core
npm install
```

## Environment Setup

Create a `.env` file:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Basic Usage

### 1. Create an Agent

```typescript
import { SBFAgent } from '@sbf/core';

const agent = await SBFAgent.create({
  userId: 'user-001',
  vaultPath: '/path/to/vault',
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cheaper
  temperature: 0.7,
});
```

### 2. Have a Conversation

```typescript
const response = await agent.step([{
  role: 'user',
  content: 'Hello! Help me organize my notes.'
}]);

console.log(response.messages[0].content);
console.log('Tokens used:', response.usage.total_tokens);
```

### 3. Manage Memory

```typescript
// Update persona (agent's personality)
agent.updateMemory('persona', 
  'I am an expert in knowledge management and help users organize information.'
);

// Update user context
agent.updateMemory('human',
  'User: John Doe\nRole: Researcher\nInterests: AI, PKM'
);

// Set current focus
agent.setCurrentFocus('topic-ml-042', 'Machine Learning Research');

// Track recently accessed entities
agent.addRecentEntity('resource-paper-123');
agent.addRecentEntity('person-john-smith-456');
```

### 4. Save and Restore

```typescript
// Save state
await agent.save();
// State saved to .sbf/agents/{agentId}.json

// Later, restore from saved state
const restoredAgent = await SBFAgent.create({
  userId: 'user-001',
  vaultPath: '/path/to/vault',
  openaiApiKey: process.env.OPENAI_API_KEY,
  existingAgentId: 'agent-user-001-1234567890',
});

// Memory is fully restored!
```

## Running the Example

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key-here

# Run the example (once TypeScript is compiled)
node dist/agent/example.js
```

## What Works in Phase 1

✅ **Stateful Conversations**
- Agent remembers context across turns
- Conversation history managed automatically

✅ **Persistent Memory**
- Block-based memory system (5 blocks)
- Persona, user, focus, recent entities, active projects
- Serializes to/from JSON

✅ **State Persistence**
- Saves to `.sbf/agents/{agentId}.json`
- Atomic writes (safe)
- Full state restoration

✅ **LLM Integration**
- OpenAI GPT-4 and GPT-3.5
- Usage tracking
- Error handling

⏳ **Tool Calling (Framework Ready)**
- Infrastructure in place
- Tool execution to be implemented in Phase 2

## Memory Blocks Explained

The agent has 5 memory blocks:

1. **persona** - Agent's personality and role
2. **human** - User context and preferences
3. **current_focus** - Currently focused entity
4. **recent_entities** - Recently accessed entities (last 10)
5. **active_projects** - Active project UIDs

These blocks are included in every LLM call as context.

## Next Steps

**Phase 2** will add:
- Tool definitions (create_entity, read_entity, etc.)
- Tool execution
- Integration with EntityFileManager
- Parameter validation

See `PHASE-1-COMPLETE.md` for full technical details.

## Troubleshooting

**"OpenAI API key not provided"**
- Set `OPENAI_API_KEY` environment variable
- Or pass `openaiApiKey` in config

**"Agent {id} not found"**
- Agent state file doesn't exist
- Check `.sbf/agents/` directory

**Type errors**
- Run `npm install` to ensure all dependencies installed
- Check TypeScript version is 5.3+

## Architecture

```
SBFAgent (main class)
├── BaseAgent (abstract interface)
├── SBFMemory (5 blocks)
├── StateManager (file persistence)
├── ConversationManager (message history)
└── OpenAIClient (LLM integration)
```

## API Reference

See the source files for full API documentation:
- `base-agent.ts` - Abstract agent interface
- `memory.ts` - Memory system
- `sbf-agent.ts` - Main agent implementation
- `schemas/agent-state.ts` - State schemas
