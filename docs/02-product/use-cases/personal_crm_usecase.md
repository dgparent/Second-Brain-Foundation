# Personal CRM (Relationships & Interactions) Use Case

## Overview
This use case defines a structured system for managing personal and professional relationships—tracking interactions, commitments, conversations, contact details, emotional patterns, and long-term relationship development. It supports both personal life (friends, family, partner) and professional networking (mentors, colleagues, investors, collaborators).

---

## User Goals
- Maintain an organized record of people in their life.
- Track conversations, meetings, commitments, and follow-ups.
- Understand relationship health and communication frequency.
- Link contacts to projects, business initiatives, events, and memories.
- Build stronger, more intentional long-term relationships.

---

## Problems & Pain Points
- Relationship details scattered across texts, emails, notes, social media.
- Hard to remember last interactions or promised follow-ups.
- No system tracks frequency or emotional sentiment in conversations.
- Most CRM tools are business-focused, not hybrid personal/professional.
- No cross-domain linking to life events, tasks, or personal goals.

---

## Data Requirements
- **Contact metadata:** name, role, relationship type, tags.
- **Interaction logs:** meetings, calls, messages, events.
- **Commitments:** promised follow-ups, favors, tasks.
- **Context:** shared interests, emotional tone, history.
- **Relationships:** linked projects, tasks, research topics.

---

## Entity Model
### Entity: `people.contact`
### Entity: `people.interaction`
### Entity: `people.relationship_profile`

Key relationships:
- `interacted_with`: contact
- `related_to`: projects, tasks, events
- `contributes_to`: long-term relationship goals

---

## YAML Example — Contact
```yaml
---
uid: contact-derrick-parent
type: people.contact
name: "Derrick Parent"
role: "Founder, Second Brain Foundation"
relationship_type: professional
location: "Ottawa, Canada"
interests:
  - ai
  - coffee_science
  - architecture
notes: "Working on SBF architecture and AI tooling."
tags:
  - vip
---
```

---

## YAML Example — Interaction Log
```yaml
---
uid: interaction-2025-11-10-investor-chat
type: people.interaction
contact_uid: contact-angel-investor-01
date: 2025-11-10
mode: call
summary: |
  Discussed early-stage funding interest for SBF hardware stack.
  Potential follow-up in two weeks.
action_items:
  - "Send pitch deck revision"
  - "Prepare hardware roadmap overview"
sentiment: positive
linked_projects:
  - taskproj-agent-cli-automation
---
```

---

## YAML Example — Relationship Profile
```yaml
---
uid: relprofile-investor-01
type: people.relationship_profile
contact_uid: contact-angel-investor-01
communication_frequency: "every 3 weeks"
history_summary: |
  Investor has shown consistent interest in SBF's approach to
  privacy-first architecture and agent automation.
strength_score: 7
notes: "High potential for convertible note discussion."
---
```

---

## Integration Architecture
### Email & Calendar
- Import conversations, meetings, and follow-up reminders.

### Messaging Apps
- Optional ingestion from WhatsApp, Telegram, SMS (manual or automated).

### Social Media
- Track interactions on LinkedIn, X, Discord.

### Browser & Notes
- Convert meeting notes into interactions.

### AEI Automations
- Suggest follow-ups based on context.
- Detect lapsed relationships.
- Summarize multi-channel communication.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Clay | Beautiful personal CRM | Closed, cloud | SBF local-first graph |
| Monica | Open-source CRM | Not multi-domain | SBF unified with health/finance |
| Notion templates | Flexible | No automation | SBF AEI-driven relationship engine |

---

## SBF Implementation Notes
- CLI: `sbf new people.contact`, `sbf new people.interaction`.
- AEI: follow-up reminders, sentiment tracking, relationship summaries.
- Dashboard: relationship health, communication frequency map.
- Cross-domain links: tasks, business goals, events, journaling insights.

