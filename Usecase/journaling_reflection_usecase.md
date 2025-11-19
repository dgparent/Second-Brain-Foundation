# Journaling & Reflection Use Case

## Overview
This use case provides a structured framework for capturing daily reflections, emotional states, insights, gratitude logs, and personal narratives. It enriches self-awareness and supports long-term tracking of mental, emotional, cognitive, and behavioral patterns. Journaling ties into health, productivity, habits, relationships, and decision-making.

---

## User Goals
- Maintain a daily or periodic journal.
- Capture thoughts, moods, insights, and emotions.
- Track long-term personal and psychological trends.
- Link reflections to life events, health patterns, habits, and decisions.
- Convert raw journal entries into actionable insights or permanent notes.

---

## Problems & Pain Points
- Journals often become unstructured and unread.
- Hard to track emotional or cognitive patterns over time.
- Traditional journaling apps lack cross-domain linking.
- Users forget insights buried in entries.
- No structured metadata for AI synthesis.

---

## Data Requirements
- **Journal entries:** text, timestamp, emotional state.
- **Metadata:** mood, stress level, sleep, energy.
- **Relationships:** health metrics, symptoms, events, tasks.
- **Tagging:** themes such as gratitude, problem-solving, relationships.

---

## Entity Model
### Entity: `personal.journal_entry`
### Entity: `personal.mood_log`

Key relationships:
- `linked_to`: events, health metrics, interpersonal notes
- `derived_from`: daily reflections or voice notes
- `contributes_to`: personal insight maps

---

## YAML Example — Journal Entry
```yaml
---
uid: journal-2025-11-12-morning
type: personal.journal_entry
date: 2025-11-12
time: "08:15"
mood: "calm"
stress_level: 3
energy_level: 6
grateful_for:
  - "Ability to continue project work"
  - "Good coffee this morning"
linked_entities:
  - taskproj-agent-cli-automation
  - symptom-2025-11-12-knee-pain
entry: |
  Feeling relatively focused this morning. Knee pain is manageable. Planning to finalize
  the next phase of the SBF ingestion architecture.
insights:
  - "Sleep improved mood today"
  - "Pain correlates with motivation fluctuations"
sensitivity: confidential
---
```

---

## YAML Example — Mood Log
```yaml
---
uid: mood-2025-11-12-evening
type: personal.mood_log
date: 2025-11-12
time: "20:45"
mood: "tired"
stress_level: 6
energy_level: 3
linked_journal_entry: journal-2025-11-12-morning
notes: "Low energy in the evening; may need earlier rest schedule."
sensitivity: confidential
---
```

---

## Integration Architecture
### Voice Notes → Journal
- AEI transcribes audio → structured journal entry.

### Health Metrics
- Sleep, HRV, and symptoms linked to emotional state.

### Task & Event Linkage
- Tasks completed affect mood patterns.
- Life events provide context for emotional swings.

### Daily Review Pipeline
- Auto-summary of the day → permanent insights.

### Weekly & Monthly Reflection Cycles
- AEI generates reflection prompts using past patterns.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Day One | Beautiful UI | Closed | SBF cross-domain + AI reflections |
| Journey | Guided prompts | Limited linking | SBF structured metadata |
| Notion templates | Flexible | Manual | SBF semantic + automated insights |

---

## SBF Implementation Notes
- CLI: `sbf new personal.journal_entry`, `sbf new personal.mood_log`.
- AEI: extract themes, synthesize insights, detect emotional patterns.
- Dashboard: mood trends, stress/energy graphs, insight cloud.
- Cross-domain: health, tasks, relationships, projects, learning.

