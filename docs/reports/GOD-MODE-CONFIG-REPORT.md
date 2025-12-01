# God Mode Configuration Investigation Report
**Date:** November 27, 2025

## 1. Findings

### A. Configuration Systems Disconnect
There are currently two separate configuration systems in the codebase:
1.  **Backend Configuration (`packages/config`)**:
    *   Source of Truth: Environment variables (`.env`).
    *   Used By: `@sbf/jobs` (Ingestion), `@sbf/aei` (Agents), and other backend services.
    *   Mechanism: Reads `process.env` at runtime.
2.  **Desktop Configuration (`ConfigManager`)**:
    *   Source of Truth: `config.json` in the user's data directory (Electron `userData`).
    *   Used By: The Desktop App UI (`GodModeSettings.tsx`).
    *   Mechanism: Reads/Writes a local JSON file.

**Critical Issue:** Changing settings in the "God Mode" dashboard (e.g., switching AI provider to OpenAI) currently **only updates the local JSON file**. It does **not** update the `.env` file or the environment variables used by the backend services (like the ingestion job running in Trigger.dev). This means the dashboard controls are effectively "placeholders" for the backend services until this link is bridged.

### B. Missing Configurations in Dashboard
The "God Mode" dashboard was missing several key configurations found in `.env` and `packages/config`:
*   **Ingestion Settings:** `chunkSize` and `chunkOverlap` (crucial for RAG performance).
*   **Model Specifics:** Distinction between `chatModel` (e.g., Llama 3) and `embeddingModel` (e.g., Nomic Embed).
*   **Analytics:** Superset and Grafana settings were present in `.env` but missing from the UI.

## 2. Actions Taken

To align the Dashboard UI with the actual system capabilities, I have performed the following updates:

### A. Updated `ConfigManager.ts`
*   Updated the `AppConfig` interface to match the structure of `packages/config`.
*   Added fields for:
    *   `ai.embeddingModel`
    *   `ai.chatModel`
    *   `ai.ingestion` (chunkSize, chunkOverlap)
    *   `analytics` (Superset, Grafana)

### B. Updated `GodModeSettings.tsx`
*   Added **Ingestion Settings** section to the "Network & AI" tab.
*   Split "Model Name" into **Chat Model** and **Embedding Model**.
*   Added a new **Analytics** tab for Superset and Grafana configuration.

### C. Fixed API Exposure
*   The `config` API was defined in the main process but **not exposed** in the preload script.
*   Updated `packages/@sbf/desktop/src/preload/index.ts` to expose `window.sbfAPI.config.get()` and `set()`.

## 3. Recommendations for Next Steps

To fix the disconnect between the Dashboard and Backend Services:

1.  **Environment Variable Sync:** Update `ConfigManager` to write critical changes (like AI Provider) to the `.env` file (if running locally) or provide an API endpoint for backend services to fetch dynamic config from the Desktop App.
2.  **Dynamic Config Loading:** Update `@sbf/config` to optionally read from the `config.json` file if it exists, allowing the Desktop App to control backend behavior without restarting services.
