# Phase 2 Execution Started

**Date:** 2025-11-24
**Objective:** Implement Cloud Core & Sync API (Node + Neon)

## Current Situation

### Build System Issues
- TypeScript dependencies not properly installed workspace-wide  
- Old @sbf packages have circular dependencies
- Some packages reference archived @sbf/memory-engine

### Strategy Shift

Instead of fixing all old @sbf packages (which were being replaced anyway), we'll:

1. **Focus on Core Domain & API** - These are the new architecture
2. **Implement Sync Endpoints** in `apps/api`  
3. **Use core-domain types** (already have truth hierarchy implemented)
4. **Defer old @sbf package fixes** until actually needed

## Phase 2 Tasks

### 2.1 Fix Build System ✅ IN PROGRESS
- [x] Identified TypeScript not globally available
- [x] Found circular dependency issues in old @sbf packages
- [ ] Install TypeScript properly
- [ ] Fix core packages (core-domain, db-client, vector-client)
- [ ] Get apps/api compiling

### 2.2 Implement /sync/push
- [ ] Create sync controller in apps/api
- [ ] Implement SyncItem[] acceptance
- [ ] Add conflict resolution logic (using core-domain)
- [ ] Store in Neon with truth-aware repository

### 2.3 Implement /sync/pull  
- [ ] Create pull endpoint
- [ ] Return changes since version/timestamp
- [ ] Apply tenant isolation
- [ ] Cloud suggestions appear as drafts for local-first tenants

### 2.4 Sync Event Logging
- [ ] Add sync_events table migration
- [ ] Log all conflicts
- [ ] Include truth-level metadata

### 2.5 Encryption Layer (Incremental)
- [ ] Add content_encrypted field
- [ ] Add encryption_metadata field
- [ ] Implement for local_first vault mode

## Next Actions

1. Install TypeScript workspace-wide properly
2. Build core-domain, db-client, vector-client
3. Build apps/api
4. Implement sync routes
