# Second Brain Foundation - Repository Cleanup Master Plan

**Created:** 2025-11-20  
**Orchestrator:** BMad Orchestrator 🎭  
**Mode:** YOLO (Skip confirmations)  
**Objective:** Comprehensive repository cleanup - documentation organization + code refactoring

---

## Executive Summary

**Current State:**
- 24 phase/status markdown files scattered in root
- 3,924 TypeScript files across packages
- Multiple documentation folders with unclear organization
- Potential code complexity issues (spaghetti code)

**Target State:**
- Clean root directory (3-5 essential docs only)
- Well-organized archive structure
- Documented code quality baseline
- Refactoring roadmap for complex code

**Estimated Duration:** 2-4 hours total
- Phase 1: 20-30 minutes (Documentation Audit)
- Phase 2: 15-20 minutes (Documentation Migration)
- Phase 3: 30-45 minutes (Code Audit)
- Phase 4: 60-120 minutes (Code Refactoring)
- Phase 5: 15-20 minutes (Final Verification)

---

## Phase 1: Documentation Audit & Classification

**Agent:** Quinn (QA)  
**Duration:** 20-30 minutes  
**Mode:** YOLO (auto-execute)

### Objectives
1. Audit all 24 root markdown files
2. Classify each document (active, archive, duplicate, stale)
3. Create migration plan with destinations
4. Identify cross-reference updates needed

### Tasks

#### Task 1.1: Inventory Root Documentation
**Action:** Scan and categorize all .md files in root
**Output:** Classification table

Categories:
- **KEEP** - Essential, active reference (README, CONTRIBUTING, LICENSE)
- **ARCHIVE-PHASE** - Phase completion reports → `docs/08-archive/phases/`
- **ARCHIVE-SESSION** - Status reports → `docs/08-archive/sessions/`
- **ARCHIVE-RESEARCH** - Analysis docs → `docs/05-research/`
- **CONSOLIDATE** - Merge with existing docs
- **DELETE** - Truly obsolete/duplicate

#### Task 1.2: Create Migration Matrix
**Action:** Map each file to destination
**Output:** Migration checklist with file operations

Format:
```
SOURCE → DESTINATION | REASON | CROSS-REFS TO UPDATE
```

#### Task 1.3: Identify Stale References
**Action:** Find broken/outdated links in remaining docs
**Output:** Link update checklist

#### Task 1.4: Generate Phase 1 Report
**Action:** Consolidate findings
**Output:** `CLEANUP-PHASE-1-DOCUMENTATION-AUDIT.md`

**Deliverables:**
- [ ] Classification table (24 files categorized)
- [ ] Migration matrix (source → destination mapping)
- [ ] Cross-reference update list
- [ ] Phase 1 audit report

---

## Phase 2: Documentation Migration

**Agent:** Manual execution (with checklist from Phase 1)  
**Duration:** 15-20 minutes  
**Mode:** YOLO (batch operations)

### Objectives
1. Execute migration plan from Phase 1
2. Update all cross-references
3. Verify archive structure
4. Update root README if needed

### Tasks

#### Task 2.1: Create Archive Directories
**Action:** Ensure target directories exist
```bash
mkdir -p docs/08-archive/phases/
mkdir -p docs/08-archive/sessions/
mkdir -p docs/08-archive/technical/
```

#### Task 2.2: Execute File Migrations
**Action:** Move files according to migration matrix
**Method:** Git mv (preserves history)

Example:
```bash
git mv PHASE-1-UX-COMPLETE.md docs/08-archive/phases/
git mv EXECUTIVE-STATUS-REPORT.md docs/08-archive/sessions/
```

#### Task 2.3: Update Cross-References
**Action:** Update all remaining docs with new paths
**Files to update:** README.md, DOCUMENTATION-INDEX.md, docs/README.md

#### Task 2.4: Commit Migration
**Action:** Single atomic commit
```bash
git commit -m "refactor(docs): migrate phase/status docs to archive structure"
```

**Deliverables:**
- [ ] All phase docs moved to `docs/08-archive/phases/`
- [ ] All status docs moved to `docs/08-archive/sessions/`
- [ ] Cross-references updated
- [ ] Migration committed to git
- [ ] Root directory cleaned (3-5 docs remaining)

---

## Phase 3: Code Quality Audit

