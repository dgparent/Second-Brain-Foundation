# Research Dossier & Knowledge Synthesis Use Case

## Overview
The Research Dossier use case provides a structured, multi-layered system for deep research on complex topics. It supports evidence collection, literature review, comparative analysis, synthesis, and long‑term management of evolving knowledge domains. This system is ideal for policy research, technical domains, scientific exploration, market analysis, competitive intelligence, and multi‑disciplinary investigations.

---

## User Goals
- Create structured research topics with clear scopes.
- Collect and annotate articles, papers, videos, datasets, and reports.
- Build evidence maps, timelines, and argument structures.
- Track competing viewpoints and unresolved questions.
- Generate periodic synthesis summaries and decision-ready insights.

---

## Problems & Pain Points
- Research material scattered across PDFs, websites, videos, and notebooks.
- No unified way to track claims, evidence quality, or contradictions.
- Hard to maintain long-term context for multi‑month or multi‑year research.
- Many apps store highlights but do not support synthesis or cross‑topic linkage.
- Researchers frequently “start over” due to poor information organization.

---

## Data Requirements
- **Research topic:** scope, keywords, questions, hypotheses.
- **Evidence sources:** articles, papers, reports, datasets.
- **Highlights/claims:** extracted insights and contextual notes.
- **Arguments:** supporting/refuting claims.
- **Synthesis layers:** summaries, insights, recommendations.
- **Relationships:** assets, goals, projects, health/finance events.

---

## Entity Model
### Entity: `research.topic`
### Entity: `research.source`
### Entity: `research.claim`
### Entity: `research.argument`
### Entity: `research.summary`

Key relationships:
- `supported_by`: claims, evidence
- `refuted_by`: counter‑claims
- `documented_in`: research summaries
- `linked_to`: articles, assets, health metrics, hobby projects

---

## YAML Example — Research Topic
```yaml
---
uid: research-ai-governance-2025
type: research.topic
title: "Global AI Governance Models"
keywords:
  - "open-weight regulation"
  - "AI Act"
  - "compute governance"
hypotheses:
  - "Open-weight models will require new safety reporting frameworks"
  - "Parameter-count thresholds will become less relevant than capability tests"
open_questions:
  - "Will compute caps become standard?"
  - "How will multi‑jurisdiction compliance evolve?"
notes: "Track evolving global policy developments."
sensitivity: normal
---
```

---

## YAML Example — Research Source
```yaml
---
uid: rsource-llm-regulation-eu2025
type: research.source
source_type: article
title: "EU LLM Legislation Analysis"
author: "TechPolicy Review"
date: 2025-11-01
url: "https://example.com/eu-llm-analysis"
linked_topics:
  - research-ai-governance-2025
notes: "Provides overview of risk tiers and transparency requirements."
sensitivity: normal
---
```

---

## YAML Example — Claim
```yaml
---
uid: claim-ai-governance-transparency
type: research.claim
topic_uid: research-ai-governance-2025
statement: "LLM regulation will increasingly require visibility into training data provenance."
support_sources:
  - rsource-llm-regulation-eu2025
  - article-2025-11-eu-llm-regulations
refute_sources: []
notes: "Strong trend across multiple jurisdictions."
---
```

---

## YAML Example — Research Summary
```yaml
---
uid: rsummary-ai-governance-2025-nov
type: research.summary
topic_uid: research-ai-governance-2025
date: 2025-11-30
summary: |
  Several global jurisdictions increased regulatory pressure on foundation models.
  Key themes:
    - Transparency obligations for training datasets
    - Systemic-risk classification frameworks
    - Hardware-level monitoring for compute governance
recommendations: |
  1. Strengthen model documentation pipelines.
  2. Enhance auditability for training data provenance.
  3. Track emerging compute‑governance standards monthly.
sensitivity: normal
---
```

---

## Integration Architecture
### Academic Databases
- Zotero integration via JSON export.
- Google Scholar alerts → RSS.
- Semantic Scholar API for article metadata.

### PDFs
- PDF ingestion → OCR → highlight extraction.

### Read‑It‑Later Apps
- Sync highlights and annotations.

### Browser Capture
- Quick-add bookmarks tagged by topic.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Zotero | Best citation manager | Weak synthesis layer | SBF adds synthesis + graph |
| Roam/Obsidian | Great linking | No structured claims model | SBF structured arguments engine |
| Notion | Flexible tables | Weak research ontology | SBF hierarchical research system |

---

## SBF Implementation Notes
- CLI: `sbf new research.topic`, `sbf new research.claim`, `sbf new research.summary`.
- AEI: auto-summarize articles, build claim graphs, detect contradictions.
- Dashboards: evidence maps, research timelines, open‑question heatmaps.
- Cross-domain: link research to investments, health topics, skills, and projects.

