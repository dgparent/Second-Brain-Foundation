---
uid: task-{{slug}}-{{counter}}
type: task
title: "{{Task Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent
  review_at: {{due_date}}
sensitivity:
  level: personal  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: true
task_meta:
  priority: medium  # critical | high | medium | low
  effort: medium  # small | medium | large
  due_date: {{YYYY-MM-DD}}
  started_date: null
  completed_date: null
provenance:
  sources: []
  confidence: 1.0
rel:
  # - [part_of, project-uid-123]
  # - [blocks, task-uid-456]
  # - [depends_on, task-uid-789]
  # - [assigned_to, person-uid-012]
status: todo  # todo | in_progress | blocked | completed | cancelled
importance: 3  # 1-5 priority score
owner: "{{Your Name}}"
bmom:
  because: "Why this task is necessary"
  meaning: "What completion achieves"
  outcome: "Specific deliverable"
  measure: "Definition of done"
checksum: ""
override:
  human_last: {{ISO8601_timestamp}}
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Task Title}}

## Description
Clear statement of what needs to be done.

## Context
Why this task matters and how it fits into larger work.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Dependencies
- Depends on: [[Task 1]]
- Blocks: [[Task 2]]

## Related
- **Project:** [[Project Name]]
- **Related Topics:** [[Topic 1]], [[Topic 2]]

## Subtasks
- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

## Notes
Work log, blockers, decisions.

## Resources
- [[Source 1]]
- [External Link](url)
