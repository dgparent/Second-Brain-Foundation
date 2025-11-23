# Module Completion Template - PRODUCTION PATTERN

**Based on:** highlights module (✅ SUCCESSFUL)  
**Pattern discovered:** Entity-only, framework re-export approach

---

## ✅ CORRECT PATTERN (What Works)

### File Structure:
```
packages/@sbf/modules/[module-name]/
├── src/
│   ├── [Entity1].ts        # Entity definitions with helpers
│   ├── [Entity2].ts        # Additional entities
│   ├── index.ts            # Exports + framework re-exports
│   └── __tests__/
│       └── [module].test.ts
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Entity Pattern:
```typescript
import { [FrameworkEntity], [FrameworkMetadata], create[FrameworkEntity] } from '@sbf/frameworks/[framework-name]';

// 1. Extend framework metadata
export interface CustomMetadata extends FrameworkMetadata {
  // Add module-specific fields
  custom_field: string;
}

// 2. Extend framework entity
export interface CustomEntity extends FrameworkEntity {
  metadata: CustomMetadata;
}

// 3. Use framework's creation function
export function createCustom(
  title: string,
  options: Partial<CustomMetadata> = {}
): CustomEntity {
  const base = create[FrameworkEntity](
    title,
    'content-type',
    options
  );
  
  return {
    ...base,
    metadata: {
      ...base.metadata,
      custom_field: options.custom_field || 'default',
      // ... other custom fields
    }
  };
}

// 4. Helper functions (not workflows!)
export function helperFunction(
  entity: CustomEntity,
  param: string
): CustomEntity {
  return {
    ...entity,
    updated: new Date().toISOString(),
    metadata: {
      ...entity.metadata,
      modified_date: new Date().toISOString(),
      // ... updates
    }
  };
}
```

### Index Pattern:
```typescript
// Export entities
export * from './Entity1.js';
export * from './Entity2.js';

// Re-export framework
export {
  FrameworkWorkflow1,
  FrameworkWorkflow2,
  frameworkHelper1,
  frameworkHelper2
} from '@sbf/frameworks/[framework-name]';
```

---

## ❌ INCORRECT PATTERN (What Doesn't Work)

### DON'T:
1. ❌ Create custom Workflow classes
2. ❌ Assume framework has database methods (addNode, getNode, etc.)
3. ❌ Use custom entity types that don't extend framework base
4. ❌ Skip required Entity fields (created, updated, lifecycle, sensitivity)
5. ❌ Implement storage/persistence logic

### Framework Reality:
- Workflows operate on **arrays of entities**, not databases
- Methods like `findRelatedNodes(nodes[], uid)` - you pass the data
- No built-in storage - that's app-level concern
- Workflows are **pure functions** for data manipulation

---

## 🎯 Module Completion Checklist

### For Each Module:

1. **Identify Framework** (5 min)
   - [ ] Which framework does it use?
   - [ ] What is the base entity type?
   - [ ] What is the base metadata type?
   - [ ] What creation function exists?

2. **Define Entities** (15-30 min)
   - [ ] Extend base metadata with module-specific fields
   - [ ] Extend base entity with custom metadata
   - [ ] Create entity using framework's creation function
   - [ ] Add module-specific helper functions

3. **Update Index** (5 min)
   - [ ] Export all entities
   - [ ] Re-export relevant framework utilities

4. **Write Tests** (15-30 min)
   - [ ] Entity creation tests
   - [ ] Helper function tests
   - [ ] Metadata tests

5. **Build & Verify** (5 min)
   - [ ] Run `npm run build`
   - [ ] Verify dist/ created
   - [ ] Check for TypeScript errors

---

## 📊 Framework Reference

### Financial Tracking
- **Base Entity:** `TransactionEntity`
- **Base Metadata:** `TransactionMetadata`
- **Creation:** `createTransaction()`
- **Location:** `@sbf/frameworks/financial-tracking`

### Health Tracking
- **Base Entity:** `HealthMeasurementEntity`
- **Base Metadata:** `HealthMeasurementMetadata`
- **Creation:** `createMeasurement()`
- **Location:** `@sbf/frameworks/health-tracking`

### Knowledge Tracking (✅ PROVEN)
- **Base Entity:** `KnowledgeNodeEntity`
- **Base Metadata:** `KnowledgeNodeMetadata`
- **Creation:** `createKnowledgeNode()`
- **Location:** `@sbf/frameworks/knowledge-tracking`
- **Workflows:** `KnowledgeGraphWorkflow`, `SpacedRepetitionWorkflow`, `ProgressTrackingWorkflow`

---

## 🚀 Quick Start for New Module

```bash
# 1. Copy entity structure from highlights
cp -r highlights/src/HighlightEntity.ts [new-module]/src/[Entity].ts

# 2. Update imports to correct framework
# 3. Customize metadata fields
# 4. Implement creation function using framework
# 5. Add helper functions
# 6. Update index.ts
# 7. Copy test structure
# 8. Build and verify
```

---

## ⏱️ Time Estimates (Per Module)

- **Investigation:** 5 min (using this template)
- **Entity Definition:** 20 min
- **Helper Functions:** 10 min
- **Tests:** 20 min
- **Build & Fix:** 10 min
- **Total:** ~65 min per module (1 hour)

---

**For 3 remaining modules: ~3 hours total**
