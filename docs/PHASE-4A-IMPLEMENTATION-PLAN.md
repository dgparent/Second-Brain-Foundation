# Phase 4A: Health + Finance Frameworks - Detailed Implementation Plan

**Created:** 2025-11-21  
**Scope:** Build 2 framework modules + 4 domain modules  
**Timeline:** 8-10 hours (one focused session)  
**Goal:** Validate cluster-based module architecture with maximum code reuse

---

## 🎯 Overview

This plan details the step-by-step implementation of:

1. **Health Tracking Framework** → Fitness + Medication modules
2. **Financial Tracking Framework** → Budgeting + Portfolio modules

**Success Criteria:**
- ✅ 85%+ code reuse within each cluster
- ✅ All tests passing
- ✅ New cluster module can be created in <1 hour
- ✅ Framework patterns documented

---

## 📦 Part 1: Health Tracking Framework (3 hours)

### **1.1 Framework Structure** (30 mins)

**Create base package:**
```bash
mkdir -p packages/@sbf/frameworks/health-tracking/src/{entities,workflows,utils}
```

**Directory Layout:**
```
packages/@sbf/frameworks/health-tracking/
├── src/
│   ├── index.ts                          # Framework exports
│   ├── entities/
│   │   ├── HealthEventEntity.ts          # Base time-stamped health event
│   │   ├── HealthMetricEntity.ts         # Base metric/measurement
│   │   └── HealthCorrelationEntity.ts    # Correlation tracking
│   ├── workflows/
│   │   ├── HealthCorrelationWorkflow.ts  # Find correlations
│   │   ├── HealthTrackingWorkflow.ts     # Generic tracking
│   │   └── MetricAggregationWorkflow.ts  # Statistics & trends
│   ├── utils/
│   │   ├── healthHelpers.ts              # Entity creation helpers
│   │   ├── metricCalculator.ts           # Stats calculations
│   │   └── privacyDefaults.ts            # Privacy configurations
│   └── types.ts                          # Shared types
├── package.json
├── tsconfig.json
└── README.md
```

### **1.2 Base Entity Types** (45 mins)

**File: `src/entities/HealthEventEntity.ts`**
```typescript
import { Entity } from '@sbf/core/types';

export interface HealthEventMetadata {
  date: string;                    // ISO date
  time?: string;                   // HH:MM format
  duration_minutes?: number;
  severity?: number;               // 0-10 scale
  body_region?: string;
  context?: Record<string, any>;
  linked_metrics?: string[];       // UIDs of related metrics
  source_system?: string;
}

export interface HealthEventEntity extends Entity {
  type: string;                    // Subclasses define specific type
  metadata: HealthEventMetadata & Record<string, any>;
}

export abstract class HealthEventBuilder {
  protected entity: Partial<HealthEventEntity>;

  constructor(type: string) {
    this.entity = {
      type,
      lifecycle: { state: 'permanent' },
      sensitivity: {
        level: 'confidential',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      metadata: {
        date: new Date().toISOString().split('T')[0],
      },
    };
  }

  withDate(date: string): this {
    this.entity.metadata!.date = date;
    return this;
  }

  withTime(time: string): this {
    this.entity.metadata!.time = time;
    return this;
  }

  withDuration(minutes: number): this {
    this.entity.metadata!.duration_minutes = minutes;
    return this;
  }

  withContext(context: Record<string, any>): this {
    this.entity.metadata!.context = context;
    return this;
  }

  abstract build(): HealthEventEntity;
}
```

**File: `src/entities/HealthMetricEntity.ts`**
```typescript
import { Entity } from '@sbf/core/types';

export interface HealthMetricMetadata {
  metric_type: string;            // weight, hr, hrv, etc.
  value: number;
  unit: string;
  date: string;
  time?: string;
  source_system?: string;
  measurement_context?: Record<string, any>;
}

export interface HealthMetricEntity extends Entity {
  type: 'health.metric';
  metadata: HealthMetricMetadata;
}

export function createHealthMetric(data: {
  uid: string;
  metric_type: string;
  value: number;
  unit: string;
  date?: string;
}): HealthMetricEntity {
  return {
    uid: data.uid,
    type: 'health.metric',
    title: `${data.metric_type}: ${data.value}${data.unit}`,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      metric_type: data.metric_type,
      value: data.value,
      unit: data.unit,
      date: data.date || new Date().toISOString().split('T')[0],
    },
  };
}
```

