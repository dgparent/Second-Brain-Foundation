# Note Taking & Personal Knowledge Capture Use Case

## Overview
This use case defines the foundational workflow for capturing notes across all contexts—meetings, ideas, reflections, journaling, research, tasks, and observations. It establishes a unified markdown-first system that supports structured capture, metadata, linking, tagging, and long-term knowledge retrieval.

---

## User Goals
- Capture information quickly and consistently.
- Organize notes by topic, domain, project, or timeline.
- Link notes to entities across all other SBF domains.
- Maintain an evolving personal knowledge graph.
- Retrieve insights using semantic search and structural queries.

---

## Problems & Pain Points
- Notes become fragmented across multiple apps.
- Lacks structure and metadata, making notes hard to find later.
- No cross-linking between ideas, projects, research, or tasks.
- Users struggle to build a durable knowledge base from raw notes.
- Traditional note-taking apps lack automation or AI context.

---

## Data Requirements
- **Note content:** markdown text, timestamps, context.
- **Metadata:** tags, domain, related entities.
- **Relationships:** projects, tasks, research topics, meetings.
- **Classification:** fleeting, literature, evergreen.

---

## Entity Model
### Entity: `pki.note`
### Entity: `pki.permanent_note`
### Entity: `pki.context_tag`

Key relationships:
- `related_to`: projects, research, skills, goals
- `derived_from`: meeting notes, highlights
- `supports`: decisions, tasks, summaries

---

## YAML Example — Standard Note
```yaml
---
uid: note-2025-11-14-ai-architecture
type: pki.note
title: "AI Architecture Brainstorm"
date: 2025-11-14
context: brainstorming
related_entities:
  - sbf-architecture-v2
  - research-ai-governance-2025
tags:
  - ai
  - architecture
  - brainstorming
sensitivity: normal
---
Key ideas:
- Hybrid local/cloud inference
- Multi-agent coordination with AEI
- Vault-centered lifecycle
```

---

## YAML Example — Permanent Note
```yaml
---
uid: evergreen-ai-lifecycle
type: pki.permanent_note
title: "AI Systems Evolve Through Contextual Feedback Loops"
derived_from:
  - note-2025-11-14-ai-architecture
insight: |
  Continuous incidental learning emerges when systems integrate
  multi-agent feedback with structured domain entities.
applications:
  - sbf-architecture
  - agent-cli
tags:
  - ai
  - systems_design
---
```

---

## Integration Architecture
### Quick Capture
- CLI quick notes: `sbf note "Text"`
- Mobile shortcuts for idea capture

### Email-to-Note
- Forward emails to ingestion pipeline

### Voice Notes
- Import audio → transcription → note conversion

### Browser Plug-in
- Convert selected text on webpages into notes with automatic metadata

### Semantic Layer
- AEI classifies notes, suggests tags, links entities

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Obsidian | Markdown native | Manual structure | SBF AI + structured entities |
| Notion | Flexible DB | Weak text-first use | SBF markdown-first + CLI |
| Roam Research | Strong linking | Subscription + silo | SBF local & cross-domain |

---

## SBF Implementation Notes
- CLI: `sbf new pki.note`, `sbf promote pki.note → pki.permanent_note`.
- AEI: automated linking, tagging, summarization.
- Dashboard: recent notes, evergreen graph, tag clusters.
- Cross-domain links: research, health, finance, projects, skills.

