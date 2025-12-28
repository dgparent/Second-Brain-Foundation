# NextGen Development Instructions

**Version:** 1.0  
**Created:** December 28, 2025  
**Author:** BMad Orchestrator Party Mode  
**Purpose:** Primary instruction guide for running SBF development cycles  
**Tools:** BMad Orchestrator + Claude Opus 4.5 + GitHub Copilot  

---

## 🎯 Quick Start

```
1. Open VS Code with GitHub Copilot extension active
2. Activate BMad Orchestrator: Load `.bmad-core/agents/bmad-orchestrator.md`
3. Tell the agent: "Run as bmad-orchestrator, I'm working on [PHASE_NUMBER]"
4. Follow the sprint tasks in the corresponding phase document
```

---

## 📚 Document Reference Map

### Core Planning Documents

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| [nextgen-blueprint.md](nextgen-blueprint.md) | Master plan, phase overview, dependency graph | Starting any phase |
| [NEXTGEN-FINAL-PASS-SUMMARY.md](NEXTGEN-FINAL-PASS-SUMMARY.md) | PRD coverage matrix, verification checklist | Before phase completion |
| [NEXTGEN-SANITY-CHECK-AMENDMENTS-V2.md](NEXTGEN-SANITY-CHECK-AMENDMENTS-V2.md) | Gap analysis, enhancement recommendations | Planning phase work |
| [NEXTGEN-PHASES-ENHANCEMENT-ADDENDUM.md](NEXTGEN-PHASES-ENHANCEMENT-ADDENDUM.md) | Per-phase blind spots and mitigations | During implementation |
| [02-product/prd.md](02-product/prd.md) | Requirements (FR1-25, NFR1-15) | Validating implementations |

### Phase Documents

| Phase | Document | Duration | Focus |
|-------|----------|----------|-------|
| 00 | [nextgen-phase-00.md](nextgen-phase-00.md) | 16 days | Foundation infrastructure |
| 01 | [nextgen-phase-01.md](nextgen-phase-01.md) | 14 days | AI infrastructure |
| 02 | [nextgen-phase-02.md](nextgen-phase-02.md) | 16 days | Chat & Search |
| 03 | [nextgen-phase-03.md](nextgen-phase-03.md) | 8 days | Transformations |
| 04 | [nextgen-phase-04.md](nextgen-phase-04.md) | 20 days | Frontend core |
| 05 | [nextgen-phase-05.md](nextgen-phase-05.md) | 16 days | Podcast engine |
| 06 | [nextgen-phase-06.md](nextgen-phase-06.md) | 14 days | Chat UI |
| 07 | [nextgen-phase-07.md](nextgen-phase-07.md) | 16 days | Knowledge graph |
| 08 | [nextgen-phase-08.md](nextgen-phase-08.md) | 13 days | DevOps |
| 09 | [nextgen-phase-09.md](nextgen-phase-09.md) | 15 days | Entity Framework (PRD Critical) |
| 10 | [nextgen-phase-10.md](nextgen-phase-10.md) | 10 days | Privacy Engine (PRD Critical) |
| 11 | [nextgen-phase-11.md](nextgen-phase-11.md) | 17 days | Integrations (PRD Critical) |

---

## 🛠️ Tool Configuration

### Claude Opus 4.5 with GitHub Copilot

**Optimal Settings:**
```
Model: Claude Opus 4.5 (via GitHub Copilot)
Context Window: Maximize (use @workspace for full context)
Temperature: Default (balanced creativity/precision)
```

**Copilot Features to Leverage:**

| Feature | When to Use | Command/Trigger |
|---------|-------------|-----------------|
| **Chat** | Architecture questions, code explanation | `Ctrl+Shift+I` |
| **Inline Suggestions** | Writing implementation code | Automatic |
| **@workspace** | Project-wide context queries | `@workspace` in chat |
| **@file** | Reference specific file content | `@file:path/to/file.ts` |
| **@terminal** | Debug terminal output | `@terminal` in chat |
| **Fix** | Quick error resolution | `Ctrl+.` on error |
| **Explain** | Understand existing code | Select code + Explain |
| **Generate Tests** | Create test files | `/tests` command |
| **Generate Docs** | Create documentation | `/doc` command |

### BMad Orchestrator Commands

