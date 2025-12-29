# @sbf/privacy-engine

Privacy and sensitivity management engine for Second Brain Foundation.

## Overview

This package implements the privacy and sensitivity framework from PRD FR15-19, providing:

- **Tiered Sensitivity Levels**: public, personal, confidential, secret
- **Context-Based Permissions**: Control over AI access, export, sync, and sharing
- **Sensitivity Inheritance**: Child entities inherit from parent entities
- **Privacy Audit Logging**: Track all privacy-related actions

## Installation

```bash
pnpm add @sbf/privacy-engine
```

## Sensitivity Levels

| Level | cloud_ai | local_ai | export | sync | share | index |
|-------|----------|----------|--------|------|-------|-------|
| public | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| personal | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| confidential | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| secret | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Usage

### Check AI Access Permission

```typescript
import { SensitivityService, AIAccessControl } from '@sbf/privacy-engine';

const sensitivityService = new SensitivityService(db, auditLogger);
const aiAccess = new AIAccessControl(sensitivityService, auditLogger);

// Check if content can be sent to cloud AI
const result = await aiAccess.checkAccess({
  tenantId: 'tenant-123',
  userId: 'user-456',
  entityUids: ['note-my-note-001'],
  aiProvider: 'openai',
  aiType: 'cloud',
  operation: 'chat',
});

if (result.allowed) {
  // Process with allowed entities only
  console.log('Processing:', result.allowedEntities);
} else {
  console.log('Blocked:', result.blockedEntities);
}
```

### Update Entity Sensitivity

```typescript
import { SensitivityService, SensitivityLevel } from '@sbf/privacy-engine';

const service = new SensitivityService(db, auditLogger);

await service.updateSensitivity(
  'note-my-note-001',
  'tenant-123',
  SensitivityLevel.CONFIDENTIAL,
  'user-456',
  'Contains sensitive project information'
);
```

### Get Effective Sensitivity (with inheritance)

```typescript
const config = await service.getEffectiveSensitivity(
  'note-my-note-001',
  'tenant-123'
);

console.log(config.level);           // 'confidential'
console.log(config.inherited_from);  // 'project-secret-project-001' (if inherited)
console.log(config.permissions);     // { cloud_ai_allowed: false, ... }
```

### Filter Content Before AI Processing

```typescript
import { SensitivityFilter } from '@sbf/privacy-engine';

const filter = new SensitivityFilter(sensitivityService);

const result = await filter.filterForAI(
  contextItems,
  'tenant-123',
  'cloud'  // or 'local'
);

if (result.blocked.length > 0) {
  console.warn(result.warning);
}

// Use only allowed items
await aiService.process(result.allowed);
```

## Security-Critical Notes

🔴 **CRITICAL**: Content marked as `secret` MUST NEVER be processed by ANY AI (cloud or local).

🔴 **CRITICAL**: Sensitivity metadata itself should not be exposed to cloud AI services.

🔴 **CRITICAL**: All AI access attempts must be logged in the audit trail.

## PRD Requirements

| Requirement | Description | Implementation |
|-------------|-------------|----------------|
| FR6/FR15 | Tiered sensitivity | `SensitivityLevel` enum |
| FR16 | Default "personal" | `getDefaultConfig()` |
| FR17 | Inheritance | `InheritanceResolver` |
| FR7/FR18 | Context permissions | `ContextPermissions` interface |
| FR19 | Secret blocking | `AIAccessControl.checkAccess()` |
| NFR10 | Metadata protection | Stripped before cloud AI calls |

## Related Packages

- `@sbf/entity-framework` - Entity management
- `@sbf/domain-base` - Base domain patterns
- `@sbf/errors` - Error handling

## License

MIT