### **1.3 Correlation Workflow** (45 mins)

**File: `src/workflows/HealthCorrelationWorkflow.ts`**
```typescript
import { ArangoDBAdapter } from '@sbf/memory-engine';
import { HealthEventEntity, HealthMetricEntity } from '../entities';

export interface CorrelationResult {
  event_uid: string;
  metric_uid: string;
  correlation_strength: number;
  time_delta_hours: number;
}

export class HealthCorrelationWorkflow {
  constructor(
    private memoryEngine: ArangoDBAdapter,
    private config: {
      maxTimeDeltaHours?: number;
      minCorrelationStrength?: number;
    } = {}
  ) {
    this.config.maxTimeDeltaHours = config.maxTimeDeltaHours || 48;
    this.config.minCorrelationStrength = config.minCorrelationStrength || 0.3;
  }

  async findCorrelations(
    eventUid: string
  ): Promise<CorrelationResult[]> {
    // Get the event
    const event = await this.memoryEngine.getEntity(eventUid) as HealthEventEntity;
    if (!event) return [];

    const eventDate = new Date(event.metadata.date);

    // Query nearby metrics
    const nearbyMetrics = await this.memoryEngine.queryEntities({
      type: 'health.metric',
      dateRange: {
        start: new Date(eventDate.getTime() - this.config.maxTimeDeltaHours! * 3600000).toISOString(),
        end: new Date(eventDate.getTime() + this.config.maxTimeDeltaHours! * 3600000).toISOString(),
      },
    });

    // Calculate correlations (simplified - could use more sophisticated methods)
    const correlations: CorrelationResult[] = [];
    
    for (const metric of nearbyMetrics) {
      const metricDate = new Date((metric as HealthMetricEntity).metadata.date);
      const timeDelta = Math.abs(metricDate.getTime() - eventDate.getTime()) / 3600000;
      
      // Simple correlation: closer in time = stronger correlation
      const correlation = 1 - (timeDelta / this.config.maxTimeDeltaHours!);
      
      if (correlation >= this.config.minCorrelationStrength!) {
        correlations.push({
          event_uid: eventUid,
          metric_uid: metric.uid,
          correlation_strength: correlation,
          time_delta_hours: timeDelta,
        });
      }
    }

    return correlations;
  }

  async createCorrelationLinks(correlations: CorrelationResult[]): Promise<void> {
    // Store as relationships in graph
    for (const corr of correlations) {
      await this.memoryEngine.createRelationship({
        from: corr.event_uid,
        to: corr.metric_uid,
        type: 'correlates_with',
        metadata: {
          strength: corr.correlation_strength,
          time_delta_hours: corr.time_delta_hours,
        },
      });
    }
  }
}
```

### **1.4 Package Configuration** (15 mins)

**File: `package.json`**
```json
{
  "name": "@sbf/frameworks-health-tracking",
  "version": "0.1.0",
  "description": "Health tracking framework for SBF modules",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@sbf/core": "*",
    "@sbf/memory-engine": "*",
    "@sbf/aei": "*"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

**File: `src/index.ts`**
```typescript
// Entities
export * from './entities/HealthEventEntity';
export * from './entities/HealthMetricEntity';
export * from './entities/HealthCorrelationEntity';

// Workflows
export * from './workflows/HealthCorrelationWorkflow';
export * from './workflows/HealthTrackingWorkflow';
export * from './workflows/MetricAggregationWorkflow';

// Utils
export * from './utils/healthHelpers';
export * from './utils/metricCalculator';
export * from './utils/privacyDefaults';

// Types
export * from './types';
```

### **1.5 Build & Test** (15 mins)

```bash
cd packages/@sbf/frameworks/health-tracking
npx tsc
npm test
```

---

## 📦 Part 2: Fitness module (1 hour)

### **2.1 module Structure** (15 mins)

**Extends health framework with specific types:**

```
packages/@sbf/modules/fitness-tracking/
├── src/
│   ├── index.ts
│   ├── entities/
│   │   ├── WorkoutEntity.ts
│   │   ├── MealEntity.ts
│   │   └── BodyMetricEntity.ts
│   ├── workflows/
│   │   └── FitnessTrackingWorkflow.ts
│   └── utils/
│       └── helpers.ts
├── package.json
└── tsconfig.json
```

### **2.2 Workout Entity** (15 mins)

**File: `src/entities/WorkoutEntity.ts`**
```typescript
import { HealthEventEntity, HealthEventBuilder } from '@sbf/frameworks-health-tracking';

