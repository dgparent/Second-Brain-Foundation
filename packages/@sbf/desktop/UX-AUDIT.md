# UX Audit & Improvement Plan
**Date:** November 27, 2025
**Target:** `@sbf/desktop` (Electron/React/AntD)

## 1. Executive Summary
The current desktop interface is a functional, developer-centric dashboard that exposes the underlying system architecture (Entities, Lifecycle, Privacy) rather than user-centric workflows. While the modular architecture is robust, the UI lacks cohesion, onboarding, and a clear "Second Brain" narrative.

## 2. Key Findings

### 2.1. Navigation & Information Architecture
*   **Problem:** The sidebar is a flat list of disparate modules (Finance, Health, Legal, HACCP). As modules grow, this will become unmanageable.
*   **Problem:** "HACCP" (Food Safety) is a top-level item, which is highly specific and likely irrelevant for many users.
*   **Opportunity:** Group modules into logical categories (e.g., "Life OS", "Work", "System"). Implement a "Module Store" or "Feature Toggle" system to hide unused modules.

### 2.2. Dashboard Experience
*   **Problem:** The current Dashboard shows system stats ("0 Entities", "Privacy Stats"). This is "Admin" data, not "User" data.
*   **Opportunity:** Transform the Dashboard into a "Daily Briefing". Show:
    *   Today's Tasks/Events
    *   Recent Notes/Thoughts
    *   Active Projects
    *   "Brain Health" summary (instead of raw entity counts)

### 2.3. Chat Interface (The "Brain")
*   **Problem:** The chat is functional but limited. It renders text and simple "Execution Plans". It lacks rich media support.
*   **Opportunity:** Implement "Rich Blocks" in the chat:
    *   **Markdown Support:** For bold, lists, code blocks.
    *   **Entity Previews:** When the AI mentions a note, show a card preview of that note.
    *   **Action Buttons:** "Create Task", "Save to Notes" directly from chat responses.

### 2.4. Terminology & Mental Model
*   **Problem:** Terms like "Entities", "Lifecycle", "God Mode", "Constitution" are exposed directly.
*   **Opportunity:** Rebrand for the user:
    *   "Entities" -> "Notes" / "Items"
    *   "God Mode" -> "Advanced Settings" / "System Internals"
    *   "Constitution" -> "Core Values" / "AI Instructions"

### 2.5. Visual Polish
*   **Problem:** The app uses default Ant Design styling. It looks like a generic enterprise tool.
*   **Opportunity:** Apply a custom theme (typography, spacing, rounded corners) to make it feel more personal and "organic" (fitting the "Brain" theme).

## 3. Recommended Action Plan

### Phase 1: Structural Cleanup (Completed)
1.  **Refactor Navigation:** Group sidebar items into `Personal`, `Professional`, and `System`. (Done)
2.  **Rename Settings:** Change "God Mode" to "Advanced". (Done)
3.  **Empty States:** Add "Get Started" buttons to empty dashboards instead of showing "0". (Pending)

### Phase 2: Dashboard Redesign (Completed)
1.  **Create `DailyBriefing` Component:** A new default view focusing on *now*. (Done)
2.  **Widget System:** Allow users to toggle "Finance", "Health", etc., widgets on the dashboard. (Partially implemented via Dashboard layout)

### Phase 3: Rich Chat (Completed)
1.  **Markdown Renderer:** Replace plain text div with `react-markdown`. (Done)
2.  **Interactive Elements:** Add "Approve Plan" or "Edit" buttons to AI responses. (Pending)

## 4. Mockup / Concept (Textual)

**New Sidebar:**
*   **Home** (Dashboard)
*   **Chat** (Copilot)
*   **My Life**
    *   Health
    *   Finance
    *   Property
*   **My Work**
    *   Projects
    *   Legal
    *   HACCP (if enabled)
*   **System**
    *   Knowledge Graph
    *   Settings

**New Dashboard:**
*   **Greeting:** "Good Morning, Dave."
*   **Focus:** "You have 3 tasks due today."
*   **Recent:** [Note Card: Project Alpha] [Note Card: Grocery List]
