# Workspace Protocol - Constitutional Memory

**STATUS:** Active Constitutional Document  
**LAST UPDATED:** 2025-11-23

## Core Principle

**ALL working documents, session files, planning documents, and temporary work artifacts MUST be generated in the `.temp-workspace/` folder.**

## Workspace Structure

```
.temp-workspace/
├── sessions/          # Session plans, summaries, progress tracking
├── planning/          # Phase planning, architecture, roadmaps
├── troubleshooting/   # Build issues, debugging notes, fixes
└── archive/           # Completed work kept for reference
```

## Rules for AI Agents & Contributors

### ✅ DO:
- Generate ALL session summaries in `.temp-workspace/sessions/`
- Create ALL planning documents in `.temp-workspace/planning/`
- Put ALL troubleshooting/debug docs in `.temp-workspace/troubleshooting/`
- Move completed work to `.temp-workspace/archive/` when done
- Keep root directory clean with ONLY essential permanent documentation

### ❌ DO NOT:
- Create session files in the root directory
- Generate PHASE-* files in the root directory
- Create temporary planning documents in the root directory
- Clutter the root with working documents

## Root Directory - Reserved for Essentials Only

The root directory should ONLY contain:
- `README.md` - Project overview
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - License information
- `WORKSPACE-PROTOCOL.md` - This file (constitutional)
- `START-HERE.md` - New user onboarding (if needed)
- Configuration files (package.json, tsconfig.json, etc.)

## Enforcement

This is a **CONSTITUTIONAL DOCUMENT**. All AI agents and contributors MUST follow this protocol. Any deviation should be corrected immediately by:

1. Moving misplaced files to appropriate `.temp-workspace/` subdirectory
2. Updating any references to moved files
3. Documenting the move in session notes

## Migration History

- **2025-11-23**: Initial workspace structure created, migrated 40+ documents from root

## Questions?

If unsure where a document belongs:
- Is it temporary/working? → `.temp-workspace/sessions/` or `.temp-workspace/planning/`
- Is it troubleshooting? → `.temp-workspace/troubleshooting/`
- Is it completed/archived? → `.temp-workspace/archive/`
- Is it permanent documentation? → Root directory (rare)
