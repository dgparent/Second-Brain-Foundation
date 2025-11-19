# Extraction-01 Technical Decisions Form

**Date:** 2025-11-14  
**Decision Maker:** [Your Name]  
**Architect:** Winston

---

## Instructions

Please fill in your decisions below by replacing `[ ]` with `[x]` for your chosen option.

Once completed, save this file and Winston will proceed with workspace setup.

---

## Decision 1: Extraction Scope

What components should be included in Extraction-01?

- [ ] **Option A (Recommended):** P0 Components Only
  - Chat Interface
  - Organization Queue
  - Markdown Editor
  - Desktop Shell
  - Entity Management
  - **Timeline:** ~3-4 weeks
  - **Reasoning:** Validate core MVP first, add P1 in Extraction-02 phase

- [ ] **Option B:** P0 + P1 Components
  - All P0 components above, PLUS:
  - File Browser
  - Settings Panel
  - Search & Command Palette
  - **Timeline:** ~5-6 weeks
  - **Reasoning:** Complete MVP in one extraction phase

**Your Decision:** Option **B** (P0 + P1)

**Additional Notes:**
```
Complete MVP in one extraction phase as per architecture docs.
```

---

## Decision 2: Desktop Framework

Which desktop framework should we use?

- [x] **Option A (Recommended): Electron**
  - **Pros:** Mature, proven, extensive documentation, FreedomGPT/jan references
  - **Cons:** Larger bundle size (~150MB), more resource usage
  - **Libraries with examples:** FreedomGPT, jan, anything-llm
  - **Learning curve:** Low (if familiar with Node.js)

- [ ] **Option B: Tauri**
  - **Pros:** Smaller bundle (~15MB), more secure, modern Rust backend
  - **Cons:** Fewer library examples, newer ecosystem, requires Rust knowledge
  - **Libraries with examples:** None directly (would need translation)
  - **Learning curve:** Medium-High (Rust required for advanced features)

**Your Decision:** Option **A** (Electron)

**Additional Notes:**
```
Proven technology with excellent library references (FreedomGPT, jan, anything-llm).
```

---

## Decision 3: Markdown Editor

Which editor framework should we use?

- [x] **Option A (Recommended): @mdxeditor/editor (npm package)**
  - **Pros:** Production-ready, Lexical-based, use as direct dependency, saves 2-3 weeks
  - **Cons:** Less customization, larger dependency
  - **Effort:** 3-4 days integration
  - **Customization:** Medium (via plugins)

- [ ] **Option B: Tiptap (Prosemirror wrapper)**
  - **Pros:** Highly flexible, headless, extensive extension system
  - **Cons:** Steeper learning curve, more setup required
  - **Effort:** 5-7 days integration
  - **Customization:** High (full control)

- [ ] **Option C: Custom Lexical Implementation**
  - **Pros:** Full control, optimized for SBF
  - **Cons:** 2-3 weeks to build from scratch
  - **Effort:** 10-15 days
  - **Customization:** Maximum

**Your Decision:** Option **A** (@mdxeditor/editor)

**Additional Notes:**
```
Production-ready, saves 2-3 weeks of development time.
```

---

## Decision 4: Backend Scope

Should Extraction-01 include backend extraction, or focus on UI only?

- [ ] **Option A (Recommended): UI-Only Extraction** ← REQUIRES FURTHER ANALYSIS
  - Extract UI components only
  - Create simple Node.js backend in parallel track
  - Backend uses native Node.js fs, gray-matter for frontmatter
  - **Timeline:** No impact on extraction timeline
  - **Complexity:** Low

- [ ] **Option B: Extract Backend from anything-llm**
  - Extract Node.js + Vector DB backend
  - Full document processing pipeline
  - Embedding generation
  - **Timeline:** +1-2 weeks
  - **Complexity:** High

- [ ] **Option C: Extract Backend from SurfSense**
  - Extract FastAPI (Python) backend
  - RAG implementation
  - Document indexing
  - **Timeline:** +1-2 weeks
  - **Complexity:** High (requires Python)

- [ ] **Option D: Custom TypeScript Backend**
  - Build from scratch in TypeScript
  - Full control over architecture
  - Unified language (TypeScript everywhere)
  - **Timeline:** +2-3 weeks
  - **Complexity:** Medium-High

**Your Decision:** **PENDING ANALYSIS**

**Additional Notes:**
```
Analyzing backend capabilities in libraries (anything-llm, SurfSense, text-gen-webui).
Need to evaluate:
- File system operations and markdown handling
- Entity extraction and metadata indexing
- Lifecycle management (48-hour transitions)
- Privacy enforcement layer
- AI integration patterns

Will make final decision after backend extraction analysis in Phase 0.
```

