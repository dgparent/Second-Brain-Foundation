# Task & Project Management Use Case

## Overview
This use case defines a unified, domain-agnostic system for managing tasks, projects, workflows, and multi-step life initiatives. It replaces fragmented task managers (Todoist, Notion, Asana, ClickUp) with a markdown-first, entity-driven framework that integrates seamlessly with all SBF domains: health, finance, hobbies, learning, research, and more.

---

## User Goals
- Capture tasks quickly with consistent structure.
- Organize projects with clear milestones and workflows.
- Link tasks to notes, research, goals, habits, or domain entities.
- Track progress over time and maintain execution momentum.
- Build multi-domain project dashboards (health, finance, hobby, work).

---

## Problems & Pain Points
- Tasks stored in isolated apps lack context and meaning.
- Users lose track of long-term or multi-domain projects.
- No integration between project tasks and research/notes.
- Traditional task managers lack cross-domain linking or semantic intelligence.
- Difficult to maintain alignment with goals and upcoming deadlines.

---

## Data Requirements
- **Task metadata:** priority, deadline, status, effort estimate.
- **Project structure:** milestones, phases, workflows, timelines.
- **Relationships:** related notes, research topics, health/finance items.
- **Context:** domain, category, associated events.

---

## Entity Model
### Entity: `task.item`
### Entity: `task.project`
### Entity: `task.milestone`

Key relationships:
- `belongs_to`: projects
- `supports`: goals
- `related_to`: notes, highlights, research topics
- `depends_on`: prerequisite tasks

---

## YAML Example — Task
```yaml
---
uid: task-2025-11-15-set-up-n8n
type: task.item
title: "Set up n8n automation server"
priority: high
status: in_progress
due_date: 2025-11-20
estimated_effort: "3h"
project_uid: taskproj-agent-cli-automation
linked_entities:
  - sbf-architecture-v2
  - research-ai-governance-2025
notes: "Required for Obsidian → Agent CLI integration"
sensitivity: normal
---
```

---

## YAML Example — Project
```yaml
---
uid: taskproj-agent-cli-automation
type: task.project
title: "Agent CLI Automation Stack"
category: technology
goal_alignment:
  - goal-davao-homestead-2027
start_date: 2025-11-01
target_completion: 2026-02-01
milestones:
  - milestone_uid: milestone-agentcli-v1
  - milestone_uid: milestone-obisidan-integration
status: active
notes: "Focus on MCP connectors and RAG pipelines."
---
```

---

## YAML Example — Milestone
```yaml
---
uid: milestone-agentcli-v1
type: task.milestone
title: "Agent CLI v1 Prototype"
description: "Minimal CLI that can run AEI tasks and ingest markdown entities."
expected_date: 2025-12-15
progress: 40
tasks:
  - task-2025-11-15-set-up-n8n
  - task-2025-11-12-create-ingestion-schemas
---
```

---

## Integration Architecture
### Calendar Systems (Google/Apple Calendar)
- Sync deadlines, reminders, and time-blocked tasks.

### Email → Task
- Parse actionable emails into task entries.

### GitHub / GitLab
- Map issues and pull requests to project tasks.

### Browser Quick Add
- Convert webpage content into actionable tasks.

### AEI Automation
- Suggest deadlines, dependencies, and prioritization.
- Transform notes → tasks through extraction.
- Detect overdue items and suggest scheduling.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Todoist | Clean UI | Weak cross-domain linking | SBF unified domain relationships |
| Notion | Flexible databases | No automated ingestion | AEI automation + markdown-first |
| Asana/ClickUp | Enterprise workflows | Overkill for personal use | SBF simple + powerful graph |

---

## SBF Implementation Notes
- CLI: `sbf new task.item`, `sbf new task.project`.
- AEI: generates schedules, dependencies, and milestone summaries.
- Dashboard: kanban boards, timelines, dependency graphs.
- Cross-domain: finance (bills), health (appointments), research (papers), hobby (build logs).

