# Refactor Plan: Consolidation & Cleanup
**Date:** November 25, 2025
**Status:** Draft
**Author:** BMad Orchestrator

## 🎯 Executive Summary
The repository is in a transitional state between a monolithic "core-domain" and a modular "packages/@sbf" structure. To achieve the "Multi-Tenant Platform" vision, we must complete the migration, clean up legacy artifacts, and standardize the application layer.

## 🔍 Findings

### 1. Core Split-Brain
*   **Issue:** Logic exists in both `packages/core-domain` (active, used by API) and `packages/@sbf/core` (new, modular).
*   **Impact:** Duplication of entity logic, confusion on where to add new features.
*   **Recommendation:** 
    *   Migrate all services/entities from `core-domain` to `@sbf/core/entity-manager`, `@sbf/core/privacy`, etc.
    *   Update `apps/api` to depend on the granular packages.
    *   Delete `packages/core-domain`.

### 2. Libraries Folder Bloat
*   **Issue:** The `libraries` folder contains a mix of:
    *   Active infrastructure (Superset, Grafana).
    *   Legacy frameworks (Legal Ops, Construction Ops) not yet migrated.
    *   Deprecated tools (listed in `libraries-to-delete.txt`).
*   **Impact:** confusing repository root, large checkout size.
*   **Recommendation:**
    *   **Delete:** Items in `libraries-to-delete.txt`.
    *   **Archive:** Move non-migrated "ops frameworks" to `docs/08-archive/legacy-extraction` or a dedicated `legacy/` folder.
    *   **Relocate:** Move active infra tools (Superset, etc.) to `infra/` or `tools/`.

### 3. Application Structure
*   **Issue:** `aei-core` (Python) sits at the root, while other services are in `apps/`.
*   **Impact:** Inconsistent build/deploy processes.
*   **Recommendation:** Move `aei-core` to `apps/aei-service` (or similar) to unify the `apps/` directory.

## 📋 Action Plan

### Phase 1: Cleanup (Immediate)
1.  [x] Delete directories listed in `libraries/libraries-to-delete.txt`.
2.  [x] Move legacy "ops frameworks" from `libraries/` to `docs/08-archive/legacy-extraction/`.
3.  [x] Move `aei-core` to `apps/aei-core`.

### Phase 2: Core Migration (High Effort)
1.  [x] Audit `packages/core-domain` vs `packages/@sbf/core/entity-manager`.
2.  [x] Port `EntityService`, `TaskService`, etc., to the new module system.
3.  [x] Update `apps/api` package.json to replace `@sbf/core-domain` with new packages.
4.  [x] Verify `apps/api` builds.
5.  [x] Update `apps/workers`, `apps/notif-service`, `apps/iot-core`, `apps/auth-service` to remove `@sbf/core-domain`.
6.  [x] Delete `packages/core-domain`.

### Phase 3: Infrastructure Organization
1.  [ ] Move `libraries/superset`, `libraries/grafana`, etc., to `infra/analytics/`.
2.  [ ] Update `docker-compose.yml` paths.

## 🚀 Next Steps
Approve this plan to begin **Phase 1: Cleanup**.
