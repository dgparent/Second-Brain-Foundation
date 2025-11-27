# Core Frameworks Integration Plan

## Objective
Integrate the 5 core frameworks into the Desktop application to provide foundational services for the Second Brain.

## Frameworks

### 1. Task Management (`@sbf/frameworks-task-management`)
- **Key Exports**: `TaskPrioritizationWorkflow`, `ProjectTrackingWorkflow`
- **Integration**:
    - Instantiate workflows in Desktop backend.
    - Expose `tasks:create`, `tasks:list`, `projects:create`, `projects:list` via IPC.
    - Create `TaskDashboard` UI.

### 2. Financial Tracking (`@sbf/frameworks-financial-tracking`)
- **Key Exports**: `FinancialAggregationWorkflow`
- **Integration**:
    - Instantiate workflow.
    - Expose `finance:logTransaction`, `finance:getSummary` via IPC.
    - Create `FinanceDashboard` UI.

### 3. Health Tracking (`@sbf/frameworks-health-tracking`)
- **Key Exports**: (Need to verify, likely `HealthMetricWorkflow` or similar)
- **Integration**:
    - Instantiate workflow.
    - Expose `health:logMetric`, `health:getStats` via IPC.
    - Create `HealthDashboard` UI.

### 4. Relationship Tracking (`@sbf/frameworks-relationship-tracking`)
- **Key Exports**: (Need to verify)
- **Integration**:
    - Instantiate workflow.
    - Expose `relationships:addContact`, `relationships:logInteraction` via IPC.
    - Create `RelationshipDashboard` UI.

### 5. Knowledge Tracking (`@sbf/frameworks-knowledge-tracking`)
- **Key Exports**: (Need to verify)
- **Integration**:
    - Instantiate workflow.
    - Expose `knowledge:capture`, `knowledge:review` via IPC.
    - Create `KnowledgeDashboard` UI.

## Execution Strategy
1.  **Backend Setup**: Update `package.json` and `index.ts` to include all frameworks.
2.  **IPC Layer**: Create `ipc/framework-handlers.ts` to handle all framework-related IPC calls.
3.  **Frontend API**: Update `preload/index.ts` to expose `sbfAPI.tasks`, `sbfAPI.finance`, etc.
4.  **UI Implementation**: Create basic dashboard components for each framework.