export interface WorkoutMetadata {
  date: string;
  time?: string;
  duration_minutes: number;
  workout_type: 'cardio' | 'strength' | 'flexibility' | 'sport' | 'other';
  exercises?: Array<{
    name: string;
    sets?: number;
    reps?: number;
    duration_seconds?: number;
    weight_kg?: number;
  }>;
  performance_metrics?: {
    avg_hr?: number;
    max_hr?: number;
    calories_burned?: number;
    distance_km?: number;
    pace_min_per_km?: number;
  };
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

export interface WorkoutEntity extends HealthEventEntity {
  type: 'fitness.workout';
  metadata: WorkoutMetadata;
}

export class WorkoutBuilder extends HealthEventBuilder {
  constructor() {
    super('fitness.workout');
  }

  withWorkoutType(type: WorkoutMetadata['workout_type']): this {
    this.entity.metadata!.workout_type = type;
    return this;
  }

  withExercises(exercises: WorkoutMetadata['exercises']): this {
    this.entity.metadata!.exercises = exercises;
    return this;
  }

  withMetrics(metrics: WorkoutMetadata['performance_metrics']): this {
    this.entity.metadata!.performance_metrics = metrics;
    return this;
  }

  build(): WorkoutEntity {
    if (!this.entity.uid) throw new Error('UID required');
    if (!this.entity.title) throw new Error('Title required');
    if (!this.entity.metadata!.workout_type) throw new Error('Workout type required');
    
    return this.entity as WorkoutEntity;
  }
}

export function createWorkout(data: {
  uid: string;
  title: string;
  workout_type: WorkoutMetadata['workout_type'];
  duration_minutes: number;
  exercises?: WorkoutMetadata['exercises'];
}): WorkoutEntity {
  return new WorkoutBuilder()
    .withWorkoutType(data.workout_type)
    .withDuration(data.duration_minutes)
    .withExercises(data.exercises || [])
    .build();
}
```

### **2.3 Workflow** (20 mins)

**File: `src/workflows/FitnessTrackingWorkflow.ts`**
```typescript
import { OllamaProvider } from '@sbf/aei';
import { ArangoDBAdapter } from '@sbf/memory-engine';
import { HealthCorrelationWorkflow } from '@sbf/frameworks-health-tracking';
import { WorkoutEntity, createWorkout } from '../entities/WorkoutEntity';

export class FitnessTrackingWorkflow {
  private correlationWorkflow: HealthCorrelationWorkflow;

  constructor(
    private aeiProvider: OllamaProvider,
    private memoryEngine: ArangoDBAdapter
  ) {
    this.correlationWorkflow = new HealthCorrelationWorkflow(memoryEngine);
  }

  async logWorkoutFromText(text: string): Promise<WorkoutEntity> {
    // 1. Extract workout data with AEI
    const extracted = await this.aeiProvider.extractEntities(text);
    
    // 2. Parse extracted data (simplified)
    const workoutData = this.parseWorkoutData(extracted);
    
    // 3. Create workout entity
    const workout = createWorkout({
      uid: `workout-${Date.now()}`,
      title: workoutData.title || 'Workout',
      workout_type: workoutData.type,
      duration_minutes: workoutData.duration,
      exercises: workoutData.exercises,
    });
    
    // 4. Store in memory engine
    await this.memoryEngine.createEntity(workout);
    
    // 5. Find correlations with nearby metrics
    const correlations = await this.correlationWorkflow.findCorrelations(workout.uid);
    await this.correlationWorkflow.createCorrelationLinks(correlations);
    
    return workout;
  }

