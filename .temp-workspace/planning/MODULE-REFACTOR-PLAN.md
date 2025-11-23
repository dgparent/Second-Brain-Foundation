# module → Module Refactor Plan

**DATE:** 2025-11-23  
**DECISION:** Rename "modules" to "modules" throughout codebase  
**APPROVED BY:** User

---

## 🎯 Objectives

1. Rename all "module" references to "module"
2. Update directory structure
3. Update package names and imports
4. Update documentation
5. Maintain full functionality
6. Single atomic commit

---

## 📋 Refactor Checklist

### Phase 1: Directory Structure (5 min)
- [ ] Rename `packages/@sbf/modules/` → `packages/@sbf/modules/`
- [ ] Update workspace paths in root `package.json`

### Phase 2: Core System Package (10 min)
- [ ] Rename `packages/@sbf/core/module-system/` → `packages/@sbf/core/module-system/`
- [ ] Update package.json name: `@sbf/core/module-system` → `@sbf/core/module-system`
- [ ] Update all imports in module-system source files
- [ ] Rename classes: `module` → `Module`, `PluginManager` → `ModuleManager`, etc.
- [ ] Update all exported types and interfaces

### Phase 3: Individual Modules (15 min)
Update package.json in each module:
- [ ] budgeting
- [ ] fitness-tracking
- [ ] learning-tracker
- [ ] personal-tasks
- [ ] relationship-crm
- [ ] va-dashboard
- [ ] highlights
- [ ] medication-tracking
- [ ] nutrition-tracking
- [ ] portfolio-tracking
- [ ] agriculture
- [ ] healthcare
- [ ] legal

Change:
- Package name: `@sbf/modules/X` → `@sbf/modules/X`
- Dependencies references
- Import statements in source files

### Phase 4: Framework & Core Packages (10 min)
Update imports in:
- [ ] `@sbf/frameworks/financial-tracking`
- [ ] `@sbf/frameworks/health-tracking`
- [ ] `@sbf/frameworks/knowledge-tracking`
- [ ] `@sbf/frameworks/relationship-tracking`
- [ ] `@sbf/frameworks/task-management`
- [ ] `@sbf/core/entity-manager`
- [ ] `@sbf/core/knowledge-graph`
- [ ] `@sbf/core/lifecycle-engine`
- [ ] `@sbf/shared`
- [ ] `@sbf/desktop`

### Phase 5: Registry & Scripts (5 min)
- [ ] Rename `module-registry.json` → `module-registry.json`
- [ ] Update `scripts/generate-module-registry.js` → `scripts/generate-module-registry.js`
- [ ] Update script content and all references
- [ ] Update package.json scripts

### Phase 6: Documentation (15 min)
- [ ] README.md - all "module" references
- [ ] CONTRIBUTING.md
- [ ] docs/README.md (was DOCUMENTATION-INDEX.md)
- [ ] docs/module-DEVELOPMENT-GUIDE.md → docs/MODULE-DEVELOPMENT-GUIDE.md
- [ ] docs/ subdirectories (architecture, implementation, etc.)
- [ ] All markdown files in .temp-workspace/

### Phase 7: Test Files (10 min)
- [ ] Update all test files with new imports
- [ ] Update test descriptions and assertions
- [ ] scripts/test-*.ts files

### Phase 8: Configuration Files (5 min)
- [ ] tsconfig files (if any module-specific paths)
- [ ] jest.config files
- [ ] Any .github/workflows/ CI files

### Phase 9: Build & Verify (10 min)
- [ ] Clean all build artifacts: `npm run clean`
- [ ] Rebuild: `npm run build`
- [ ] Run tests: `npm run test`
- [ ] Verify no TypeScript errors
- [ ] Check desktop app still works

### Phase 10: Git Commit (5 min)
- [ ] Stage all changes
- [ ] Commit with message: `refactor: rename modules to modules for better nomenclature`
- [ ] Verify commit includes all changes

---

## 🔍 Search/Replace Strategy

### Global Search Terms:
1. `module` → `module` (case-insensitive, whole word)
2. `module` → `Module` (class names, types)
3. `module` → `MODULE` (constants)
4. `modules` → `modules` (directories, plural)
5. `modules` → `Modules` (plural types)

### Exclude from search:
- `node_modules/`
- `dist/`
- `.git/`
- `*.log`

### Files to manually review:
- Any API contracts (if external dependencies)
- Any configuration that might be version-controlled elsewhere
- CHANGELOG or VERSION files

---

## 🎯 Key Replacements

### Directory Paths:
```
packages/@sbf/modules/ → packages/@sbf/modules/
packages/@sbf/core/module-system/ → packages/@sbf/core/module-system/
```

### Package Names:
```
@sbf/modules/budgeting → @sbf/modules/budgeting
@sbf/core/module-system → @sbf/core/module-system
```

### Class Names:
```
module → Module
PluginManager → ModuleManager
PluginRegistry → ModuleRegistry
PluginLoader → ModuleLoader
PluginMetadata → ModuleMetadata
IPlugin → IModule
```

### File Names:
```
module-registry.json → module-registry.json
generate-module-registry.js → generate-module-registry.js
module-DEVELOPMENT-GUIDE.md → MODULE-DEVELOPMENT-GUIDE.md
```

### Script Commands:
```
marketplace:list → marketplace:list (keep, just update internals)
registry:generate → registry:generate (keep, just update script name)
```

---

## ⚠️ Potential Gotchas

1. **Desktop App**: May have hardcoded "module" references in UI strings
2. **Registry Format**: Check if registry JSON has "module" as keys
3. **External Docs**: Any published documentation outside repo
4. **Git History**: Previous commits will still reference "modules" (acceptable)
5. **Breaking Changes**: This is a breaking change for any external users

---

## 📊 Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Directory Structure | 5 min |
| 2 | Core System Package | 10 min |
| 3 | Individual Modules | 15 min |
| 4 | Framework & Core Packages | 10 min |
| 5 | Registry & Scripts | 5 min |
| 6 | Documentation | 15 min |
| 7 | Test Files | 10 min |
| 8 | Configuration Files | 5 min |
| 9 | Build & Verify | 10 min |
| 10 | Git Commit | 5 min |
| **TOTAL** | | **90 min** |

---

## 🚀 Execution Approach

**Method 1: Automated (Recommended)**
1. Use VSCode global search/replace
2. Rename directories via file system
3. Update package.json files programmatically
4. Verify and build

**Method 2: Scripted**
1. Create bash/PowerShell script for bulk operations
2. Run script
3. Manual verification
4. Build and test

**Method 3: Manual**
- Not recommended (too error-prone)

---

## ✅ Success Criteria

- [ ] No TypeScript compilation errors
- [ ] All tests pass
- [ ] Build completes successfully
- [ ] `npm run test:va` works
- [ ] Desktop app launches
- [ ] No "module" references in code (except comments/history)
- [ ] All documentation updated
- [ ] Single clean git commit

---

**READY TO EXECUTE?**

Recommend starting with Phase 1 (directory rename) and working through systematically.