**Essential Commands:**
```
*help              - Show all available commands
*agent [name]      - Transform into specialist (dev, architect, qa, pm)
*party-mode        - Enable all-agent collaboration
*task [name]       - Execute a specific task
*checklist [name]  - Run a verification checklist
*status            - Show current context and progress
*doc-out           - Output complete document
*yolo              - Toggle skip confirmations (for experienced users)
```

**Available Agents:**
```
*agent dev         - Developer (implementation focus)
*agent architect   - Architect (system design, patterns)
*agent qa          - QA Lead (testing, validation)
*agent pm          - Product Manager (requirements, priorities)
*agent analyst     - Business Analyst (research, analysis)
```

**Available Workflows:**
```
*workflow brownfield-fullstack   - Existing codebase, full stack
*workflow brownfield-service     - Existing codebase, backend service
*workflow brownfield-ui          - Existing codebase, frontend only
```

---

## 🔄 Development Cycle Process

### Phase Initiation

**Step 1: Load Context**
```
When starting a new phase, provide this context to the agent:

"I'm starting Phase [XX]: [Phase Name]. 
Please read the following documents:
- docs/nextgen-phase-[XX].md (primary)
- docs/NEXTGEN-PHASES-ENHANCEMENT-ADDENDUM.md (blind spots for this phase)
- docs/nextgen-blueprint.md (dependencies and overview)

I need to complete Sprint [XX.Y]: [Sprint Name]"
```

**Step 2: Verify Prerequisites**
```
Ask: "What are the prerequisites for Phase [XX] and how do I verify they are complete?"

The agent will reference the phase document's Prerequisites Checklist.
```

**Step 3: Create Sprint Plan**
```
Ask: "Create a detailed implementation plan for Sprint [XX.Y] with:
1. Files to create/modify
2. Order of implementation
3. Test verification at each step"
```

### Sprint Execution

**For Each Task in a Sprint:**

```
1. DESCRIBE: "I'm working on Task [XX.Y.Z]: [Task Name]"

2. DESIGN: "What's the best approach for implementing this? Consider:
   - Existing code patterns in the workspace
   - PRD requirements this addresses
   - Integration with other packages"

3. IMPLEMENT: Use GitHub Copilot inline suggestions + chat
   - Let Copilot suggest code based on context
   - Use @file to reference similar implementations
   - Ask for explanations of generated code

4. TEST: "Generate tests for the implementation I just created"
   - Use /tests command in Copilot
   - Reference phase document's Acceptance Criteria

5. VERIFY: "Run the verification gate for Task [XX.Y.Z]"
   - Each phase has verification gates
   - Don't proceed until verification passes
```

### Quality Checkpoints

**After Each Sprint:**
```
*checklist story-dod-checklist

This runs the Definition of Done checklist to verify:
- All tasks completed
- Tests passing
- Documentation updated
- No regressions
```

**After Each Phase:**
```
Reference: docs/NEXTGEN-FINAL-PASS-SUMMARY.md → Final Verification Checklist

Complete the phase-specific verification items before moving to next phase.
```

---

## 🎯 Effective Prompting Patterns

### Pattern 1: Context-Rich Implementation Request

```
I'm implementing [TASK_NAME] from Phase [XX], Sprint [XX.Y].

PRD Requirements addressed: [FR/NFR numbers]
Reference implementation: [file path or pattern source]
Integration points: [related packages/files]

Please generate the implementation for [specific component/service].
Consider the existing patterns in @workspace and ensure compatibility 
with @file:packages/@sbf/domain-base/src/BaseEntity.ts
```

### Pattern 2: Architecture Decision Request

```
*agent architect

I need to decide on the approach for [FEATURE/COMPONENT].

Options I'm considering:
1. [Option A] - [pros/cons]
2. [Option B] - [pros/cons]

Constraints from PRD:
- [FR/NFR requirement]
- [Performance requirement]
- [Privacy requirement]

Please recommend the best approach with rationale.
```

### Pattern 3: Test Generation Request

```
*agent qa

I've implemented [COMPONENT_NAME] at @file:[path].

Please generate comprehensive tests including:
1. Unit tests for core functionality
2. Integration tests for API endpoints
3. Security tests (especially for sensitivity/privacy)

Reference the acceptance criteria in @file:docs/nextgen-phase-[XX].md
```

