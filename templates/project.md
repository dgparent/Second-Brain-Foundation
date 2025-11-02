---
uid: project-{{slug}}-{{counter}}
type: project
title: "{{Project Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: capture  # capture | transitional | permanent | archived
  review_at: {{ISO8601_timestamp_+48h}}
sensitivity:
  level: personal  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: true
provenance:
  sources: []
  confidence: 1.0  # 0.0-1.0 (AI inference confidence)
rel:
  # - [subproject_of, project-parent-uid]
  # - [uses, process-uid-123]
  # - [occurs_at, place-uid-456]
  # - [informed_by, topic-uid-789]
status: planned  # planned | active | paused | completed | archived
importance: 4  # 1-5 priority score
owner: "{{Your Name}}"
stakeholders: []
timeline:
  start_date: {{YYYY-MM-DD}}
  target_date: {{YYYY-MM-DD}}
  completed_date: null
bmom:
  because: "Why this project exists"
  meaning: "What success means"
  outcome: "Specific deliverable or result"
  measure: "Success criteria"
checksum: ""  # SHA-256 hash for integrity
override:
  human_last: {{ISO8601_timestamp}}  # Last human decision timestamp
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Project Title}}

## Objective
Clear statement of what this project aims to achieve.

## Context
Why this project matters and how it fits into larger goals.

## Milestones
- [ ] Milestone 1 - {{date}}
- [ ] Milestone 2 - {{date}}
- [ ] Milestone 3 - {{date}}

## Key Activities
1. Activity 1
2. Activity 2
3. Activity 3

## People Involved
- [[Person 1]] - Role
- [[Person 2]] - Role

## Related Resources
- [[Topic 1]] - Supporting knowledge
- [[Source 1]] - Reference material

## Notes
Project journal, decisions, and observations.

## Next Actions
- [ ] Action 1
- [ ] Action 2
