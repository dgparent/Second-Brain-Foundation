# module Nomenclature Rebrand - Party Mode Analysis

**DATE:** 2025-11-23  
**TASK:** Find better terminology for framework-based use-case engines

---

## 🎭 Current Problem

**Term:** "module"  
**Issue:** Implies external, third-party tools that "plug into" the app  
**Reality:** These are **first-class use-case engines** built on domain frameworks

---

## 💡 10 Recommended Alternative Terms

### 1. **Module** ⭐⭐⭐⭐⭐
- **Pros:** Industry-standard, implies integral component, clean & professional
- **Cons:** Slightly generic, used heavily in other contexts
- **Vibe:** `@sbf/modules/budgeting`
- **Why it works:** Modules are self-contained, purpose-built components

### 2. **Application** (or "Apps") ⭐⭐⭐⭐⭐
- **Pros:** Clear user intent, familiar, suggests complete functionality
- **Cons:** None - very strong choice
- **Vibe:** `@sbf/apps/budgeting`
- **Why it works:** Each is a complete application for a specific use case

### 3. **Engine** ⭐⭐⭐⭐
- **Pros:** Powerful, suggests active processing, technical excellence
- **Cons:** Might sound overly technical
- **Vibe:** `@sbf/engines/budgeting`
- **Why it works:** Emphasizes the "use-case engine" nature

### 4. **Domain** ⭐⭐⭐
- **Pros:** DDD terminology, professional, clear scope
- **Cons:** Might conflict with "frameworks" being domain-based
- **Vibe:** `@sbf/domains/budgeting`
- **Why it works:** Each addresses a specific domain need

### 5. **Workspace** ⭐⭐⭐⭐
- **Pros:** Modern, implies dedicated work area, user-centric
- **Cons:** Could confuse with dev workspace concept
- **Vibe:** `@sbf/workspaces/budgeting`
- **Why it works:** Each is a workspace for specific tasks

### 6. **Suite** ⭐⭐⭐
- **Pros:** Professional, implies completeness
- **Cons:** Usually for collections, not individual items
- **Vibe:** `@sbf/suites/budgeting`
- **Why it works:** Each is a suite of capabilities for a use case

### 7. **Package** ⭐⭐
- **Pros:** Familiar npm terminology
- **Cons:** Too generic, conflicts with npm packages
- **Vibe:** `@sbf/packages/budgeting`
- **Why it works:** Standard terminology, but confusing

### 8. **Solution** ⭐⭐⭐⭐
- **Pros:** Business-friendly, implies problem-solving
- **Cons:** Microsoft vibes (Visual Studio Solutions)
- **Vibe:** `@sbf/solutions/budgeting`
- **Why it works:** Each solves a specific use case

### 9. **Capability** ⭐⭐⭐
- **Pros:** Modern, feature-oriented
- **Cons:** Verbose, slightly academic
- **Vibe:** `@sbf/capabilities/budgeting`
- **Why it works:** Focuses on what it enables

### 10. **Service** ⭐⭐
- **Pros:** SOA terminology, professional
- **Cons:** Implies network/API service
- **Vibe:** `@sbf/services/budgeting`
- **Why it works:** Each provides a service

---

## 🏆 Top 3 Recommendations

### 🥇 **Module** (Best Overall)
**Why:** Industry-standard, clean, professional, no baggage
- `@sbf/modules/budgeting`
- "The Budgeting Module"
- "SBF ships with 13 modules"

### 🥈 **Application** (Most User-Friendly)
**Why:** Clear to end-users, familiar, suggests completeness
- `@sbf/apps/budgeting`
- "The Budgeting App"
- "SBF includes 13 built-in apps"

### 🥉 **Engine** (Most Technical)
**Why:** Emphasizes the processing/workflow nature
- `@sbf/engines/budgeting`
- "The Budgeting Engine"
- "Powered by 13 specialized engines"

---

## 🎯 Recommendation Matrix

| Term | User-Friendly | Technical Accuracy | Uniqueness | Industry Standard |
|------|---------------|-------------------|------------|-------------------|
| Module | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Application | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Engine | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Workspace | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Solution | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 💭 Branding Considerations

### "Module" Brand Examples:
- "Browse the Module Marketplace"
- "Install the Budgeting Module"
- "13 production-ready modules"
- "Framework-based modules"

### "Application" Brand Examples:
- "Explore the App Store"
- "Launch the Budgeting App"
- "6 production apps, 4 in development"
- "Framework-powered applications"

### "Engine" Brand Examples:
- "Activate the Budgeting Engine"
- "13 specialized engines"
- "Framework-driven engines"
- "Use-case engines for every domain"

---

## 📊 Impact Analysis

### Codebase Changes Required:
1. **Directory rename:** `packages/@sbf/modules` → `packages/@sbf/[modules|apps|engines]`
2. **Package names:** `@sbf/modules/budgeting` → `@sbf/[modules|apps|engines]/budgeting`
3. **Import statements:** Throughout codebase
4. **Documentation:** README, guides, architecture docs
5. **Core system:** `module-system` package → `[module|app|engine]-system`
6. **Registry:** `module-registry.json` → `[module|app|engine]-registry.json`
7. **Scripts:** `generate-module-registry.js`, etc.
8. **Tests:** All references in test files

### Estimated Changes:
- **Files affected:** ~100-150 files
- **Import statements:** ~200-300 occurrences
- **Documentation:** ~50 references
- **Time estimate:** 2-3 hours with search/replace

---

## 🎭 Party Mode Consensus

After consultation with the virtual agent squad:

**🏆 Winner: "Module"**

**Reasoning:**
1. ✅ Most balanced across all criteria
2. ✅ Industry-standard terminology
3. ✅ No confusing associations
4. ✅ Clean, professional sound
5. ✅ Works well in all contexts

**Runner-up: "Application"** (if you want more user-friendly branding)

---

## 🔄 Next Steps

If you choose to proceed:

1. **Decision:** Pick the term (Module/Application/Engine)
2. **Planning:** Create refactor plan document
3. **Execution:** Automated search/replace + manual verification
4. **Testing:** Ensure build still works
5. **Documentation:** Update all references
6. **Git:** Single atomic commit for the rename

---

**Ready to proceed with the rebrand?** 🚀
