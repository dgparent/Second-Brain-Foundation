---
uid: artifact-{{slug}}-{{counter}}
type: artifact
title: "{{Artifact Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent
  review_at: {{ISO8601_timestamp_+90d}}
sensitivity:
  level: confidential  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
artifact_meta:
  format: document  # document | design | code | dataset | model | presentation
  version: "1.0"
  file_path: ""
  file_size: ""
  last_modified: {{ISO8601_timestamp}}
provenance:
  sources: []
  confidence: 1.0
rel:
  # - [produced_by, project-uid-123]
  # - [authored_by, person-uid-456]
  # - [cites, source-uid-789]
  # - [uses, process-uid-012]
status: draft  # draft | review | final | archived
importance: 4  # 1-5 priority score
owner: "{{Your Name}}"
stakeholders: []
bmom:
  because: "Why this artifact was created"
  meaning: "What it represents"
  outcome: "What it enables or produces"
  measure: "Usage or impact metrics"
checksum: ""
override:
  human_last: {{ISO8601_timestamp}}
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Artifact Title}}

## Overview
Description of what this artifact is and its purpose.

## Context
- **Project:** [[Project Name]]
- **Created For:** Purpose or stakeholder
- **Status:** {{Current status}}

## Content Summary
Brief description of the artifact's contents.

## Key Features
- Feature 1
- Feature 2
- Feature 3

## Related Artifacts
- [[Related Artifact 1]]
- [[Related Artifact 2]]

## Sources Used
- [[Source 1]]
- [[Source 2]]

## Version History
- v1.0 ({{date}}) - Initial creation
- v1.1 ({{date}}) - Updates

## Access & Location
- **File Path:** {{path}}
- **Access Permissions:** {{permissions}}

## Notes
Additional context, decisions made, or future improvements.
