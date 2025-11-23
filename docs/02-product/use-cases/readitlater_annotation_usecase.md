# Read-It-Later & Annotation Use Case

## Overview
This use case defines a unified system for capturing, storing, annotating, and synthesizing articles, blog posts, PDFs, newsletters, videos, and long-form content. It centralizes all saved‑for‑later material into a structured, searchable PKM framework with highlight extraction, annotation workflows, and cross-domain linking.

---

## User Goals
- Save articles, newsletters, and videos for later reading/watching.
- Extract and store highlights, notes, and key insights.
- Tag and categorize saved items by topic, project, or research theme.
- Maintain reading lists and track progress.
- Convert consumed content into permanent notes or research artifacts.

---

## Problems & Pain Points
- Saved articles often accumulate and become unmanageable.
- Highlights locked inside proprietary apps (Instapaper, Pocket, Medium).
- No linkage between saved content → projects → insights.
- No long-term context: why something was saved, what was learned.
- Hard to unify PDFs, videos, newsletters, and web content.

---

## Data Requirements
- **Saved content:** title, URL, save date, content type.
- **Annotations:** highlights, comments, key points, tags.
- **Status:** unread, in-progress, completed, archived.
- **Relationships:** research topics, projects, goals.

---

## Entity Model
### Entity: `info.saved_item`
### Entity: `info.highlight`
### Entity: `info.annotation`

Key relationships:
- `contains`: highlights
- `annotated_for`: projects, research topics
- `related_to`: content sources, topics

---

## YAML Example — Saved Item
```yaml
---
uid: saveditem-2025-11-ai-ethics-guide
type: info.saved_item
title: "A Practical Guide to AI Ethics"
url: "https://example.com/ai-ethics-guide"
content_type: article
saved_date: 2025-11-12
status: in_progress
linked_topics:
  - topic-ai-governance-2025
tags:
  - ethics
  - governance
  - ai
notes: "Use this for regulatory deep-dive."
sensitivity: normal
---
```

---

## YAML Example — Highlight
```yaml
---
uid: highlight-2025-ai-ethics-h1
type: info.highlight
parent_item_uid: saveditem-2025-11-ai-ethics-guide
text: "Effective AI governance requires visibility into model training data."
location: paragraph_12
annotation: "Relates to transparency obligation for future SBF compliance module."
linked_research_topics:
  - topic-ai-governance-2025
---
```

---

## Integration Architecture
### Instapaper
- API allows pulling bookmarks and highlights.
- Map highlights → `info.highlight` entities.

### Readwise Reader
- Webhooks or export → ingest highlights and reading progress.

### Omnivore
- Direct export of articles + annotations.

### PDFs
- Support PDF parsing with highlight extraction.

### Browser Capture
- Use AI assistant or bookmarklet for quick saves.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Instapaper | Simple, reliable highlights | Silos annotations | SBF unifies annotations + cross-domain graph |
| Readwise Reader | Multi-source ingestion | Cloud-only | Local, markdown-first SBF integration |
| Pocket (Legacy) | Good UI | Limited export | Full structure with YAML and linking |

---

## SBF Implementation Notes
- CLI: `sbf new info.saved_item`, `sbf new info.highlight`.
- AEI: auto-summarize articles, generate permanent notes.
- Dashboard: reading queue, highlight graph, topic saturation.
- Cross-domain: link highlights → research, skills, projects, finance, health.

