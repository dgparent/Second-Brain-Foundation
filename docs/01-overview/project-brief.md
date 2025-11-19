# Second Brain Foundation - Project Brief

**Version:** 2.0  
**Date:** November 14, 2025  
**Status:** Active  
**Owner:** Product Team  
**Last Updated:** 2025-11-14

---

## Vision

Create a **privacy-first, AI-augmented personal knowledge management framework** that eliminates manual organization burden while maintaining complete user control and data sovereignty.

Second Brain Foundation is an open-source framework that enables **individual users** to build and maintain their "second brain" - a markdown-based knowledge system that progressively organizes itself through intelligent automation, with enterprise capabilities as a natural evolution path.

---

## Mission

Empower knowledge workers, researchers, students, and lifelong learners to:
- **Capture** information effortlessly without worrying about organization
- **Connect** ideas automatically through AI-assisted entity extraction and relationship mapping
- **Structure** knowledge progressively as it matures, not manually upfront
- **Control** their data completely with local-first architecture and context-aware privacy
- **Scale** from personal use to team collaboration when ready

---

## Core Philosophy

### 1. Progressive Organization Over Manual Filing
Traditional PKM tools force users to organize notes immediately or face chaos. We flip this: **capture first, organize later** through a natural 48-hour lifecycle that mirrors how humans actually think and work.

### 2. Privacy as Architecture, Not Feature
Context-aware privacy controls (local vs cloud AI, tiered sensitivity) are foundational, not bolted on. Users maintain complete sovereignty over their knowledge while still benefiting from AI assistance.

### 3. Tool-Agnostic Foundation
Pure markdown with frontmatter metadata ensures portability. Works with Obsidian, NotebookLM, VS Code, or any markdown editor. No vendor lock-in, ever.

### 4. Individual First, Enterprise Ready
**MVP Target:** Individual users (knowledge workers, researchers, students)  
**Growth Path:** Team collaboration → Enterprise operations (CRM, ITIL, R&D)

The architecture supports individual users today and scales to enterprise needs tomorrow without fundamental redesign.

---

## Target Users (MVP)

### Primary: Individual Knowledge Workers
- **Researchers** - Managing literature, notes, citations, and insights
- **Writers & Content Creators** - Organizing ideas, drafts, and research
- **Students** - Building personal knowledge bases for learning
- **Developers** - Technical documentation and project knowledge
- **Consultants** - Client information, project notes, expertise mapping

### Secondary: Power Users
- **PKM Enthusiasts** - Currently using Obsidian, Roam, Logseq
- **Privacy-Conscious Users** - Want local-first, open-source solutions
- **AI Early Adopters** - Interested in AI-augmented workflows

### Future: Teams & Organizations
- Small teams sharing knowledge bases
- Enterprises needing CRM, ITIL, and operational intelligence
- Research institutions requiring collaborative knowledge graphs

---

## Product Scope

### MVP (Phase 1-2): Individual AI-Augmented PKM

**Core Capabilities:**
1. **Markdown-Based Vault** - Pure markdown files with YAML frontmatter
2. **Entity System** - People, Places, Topics, Projects, Sources, Events
3. **Progressive Organization** - 48-hour lifecycle (Capture → Connect → Structure)
4. **AI-Enabled Interface (AEI)** - Chat-based organization assistant
5. **Context-Aware Privacy** - Local vs cloud AI, sensitivity tiers
6. **Knowledge Graph** - UID-based typed relationships
7. **Hybrid Search** - Vector + keyword + graph traversal

**What's Included:**
- Desktop application (Electron/Tauri)
- Python backend (FastAPI)
- React frontend (chat, queue, graph, settings)
- Local LLM support (Ollama, LMStudio)
- Cloud LLM option (OpenAI, Anthropic)
- Automated workflows (Prefect core, optional n8n plugin)
- Multi-modal input (text, voice transcripts)

**What's NOT Included in MVP:**
- Multi-user collaboration
- Real-time sync
- CRM features
- ITIL/operations management
- Enterprise authentication

### Future Phases: Enterprise Evolution

**Phase 3: Team Collaboration**
- Multi-user vaults
- Shared knowledge graphs
- Conflict resolution
- Permission systems
- Team workflows

**Phase 4: Enterprise Operations**
- CRM integration
- ITIL service management
- R&D project tracking
- Compliance and governance
- Advanced analytics

---

## Success Metrics (MVP)

### User Adoption
- **Target:** 1,000 active users within 6 months of launch
- **Metric:** Daily active users organizing notes with AEI
- **Benchmark:** 30% weekly retention

### Organization Efficiency
- **Target:** 80% reduction in manual organization time
- **Metric:** Time spent filing vs. AEI-assisted organization
- **Benchmark:** <5 minutes per day for organization tasks

### AI Quality
- **Target:** 90% entity extraction accuracy
- **Metric:** User approval rate on suggested entities
- **Benchmark:** <10% corrections needed

### User Satisfaction
- **Target:** NPS score >50
- **Metric:** User survey after 30 days of use
- **Benchmark:** "Significantly improves my workflow"

### Open Source Traction
- **Target:** 500 GitHub stars within 3 months
- **Metric:** Community engagement (stars, forks, contributions)
- **Benchmark:** 10+ community contributors

---

## Competitive Positioning

### vs. Obsidian
- **Them:** Manual organization, plugin-based AI
- **Us:** AI-native progressive organization, built-in automation
- **Advantage:** Eliminates manual burden while maintaining compatibility

