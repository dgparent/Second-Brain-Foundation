# Symptom Tracking Use Case

## Overview
A structured system for capturing, correlating, and analyzing personal symptom events over time. This use case supports longitudinal health insights, physician communication, and correlation between symptoms, metrics, medications, lifestyle, and environmental triggers.

---

## User Goals
- Track symptom occurrences with timestamp, location, severity, and context.
- Identify correlations with sleep, steps, heart rate, nutrition, stress, menstrual cycle, environmental factors.
- Export summaries for healthcare appointments.
- Link symptoms to medications, conditions, metrics, and events.

---

## Problems & Pain Points
- Siloed data in health apps, journals, or memory.
- Difficult to correlate symptom patterns over months or years.
- Healthcare providers lack historical context.
- Data export/import between health apps and PKM tools is limited.

---

## Data Requirements
- **Core fields:** date, time, symptom type, body region, severity (0–10), duration.
- **Context tags:** food, exercise, sleep, stress, menstrual cycle, location.
- **Relationships:** medication intake, health metrics, conditions, documents.
- **Source system:** manual entry, Apple Health export, Google Fit metrics.

---

## Entity Model
### Entity: `health.symptom_event`
Key relationships:
- `correlates_with`: health metrics
- `related_to`: medications, conditions
- `occurs_during`: appointments, life events

---

## YAML Example
```yaml
---
uid: symptom-2025-11-10-knee-pain
type: health.symptom_event
title: "Right knee flare after long walk"
date: 2025-11-10
time: "20:30"
symptom_type: knee_pain
severity_0_10: 7
duration_minutes: 90
body_region: right_knee
context:
  activity: "10km walk"
  sleep_prev_hours: 5.5
  stress_level: medium
linked_metrics:
  - metric_uid: metric-hrv-2025-11-10
    relationship: correlates_with
linked_medications:
  - medication_order_uid: medorder-meloxicam-2025
relationships:
  - type: correlates_with
    target_uid: metric-steps-2025-11-10
sensitivity: confidential
source_system:
  imported_from: apple_health_export
created_at: 2025-11-11T09:00:00-05:00
updated_at: 2025-11-11T09:10:00-05:00
---
# Notes
Pain started after kilometer 8. Mild improvement with ice.
```

---

## Integration Architecture
### Apple Health
- Import via exported XML.
- Map `HKCategoryTypeIdentifier` to symptom types.
- Correlate with HR, HRV, sleep, activity.

### Google Fit
- Use REST API for daily metrics.
- Map heart rate, steps, sleep metrics to correlations.

### Fitbit
- Activity/sleep data used for correlation.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Bearable | Excellent symptom UI | Closed ecosystem | SBF can unify with metrics + YAML |
| Migraine Buddy | Specialized | Single condition | SBF supports all symptom types |
| HealthKit | Accurate metrics | No cross-domain insight | SBF provides correlation engine |

---

## SBF Implementation Notes
- CLI command: `sbf new health.symptom_event`
- Automated correlation engine using AEI embeddings
- Dashboard: symptom heatmaps + trend over time
- Cross-domain linking with finance, appointments, life events

