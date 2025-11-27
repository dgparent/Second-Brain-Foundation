# Second Brain Foundation Documentation

Welcome to the Second Brain Foundation documentation! This guide will help you navigate the project's documentation and find what you need.

---

## 📖 Documentation Structure

### [01-Overview](01-overview/) - Project Essentials
Start here to understand the project vision, goals, and current status.

- **[Project Brief](01-overview/project-brief.md)** - Vision, goals, success metrics, and market positioning
- **[Project Status](01-overview/project-status.md)** - Current implementation status, roadmap progress, and next steps

### [02-Product](02-product/) - Product Specifications
Product requirements, features, and planning documents.

- **[PRD (Product Requirements Document)](02-product/prd.md)** - Complete functional and non-functional requirements
- **[Features](02-product/features/)** - Detailed feature specifications (to be added)

### [03-Architecture](03-architecture/) - Technical Architecture
Complete technical architecture and design decisions.

- **[Architecture](03-architecture/architecture.md)** - Main fullstack architecture document (55K+ chars)
- **[Architecture v2 Enhanced](03-architecture/architecture-v2-enhanced.md)** - Enhanced graph-based architecture
- **[Frontend Spec](03-architecture/frontend-spec.md)** - Complete UI/UX specification (41K+ chars)
- **[Automation Integration](03-architecture/automation-integration.md)** - Prefect + n8n integration architecture
- **[Tech Stack Update](03-architecture/tech-stack-update.md)** - Recent technology stack changes and rationale
- **[Developer Migration Plan](03-architecture/developer-migration-plan.md)** - 5-stage deployment roadmap

### [04-Implementation](04-implementation/) - Build Guides
Step-by-step implementation plans and development guides.

- **[Implementation Plan](04-implementation/implementation-plan.md)** - 8-week MVP build plan (Option B)
- **[AEI Integration Plan](04-implementation/aei-integration-plan.md)** - AI-Enabled Interface integration strategy
- **[CLI Scaffolding Guide](04-implementation/cli-scaffolding-guide.md)** - Complete CLI code and structure
- **[CLI Enhancement Guide](04-implementation/cli-enhancement-guide.md)** - v2.0 CLI implementation updates
- **[CLI Implementation Summary](04-implementation/cli-implementation-summary.md)** - CLI overview and next steps
- **[Resume Guide](04-implementation/resume-guide.md)** - How to resume/restart implementation
- **[MVP Backlog](04-implementation/mvp-backlog.csv)** - Jira-ready backlog (8 EPICs, 40+ stories)
- **[Week-by-Week](04-implementation/week-by-week/)** - Weekly implementation checklists

### [05-Research](05-research/) - Analysis & Research
Market research, user research, and technology analysis.

**Market Research:**
- [Competitor Analysis](05-research/market-research/competitor-analysis.md) - Obsidian, Capacities, Logseq comparison
- [PKM Communities](05-research/market-research/pkm-communities.md) - Reddit, Discord, forums analysis
- [Defence Analysis](05-research/market-research/defence-competitive-analysis.md) - Competitive positioning
- [VC Scoping](05-research/market-research/vc-scoping-exercise.md) - Venture capital landscape
- [Reddit Posts](05-research/market-research/reddit-post-compendium.md) - Community engagement strategy

**User Research:**
- [Interview Guide](05-research/user-research/interview-guide.md) - User interview framework
- [Interview Questions](05-research/user-research/interview-questions.md) - Question compendium
- [Custom Script](05-research/user-research/custom-interview-script.md) - Customizable interview templates

**Technology Research:**
- [Open Source Research](05-research/technology-research/open-source-research.md) - Similar projects, collaboration opportunities
- [Tech Stack Decision](05-research/technology-research/tech-stack-decision.md) - Technology selection rationale
- [Scenario Analysis](05-research/technology-research/scenario-deep-dive.md) - Implementation scenario comparisons
- [Obsidian module Analysis](05-research/technology-research/scenario-obsidian-module.md) - module approach feasibility

**General:**
- [Brainstorming Session](05-research/brainstorming-session.md) - Initial ideation results

### [06-Guides](06-guides/) - How-To Guides
User and developer guides (to be added).

- Getting Started Guide (planned)
- Contributing Guide (planned)
- Setup Guide (planned)
- Deployment Guide (planned)

### [07-Reference](07-reference/) - Quick References
Quick lookup documents for developers.

- **[Tech Stack Quick Reference](07-reference/tech-stack-quick-ref.md)** - Technology decision matrix, configuration examples, quick start commands