### vs. Notion/Capacities
- **Them:** Cloud-first, database-centric, vendor lock-in
- **Us:** Local-first, markdown-native, portable
- **Advantage:** Privacy, data sovereignty, tool-agnostic

### vs. Mem.ai/Reflect
- **Them:** Cloud-only, simplified features
- **Us:** Local option, advanced knowledge graph, open-source
- **Advantage:** Power user features + privacy

### vs. NotebookLM/AnythingLLM
- **Them:** RAG tools, no progressive organization
- **Us:** Complete PKM framework + RAG
- **Advantage:** Structured knowledge management + AI chat

---

## Market Opportunity

### Addressable Market
- **PKM Software Market:** Growing rapidly (est. $2B+ by 2027)
- **Knowledge Workers:** 1 billion+ globally
- **Privacy-Conscious Segment:** 15-20% willing to pay for local-first tools
- **Open Source Community:** Strong demand for Obsidian alternatives

### Market Trends
- ✅ **AI Augmentation:** Users want AI help without losing control
- ✅ **Privacy Concerns:** Growing distrust of cloud-only solutions
- ✅ **PKM Explosion:** Remote work driving personal knowledge management
- ✅ **Open Source Preference:** Developers and power users favor open platforms

### Differentiation
1. **Only local-first PKM with AI-native progressive organization**
2. **Context-aware privacy** (unique in market)
3. **Open-source + commercial dual model**
4. **Tool-agnostic markdown foundation**
5. **Clear enterprise evolution path**

---

## Technology Foundation

**Backend:** Python (FastAPI, LlamaIndex, Instructor, Prefect)  
**Frontend:** React + TypeScript  
**Data:** Markdown files + SQLite + LanceDB  
**AI:** Local (Ollama) + Cloud (OpenAI/Anthropic)  
**Desktop:** Electron or Tauri  
**Automation:** Prefect (core) + n8n (optional plugin)

See [Technical Architecture](../03-architecture/architecture.md) for details.

---

## Roadmap

### Q4 2025: MVP Development
- ✅ Architecture complete
- ✅ Tech stack finalized
- 🟡 Week 1-4: Core backend + file watching
- ⏳ Week 5-8: AEI integration + frontend

### Q1 2026: Beta Launch
- Closed beta with 50-100 users
- Feedback iteration
- Documentation completion
- Package desktop app

### Q2 2026: Public Launch
- Open source release
- Marketing campaign (Reddit, HN, ProductHunt)
- Community building
- Initial 1,000 users

### Q3-Q4 2026: Growth & Iteration
- Premium tier launch
- Enterprise feature planning
- Strategic partnerships
- Scale to 10,000+ users

### 2027+: Enterprise Evolution
- Team collaboration features
- CRM/ITIL modules
- Enterprise sales
- Series A funding (if applicable)

---

## Key Risks & Mitigations

### Risk 1: User Adoption
**Concern:** Users might not trust AI to organize their knowledge  
**Mitigation:** Human-in-the-loop approval queue, transparent suggestions, always reversible

### Risk 2: AI Quality
**Concern:** Entity extraction accuracy might be insufficient  
**Mitigation:** Hybrid approach (spaCy + LLM), confidence scoring, user feedback loop

### Risk 3: Obsidian Ecosystem
**Concern:** Users might prefer staying in pure Obsidian  
**Mitigation:** Full Obsidian compatibility, position as "Obsidian + AI automation"

### Risk 4: Open Source Sustainability
**Concern:** How to fund development long-term  
**Mitigation:** Premium tier for individuals, enterprise licensing, consulting services

### Risk 5: Scope Creep
**Concern:** Enterprise features dilute MVP focus  
**Mitigation:** Strict phase gates, MVP-first mentality, clear roadmap boundaries

---

## Success Criteria

**MVP Success = Launch-Ready Product:**
- ✅ 8-week implementation complete
- ✅ 50 beta users successfully organizing knowledge
- ✅ <5 critical bugs
- ✅ Documentation complete
- ✅ Desktop packages for Windows/Mac/Linux

**Market Success = Product-Market Fit:**
- ✅ 1,000+ active users
- ✅ 30%+ weekly retention
- ✅ NPS >50
- ✅ 500+ GitHub stars
- ✅ 10+ community contributors

**Business Success = Sustainable:**
- ✅ Clear path to revenue (premium tier)
- ✅ Enterprise interest validated
- ✅ Funding secured OR profitable
- ✅ Team of 2-5 people

---

## Principles & Values

### User-Centric
Put user needs first. If a feature doesn't serve individual knowledge workers in MVP, defer it.

### Privacy-First
Never compromise on data sovereignty. Local-first is non-negotiable for MVP.

### Open & Transparent
Open source core, transparent roadmap, community-driven development.

### Quality Over Speed
Ship when ready, not when rushed. Polish matters for trust.

### Composable & Extensible
Build for flexibility. Enable users and developers to extend the system.

---

## Related Documents

- **[PRD](../02-product/prd.md)** - Detailed product requirements
- **[Architecture](../03-architecture/architecture.md)** - Technical design
- **[Implementation Plan](../04-implementation/implementation-plan.md)** - 8-week build plan
- **[Tech Stack](../07-reference/tech-stack-quick-ref.md)** - Technology decisions

---

**Approved by:** Product Owner  
**Framework:** BMAD-METHOD™  
**Next Review:** After MVP launch
