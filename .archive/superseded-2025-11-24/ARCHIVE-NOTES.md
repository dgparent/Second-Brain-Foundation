# Archive Notes: Superseded SBF Folders

**Date:** November 24, 2025  
**Reason:** Holistic refactoring to microservices architecture  
**Status:** Superseded by new architecture

---

## Archived Folders

### 1. `packages/@sbf/automation/`

**Original Purpose:** ActivePieces and n8n workflow automation integration

**Contents:**
- `activepieces-piece/` - Custom ActivePieces integration
- `n8n-node/` - Custom n8n nodes for SBF
- `workflows/` - Predefined automation workflows

**Why Superseded:**
- Automation is now handled by `apps/workers/` with BullMQ
- Background job processing moved to dedicated worker service
- Workflow management integrated into core API

**Replacement:**
- `apps/workers/` - Background job processing with BullMQ
- `packages/core-domain/` - Domain logic for automations
- `apps/api/src/routes/automations.ts` - API endpoints for automation management

**Migration Notes:**
- Existing workflows can be imported via migration scripts
- n8n integration can be re-added as external integration if needed
- ActivePieces functionality replaced by native worker jobs

---

### 2. `packages/@sbf/modules/`

**Original Purpose:** Feature-specific domain modules

**Contents:**
- `agriculture/` - Agricultural domain module
- `analytics-dashboard/` - Dashboard functionality
- `budgeting/` - Financial budgeting
- `construction-ops/` - Construction operations
- `fitness-tracking/` - Fitness and health tracking
- `healthcare/` - Healthcare domain
- `highlights/` - Content highlighting
- `hospitality-ops/` - Hospitality operations
- `insurance-ops/` - Insurance operations
- `learning-tracker/` - Learning management
- `legal-ops/` - Legal operations
- `logistics-ops/` - Logistics management
- `manufacturing-ops/` - Manufacturing operations
- `medication-tracking/` - Medication tracking
- `nutrition-tracking/` - Nutrition tracking
- `personal-tasks/` - Personal task management
- `portfolio-tracking/` - Investment portfolio tracking
- `property-mgmt/` - Property management
- `relationship-crm/` - Relationship CRM
- `renewable-ops/` - Renewable energy operations
- `restaurant-haccp/` - Restaurant HACCP compliance
- `security-ops/` - Security operations
- `va-dashboard/` - Virtual assistant dashboard

**Why Superseded:**
- Moved to domain-specific logic in `packages/core-domain/`
- Entity-based approach replaces module-specific implementations
- Generic entity system with custom types replaces specialized modules

**Replacement:**
- `packages/core-domain/entities/` - Generic entity management
- `packages/core-domain/types/` - Entity type definitions
- `apps/api/src/controllers/` - Domain controllers
- Database entity types configured per tenant

**Migration Notes:**
- Each module's functionality can be recreated using entity types
- Custom business logic can be added via entity hooks/plugins
- Domain-specific features available through entity metadata

---

### 3. `packages/@sbf/memory-engine/`

**Original Purpose:** Knowledge graph and semantic search engine

**Contents:**
- `search/` - Search functionality
- `security/` - Security features
- `storage/` - Storage management
- `sync/` - Synchronization logic
- `tests/` - Unit tests

**Why Superseded:**
- Replaced by dedicated `packages/vector-client/`
- Knowledge graph moved to `packages/db-client/` with PostgreSQL
- Search functionality integrated into API service

**Replacement:**
- `packages/vector-client/` - Vector database integration (Pinecone/Qdrant)
- `packages/db-client/` - Knowledge graph in PostgreSQL
- `apps/llm-orchestrator/` - AI/LLM integration for semantic operations
- `packages/db-client/migrations/002_tenant_entities.sql` - Entity relationships table

**Migration Notes:**
- Existing knowledge graph data can be migrated to new schema
- Vector embeddings need to be regenerated for new vector DB
- Search indices will be rebuilt automatically

---

## Architecture Rationale

### Old Architecture Issues:
1. **Monolithic Structure:** Tightly coupled modules
2. **Desktop-Centric:** Not cloud-native
3. **Single-Tenant:** No isolation between users
4. **Limited Scalability:** Hard to scale specific components

### New Architecture Benefits:
1. **Microservices:** Independent, scalable services
2. **Multi-Tenant:** Complete tenant isolation with RLS
3. **Cloud-Native:** Deploy to Fly.io and Vercel
4. **Platform-Agnostic:** Support web, mobile, voice, IoT

---

## Data Migration Strategy

### For Existing Deployments:

**Step 1: Export Existing Data**
```bash
# Run data export script (if needed)
node scripts/export-legacy-data.js
```

**Step 2: Transform to New Schema**
```typescript
// Migration script will:
// 1. Create default tenant
// 2. Migrate entities to multi-tenant schema
// 3. Rebuild knowledge graph
// 4. Regenerate vector embeddings
```

**Step 3: Import to New System**
```bash
# Run migration
npm run migrate:legacy-data
```

---

## Reusable Components

Some components from archived folders may still be valuable:

### From `automation/`:
- Workflow templates can inform new BullMQ job designs
- Integration patterns useful for external service connectors

### From `modules/`:
- Domain-specific business logic can be extracted
- Entity type definitions for specialized industries
- UI components for specific use cases

### From `memory-engine/`:
- Search algorithms and ranking logic
- Security patterns for data access
- Sync strategies for offline-first approach

---

## Future Considerations

### If Functionality Needed:
1. Review archived code in `.archive/` folder
2. Extract reusable patterns
3. Adapt to new microservices architecture
4. Implement in appropriate service/package

### Restoration Process:
- Archived code remains available in `.archive/` folder
- Can be referenced for business logic
- Should not be restored as-is (use as reference only)

---

## Affected Package References

The following packages may have dependencies on archived folders:

**Update Required:**
- `packages/@sbf/desktop/` - If still in use, update imports
- `packages/@sbf/cli/` - Update module references
- Any custom scripts in `scripts/` folder

**Action Items:**
- [ ] Search codebase for imports from archived folders
- [ ] Update package.json dependencies
- [ ] Remove references in TypeScript configs
- [ ] Update documentation

---

## Testing Checklist

After archiving:
- [ ] Verify build succeeds: `npm run build`
- [ ] Check for broken imports: `npm run type-check`
- [ ] Run tests: `npm test`
- [ ] Verify services start: `npm run dev`

---

## Rollback Procedure

If needed to restore (NOT RECOMMENDED):

```bash
# Restore automation
mv .archive/superseded-2025-11-24/automation packages/@sbf/automation

# Restore modules
mv .archive/superseded-2025-11-24/modules packages/@sbf/modules

# Restore memory-engine
mv .archive/superseded-2025-11-24/memory-engine packages/@sbf/memory-engine
```

**Note:** Restoration should only be for reference. New architecture is the forward path.

---

## Summary

**Archived:** 3 major packages
**Reason:** Microservices refactoring
**Status:** Superseded by new cloud-native architecture
**Restoration:** Not recommended (use as reference only)

**Next Steps:**
- Continue with Phase 2 implementation
- Build out new microservices
- Implement entity-based domain model
- Complete multi-tenant infrastructure

---

**Archive Created:** November 24, 2025  
**Created By:** Automated refactoring process  
**Reference:** See HOLISTIC-REFACTORING-PLAN.md for full context
