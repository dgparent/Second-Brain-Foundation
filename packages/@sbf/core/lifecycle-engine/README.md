# @sbf/core-lifecycle-engine

48-hour lifecycle automation for Second Brain Foundation - eliminates manual organization burden.

## 🎯 Purpose

Automatically organize daily notes into permanent knowledge structures using AI-powered entity extraction and intelligent dissolution workflows.

## 🚀 Features

### ✅ Complete Lifecycle Automation
- **Automatic 48-hour dissolution** of daily notes
- **AI-powered entity extraction** from unstructured content
- **Smart content filing** into permanent entities
- **Human override controls** (prevent, postpone)
- **Event-driven architecture** for observability

### ✅ Scheduler System
- Cron-like job scheduling
- Job persistence across restarts
- Retry logic with configurable max retries
- Event emission for all job states
- Statistics and monitoring

### ✅ Entity Extraction
- Wikilink and tag parsing
- Entity type inference (person, project, topic)
- Confidence scoring (0-1 scale)
- Batch processing support
- Integration with @sbf/aei providers

### ✅ Dissolution Workflow
- Content extraction and archival
- Smart merging for existing entities
- Relationship tracking
- Dissolution summaries
- Graceful error handling

## 📦 Installation

```bash
npm install @sbf/core-lifecycle-engine
```

## 🔧 Usage

### Basic Setup

```typescript
import { LifecycleAutomationService } from '@sbf/core-lifecycle-engine';
import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';

// Initialize the automation service
const automation = new LifecycleAutomationService({
  entityManager: yourEntityManager,
  aiProvider: yourAIProvider,
  checkIntervalMinutes: 60, // Check every hour
  enableAutoDissolution: true,
});

// Initialize and start
await automation.initialize();
automation.start();
```

### Listen to Events

```typescript
// Automation started
automation.on('automation:started', () => {
  console.log('✅ Automation started');
});

// Regular checks
automation.on('automation:check', (timestamp) => {
  console.log(`🔍 Checking at ${timestamp}`);
});

// Batch dissolution complete
automation.on('automation:dissolution:batch', (results) => {
  console.log(`📦 Dissolved ${results.length} notes`);
  results.forEach(r => console.log(r.summary));
});
```

### Manual Controls

```typescript
// Manually trigger dissolution
const results = await automation.manuallyDissolve([
  'daily-2025-11-19-001',
  'daily-2025-11-20-001',
]);

// Prevent dissolution
await automation.preventDissolution(
  'daily-2025-11-21-001',
  'Important reference material'
);

// Postpone dissolution by 24 hours
await automation.postponeDissolution(
  'daily-2025-11-21-002',
  24
);

// Get statistics
const stats = automation.getStats();
console.log(stats);
```

### Stop Automation

```typescript
automation.stop();
```

## 📚 Architecture

```
LifecycleAutomationService (Orchestrator)
│
├─► Scheduler
│   ├─► CronParser - Parse cron expressions
│   └─► Job Management - Queue, retry, persist
│
├─► LifecycleEngine
│   └─► State Transitions - capture → transitional → archived
│
├─► EntityExtractionWorkflow
│   ├─► AI Integration - Extract entities from text
│   └─► Confidence Scoring - Filter low-confidence results
│
└─► DissolutionWorkflow
    ├─► Entity Creation - File content into permanent entities
    ├─► Content Merging - Smart merge for existing entities
    └─► Archival - Mark daily notes as archived
```

## 🔄 The 48-Hour Lifecycle

1. **Day 0:** Daily note created (state: `capture`)
2. **Day 2 (48h):** Scheduler triggers dissolution
3. **Extraction:** AI extracts entities (people, projects, topics)
4. **Dissolution:** Content filed into permanent entities
5. **Archive:** Daily note marked as `archived`
6. **Summary:** Audit trail generated

## 🎛️ Configuration

```typescript
interface LifecycleAutomationConfig {
  entityManager: EntityManager;          // Required
  aiProvider: BaseAIProvider;            // Required
  checkIntervalMinutes?: number;         // Default: 60
  enableAutoDissolution?: boolean;       // Default: true
}
```

## 📊 Statistics

```typescript
const stats = automation.getStats();

// Returns:
{
  isRunning: boolean,
  checkIntervalMinutes: number,
  enableAutoDissolution: boolean,
  lifecycle: {
    totalTransitions: number,
    automaticTransitions: number,
    manualOverrides: number,
    rules: number
  },
  scheduler: {
    total: number,
    pending: number,
    running: number,
    completed: number,
    failed: number,
    cancelled: number
  }
}
```

## 🧪 Events

### Automation Events
- `automation:started` - Service started
- `automation:stopped` - Service stopped
- `automation:check` - Regular check performed
- `automation:dissolution:batch` - Batch dissolution completed

### Lifecycle Events
- `lifecycle:transition` - Entity state changed
- `lifecycle:auto-transition` - Automatic transition
- `lifecycle:manual-override` - Manual override applied

### Extraction Events
- `extraction:started` - Extraction started
- `extraction:completed` - Extraction completed
- `extraction:failed` - Extraction failed

### Dissolution Events
- `dissolution:started` - Dissolution started
- `dissolution:completed` - Dissolution completed
- `dissolution:failed` - Dissolution failed
- `dissolution:prevented` - Dissolution prevented by user

## 🔒 Human Overrides

### Prevent Dissolution
```typescript
// Prevents automatic dissolution permanently
await automation.preventDissolution(
  'daily-note-uid',
  'Reason for preventing'
);
```

### Postpone Dissolution
```typescript
// Extends the 48-hour window
await automation.postponeDissolution(
  'daily-note-uid',
  24 // hours to postpone
);
```

## 🧩 Components

### Scheduler
- **Purpose:** Manage scheduled jobs with cron support
- **Features:** Persistence, retry logic, event emission
- **Usage:** `new Scheduler(config)`

### EntityExtractionWorkflow
- **Purpose:** Extract entities from daily notes
- **Features:** AI integration, batch processing, confidence scoring
- **Usage:** `new EntityExtractionWorkflow(config)`

### DissolutionWorkflow
- **Purpose:** Archive daily notes and file content
- **Features:** Content merging, relationship tracking, summaries
- **Usage:** `new DissolutionWorkflow(config)`

### LifecycleAutomationService
- **Purpose:** Orchestrate all automation workflows
- **Features:** Start/stop, manual controls, statistics
- **Usage:** `new LifecycleAutomationService(config)`

## 📝 Examples

See `examples/lifecycle-automation-demo.ts` for complete usage examples.

## 🧪 Testing

```bash
npm test
```

## 🔨 Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test

# Test coverage
npm run test:coverage
```

## 📄 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../../../CONTRIBUTING.md)

---

**Built with ❤️ for Second Brain Foundation**
