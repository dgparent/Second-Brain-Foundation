# Highlight Synthesis & Permanent Knowledge Creation Use Case

## Overview
This use case defines a structured pipeline for transforming raw highlights—extracted from books, articles, PDFs, podcasts, and videos—into synthesized, durable knowledge. It supports the transition from **fleeting notes → literature notes → evergreen notes**, enabling deep understanding, cross-domain integration, and long-term memory retention.

---

## User Goals
- Consolidate highlights from all reading and media sources.
- Generate permanent notes that summarize, interpret, and contextualize key ideas.
- Create synthesis across books, disciplines, and domains.
- Build and maintain idea clusters, conceptual maps, and long-range thinking.
- Feed insights into projects, decisions, and research.

---

## Problems & Pain Points
- Highlights pile up without ever becoming usable knowledge.
- Notes apps trap highlights without proper linking or structure.
- Users forget what they read because no synthesis occurs.
- It’s difficult to transform raw notes into actionable ideas.
- Lack of automated workflows for clustering or summarizing highlights.

---

## Data Requirements
- **Highlight metadata:** text, location, source, context.
- **Literature notes:** concise summaries and interpretations.
- **Evergreen notes:** generalized, reusable insights.
- **Relationships:** link highlights → ideas → projects → domains.

---

## Entity Model
### Entity: `info.highlight`
### Entity: `knowledge.literature_note`
### Entity: `knowledge.evergreen_note`

Key relationships:
- `derived_from`: highlight → literature note
- `supports`: evergreen note
- `linked_to`: research topics, hobby projects, goals

---

## YAML Example — Highlight
```yaml
---
uid: highlight-2025-maillard-chemistry-01
type: info.highlight
source_item_uid: saveditem-chemistry-foodscience-2025
text: "Maillard reactions depend heavily on water activity and temperature profile."
location: chapter_3
notes: "Important for vacuum roasting tests."
linked_topics:
  - topic-coffee-science
sensitivity: normal
---
```

---

## YAML Example — Literature Note
```yaml
---
uid: litnote-maillard-chemistry-01
type: knowledge.literature_note
title: "Key Factors in Maillard Browning"
derived_from:
  - highlight-2025-maillard-chemistry-01
summary: |
  Under reduced water activity (e.g., in vacuum), Maillard reactions initiate differently
  and can lead to distinct flavor development. Temperature control remains the primary driver.
insights:
  - "Vacuum roasting alters browning kinetics"
  - "Control over energy input determines outcome more than pressure"
linked_projects:
  - hobbyproj-vacuum-ir-roaster
---
```

---

## YAML Example — Evergreen Note
```yaml
---
uid: evergreen-maillard-thermal-dynamics
type: knowledge.evergreen_note
title: "Thermal Kinetics Govern Browning Across All Mediums"
core_idea: |
  Regardless of medium (air, vacuum, liquid), browning chemistry follows predictable
  temperature-dependent kinetics. Pressure and water activity modify rates but not the core model.
applications:
  - coffee_roasting
  - cooking_science
  - material_thermal_processing
linked_literature_notes:
  - litnote-maillard-chemistry-01
---
```

---

## Integration Architecture
### Readwise, Instapaper, Omnivore
- Import highlights via API or export.
- Convert highlights → `info.highlight`.

### PDF & eBooks
- Extract highlights with PDF parsers or Calibre.

### YouTube / Podcasts
- Transcript-based highlight extraction.

### AI-Assisted Synthesis
- AEI generates literature notes from highlights.
- AEI clusters related highlights into evergreen notes.
- AEI supports progressive summarization.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Readwise | Excellent highlight sync | Weak synthesis workflow | SBF adds structured synthesis pipeline |
| Obsidian | Good for evergreen notes | No ingestion automation | SBF connectors + AEI |
| Notion | Flexible for notes | No PKM science baked-in | SBF structured knowledge creation model |

---

## SBF Implementation Notes
- CLI: `sbf new info.highlight`, `sbf new knowledge.literature_note`, `sbf new knowledge.evergreen_note`.
- AEI suggestions: auto-cluster themes, generate evergreen notes.
- Dashboard: highlight inbox → synthesis queue → evergreen knowledge map.
- Cross-domain linking: finance strategy, health learning, engineering experiments.

