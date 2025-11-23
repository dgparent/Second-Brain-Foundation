# Documentation Cleanup Plan

**Created:** 2025-11-21  
**Status:** 🎯 IN PROGRESS  
**Goal:** Organize, archive, and update all project documentation

---

## Executive Summary

After completing the holistic refactor (95% complete, production-ready), we need to:
1. **Archive** deprecated/session-specific documents
2. **Update** core documentation with current status
3. **Consolidate** duplicate/overlapping documents
4. **Create** missing critical documents
5. **Organize** documentation for easy discovery

---

## Current State Analysis

### Root Directory (34 markdown files)
- **Core Docs (Keep & Update):** 8 files
- **Session Reports (Archive):** 15 files
- **Deprecated/Old (Archive):** 7 files
- **Status Reports (Consolidate):** 4 files

### docs/ Directory
- **Organized subdirectories:** 01-overview through 08-archive
- **Recent additions:** Framework guides, module strategies
- **Archive exists:** docs/08-archive with subdirectories

---

## Cleanup Strategy

### Phase 1: Archive Session-Specific Documents ✅

**Move to:** `docs/08-archive/sessions/`

Session reports (chronological, completed):
- END-OF-SESSION-2025-11-21.md
- REFACTOR-SESSION-2025-11-20.md
- REFACTOR-SESSION-2025-11-21.md
- REFACTOR-SESSION-SUMMARY-OLD.md
- REFACTOR-STATUS-2025-11-21.md
- SESSION-COMPLETE.md
- SESSION-SUMMARY-2025-11-21-TASK-MGMT.md
- SESSION-SUMMARY-CI-CD.md
- PROJECT-STATUS-2025-11-21.md

Build/status snapshots (point-in-time):
- BUILD-SYSTEM-FIX.md
- IMPLEMENTATION-STATUS.md (snapshot from Nov 20)
- NEXT-STEPS.md (Nov 20 - now superseded)

### Phase 2: Archive Completion Reports ✅

**Move to:** `docs/08-archive/phases/`

Phase completion documents:
- PHASE-3-COMPLETE.md (VA module)
- PHASE-7-COMPLETE.md (CI/CD)
- TASK-MANAGEMENT-COMPLETE.md
- MISSION-ACCOMPLISHED.md
- PROJECT-COMPLETE.md

### Phase 3: Archive Deprecated Documents ✅

**Move to:** `docs/08-archive/deprecated/`

Old/superseded versions:
- CONTRIBUTING-old.md (superseded by CONTRIBUTING.md)
- README-v3.md (old version)
- README-VA-SUITE.md (integrated into main system)
- README-QUICK-REFERENCE.md (outdated)

### Phase 4: Update Core Documents 📝

**Keep in root, update content:**

1. **README.md** - Main project overview
   - ✅ Update status to 95% complete
   - ✅ Reference new frameworks/modules
   - ✅ Update roadmap with CI/CD completion

2. **CONTRIBUTING.md** - Contribution guidelines
   - ✅ Update with current build process
   - ✅ Add module development workflow
   - ✅ Reference framework development

3. **START-HERE.md** - Quick orientation
   - ✅ Update with current project status
   - ✅ Link to key documents
   - ✅ Clear next steps

4. **QUICK-START.md** - Setup guide
   - ✅ Update with current commands
   - ✅ Add marketplace usage
   - ✅ Include desktop app (when ready)

5. **HOLISTIC-REFACTOR-PLAN.md** - Master plan
   - ✅ Mark phases 1-7 complete
   - ✅ Update metrics
   - ✅ Add final status

6. **WORKFLOWS.md** - Workflow documentation
   - ✅ Update with new frameworks
   - ✅ Add module examples
   - ✅ Include CI/CD workflows

7. **ENVIRONMENT-SETUP.md** - Development setup
   - ✅ Update prerequisites
   - ✅ Add ArangoDB setup
   - ✅ Include Ollama instructions

8. **DEPLOYMENT.md** - Deployment guide
   - ✅ Update with CI/CD pipeline
   - ✅ Add npm publishing process
   - ✅ Include desktop app distribution

### Phase 5: Consolidate Status Documents 📝

**Create single source of truth:**

1. **PROJECT-STATUS.md** (Update existing)
   - Merge content from PROJECT-STATUS-2025-11-21.md
   - Add completion metrics
   - Current state of all phases
   - Next steps and roadmap

2. Archive dated versions:
   - PROJECT-STATUS-2025-11-21.md → docs/08-archive/sessions/

### Phase 6: Create Missing Documents 📝

**New documents needed:**

1. **ARCHITECTURE.md** (root)
   - High-level architecture overview
   - Link to detailed docs in docs/03-architecture/
   - System diagram reference

2. **TESTING.md** (root)
   - Testing strategy
   - How to run tests
   - CI/CD test coverage

3. **module-DEVELOPMENT.md** (root)
   - Quick guide to building modules
   - Link to detailed guides in docs/
   - Examples and templates

### Phase 7: Update Documentation Index 📝

**Update DOCUMENTATION-INDEX.md:**
- Remove archived documents
- Add new documents
- Update organization
- Improve navigation

### Phase 8: Update docs/ Subdirectories 📝