**Agent:** Quinn (QA)  
**Duration:** 30-45 minutes  
**Mode:** YOLO (comprehensive scan)

### Objectives
1. Measure code complexity across all packages
2. Identify spaghetti code patterns
3. Find duplicate code
4. Flag refactoring priorities

### Tasks

#### Task 3.1: Complexity Analysis
**Action:** Scan TypeScript files for metrics
**Metrics:**
- Cyclomatic complexity (threshold: >10 = flag, >20 = critical)
- Lines of Code per class (threshold: >300 = flag, >500 = critical)
- Method length (threshold: >50 = flag, >100 = critical)
- Nesting depth (threshold: >4 = flag, >6 = critical)

**Method:** Use static analysis or manual inspection of key files

**Output:** Complexity report table

#### Task 3.2: Spaghetti Code Detection
**Action:** Identify anti-patterns
**Patterns to find:**
- God classes (doing too much)
- Long parameter lists (>5 params)
- Deep nesting (>4 levels)
- Tight coupling (excessive dependencies)
- Magic numbers/strings
- Lack of error handling

**Output:** Anti-pattern inventory

#### Task 3.3: Duplicate Code Analysis
**Action:** Find copy-paste code across packages
**Focus areas:**
- Utility functions duplicated
- Similar business logic
- Repeated validation patterns
- Copy-paste components

**Output:** Deduplication opportunities list

#### Task 3.4: Prioritize Refactoring Targets
**Action:** Rank files by refactoring urgency
**Criteria:**
- Complexity score (high = urgent)
- Change frequency (frequently changed + complex = critical)
- Test coverage (untested + complex = high risk)
- Business criticality (core logic = priority)

**Output:** Refactoring priority matrix

#### Task 3.5: Generate Phase 3 Report
**Action:** Consolidate code quality findings
**Output:** `CLEANUP-PHASE-3-CODE-QUALITY-AUDIT.md`

**Deliverables:**
- [ ] Complexity metrics report
- [ ] Spaghetti code inventory
- [ ] Duplicate code list
- [ ] Refactoring priority matrix (top 10 targets)
- [ ] Phase 3 audit report

---

## Phase 4: Code Refactoring

**Agent:** Developer (Manual) with QA oversight  
**Duration:** 60-120 minutes  
**Mode:** Iterative (one target at a time)

### Objectives
1. Refactor top priority targets from Phase 3
2. Extract reusable utilities
3. Apply SOLID principles
4. Add unit tests for refactored code

### Tasks

#### Task 4.1: Setup Refactoring Branch
**Action:** Create feature branch
```bash
git checkout -b refactor/code-cleanup-phase-4
```

#### Task 4.2: Refactor Priority Targets (Top 5)
**Action:** Refactor one class/module at a time
**Process per target:**
1. Review complexity report
2. Identify single responsibility violations
3. Extract methods/classes
4. Apply design patterns (Strategy, Factory, etc.)
5. Add/update tests
6. Commit

**Example commit:**
```bash
git commit -m "refactor(core): split EntityManager into CRUD + Validation"
```

#### Task 4.3: Extract Common Utilities
**Action:** Create shared utility modules
**Targets:**
- Validation helpers
- Error handling utilities
- Type guards
- Formatting functions

**Output:** New `utils/` folders in packages

#### Task 4.4: Update Documentation
**Action:** Document refactored code
- Add JSDoc comments
- Update architecture docs
- Note breaking changes (if any)

#### Task 4.5: Run Tests & Quality Checks
**Action:** Ensure refactoring didn't break functionality
```bash
pnpm test
pnpm lint
pnpm type-check
```

**Deliverables:**
- [ ] Top 5 complex classes refactored
- [ ] Utilities extracted to shared modules
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Refactoring committed

---

## Phase 5: Final Verification

**Agent:** Quinn (QA)  
**Duration:** 15-20 minutes  
**Mode:** YOLO (validation)

### Objectives
1. Verify documentation organization
2. Re-measure code quality
3. Check for broken links
4. Create maintenance guidelines

### Tasks

#### Task 5.1: Documentation Verification
**Action:** Verify cleanup objectives met
**Checks:**
- [ ] Root has ≤5 markdown files
- [ ] All archives properly organized
- [ ] No broken links in active docs
- [ ] DOCUMENTATION-INDEX.md updated

