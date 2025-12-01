# Strategic Capability Expansion Plan

**Date:** November 27, 2025
**Status:** Draft
**Objective:** To severely increase the capabilities of the Second Brain Foundation application, aligning with the "God Mode" vision and Domain Implementation plans.

---

## Phase 1: Foundation & Migration (The "Plugin" Phase)
**Goal:** Establish a robust, modular "Skill System" for the AI.
*   **Objective:** Transition from monolithic `@sbf/modules` to the dynamic `@sbf/plugins` architecture.
*   **Key Actions:**
    1.  **Migrate Core Domains:** Convert `budgeting`, `fitness-tracking`, and `personal-tasks` into full `SBFPlugin` implementations.
    2.  **Tool Definition:** Ensure every plugin exports granular Tools (e.g., `add_transaction`, `get_workout_history`) with Zod schemas for AI consumption.
    3.  **Event Bus:** Implement a system-wide Event Bus so plugins can react to each other (e.g., "Workout Completed" -> "Update Calorie Budget").
*   **Deliverable:** A suite of "installable" skills that the Memory Engine can load dynamically.

## Phase 2: The Cognitive Engine (The "Agent" Phase)
**Goal:** Empower the AI to reason, plan, and execute complex workflows.
*   **Objective:** Upgrade the `VaultAgent` from a simple chatbot to an autonomous agent.
*   **Key Actions:**
    1.  **LangGraph Implementation:** Finalize the LangGraph runtime to support cyclic graphs (Plan -> Execute -> Observe -> Refine).
    2.  **Tool Execution Layer:** Implement the actual runtime logic to execute the tools injected by Phase 1 plugins.
    3.  **Memory Systems:**
        *   **Short-term:** Conversation history and scratchpad.
        *   **Long-term:** Vector database integration for semantic recall of past interactions.
*   **Deliverable:** An Agent that can receive a high-level goal ("Plan my week") and execute multiple steps across different plugins to achieve it.

## Phase 3: Data Ingestion & The Knowledge Graph (The "Brain" Phase)
**Goal:** Make the Vault "alive" and fully queryable.
*   **Objective:** Ensure the AI has real-time, semantic access to all user data (Notes, PDFs, Databases).
*   **Key Actions:**
    1.  **Ingestion Pipeline:** Build a robust file watcher (using Trigger.dev or internal jobs) that detects changes in the Vault.
    2.  **Semantic Indexing:** Automatically chunk and embed new/modified notes into the Vector Store (Pinecone/Weaviate).
    3.  **Graph Linking:** Extract entities (People, Projects, Companies) from notes and build a structured Knowledge Graph.
*   **Deliverable:** The AI knows everything you write down, instantly.

## Phase 4: Multi-Modal Interfaces (The "Access" Phase)
**Goal:** Ubiquitous access to the Second Brain.
*   **Objective:** Break out of the Desktop/Web silo.
*   **Key Actions:**
    1.  **Mobile App:** Polish the React Native mobile app for quick capture and read-only access.
    2.  **Voice Interface:** Implement a "Voice Mode" for hands-free interaction (Speech-to-Text -> Agent -> Text-to-Speech).
    3.  **API Gateway:** Securely expose the Agent via a standard API for third-party integrations (e.g., Siri Shortcuts, Telegram Bot).
*   **Deliverable:** "Hey Second Brain, add this thought..." from anywhere.

## Phase 5: Specialized Domain Expansion (The "Expert" Phase)
**Goal:** Deepen capabilities in specific verticals.
*   **Objective:** Move beyond "tracking" to "analysis" and "coaching".
*   **Key Actions:**
    1.  **Financial Analyst:** Implement portfolio analysis, forecasting, and automated budgeting advice.
    2.  **Health Coach:** Correlate workout data with nutrition and sleep to provide actionable recovery advice.
    3.  **Project Manager:** Auto-generate tasks from meeting notes and identify project risks.
*   **Deliverable:** The system acts as a specialized consultant in each domain.

## Phase 6: "God Mode" & Autonomy (The "Evolution" Phase)
**Goal:** Proactive, autonomous assistance.
*   **Objective:** The system acts without being asked.
*   **Key Actions:**
    1.  **Background Daemons:** Agents that run on schedules (e.g., "Weekly Review Agent", "Morning Briefing Agent").
    2.  **Proactive Notifications:** The system nudges you based on context ("You have a meeting in 10 mins, here is the briefing doc").
    3.  **Self-Optimization:** The system suggests new plugins or workflow improvements based on your usage patterns.
*   **Deliverable:** A true "Second Brain" that thinks alongside you.
