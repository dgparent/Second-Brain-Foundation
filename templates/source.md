---
uid: source-{{slug}}-{{counter}}
type: source
title: "{{Source Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent
  review_at: null
sensitivity:
  level: public  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
source_meta:
  type: article  # article | book | paper | video | podcast | website | dataset
  authors: []
  publication_date: {{YYYY-MM-DD}}
  url: ""
  doi: ""
  isbn: ""
  accessed_date: {{YYYY-MM-DD}}
provenance:
  sources: []  # Citations within this source
  confidence: 1.0
rel:
  # - [cited_by, artifact-uid-123]
  # - [relates_to, topic-uid-456]
status: active  # active | archived
importance: 3  # 1-5 priority score
bmom:
  because: "Why this source is valuable"
  meaning: "What it contributes to knowledge"
  outcome: "How it informs work"
  measure: "Citation count or reference frequency"
checksum: ""
override:
  human_last: {{ISO8601_timestamp}}
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Source Title}}

## Metadata
- **Type:** {{Type}}
- **Authors:** {{Author list}}
- **Publication Date:** {{Date}}
- **URL:** [Link]({{url}})

## Summary
Brief overview of the source content and key arguments.

## Key Points
- Point 1
- Point 2
- Point 3

## Relevant Quotes
> Quote 1

> Quote 2

## My Analysis
Personal thoughts, critiques, and connections.

## Related Topics
- [[Topic 1]]
- [[Topic 2]]

## Applications
How this source informs current projects or thinking:
- [[Project 1]] - Application context
- [[Topic 1]] - Theoretical connection

## References
Other sources cited within this work.