#### Task 5.2: Code Quality Re-Measurement
**Action:** Re-run metrics from Phase 3
**Compare:**
- Complexity scores (before vs. after)
- Number of flagged files (reduction %)
- Test coverage (improvement)

**Output:** Quality improvement report

#### Task 5.3: Create Maintenance Guidelines
**Action:** Document ongoing quality practices
**Content:**
- Complexity thresholds (when to refactor)
- Documentation filing rules
- Code review checklist
- Automated quality gates (future)

**Output:** `MAINTENANCE-GUIDELINES.md`

#### Task 5.4: Final Quality Gate Decision
**Action:** Issue final QA verdict
**Criteria:**
- ✅ PASS: All objectives met, no blockers
- 🟡 PASS WITH CONCERNS: Met objectives, minor issues remain
- ⚠️ CONCERNS: Met objectives, follow-up work needed
- ❌ FAIL: Did not meet cleanup objectives

**Output:** `CLEANUP-PHASE-5-FINAL-REPORT.md`

**Deliverables:**
- [ ] Documentation verification complete
- [ ] Code quality improvement measured
- [ ] Maintenance guidelines created
- [ ] Final quality gate decision
- [ ] Phase 5 report generated

---

## Success Criteria

### Documentation Organization ✅
- [x] Root directory has ≤5 essential markdown files
- [x] Phase completion docs archived to `docs/08-archive/phases/`
- [x] Status reports archived to `docs/08-archive/sessions/`
- [x] All active docs have updated cross-references
- [x] DOCUMENTATION-INDEX.md reflects new structure

### Code Quality ✅
- [x] Top 5 complex classes refactored
- [x] Complexity metrics improved by ≥20%
- [x] Duplicate code reduced
- [x] Utilities extracted to shared modules
- [x] Tests passing after refactoring

### Process ✅
- [x] All phases completed
- [x] Quality gate issued (PASS/CONCERNS)
- [x] Maintenance guidelines documented
- [x] Git history clean (meaningful commits)

---

## Risk Assessment

### Low Risk
- **Documentation migration** - Non-breaking, easily reversible
- **Code metrics collection** - Read-only analysis

### Medium Risk
- **Cross-reference updates** - May miss some links
- **Mitigation:** Automated link checker in Phase 5

### High Risk
- **Code refactoring** - May introduce bugs
- **Mitigation:** 
  - Tests before/after refactoring
  - One target at a time
  - Feature branch (can be reverted)
  - QA oversight throughout

---

## Rollback Plan

If cleanup causes issues:

### Documentation Rollback
```bash
git revert <commit-hash>  # Revert migration commit
```

### Code Rollback
```bash
git checkout main
git branch -D refactor/code-cleanup-phase-4
```

### Partial Acceptance
- Keep documentation cleanup
- Defer code refactoring to future sprint

---

## Execution Timeline

### Immediate (Now)
- **Phase 1:** Quinn executes documentation audit (20-30 min)

### Session 1 (Same day)
- **Phase 2:** Execute documentation migration (15-20 min)
- **Phase 3:** Quinn executes code quality audit (30-45 min)

### Session 2 (Next day or later)
- **Phase 4:** Developer executes code refactoring (60-120 min)
- **Phase 5:** Quinn executes final verification (15-20 min)

**Total Time:** 2-4 hours across 1-2 sessions

---

## Agent Transformation Sequence

1. **BMad Orchestrator** (current) → Create this plan ✅
2. **Transform to Quinn** → Execute Phase 1 (next)
3. **Return to Orchestrator** → Coordinate Phase 2
4. **Transform to Quinn** → Execute Phase 3
5. **Developer mode** → Execute Phase 4
6. **Transform to Quinn** → Execute Phase 5
7. **Return to Orchestrator** → Final summary

---

## Approval & Next Steps

**Plan Status:** ✅ READY FOR EXECUTION  
**Mode:** YOLO (skip confirmations)  
**First Action:** Transform into Quinn and execute Phase 1

---

**Created by:** BMad Orchestrator 🎭  
**Approved by:** User (YOLO mode)  
**Start Time:** 2025-11-20T00:11:47Z  
**Estimated Completion:** 2025-11-20 (same day for Phases 1-3)
