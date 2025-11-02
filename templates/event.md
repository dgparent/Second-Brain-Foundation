---
uid: event-{{slug}}-{{counter}}
type: event
title: "{{Event Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent
  review_at: null
sensitivity:
  level: personal  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: true
event_meta:
  type: meeting  # meeting | conference | workshop | milestone | deadline
  start_time: {{ISO8601_timestamp}}
  end_time: {{ISO8601_timestamp}}
  duration_minutes: 0
  location_type: physical  # physical | virtual | hybrid
provenance:
  sources: []
  confidence: 1.0
rel:
  # - [occurs_at, place-uid-123]
  # - [part_of, project-uid-456]
  # - [involves, person-uid-789]
status: scheduled  # scheduled | completed | cancelled | rescheduled
importance: 3  # 1-5 priority score
attendees: []
bmom:
  because: "Why this event matters"
  meaning: "What it represents"
  outcome: "Expected results"
  measure: "Success criteria"
checksum: ""
override:
  human_last: {{ISO8601_timestamp}}
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Event Title}}

## Details
- **Date:** {{Date}}
- **Time:** {{Start}} - {{End}}
- **Location:** [[Place]] or {{Virtual link}}
- **Type:** {{Type}}

## Attendees
- [[Person 1]]
- [[Person 2]]

## Agenda
1. Topic 1
2. Topic 2
3. Topic 3

## Notes


## Action Items
- [ ] Action 1 - Assigned to [[Person]]
- [ ] Action 2 - Assigned to [[Person]]

## Decisions Made


## Follow-up


## Related
- [[Project 1]]
- [[Topic 1]]
