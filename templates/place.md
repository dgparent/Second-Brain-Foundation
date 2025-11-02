---
uid: place-{{slug}}-{{counter}}
type: place
title: "{{Place Name}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent  # place entities typically start permanent
  review_at: {{ISO8601_timestamp_+90d}}
sensitivity:
  level: personal  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
provenance:
  sources: []
  confidence: 1.0  # 0.0-1.0 (AI inference confidence)
rel:
  # - [located_in, place-parent-uid]
  # - [hosts, event-uid-123]
  # - [associated_with, project-uid-456]
status: active  # active | inactive | archived
importance: 3  # 1-5 priority score
location:
  type: physical  # physical | virtual | conceptual
  coordinates: ""  # lat/long if applicable
  address: ""
  url: ""  # for virtual spaces
bmom:
  because: "Why this place is significant"
  meaning: "What this place represents"
  outcome: "What happens here"
  measure: "How often visited or referenced"
checksum: ""  # SHA-256 hash for integrity
override:
  human_last: {{ISO8601_timestamp}}  # Last human decision timestamp
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Place Name}}

## Overview
Brief description of the place and its significance.

## Type
Physical location / Virtual space / Conceptual domain

## Context
When and why you interact with this place.

## Events & Activities
- [[Event 1]] - {{date}}
- [[Event 2]] - {{date}}

## Associated People
- [[Person 1]]
- [[Person 2]]

## Associated Projects
- [[Project 1]]
- [[Project 2]]

## Notes
Observations, atmosphere, practical information.

## References
- [External link 1](url)
- [External link 2](url)
