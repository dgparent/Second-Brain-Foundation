---
uid: process-{{slug}}-{{counter}}
type: process
title: "{{Process Title}}"
aliases: []
created: {{ISO8601_timestamp}}
updated: {{ISO8601_timestamp}}
lifecycle:
  state: permanent
  review_at: {{ISO8601_timestamp_+180d}}
sensitivity:
  level: confidential  # public | personal | confidential | secret
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
process_meta:
  category: workflow  # workflow | sop | methodology | framework
  maturity: draft  # draft | tested | proven | optimized
  frequency: as_needed  # daily | weekly | monthly | quarterly | as_needed
provenance:
  sources: []
  confidence: 1.0
rel:
  # - [used_by, project-uid-123]
  # - [produces, artifact-uid-456]
  # - [requires, artifact-uid-789]
status: active  # draft | active | deprecated | archived
importance: 4  # 1-5 priority score
owner: "{{Your Name}}"
bmom:
  because: "Why this process exists"
  meaning: "What it optimizes or enables"
  outcome: "Expected results when followed"
  measure: "Success metrics or KPIs"
checksum: ""
override:
  human_last: {{ISO8601_timestamp}}
tool:
  compat: [obsidian, notebooklm, anythingllm]
tags: []
---

# {{Process Title}}

## Overview
Brief description of what this process accomplishes.

## When to Use
Situations or triggers that call for this process.

## Prerequisites
- Requirement 1
- Requirement 2
- Required tools or resources

## Steps

### 1. {{Step Name}}
Description and details.

**Inputs:** What you need  
**Outputs:** What you produce  
**Notes:** Tips or common issues

### 2. {{Step Name}}
Description and details.

**Inputs:** What you need  
**Outputs:** What you produce  
**Notes:** Tips or common issues

### 3. {{Step Name}}
Description and details.

## Quality Checks
- [ ] Check 1
- [ ] Check 2
- [ ] Check 3

## Common Issues & Solutions
- **Issue:** Description
  - **Solution:** How to resolve

## Related
- **Projects Using This:** [[Project 1]], [[Project 2]]
- **Related Processes:** [[Process 1]], [[Process 2]]
- **Tools:** [[Tool 1]], [[Tool 2]]

## Version History
- v1.0 ({{date}}) - Initial documentation
- v1.1 ({{date}}) - Updates based on experience

## Improvements
Ideas for optimizing or enhancing this process.