### [08-Archive](08-archive/) - Historical Documents
Archived decisions, old specifications, and deprecated content.

**Decisions:**
- [Architecture Merge Complete](08-archive/decisions/architecture-merge-complete.md)
- [Release Notes v2](08-archive/decisions/release-notes-v2.md)
- [Strategic Decision Framework](08-archive/decisions/strategic-decision-framework.md)

**Old Specs:**
- [Graph-Based Architecture (Original)](08-archive/old-specs/graph-based-architecture-original.md)

---

## 🗺️ Common Workflows

### "I want to understand the project"
1. Start with [Project Brief](01-overview/project-brief.md)
2. Review [Project Status](01-overview/project-status.md)
3. Read [PRD](02-product/prd.md)

### "I want to build this"
1. Review [Architecture](03-architecture/architecture.md)
2. Follow [Implementation Plan](04-implementation/implementation-plan.md)
3. Use [Week 1 Checklist](04-implementation/week-by-week/week-1-checklist.md)

### "I want to understand technical decisions"
1. Read [Tech Stack Update](03-architecture/tech-stack-update.md)
2. Check [Tech Stack Quick Ref](07-reference/tech-stack-quick-ref.md)
3. Review [Developer Migration Plan](03-architecture/developer-migration-plan.md)

### "I want to do market research"
1. Start with [Competitor Analysis](05-research/market-research/competitor-analysis.md)
2. Review [PKM Communities](05-research/market-research/pkm-communities.md)
3. Check [User Interview Guide](05-research/user-research/interview-guide.md)

---

## 📊 Documentation Statistics

**Total Documents:** 40+ markdown files
- Overview: 2 docs
- Product: 1 doc (+ features folder)
- Architecture: 6 docs (~150KB)
- Implementation: 8 docs + backlog
- Research: 15+ docs
- Reference: 1 doc
- Archive: 4+ docs

**Last Major Update:** 2025-11-13 (Tech stack reorganization)

---

## 🔗 External Resources

### Project Links
- **Repository:** (to be created on GitHub)
- **Website:** (planned)
- **Discord:** (planned)
- **Reddit:** (planned)

### Technology Documentation
- [Prefect](https://docs.prefect.io/) - Workflow orchestration
- [LlamaIndex](https://docs.llamaindex.ai/) - RAG framework
- [Instructor](https://python.useinstructor.com/) - Type-safe LLM output
- [LanceDB](https://lancedb.github.io/lancedb/) - Vector database
- [Letta](https://www.letta.com/) - Agent memory

---

## 📝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category:**
   - `01-overview/` - High-level project info
   - `02-product/` - Product specs and features
   - `03-architecture/` - Technical architecture
   - `04-implementation/` - Implementation guides
   - `05-research/` - Analysis and research
   - `06-guides/` - How-to guides
   - `07-reference/` - Quick references
   - `08-archive/` - Historical documents

2. **Use clear naming:**
   - Use kebab-case: `my-document-name.md`
   - Be descriptive: `competitor-analysis.md` not `analysis.md`
   - Include version if applicable: `architecture-v2-enhanced.md`

3. **Update this README:**
   - Add your document to the appropriate section
   - Update document counts
   - Add to relevant workflows

4. **Link related documents:**
   - Add cross-references where relevant
   - Update any index pages
   - Keep navigation clear

---

## 🔍 Quick Find

Can't find what you're looking for? Use these keywords:

- **Vision & Goals** → [Project Brief](01-overview/project-brief.md)
- **Requirements** → [PRD](02-product/prd.md)
- **Technical Design** → [Architecture](03-architecture/architecture.md)
- **Build Plan** → [Implementation Plan](04-implementation/implementation-plan.md)
- **Technology Choices** → [Tech Stack Quick Ref](07-reference/tech-stack-quick-ref.md)
- **Competition** → [Competitor Analysis](05-research/market-research/competitor-analysis.md)
- **Users** → [Interview Guide](05-research/user-research/interview-guide.md)
- **Status** → [Project Status](01-overview/project-status.md)
- **Old Docs** → [Archive](08-archive/)

---

## 📧 Questions?

If you can't find what you need:
1. Check the [Project Status](01-overview/project-status.md) for current phase
2. Review the [Architecture](03-architecture/architecture.md) for technical questions
3. Open an issue on GitHub (once repository is public)

---

**Documentation maintained using BMAD-METHOD™ framework**  
**Last updated:** 2025-11-13
