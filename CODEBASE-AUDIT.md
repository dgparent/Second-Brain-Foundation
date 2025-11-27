# Codebase Audit & Opportunity Report
**Date:** November 27, 2025
**Focus:** Automation Stack Migration & General Architecture

## 1. Critical Issues (Immediate Action Required)

### A. Incomplete Integration of Automation Stack
*   **Issue**: The newly created `@sbf/jobs` package (Trigger.dev integration) is **not installed** in `apps/api` or `@sbf/desktop`.
*   **Impact**: The main application cannot trigger background jobs. The automation system is currently isolated.
*   **Fix**: Add `@sbf/jobs` as a dependency to `apps/api/package.json` and `@sbf/desktop/package.json`.

### B. Unimplemented Core Logic
*   **Issue**: `packages/@sbf/aei/src/graph/vaultAgent.ts` contains a `TODO` and only implements an echo bot. It does not connect to the LLM.
*   **Impact**: The "Vault Agent" is non-functional.
*   **Fix**: Inject `AiClientFactory` into the agent node and implement the actual LLM call.

*   **Issue**: `packages/@sbf/jobs/src/jobs/ingest.ts` contains a `TODO` and does not perform any ingestion.
*   **Impact**: Document ingestion workflows will fail to process data.
*   **Fix**: Implement file reading, chunking (using `langchain` text splitters), embedding (using `ai-client`), and storage (using `vector-client`).

### C. Legacy Configuration Artifacts
*   **Issue**: `.env.example` still contains `n8n` configuration sections.
*   **Issue**: Root `README.md` still lists `n8n` as a component.
*   **Impact**: Developer confusion and potential misconfiguration.
*   **Fix**: Remove n8n references from documentation and example configs.

## 2. Architectural Observations

### A. "Thick Client" Desktop
*   **Observation**: `@sbf/desktop` depends directly on many core modules (`@sbf/budgeting`, `@sbf/fitness-tracking`, etc.).
*   **Implication**: The desktop app appears to run significant business logic locally (Electron main process) rather than purely relying on `apps/api`. This is fine for a "Local First" approach but requires careful synchronization if `apps/api` is also writing to the same DB.

### B. Python vs. TypeScript Backend
*   **Observation**: There is an `apps/aei-core` (Python) and `apps/api` (TypeScript).
*   **Risk**: Potential duplication of logic or unclear boundaries. The new automation stack is TS-first (`@sbf/aei`, `@sbf/jobs`), which aligns better with `apps/api`. The Python backend might become legacy or specialized for specific ML tasks.

## 3. Opportunities for Improvement

### A. "God Mode" Enhancements
*   **Idea**: Add a "Test Connection" button in the God Mode UI for Trigger.dev and Activepieces.
*   **Benefit**: Immediate feedback on configuration validity.

### B. Unified Vector Interface
*   **Idea**: Ensure `vector-client` abstracts the differences between `pgvector` (local/Supabase) and dedicated vector DBs (Pinecone).
*   **Benefit**: Easier switching between local-only (privacy-focused) and cloud-scaled deployments.

### C. Agent "Tools" Library
*   **Idea**: Create a standard library of LangGraph "Tools" that wrap `Activepieces` webhooks.
*   **Benefit**: Allows agents to easily trigger user-defined automations without hardcoding HTTP calls.

## 4. Recommended Next Steps
1.  **Wire up Dependencies**: `pnpm add @sbf/jobs --filter @sbf/api` & `pnpm add @sbf/jobs --filter @sbf/desktop`.
2.  **Implement Logic**: Fill in the `TODO`s in `vaultAgent.ts` and `ingest.ts`.
3.  **Cleanup**: Scrub n8n from docs.
