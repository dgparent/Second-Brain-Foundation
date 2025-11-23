# Topic-Centric Newsroom Use Case

## Overview
This use case creates a structured system for tracking news, policy developments, market shifts, and domain-specific updates across multiple sources. Users build their own “personal newsroom,” organized by topics such as AI governance, geopolitics, economics, climate, health, cybersecurity, or niche interests.

---

## User Goals
- Maintain curated topic hubs for areas of interest.
- Aggregate content from diverse sources (RSS, newsletters, YouTube, blogs).
- Track updates chronologically with annotations.
- Link news items to research topics, assets, health events, or projects.
- Maintain long-term context for ongoing issues.

---

## Problems & Pain Points
- Users consume news reactively; no long-term synthesis.
- Different platforms → fragmented view of information.
- Hard to contextualize weekly events within larger narratives.
- Research often restarts from scratch due to lack of continuity.

---

## Data Requirements
- **Sources:** publications, journalists, newsletters, feeds.
- **Articles:** title, URL, date, summary, highlights.
- **Topic metadata:** category, keywords, relevance rating.
- **Relationships:** research topics, assets, goals, projects.

---

## Entity Model
### Entity: `info.topic`
### Entity: `info.source`
### Entity: `info.article`

Key relationships:
- `related_to`: research topics
- `published_by`: sources
- `affects`: assets (finance), projects, decisions

---

## YAML Example — Topic Hub
```yaml
---
uid: topic-ai-governance-2025
type: info.topic
title: "AI Governance & Regulation"
category: technology_policy
keywords:
  - "AI Act"
  - "model transparency"
  - "open weights"
importance: high
notes: "Track global LLM regulation policies and compliance implications."
---
```

---

## YAML Example — Article
```yaml
---
uid: article-2025-11-eu-llm-regulations
type: info.article
title: "EU Finalizes New LLM Regulation Framework"
source_uid: source-politico
date_published: 2025-11-01
url: "https://example.com/eu-regulation"
summaries:
  manual: |
    Regulation introduces new transparency requirements for large models.
  ai_generated: |
    EU imposes systemic-risk classifications for LLMs above key thresholds.
highlights:
  - text: "Models above 70B parameters classified as systemic risk."
    note: "Impacts compute governance?"
linked_topics:
  - topic-ai-governance-2025
linked_assets:
  - asset-aapl
sensitivity: public
---
```

---

## YAML Example — Source
```yaml
---
uid: source-politico
type: info.source
name: "Politico Europe"
platform: news_site
rss: "https://example.com/politico/feed"
tags:
  - politics
  - regulation
notes: "High-quality policy reporting"
---
```

---

## Integration Architecture
### RSS & News Aggregators
- Ingest via RSS feeds for most news sites.
- Periodic polling via CLI or AEI.

### Read-it-Later Tools (Instapaper, Readwise)
- Import saved articles + highlights.

### YouTube / Podcasts
- Track political commentary, weekly updates.

### Newsletter Parsing
- Email → `.eml` parser pipeline.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Feedly | Topic organization | RSS-only focus | SBF cross-source graph |
| Inoreader | Automation rules | Steeper learning curve | Unified topic dashboards |
| Readwise Reader | Highlight sync | Closed ecosystem | SBF local-first, YAML export |

---

## SBF Implementation Notes
- CLI: `sbf new info.article`, `sbf new info.topic`.
- AEI: auto-summarize articles and map them to topics.
- Dashboard: per-topic timelines, highlight maps, source reliability ranking.
- Cross-domain linking: financial assets, health events, learning domains.

