# Hobby Projects & Creative Workflows Use Case

## Overview
This use case defines a structured system for capturing, organizing, and executing hobby-related projects across domains such as cooking, DIY, engineering, crafting, gaming, writing, and maker projects. It supports iterative project development, materials management, progress tracking, and inspiration linkage.

---

## User Goals
- Create structured project pages for hobbies (cooking, coffee science, DIY builds, art, music, etc.).
- Track steps, tasks, materials, tools, and progress.
- Link tutorials, references, videos, Reddit threads, and Discord discussions to each project.
- Maintain logs of project sessions and experiment results.
- Track version history for iterative creative work.

---

## Problems & Pain Points
- Hobby work is often scattered across bookmarks, screenshots, YouTube playlists, and loose notes.
- No unified system handles multi-step experiments or iterative creative improvements.
- Materials lists, instructions, and experiments are rarely stored cohesively.
- Hard to connect multiple sources of inspiration to one final project.

---

## Data Requirements
- **Project metadata:** name, category, status, priority.
- **Tasks/workflow:** steps, subtasks, checklists.
- **Materials/equipment:** items, quantities, costs.
- **Sessions:** timestamps, duration, notes, results.
- **Inspiration:** content sources, ideas, diagrams, images.

---

## Entity Model
### Entity: `hobby.project`
### Entity: `hobby.item`
### Entity: `hobby.session`

Key relationships:
- `uses`: items/materials
- `based_on`: content sources
- `progressed_by`: sessions
- `belongs_to_category`: hobby type

---

## YAML Example — Hobby Project
```yaml
---
uid: hobbyproj-vacuum-ir-roaster
type: hobby.project
title: "Vacuum + IR Coffee Roaster Prototype"
category: coffee_engineering
status: in_progress
priority: high
start_date: 2025-10-01
materials:
  - item_uid: item-borosilicate-vessel-30cm
    purpose: "Vacuum chamber"
  - item_uid: item-swir-lamp-b08m9n5d73
    purpose: "Infrared heat source"
tasks:
  - description: "Design heat shielding"
    status: done
  - description: "Run heating curve tests at 20kPa"
    status: in_progress
linked_sources:
  - source_uid: yt-coffee-vision
    role: inspiration
  - source_uid: reddit-r-coffee-thread-9341
    role: troubleshooting
notes: "Focus on thermal uniformity using rotating chamber."
sensitivity: personal
---
```

---

## YAML Example — Session Log
```yaml
---
uid: session-2025-11-12-vacuum-test-1
type: hobby.session
project_uid: hobbyproj-vacuum-ir-roaster
date: 2025-11-12
duration_minutes: 90
activity: "Initial IR heating test in 50kPa vacuum"
results:
  temperature_reached_c: 187
  issues:
    - "Uneven heating"
    - "Seal leakage after 45 minutes"
notes: "Next: test with improved seal and lower starting pressure"
---
```

---

## Integration Architecture
### YouTube
- Import tutorial videos, engineering guides, experiment workflows.

### Reddit
- Link threads for troubleshooting.

### Discord
- Capture community insight from maker or specialty servers.

### Images & Diagrams
- Link local images or embedded diagrams for prototypes.

### BOM (Bill of Materials)
- Manual entry or ingest from spreadsheets.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Notion | Good project templates | Weak experiment logging | SBF experiment logs + YAML |
| Trello | Visual workflow | Not hobby-focused | SBF structured project templates |
| Obsidian | Flexible linking | No built-in BOM/tasks | SBF adds project scaffolding |

---

## SBF Implementation Notes
- CLI: `sbf new hobby.project`, `sbf new hobby.session`.
- AEI: suggest next steps based on session notes.
- Dashboard: project pipeline, timeline, experiments map.
- Cross-domain: link to finance (costs), health (injuries), learning (skills).

