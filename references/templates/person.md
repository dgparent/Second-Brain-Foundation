---
uid: person-{{slug}}-{{counter}}
type: person
title: "{{Person Name}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent  # person entities typically start permanent
  review_at: {{ISO8601_timestamp_+90d}}
sensitivity:
  level: personal  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
provenance:
  sources: []
  confidence: 1.0  # 0.0-1.0 (AI inference confidence)
rel:
  # - [collaborates_with, person-uid-123]
  # - [works_at, org-uid-456]
  # - [expert_in, topic-uid-789]
  # - [mentioned_in, daily-2025-11-02]
status: active  # active | inactive | archived
importance: 3  # 1-5 priority score
owner: "{{Your Name}}"
contact:
  email: ""
  phone: ""
  social: []
bmom:
  because: "Why this relationship matters"
  meaning: "Nature of the relationship"
  outcome: "What you hope to achieve together"
  measure: "How you'll track the relationship"
checksum: ""  # SHA-256 hash for integrity
override:
  human_last: {{ISO8601_timestamp}}  # Last human decision timestamp
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Person Name}}

## Overview
Brief description of who this person is and your relationship.

## Context
How you know them, shared projects, or areas of interaction.

## Expertise & Interests
- Area 1
- Area 2
- Area 3

## Interactions
### Recent
- [[2025-11-02]] - Brief description of interaction

### Significant
- [[YYYY-MM-DD]] - Key conversation or event

## Shared Projects
- [[Project 1]]
- [[Project 2]]

## Notes
Observations, preferences, communication style, etc.

## Follow-up Items
- [ ] Item 1
- [ ] Item 2
