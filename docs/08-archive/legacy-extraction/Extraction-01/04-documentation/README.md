# 04-documentation - Historical Backups & Removed Code

**Path:** `Extraction-01/04-documentation/`  
**Purpose:** Archive of removed stub code and deprecated documentation  
**Status:** 📦 Archive (Reference Only)  
**Last Updated:** 2025-11-14

---

## Overview

This folder contains **historical backups** of code and documentation that were removed during the refactoring session on 2025-11-14. The contents are **reference-only** and should NOT be used in active development.

**Purpose:** Preserve removed code for future reference if patterns are needed.

---

## Contents

### removed-stubs/ (8 files)
**Created:** 2025-11-14  
**Context:** Refactoring session removed stub implementations that were placeholders

**Files:**
- `entity-manager-stub.ts.bak` - Placeholder entity manager (replaced by EntityFileManager)
- `frontmatter.ts.bak` - Stub frontmatter parser (replaced by production version)
- `indexer.ts.bak` - Stub search indexer (deferred to future phase)
- `lifecycle-engine.ts.bak` - Stub 48-hour lifecycle (deferred to future phase)
- `privacy-controller.ts.bak` - Stub privacy enforcement (deferred to future phase)
- `vault-original.ts.bak` - Original monolithic Vault class (refactored into 3 classes)
- `README-old.md.bak` - Outdated README (replaced by current version)
- `README.md` - Index of removed stubs (this file)

---

## Why These Were Removed

### 1. Stub Implementations (5 files)
**Reason:** Non-functional placeholders blocking progress

These files contained skeleton code with `TODO` comments but no actual implementation:
- `entity-manager-stub.ts` → Replaced by `EntityFileManager.ts` (277 LOC, production-ready)
- `frontmatter.ts` → Replaced by production gray-matter integration
- `indexer.ts` → Deferred to Phase 2 (will use fuse.js)
- `lifecycle-engine.ts` → Deferred to Phase 2 (48-hour memory evolution)
- `privacy-controller.ts` → Deferred to Phase 2 (sensitivity enforcement)

**Impact:** Removing stubs clarified what exists vs. what's planned, reducing confusion.

---

### 2. Monolithic Vault Class
**Reason:** Too complex, hard to test, violated single responsibility principle

`vault-original.ts` was a 500+ LOC class doing:
- File system operations
- Entity CRUD
- Relationship management
- Search indexing
- Privacy enforcement

**Refactored into:**
- `VaultCore.ts` - Core file operations
- `VaultFiles.ts` - Entity file management
- `Vault.ts` - High-level orchestration
- `EntityFileManager.ts` - Entity-specific operations

**Impact:** Reduced max class size from 500 LOC → 240 LOC (54% reduction)

---

### 3. Outdated Documentation
**Reason:** Information was stale and contradicted current implementation

`README-old.md` referenced the monolithic architecture and stub modules that no longer existed.

**Replaced by:** Current README.md with accurate status and metrics.

---

## Refactoring Context

### Refactoring Session (2025-11-14)
**Goal:** Convert stubs to working implementations or remove them  
**Outcome:**
- ✅ 4 stub modules removed (not needed yet)
- ✅ 1 stub replaced with production code (EntityFileManager)
- ✅ 1 monolithic class split into 3 focused classes
- ✅ Documentation updated to reflect reality

**Report:** [../REFACTORING-SUMMARY.md](../REFACTORING-SUMMARY.md)

---

## Should I Use Code From This Folder?

### ❌ Do NOT Use:
- **Stubs** - They are incomplete and non-functional
- **vault-original.ts** - It was refactored for good reasons
- **README-old.md** - Information is outdated

### ✅ Safe to Reference:
- **Vault patterns** - If you need to understand the original monolithic approach
- **Interface definitions** - If they inform future implementations
- **README-old.md** - To understand historical project context

---

## Relationship to Other Folders

| Folder | Purpose | Status |
|--------|---------|--------|
| `00-archive/` | Completed phase reports | ✅ Active reference |
| `00-analysis/` | Library analysis | ✅ Active reference |
| `01-extracted-raw/` | Raw library code | ✅ Active reference |
| `02-refactored/` | Intermediate step | ⚠️ Empty (step skipped) |
| `03-integration/` | Production code | ✅ Active development |
| **`04-documentation/`** | **Removed code backups** | 📦 **Archive only** |

---

## Archive Policy

### Retention
Files in this folder are kept for:
- **Historical reference** - Understanding past decisions
- **Pattern recovery** - If a pattern is needed later
- **Audit trail** - Demonstrating refactoring progression

### Cleanup
This folder may be deleted after:
- 6 months of stable production (2025-05-14+)
- Migration to formal version control tags
- Confirmation no patterns are needed

---

## Future Use

If you need to reference removed code:

1. **Check git history first** - More reliable than backups
2. **Read refactoring reports** - Understand why code was removed
3. **Consider alternatives** - The replacement is usually better
4. **Don't copy directly** - Use as inspiration, not source

---

## Related Documentation

- **Refactoring Summary:** [../REFACTORING-SUMMARY.md](../REFACTORING-SUMMARY.md)
- **Refactoring Log:** [../REFACTORING-LOG.md](../REFACTORING-LOG.md)
- **Code Audit:** [../CODE-AUDIT-REPORT.md](../CODE-AUDIT-REPORT.md)
- **Current Status:** [../STATUS.md](../STATUS.md)

---

**Archive Created:** 2025-11-14  
**Context:** Post-refactoring backup  
**Status:** Deprecated - Reference Only  
**Maintainer:** None (archived)