---

## Decision 5: Extraction Approach

How should we approach the extraction process?

- [x] **Option A (Recommended): Phased Extraction**
  - Week 1-2: Extract Desktop Shell + Chat Interface
  - **Validate:** Ensure working before proceeding
  - Week 3-4: Extract Editor + Queue
  - **Validate:** Ensure integration works
  - Week 5-6: Extract Entity Management (+ P1 if applicable)
  - **Pros:** Lower risk, validates as you go, easier to course-correct
  - **Cons:** Slightly longer timeline due to validation steps

- [ ] **Option B: Batch Extraction**
  - Week 1-3: Extract all P0 (or P0+P1) components simultaneously
  - Week 4-5: Refactor all components
  - Week 6: Integration
  - **Pros:** Faster if everything goes smoothly
  - **Cons:** Higher risk, harder to identify issues, more rework if problems arise

**Your Decision:** Option **A** (Phased Extraction)

**Additional Notes:**
```
Phased by modules as defined in docs/03-architecture folder:
- Phase 1A: Desktop Shell
- Phase 1B: Chat Interface  
- Phase 1C: Markdown Editor
- Phase 1D: Organization Queue
- Phase 1E: Entity Management
- Phase 2A: File Browser
- Phase 2B: Settings Panel
- Phase 2C: Search & Command Palette

Validate each phase before proceeding to next.
Ground extraction in existing architecture documentation.
```

---

## Additional Decisions (Optional)

### State Management

- [x] **Option A (Recommended): Zustand** - Lightweight, minimal boilerplate
- [ ] **Option B: Redux Toolkit** - More structured, familiar to many devs
- [ ] **Option C: React Context + useReducer** - No dependencies, simpler for small apps

**Your Decision:** Option **A** (Zustand)

---

### Package Manager

- [x] **Option A (Recommended): pnpm** - Fast, efficient, good monorepo support
- [ ] **Option B: npm** - Default, universal, simpler
- [ ] **Option C: yarn** - Fast, good monorepo support

**Your Decision:** Option **A** (pnpm)

---

### Monorepo Structure

- [x] **Option A (Recommended): Monorepo (pnpm workspaces)** - Shared code, easier development
- [ ] **Option B: Multi-Repo** - Clear boundaries, separate versioning

**Your Decision:** Option **A** (Monorepo)

---

## Summary of Decisions

Once you've made your selections, summarize here for quick reference:

```yaml
scope: P0+P1                          # Complete MVP
desktop: Electron                     # Proven, extensive references
editor: mdx-editor                    # Production-ready npm package
backend: PENDING_ANALYSIS             # Requires backend extraction analysis
approach: Phased                      # Module-by-module validation

# Optional (All recommendations accepted)
state_management: Zustand             # Lightweight, minimal boilerplate
package_manager: pnpm                 # Fast, efficient monorepo support
monorepo: Yes                         # pnpm workspaces
```

---

## Timeline Impact

Based on your decisions, the estimated timeline will be:

**Your Configuration:**
- Scope: P0 + P1 (Complete MVP)
- Approach: Phased (module-by-module)
- Backend: Pending analysis (will adjust after Phase 0 backend evaluation)

**Estimated Total Duration:** 5-7 weeks

**Breakdown:**
- Phase 0: Setup & Backend Analysis (3-4 days)
- Phase 1: P0 Components (14-19 days)
  - Desktop Shell (2-3 days)
  - Chat Interface (4-5 days)
  - Markdown Editor (3-4 days)
  - Organization Queue (3-4 days)
  - Entity Management (3-4 days)
- Phase 2: P1 Components (6-8 days)
  - File Browser (2 days)
  - Settings Panel (2-3 days)
  - Search & Command Palette (2-3 days)
- Phase 3: Integration & Testing (5-7 days)

**Note:** Backend decision may add 0-3 weeks depending on analysis outcome.

---

## Approval

**I approve this technical plan and the decisions above.**

- **Name:** User (Project Lead)
- **Date:** 2025-11-14
- **Approved By:** Winston (Architect)
- **Status:** ✅ APPROVED - Proceeding with workspace setup

---

## Next Steps After Approval

1. ✅ Winston creates complete folder structure
2. ✅ Set up package scaffolds with chosen tech stack
3. ✅ Document decisions in `00-analysis/tech-stack-decisions.md`
4. ✅ Create extraction checklist
5. 🚀 Begin Phase 0 (Workspace Setup)

---

**Instructions:** Save this file as `DECISIONS.md` in the Extraction-01 folder after filling it out.