**docs/01-overview/**
- Update project-status.md with current info
- Update project-brief.md if needed

**docs/06-guides/**
- Ensure all guides reference current architecture
- Add module development guide
- Add marketplace guide

**docs/07-reference/**
- Add quick reference cards for frameworks
- module API reference
- CLI commands reference

---

## File Organization Matrix

### Keep in Root (Active Documents)
```
README.md                    # Main project overview
CONTRIBUTING.md              # How to contribute
START-HERE.md                # Quickstart orientation
QUICK-START.md               # Setup guide
HOLISTIC-REFACTOR-PLAN.md    # Master refactor plan
WORKFLOWS.md                 # Workflow documentation
ENVIRONMENT-SETUP.md         # Development setup
DEPLOYMENT.md                # Deployment guide
PROJECT-STATUS.md            # Current status
DOCUMENTATION-INDEX.md       # Documentation map
QUICK-REFERENCE.md           # Quick reference
TASK-FRAMEWORK-QUICK-REF.md  # Task framework reference
VA-usecase-instructions.md   # VA use case documentation
LICENSE                      # License file
```

### Archive Session Reports
```
docs/08-archive/sessions/
├── END-OF-SESSION-2025-11-21.md
├── REFACTOR-SESSION-2025-11-20.md
├── REFACTOR-SESSION-2025-11-21.md
├── REFACTOR-SESSION-SUMMARY-OLD.md
├── REFACTOR-STATUS-2025-11-21.md
├── SESSION-COMPLETE.md
├── SESSION-SUMMARY-2025-11-21-TASK-MGMT.md
├── SESSION-SUMMARY-CI-CD.md
├── PROJECT-STATUS-2025-11-21.md
├── BUILD-SYSTEM-FIX.md
├── IMPLEMENTATION-STATUS.md
└── NEXT-STEPS.md
```

### Archive Phase Completions
```
docs/08-archive/phases/
├── PHASE-3-COMPLETE.md
├── PHASE-7-COMPLETE.md
├── TASK-MANAGEMENT-COMPLETE.md
├── MISSION-ACCOMPLISHED.md
└── PROJECT-COMPLETE.md
```

### Archive Deprecated
```
docs/08-archive/deprecated/
├── CONTRIBUTING-old.md
├── README-v3.md
├── README-VA-SUITE.md
└── README-QUICK-REFERENCE.md
```

---

## Execution Checklist

### Phase 1: Archive Session Documents ✅
- [ ] Create docs/08-archive/sessions/ if not exists
- [ ] Move 12 session-specific documents
- [ ] Create README.md in sessions directory

### Phase 2: Archive Completion Reports ✅
- [ ] Verify docs/08-archive/phases/ exists
- [ ] Move 5 phase completion documents
- [ ] Update phases README.md

### Phase 3: Archive Deprecated ✅
- [ ] Verify docs/08-archive/deprecated/ exists
- [ ] Move 4 deprecated documents
- [ ] Create README.md in deprecated directory

### Phase 4: Update Core Documents 📝
- [ ] Update README.md (status, roadmap, features)
- [ ] Update CONTRIBUTING.md (workflow, module dev)
- [ ] Update START-HERE.md (current status, links)
- [ ] Update QUICK-START.md (commands, marketplace)
- [ ] Update HOLISTIC-REFACTOR-PLAN.md (completion)
- [ ] Update WORKFLOWS.md (new frameworks)
- [ ] Update ENVIRONMENT-SETUP.md (ArangoDB, Ollama)
- [ ] Update DEPLOYMENT.md (CI/CD, publishing)

### Phase 5: Consolidate Status 📝
- [ ] Update PROJECT-STATUS.md with current metrics
- [ ] Add completion summary
- [ ] Archive dated version

### Phase 6: Create Missing Docs 📝
- [ ] Create ARCHITECTURE.md
- [ ] Create TESTING.md
- [ ] Create module-DEVELOPMENT.md

### Phase 7: Update Index 📝
- [ ] Update DOCUMENTATION-INDEX.md
- [ ] Add navigation improvements
- [ ] Update quick links

### Phase 8: Update docs/ 📝
- [ ] Review docs/01-overview/
- [ ] Update docs/06-guides/
- [ ] Enhance docs/07-reference/

---

## Success Criteria

✅ **Organization:**
- All session reports archived
- Deprecated docs archived
- Clear separation of active vs historical

✅ **Currency:**
- All active docs reflect current state (95% complete)
- No outdated status information
- Accurate roadmap

✅ **Discoverability:**
- Clear documentation index
- Easy navigation
- Logical grouping

✅ **Completeness:**
- No missing critical documents
- All aspects documented
- Clear contribution path

---

## Timeline

**Estimated Time:** 2-3 hours

1. **Archiving (30 mins):** Move files, create READMEs
2. **Core Updates (60 mins):** Update 8 core documents
3. **New Docs (45 mins):** Create 3 new documents
4. **Index Update (15 mins):** Update navigation

---

## Next Session

After cleanup:
1. **Code review** - Review key packages for quality
2. **Test coverage** - Add comprehensive tests
3. **Video tutorial** - Create walkthrough
4. **Community launch** - Prepare for public release

---

**Status:** 🎯 Ready to Execute  
**Owner:** BMad Orchestrator  
**Updated:** 2025-11-21
