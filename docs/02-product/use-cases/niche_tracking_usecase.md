# Niche Tracking & Micro‑Obsessions Use Case

## Overview
This use case captures the long‑tail of personal data tracking—hyper‑specific domains that matter deeply to an individual but fall outside standard app categories. Examples include sports analytics, gaming stats, niche research domains, micro‑experiments, cryptocurrency mining logs, weather patterns, vehicle diagnostics, sleep chronotypes, coffee extraction data, or any unique personal metric.

It provides a flexible, schema‑driven model so users can create structured tracking systems for *anything* without requiring custom apps.

---

## User Goals
- Track highly specific personal interests that general apps don’t support.
- Maintain a structured dataset for niche experiments or observations.
- Connect niche tracking to larger domains (health, finance, hobbies, research).
- Visualize patterns and extract insights from long‑term niche logs.
- Build custom dashboards for personal curiosities and R&D.

---

## Problems & Pain Points
- No app exists for most niche domains.
- Spreadsheets are hard to maintain and lack semantic structure.
- Tracking often becomes inconsistent due to friction.
- No linking between niche data and other life domains.
- Hard to visualize or extract insights without a structured model.

---

## Data Requirements
Because niche tracking varies heavily by user, the model must be open‑ended:
- **Custom field definitions** (numerical, categorical, boolean, free text).
- **Timestamps**, frequencies, and session metadata.
- **Relationships:** projects, health events, metrics, hobbies, research.
- **Categories:** niche type, tags, context.
- **Versioning:** tracking schema evolution over time.

---

## Entity Model
### Entity: `niche.metric`
### Entity: `niche.session`
### Entity: `niche.schema`

Key relationships:
- `tracked_by`: schema
- `recorded_in`: sessions
- `linked_to`: projects, hobbies, health metrics, research topics

---

## YAML Example — Niche Schema (Custom Metric Definition)
```yaml
---
uid: schema-coffee-extraction-v1
type: niche.schema
title: "Coffee Extraction Tracking Schema v1"
category: coffee_science
fields:
  - name: dose_g
    type: float
  - name: yield_g
    type: float
  - name: temperature_c
    type: float
  - name: pressure_bar
    type: float
  - name: tds_pct
    type: float
  - name: extraction_pct
    type: float
  - name: sensory_notes
    type: text
version: 1.0
notes: "Schema for systematic espresso extraction testing."
---
```

---

## YAML Example — Niche Metric Entry
```yaml
---
uid: metric-espresso-2025-11-12-01
type: niche.metric
schema_uid: schema-coffee-extraction-v1
date: 2025-11-12
fields:
  dose_g: 18.2
  yield_g: 38.7
  temperature_c: 92.5
  pressure_bar: 8.2
  tds_pct: 9.4
  extraction_pct: 22.4
  sensory_notes: "Bright acidity, long finish, slightly underdeveloped sweetness."
linked_projects:
  - hobbyproj-coffee-randd-2025
linked_items:
  - item-pietro-pro-grinder
sensitivity: personal
---
```

---

## YAML Example — Niche Session
```yaml
---
uid: nichesession-2025-11-12-extraction-tests
type: niche.session
title: "Extraction Profiling Session – Ethiopian Natural"
date: 2025-11-12
duration_minutes: 55
schema_uid: schema-coffee-extraction-v1
metrics:
  - metric-espresso-2025-11-12-01
  - metric-espresso-2025-11-12-02
notes: "Testing roast curve variations for vacuum+IR roast batch."
linked_projects:
  - hobbyproj-vacuum-ir-roaster
sensitivity: personal
---
```

---

## Integration Architecture
### Flexible Data Import
- CSV importer maps columns → custom fields.
- API ingestion via AEI for niche data (e.g., crypto miners, IoT sensors).

### Time‑Series Analysis
- SBF dashboards with charts and anomaly detection.

### IoT & Hardware Integration
- ESP32 / Arduino / Raspberry Pi sensors → JSON logs → YAML metrics.

### Manual + Quick Capture
- Mobile shortcuts for scanning data quickly.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Excel/Sheets | Flexible | No relationships | SBF graph + schema model |
| Airtable | Custom fields | Cloud‑locked | SBF markdown + local versioning |
| Notion | Database system | Manual + no automation | SBF ingest + schema evolution |

---

## SBF Implementation Notes
- CLI: `sbf new niche.schema`, `sbf new niche.metric`, `sbf new niche.session`.
- AEI: auto‑detect schema fields from raw logs.
- Dashboards: flexible charts, heatmaps, custom metrics.
- Cross‑domain linking: research, health patterns, hobbies, finance (costs), learning.

This use case enables users to track *anything they can imagine*—turning personal curiosities into structured, analyzable knowledge.

