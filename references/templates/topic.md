---
uid: topic-{{slug}}-{{counter}}
type: topic
title: "{{Topic Title}}"
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
  # - [informs, project-uid-123]
  # - [related_to, topic-uid-456]
status: active  # active | planned | paused | done | archived
importance: 3  # 1-5 priority score
owner: "{{Your Name}}"
stakeholders: []
bmom:
  because: "Why this topic matters"
  meaning: "What it represents in your knowledge system"
  outcome: "Expected understanding or capability"
  measure: "How you'll know you've mastered it"
checksum: ""  # SHA-256 hash for integrity
override:
  human_last: {{ISO8601_timestamp}}  # Last human decision timestamp
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Topic Title}}

## Overview
Brief description of the topic and its significance.

## Key Concepts
- Core concept 1
- Core concept 2

## Related Topics
- [[Related Topic 1]]
- [[Related Topic 2]]

## Resources
- [Resource 1](url)
- [Resource 2](url)

## Notes
Additional context, insights, or observations.

## Open Questions
- Question 1?
- Question 2?
