# Creative Swipefile & Inspiration Archive Use Case

## Overview
This use case provides a structured system for collecting, organizing, and reusing inspiration sources—quotes, prompts, visual references, writing patterns, design patterns, hooks, marketing copy, frameworks, and creative ideas. It enables creators to build a personal "idea reservoir" for reuse across writing, design, product development, innovation, and hobby projects.

---

## User Goals
- Capture inspiration quickly (quotes, screenshots, notes, ideas).
- Categorize inspiration into reusable themes.
- Retrieve patterns and examples during creative work.
- Link ideas to projects, content drafts, or learning goals.
- Maintain a large evolving archive of references.

---

## Problems & Pain Points
- Inspiration is scattered across social media, YouTube, Reddit, screenshots, PDFs, etc.
- Hard to remember where inspiration came from.
- Notes apps lack structured tagging for reuse.
- No unified system for connecting sparks → drafts → finished content.
- Swipefiles often become massive, unsearchable dumps.

---

## Data Requirements
- **Inspiration items:** text, image, link, quote, visual reference.
- **Metadata:** category, emotional tone, content type, tag cloud.
- **Relationships:** linked content drafts, skill development, projects.
- **Capture pipeline:** mobile capture, browser extension, clipboard imports.

---

## Entity Model
### Entity: `creative.swipe_item`
### Entity: `creative.category`
### Entity: `creative.pattern`

Key relationships:
- `belongs_to`: category
- `applied_in`: drafts, creative projects
- `references`: external source
- `derived_from`: earlier swipe items (versioning)

---

## YAML Example — Swipe Item (Text)
```yaml
---
uid: swipe-2025-11-12-compelling-hook
type: creative.swipe_item
title: "Compelling Opening Hook"
content: |
  "People don’t buy products—they buy versions of themselves."
source_url: "https://example.com/marketing-hooks"
category: marketing_copy
tags:
  - psychology
  - persuasion
  - branding
use_cases:
  - project-website-rewrite-2025
notes: "Use for homepage hero statement options."
sensitivity: normal
---
```

---

## YAML Example — Swipe Item (Image)
```yaml
---
uid: swipe-2025-10-02-minimal-ui
type: creative.swipe_item
title: "Minimal UI Reference"
media_type: image
image_path: "/assets/swipe/minimal-ui-2025.png"
category: ui_design
tags:
  - clean
  - whitespace
  - modern
linked_projects:
  - sbf-personal-dashboard-v1
notes: "Inspiration for card-based dashboard layout."
sensitivity: normal
---
```

---

## YAML Example — Creative Pattern
```yaml
---
uid: pattern-three-layer-story
type: creative.pattern
title: "Three-Layer Story Structure"
description: "Hook → Story → Insight → Call-to-action"
categories:
  - writing
use_cases:
  - content-blogpost-structure-2025
notes: "Useful for thought-leadership writing."
---
```

---

## Integration Architecture
### Browser Capture
- Use AI assistant or mobile shortcut to create swipe items automatically.

### Social Media Imports
- YouTube: save inspirations from videos.
- Reddit: import saved posts.
- X/Twitter: import liked posts.

### Screenshots / Image Inputs
- SBF stores images locally with metadata.

### Mobile Capture
- Quick-add CLI or mobile workflow for instant inspiration entry.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Readwise | Great at highlight aggregation | Not structured for creative patterns | SBF adds pattern-based linking |
| Notion | Flexible database style | Weak quick capture | Fast SBF capture → markdown |
| Milanote | Visual inspiration | Weak long-term archival | SBF unified graph + versioning |

---

## SBF Implementation Notes
- CLI: `sbf new creative.swipe_item`, `sbf new creative.pattern`.
- AEI: recommend patterns to apply based on project drafts.
- Dashboard: visual inspiration board, tag heatmap.
- Cross-domain linking: learning skill trees, hobby projects, writing pipeline.

