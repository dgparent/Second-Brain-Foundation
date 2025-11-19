# Learning & Skill Tree Development Use Case

## Overview
This use case defines a structured system for tracking learning goals, study materials, training routines, spaced repetition, skill trees, and progress across multiple disciplines (languages, music, engineering, programming, cooking, etc.). It organizes educational content into a hierarchical skill model that supports long-term mastery.

---

## User Goals
- Track skills they want to learn or improve over time.
- Break skills into subskills, competencies, and milestones.
- Organize learning resources (books, videos, courses, notes).
- Track practice sessions with timestamps and outcomes.
- Maintain a long-term learning roadmap.

---

## Problems & Pain Points
- Learning resources scattered across YouTube, courses, books, PDFs.
- No global picture of competencies or progress.
- Difficult to measure learning over months/years.
- Hard to link learning outcomes to project execution.
- No cross-topic synthesis (e.g., coffee roasting + chemistry + mechanics).

---

## Data Requirements
- **Skill metadata:** name, description, category, milestones.
- **Subskills:** nested hierarchy of competencies.
- **Learning resources:** tutorials, articles, books, courses.
- **Practice sessions:** logs, results, difficulty ratings.
- **Relationships:** hobby projects, research topics, content sources.

---

## Entity Model
### Entity: `learning.skill`
### Entity: `learning.subskill`
### Entity: `learning.session`
### Entity: `learning.resource`

Key relationships:
- `composed_of`: skills → subskills
- `supported_by`: books, videos, tutorials
- `improved_by`: learning sessions
- `applied_in`: hobby projects, research tasks

---

## YAML Example — Skill Tree
```yaml
---
uid: skill-coffee-roasting
type: learning.skill
title: "Coffee Roasting Mastery"
category: food_science
level: intermediate
milestones:
  - "Understand Maillard reactions"
  - "Control heat transfer under vacuum"
  - "Achieve consistent development times"
subskills:
  - subskill-chemistry-maillard
  - subskill-thermal-dynamics
linked_projects:
  - hobbyproj-vacuum-ir-roaster
notes: "Combine chemistry + engineering for optimal roast curves."
sensitivity: normal
---
```

---

## YAML Example — Subskill
```yaml
---
uid: subskill-chemistry-maillard
type: learning.subskill
title: "Maillard Reaction Chemistry"
parent_skill_uid: skill-coffee-roasting
description: "Chemical reactions responsible for browning and flavor complexity"
resources:
  - resource_uid: yt-coffee-chemistry-masterclass
  - resource_uid: book-coffee-roasters-companion
---
```

---

## YAML Example — Learning Session
```yaml
---
uid: learnsession-2025-11-12-maillard-deepdive
type: learning.session
skill_uid: skill-coffee-roasting
date: 2025-11-12
duration_minutes: 60
activity: "Studied heat-induced reaction kinetics"
results:
  insights:
    - "Vacuum reduces water activity, affecting early-stage browning"
    - "IR heating accelerates external browning vs conductive heat"
  difficulty_rating: 7
linked_resources:
  - resource_uid: yt-coffee-chemistry-masterclass
notes: "Need controlled experiments to validate rate differentials."
---
```

---

## Integration Architecture
### YouTube API
- Import educational videos.

### Course Platforms (Coursera, Udemy, Skillshare)
- Manual entry or CSV export where possible.

### Book Tracking (Goodreads, PDF notes)
- Import via API/HTML scraping or manual creation.

### Spaced Repetition
- Optional integration with Anki through JSON export.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Notion Student Templates | Good structure | No hierarchical skill trees | SBF graph-based skill model |
| Duolingo / language apps | Gamified learning | Narrow focus | SBF multi-domain learning |
| Anki | Spaced repetition | Weak context linking | SBF unified learning + notes |

---

## SBF Implementation Notes
- CLI: `sbf new learning.skill`, `sbf new learning.session`.
- AEI: generate study recommendations based on gaps.
- Dashboards: skill mastery map, weekly learning map.
- Cross-domain links: projects, research, health (energy/cognition patterns).

