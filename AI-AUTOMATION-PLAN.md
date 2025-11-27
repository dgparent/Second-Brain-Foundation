# AI & Automation Module Implementation Plan

## 1. Objective
Transition the Second Brain Foundation (2BF) automation stack from n8n to a robust, TypeScript-first architecture using **LangGraph.js** (Agents), **Trigger.dev** (Background Jobs), and **Activepieces** (User Automations).

## 2. Architecture Overview

### 2.1 Core Components
*   **Agent Runtime (AEI)**: `packages/@sbf/aei`
    *   Powered by **LangGraph.js**.
    *   Handles complex, stateful agent workflows (e.g., Vault Search, Planning).
*   **Internal Automation**: `packages/@sbf/jobs` (New Package)
    *   Powered by **Trigger.dev**.
    *   Handles long-running tasks, ingestion, and scheduled syncs.
*   **User Automation**: `packages/sbf-automation/pieces`
    *   Powered by **Activepieces**.
    *   Custom pieces for 2BF integration.
*   **Core Interfaces**: `packages/@sbf/core`
    *   `ai/provider.ts`: Abstraction for LLM providers.
    *   `vector/store.ts`: Abstraction for Vector DBs.

## 3. Implementation Steps

### Phase 1: Cleanup & Configuration (Immediate)
1.  **Remove n8n Configuration**:
    *   Remove n8n fields from `ConfigManager.ts` and `GodModeSettings.tsx`.
    *   Deprecate `packages/sbf-automation/nodes-sbf`.
2.  **Update Configuration**:
    *   Add `triggerDev` config (API Key, Project ID).
    *   Add `activePieces` config (API URL, API Key).
    *   Add `llm` config (Provider, API Key - already partially exists, refine for generic provider).
    *   Add `vector` config (already exists, ensure alignment with `vector/store.ts`).

### Phase 2: Core Abstractions
1.  **Define Interfaces in `@sbf/core`**:
    *   Create `src/ai/provider.ts`.
    *   Create `src/vector/store.ts`.
2.  **Implement Adapters**:
    *   Implement OpenAI/Ollama adapters for `LlmProvider`.
    *   Implement Supabase/pgvector adapter for `VectorStore`.

### Phase 3: Agent Runtime (LangGraph.js)
1.  **Setup `@sbf/aei`**:
    *   Install `@langchain/langgraph`, `@langchain/core`.
    *   Create `src/graph/vaultAgent.ts` (Basic RAG agent).
    *   Integrate with `ConfigManager` to load LLM/Vector settings.

### Phase 4: Internal Jobs (Trigger.dev)
1.  **Create `@sbf/jobs` Package**:
    *   Initialize a new package for Trigger.dev jobs.
    *   Install `@trigger.dev/sdk`.
    *   Create `src/jobs/ingest.ts` (Document ingestion job).

### Phase 5: User Automations (Activepieces)
1.  **Refine `@sbf/automation`**:
    *   Focus on `pieces/sbf`.
    *   Ensure the custom piece exposes necessary triggers (e.g., `note_created`) and actions (e.g., `create_task`).

## 4. Execution Plan (Current Session)
1.  **Update Config**: Modify `ConfigManager` and `GodModeSettings` to reflect the new stack.
2.  **Scaffold Core**: Create the `ai` and `vector` interfaces in `@sbf/core`.
3.  **Install Dependencies**: Add LangGraph to `@sbf/aei`.
