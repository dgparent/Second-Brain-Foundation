# Codebase Investigation Report
**Date:** November 27, 2025
**Scope:** Recent changes to Automation Stack (Jobs, AEI, AI Client)

## 1. Findings

### A. Logic Issues in `ingest.ts`
*   **Missing Chunking**: The ingestion job takes the full `text` and sends it to the embedding model. Most embedding models (like `nomic-embed-text` or OpenAI's `text-embedding-3`) have a token limit (e.g., 8192 tokens). Passing a large document without chunking will cause the API call to fail.
*   **Hardcoded Model**: The model `nomic-embed-text` is hardcoded. This should be configurable via `config` or the payload.
*   **Hardcoded Provider**: The provider is hardcoded to `'ollama'`. This breaks the "provider-agnostic" goal if the user wants to use OpenAI for embeddings.
*   **Metadata Handling**: The `text` snippet stored in metadata is `substring(0, 1000)`. If the document is small, this is fine, but for RAG, we usually want to store the *chunk* text with the embedding, not just a snippet of the whole doc.

### B. Logic Issues in `vaultAgent.ts`
*   **Hardcoded Provider**: Similar to `ingest.ts`, the provider is hardcoded to `'ollama'` and `http://localhost:11434`.
*   **Error Handling**: The error handling catches the error and returns a polite message, which is good for UX but might hide configuration errors during development.
*   **State Management**: The agent is stateless between turns (except for the message history passed in). This is typical for LangGraph but worth noting.

### C. Configuration Gaps
*   **`packages/config`**: The `config` object has `ai.togetherApiKey` but lacks generic `ai.apiKey`, `ai.provider`, `ai.baseUrl`. The code in `vaultAgent.ts` tries to use `config.ai.togetherApiKey` as a fallback for the generic API key, which is confusing naming.
*   **Vector Config**: `config.vector` has `apiKey` and `indexName`, but `ingest.ts` assumes `getVectorClient()` works magically without passing these config values explicitly (it likely relies on env vars internally, which is inconsistent with passing `aiClient` config explicitly).

### D. Dependency Verification
*   **`@sbf/jobs`**: Correctly depends on `@sbf/ai-client`, `@sbf/config`, `@sbf/vector-client`.
*   **`@sbf/aei`**: Correctly depends on `@sbf/ai-client`, `@sbf/config`.
*   **`apps/api`**: Correctly depends on `@sbf/jobs`.
*   **`@sbf/desktop`**: Correctly depends on `@sbf/jobs`.

## 2. Recommendations

### A. Fix Ingestion Logic
1.  **Implement Chunking**: Use `RecursiveCharacterTextSplitter` from `langchain` (or a simple utility) to split `text` into chunks.
2.  **Loop Embeddings**: Generate an embedding for *each* chunk.
3.  **Batch Upsert**: Upsert all chunks to the vector DB, not just one record per document.
4.  **Configurable Provider**: Read the provider and model from `config` or payload.

### B. Standardize Configuration
1.  **Update `@sbf/config`**: Add `ai.provider`, `ai.baseUrl`, `ai.apiKey` (generic), `ai.embeddingModel`.
2.  **Update Usage**: Update `vaultAgent.ts` and `ingest.ts` to use these new config fields.

### C. Refactor `vaultAgent.ts`
1.  **Dynamic Provider**: Instantiate `AiClientFactory` based on the updated config.

## 3. Plan
1.  Update `packages/config/src/index.ts`.
2.  Update `packages/@sbf/jobs/src/jobs/ingest.ts` to add chunking and loop.
3.  Update `packages/@sbf/aei/src/graph/vaultAgent.ts` to use dynamic config.