### Pattern 4: Debug Assistance Request

```
I'm getting an error in [COMPONENT].

Error message: [paste error]
Terminal output: @terminal
Relevant file: @file:[path]

This is part of Phase [XX], Task [XX.Y.Z]: [task name]

What's causing this and how do I fix it?
```

### Pattern 5: Code Review Request

```
*party-mode

Please review my implementation of [FEATURE] across these files:
- @file:[path1]
- @file:[path2]
- @file:[path3]

Check for:
- 🏗️ Architecture: Pattern consistency, separation of concerns
- 📋 PM: PRD requirement coverage for FR[X], NFR[Y]
- 💻 Dev: Code quality, error handling, types
- 🧪 QA: Test coverage, edge cases
- 📝 Tech Writer: Documentation completeness
```

---

## 🚀 Advanced Workflows

### Multi-File Implementation

```
When implementing a feature that spans multiple files:

1. Ask agent to create implementation plan:
   "Plan the implementation of [FEATURE] showing file creation order"

2. Implement foundation files first:
   "Create @file:[path] with [description]"

3. Use Copilot's multi-file edit:
   - Select all related files in editor
   - Ask for coordinated changes

4. Verify integration:
   "Verify the integration between [file1], [file2], [file3]"
```

### Database Migration Workflow

```
For new database tables/migrations:

1. Design schema: 
   "*agent architect - Design the database schema for [FEATURE]"

2. Create migration:
   "Create migration file packages/@sbf/db-migrations/migrations/[NNN]_[name].sql"

3. Generate entity:
   "Generate the TypeScript entity class for [TABLE_NAME]"

4. Test migration:
   "pnpm migrate:up" then "pnpm migrate:status"
```

### Package Creation Workflow

```
When creating a new @sbf package:

1. Initialize structure:
   "Create the package structure for @sbf/[package-name] following the pattern 
   in @file:packages/@sbf/errors/package.json"

2. Implement exports:
   "Create src/index.ts with public exports"

3. Add to workspace:
   "Add workspace dependency to consuming packages"

4. Test package:
   "pnpm test --filter @sbf/[package-name]"
```

---

## ⚠️ Critical Rules

### Never Skip These

1. **Phase Prerequisites** - Always verify before starting a phase
2. **Verification Gates** - Each sprint has specific verification tests
3. **Security Tests** - Phase 10 security tests are MANDATORY
4. **PRD Alignment** - Check requirement coverage for critical phases (09, 10, 11)

### Privacy-Critical Implementations

```
When implementing anything related to:
- AI processing
- Content indexing/search
- Data export
- Cloud services

ALWAYS reference Phase 10 (Privacy Engine) constraints:
- Secret content: NEVER processed by ANY AI
- Confidential: Local AI only (Ollama)
- Personal: Default to local, user can override
- Public: Any AI allowed

Use @file:docs/nextgen-phase-10.md for permission matrix.
```

### Multi-Tenancy Requirements

```
All database operations MUST be tenant-scoped.

Pattern to follow:
1. Get tenant_id from auth context
2. Set PostgreSQL session variable: SET app.current_tenant_id = [uuid]
3. RLS policies automatically filter data
4. Never bypass RLS in application code
```

---

## 📊 Progress Tracking

### Daily Development Log

```markdown
## [DATE] - Phase [XX] Sprint [XX.Y]

### Completed Tasks
- [ ] Task XX.Y.Z - [Description]

### Blockers
- [Issue description]

### Verification Status
- [ ] Unit tests passing
- [ ] Integration tests passing  
- [ ] Lint/type checks passing

### Next Session Plan
- [What to work on next]
```

### Phase Completion Checklist

