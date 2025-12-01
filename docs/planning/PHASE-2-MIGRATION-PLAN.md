# Phase 2 Migration Plan: Core Domain to Modular Core

**Date:** November 25, 2025
**Status:** In Progress

## 🎯 Objective
Migrate all logic from the monolithic `packages/core-domain` to the modular `packages/@sbf/core/*` packages, specifically `entity-manager`.

## 🔄 Migration Steps

### 1. Entity Manager Migration (Complete)
- [x] **Types:** Ported `Entity`, `CreateEntityInput`, etc. to `@sbf/core/entity-manager/src/types.ts`.
- [x] **Validation:** Ported `EntityService` validation logic to `@sbf/core/entity-manager/src/validation.ts` (renamed to `EntityValidator`).
- [x] **Build:** Successfully built `@sbf/core-entity-manager` and `@sbf/shared`.

### 2. API Update (In Progress)
- [x] Update `apps/api/package.json` to depend on `@sbf/core-entity-manager`.
- [x] Update `apps/api/src/controllers/entities.controller.ts` to import from `@sbf/core-entity-manager`.
- [ ] Update `apps/api/src/controllers/tasks.controller.ts` to remove `@sbf/core-domain`.
- [ ] Update `apps/api/src/controllers/sync.controller.ts` to remove `@sbf/core-domain`.
- [ ] Update `apps/api/src/middleware/tenant-context.ts` to remove `@sbf/core-domain`.
- [ ] Fix `@sbf/logging` resolution in API.

### 3. Cleanup (Pending)
- [ ] Delete `packages/core-domain`.

## ⚠️ Critical Notes
- The existing `EntityManager` class in `@sbf/core/entity-manager` is an **in-memory implementation**.
- The `apps/api` uses `@sbf/db-client` for persistence.
- **Decision:** For now, we are only migrating *Types* and *Validation* to `@sbf/core/entity-manager` to replace `core-domain`. We are *not* yet replacing `@sbf/db-client` usage in the API.
- **Future:** We should evolve `EntityManager` to wrap `@sbf/db-client` so the API doesn't need to talk to the DB client directly.