  private parseWorkoutData(extracted: any): any {
    // AEI parsing logic (simplified for now)
    return {
      title: extracted.title || 'Workout',
      type: extracted.type || 'other',
      duration: extracted.duration || 30,
      exercises: extracted.exercises || [],
    };
  }
}
```

### **2.4 Test** (10 mins)

**File: `tests/fitness.test.ts`**
```typescript
import { FitnessTrackingWorkflow } from '../src/workflows/FitnessTrackingWorkflow';
import { OllamaProvider } from '@sbf/aei';
import { ArangoDBAdapter } from '@sbf/memory-engine';

async function testFitnessPlugin() {
  // Initialize
  const aei = new OllamaProvider({ model: 'llama3.2:3b' });
  const memory = new ArangoDBAdapter({
    url: process.env.ARANGO_URL || 'http://localhost:8529',
    database: 'sbf_test',
  });
  
  await memory.connect();
  
  const workflow = new FitnessTrackingWorkflow(aei, memory);
  
  // Test workout logging
  const workoutText = 'Did a 45-minute run, 8km, average HR 145';
  const workout = await workflow.logWorkoutFromText(workoutText);
  
  console.log('✅ Workout created:', workout.uid);
  
  // Verify storage
  const retrieved = await memory.getEntity(workout.uid);
  console.log('✅ Workout retrieved:', retrieved?.title);
  
  await memory.disconnect();
}

testFitnessPlugin().catch(console.error);
```

---

## 📦 Part 3: Medication module (30 mins)

**Similar structure to Fitness, but simpler:**
- `MedicationOrderEntity` extends `HealthEventEntity`
- `MedicationIntakeEntity` for adherence tracking
- `MedicationTrackingWorkflow` for scheduling & reminders

**Implementation follows same pattern as Fitness but with medication-specific fields**

---

## 📦 Part 4: Financial Framework (3 hours)

### **4.1 Framework Structure** (Similar to Health)

**Base entities:**
- `FinancialEventEntity` - Transactions, payouts, contributions
- `FinancialAccountEntity` - Accounts, wallets, brokerages
- `FinancialAggregationWorkflow` - Statistics & trends

### **4.2 Key Workflows**
- `TransactionCategorizationWorkflow` - Auto-categorize with AEI
- `FinancialAggregationWorkflow` - Monthly/yearly stats
- `CurrencyConversionWorkflow` - Multi-currency support

---

## 📦 Part 5: Budgeting module (1 hour)

**Extends financial framework:**
- `TransactionEntity`
- `BudgetCategoryEntity`
- `BillEntity`
- `BudgetTrackingWorkflow`

---

## 📦 Part 6: Portfolio module (1 hour)

**Extends financial framework:**
- `AssetEntity`
- `HoldingEntity`
- `ValuationEntity`
- `PortfolioTrackingWorkflow`

---

## ✅ Validation Checklist

### **Health Framework**
- [ ] Base entities compile
- [ ] Correlation workflow works
- [ ] Metric aggregation works
- [ ] Privacy defaults correct

### **Fitness module**
- [ ] Workout entity creates successfully
- [ ] AEI extraction works
- [ ] Correlations detected
- [ ] Test passes

### **Medication module**
- [ ] Medication order creates
- [ ] Intake tracking works
- [ ] Test passes

### **Financial Framework**
- [ ] Base entities compile
- [ ] Transaction workflow works
- [ ] Currency conversion works

### **Budgeting module**
- [ ] Transaction categorization works
- [ ] Budget limits enforced
- [ ] Test passes

### **Portfolio module**
- [ ] Asset tracking works
- [ ] Valuation updates
- [ ] Test passes

---

## 📊 Success Metrics

**Code Reuse:**
- Health cluster: 85%+ shared (target: 90%)
- Finance cluster: 85%+ shared (target: 90%)

**Development Time:**
- Framework: 3 hours each (expected)
- Domain module: 30-60 mins (target: <1 hour)

**Quality:**
- All tests passing
- TypeScript strict mode
- No duplicate code

---

## 🎯 Next Steps After Completion

1. **Update documentation**
   - module-DEVELOPMENT-GUIDE.md
   - module-CLUSTER-STRATEGY.md
   - HOLISTIC-REFACTOR-PLAN.md

2. **Create cluster module tutorial**
   - Step-by-step guide
   - Video walkthrough (optional)

3. **Plan Phase 4B**
   - Choose next 2 clusters
   - Repeat process

---

*Ready to execute! Let's build these frameworks!*