```markdown
## Phase [XX] Completion

### Sprint Completion
- [ ] Sprint XX.1 - All tasks done
- [ ] Sprint XX.2 - All tasks done
- [ ] Sprint XX.N - All tasks done

### Verification Gates
- [ ] All acceptance criteria met
- [ ] Tests passing (pnpm test --filter [packages])
- [ ] No TypeScript errors
- [ ] Documentation updated

### PRD Requirements Verified
- [ ] FR[X] - [Verification method]
- [ ] NFR[Y] - [Verification method]

### Ready for Next Phase
- [ ] Dependencies documented
- [ ] API contracts stable
- [ ] No breaking changes to existing code
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Copilot not suggesting relevant code**
```
Solution: 
1. Open relevant files in editor tabs
2. Use @file to explicitly reference patterns
3. Provide more context in prompt
```

**Issue: Agent losing context**
```
Solution:
1. Re-state current phase and sprint
2. Reference specific files with @file
3. Use *status to see agent's understanding
```

**Issue: Test failures after implementation**
```
Solution:
1. Ask: "Analyze test failure: @terminal"
2. Check for missing dependencies
3. Verify database migrations applied
4. Run: "pnpm test --filter [package] --verbose"
```

**Issue: Type errors across packages**
```
Solution:
1. Run: "pnpm build" to rebuild all packages
2. Check workspace dependencies in package.json
3. Ask: "Fix type errors in @file:[path]"
```

---

## 📋 Session Templates

### Starting a Development Session

```
"I'm continuing development on Second Brain Foundation.

Current Progress:
- Last completed: Phase [X], Sprint [X.Y]
- Currently working on: Phase [X], Sprint [X.Y]
- Next task: [Task ID and description]

Please load context from:
- @file:docs/nextgen-phase-[XX].md
- @file:docs/NEXTGEN-PHASES-ENHANCEMENT-ADDENDUM.md

What should I focus on first?"
```

### Ending a Development Session

```
"I'm ending this development session.

Please summarize:
1. What was completed this session
2. Current state of the sprint
3. What to work on next session
4. Any blockers or concerns

Output in the Daily Development Log format."
```

### Handoff Between Sessions

```
"I'm handing off development to continue later.

Please create a handoff document with:
1. Current phase/sprint/task status
2. Files modified this session
3. Tests status
4. Outstanding work
5. Important context for next session"
```

---

## 🎭 Agent Collaboration Patterns

### Pattern: Architecture Review

```
*agent architect
Review the architecture of [COMPONENT].
Consider: patterns, scalability, maintainability.

[After review]

*agent dev
Implement the recommended changes.

[After implementation]

*agent qa
Verify the changes with tests.
```

### Pattern: Feature Implementation

```
*party-mode

Implementing [FEATURE_NAME] from Phase [XX]:

1. 📋 PM: Confirm requirements coverage
2. 🏗️ Architect: Design approach
3. 💻 Dev: Implementation
4. 🧪 QA: Test plan
5. 📝 Tech Writer: Documentation

Let's collaborate on this feature.
```

### Pattern: Bug Investigation

```
*agent dev
There's a bug in [COMPONENT]: [description]

Investigate with:
- @file:[relevant files]
- @terminal (for error output)

[After diagnosis]

*agent qa
Verify the fix doesn't introduce regressions.
What tests should I add to prevent this in the future?
```

---

## 📎 Reference Commands

### Terminal Commands
```powershell
# Build all packages
pnpm build

# Run all tests
pnpm test

# Run specific package tests
pnpm test --filter @sbf/[package-name]

# Database migrations
pnpm migrate:up
pnpm migrate:down
pnpm migrate:status

# Lint and type check
pnpm lint
pnpm typecheck

# Start development servers
pnpm dev

# Start specific app
pnpm dev --filter @sbf/web
pnpm dev --filter @sbf/api
```

### File Paths Quick Reference
```
Phase Documents:     docs/nextgen-phase-[00-11].md
PRD:                 docs/02-product/prd.md
Architecture:        docs/03-architecture/
Package Root:        packages/@sbf/
Apps Root:           apps/
API Service:         apps/api/
Web Frontend:        apps/web/
Python AEI Core:     apps/aei-core/
BMad Core:           .bmad-core/
```

---

## ✅ Ready to Begin

1. **Load this document** at the start of each development session
2. **Reference the specific phase document** for detailed tasks
3. **Use the prompting patterns** for consistent, high-quality results
4. **Track progress** using the templates provided
5. **Run verifications** before completing each sprint

**First Action:** Start with Phase 00 if beginning fresh, or continue from your current phase.

---

*This document is your primary reference for all NextGen development work.*  
*Update progress tracking sections as you complete work.*  
*Generated by BMad Orchestrator Party Mode for optimal Claude Opus 4.5 + GitHub Copilot workflow.*
