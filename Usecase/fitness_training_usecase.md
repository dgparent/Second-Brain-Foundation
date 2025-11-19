# Fitness & Training Log Use Case

## Overview
This use case defines a structured system for tracking workouts, physical activity, training load, recovery, and fitness progress. It integrates metrics from wearable devices, manual entries, and structured training plans to build longitudinal insights into performance and health.

---

## User Goals
- Log workouts with structured metadata.
- Track performance progression (pace, reps, sets, weights, HR zones).
- Correlate training intensity with sleep, mood, HRV, injuries, and energy levels.
- Maintain training plans and periodization schedules.
- Export summaries for coaches, trainers, or personal review.

---

## Problems & Pain Points
- Data is fragmented across multiple apps (Strava, Apple Fitness, Garmin, Fitbod, spreadsheets).
- Hard to see long-term trends across training cycles.
- No unified link between workouts, symptoms, injuries, and recovery.
- No contextual intelligence about overtraining or load spikes.

---

## Data Requirements
- **Workout metadata:** type, modality, distance, reps, intensity, RPE.
- **Performance metrics:** pace, cadence, max HR, average HR, splits.
- **Biometric inputs:** HR, HRV, sleep, VO2 estimates.
- **Context:** location, weather, equipment used.
- **Relationships:** symptoms, metrics, goals, equipment.

---

## Entity Model
### Entity: `health.workout`
### Entity: `health.training_plan`
### Entity: `health.training_session`

Key relationships:
- `performed_by`: person
- `uses_equipment`: gear
- `correlates_with`: HR, HRV, sleep metrics
- `results_in`: performance improvements
- `associated_with`: symptoms, injuries

---

## YAML Example – Workout
```yaml
---
uid: workout-2025-11-12-run-10k
type: health.workout
title: "10K Endurance Run"
date: 2025-11-12
start_time: "07:30"
duration_minutes: 58
workout_type: running
distance_km: 10.1
location: "Ottawa Canal"
rpe: 6
intensity_zone: zone_2
metrics:
  avg_hr: 142
  max_hr: 161
  cadence_spm: 168
  pace_min_per_km: 5.45
linked_metrics:
  - metric_uid: metric-hrv-2025-11-12
    relationship: correlates_with
  - metric_uid: metric-sleep-2025-11-11
    relationship: correlative_context
equipment:
  - item_uid: shoe-nike-invincible-run-3
notes: "Felt good. Slight right knee tension."
sensitivity: personal
---
```

---

## YAML Example – Training Plan
```yaml
---
uid: trainplan-2025-marathon
type: health.training_plan
title: "Marathon Base Phase 2025"
start_date: 2025-01-01
end_date: 2025-04-01
goal: "Complete marathon under 4 hours"
phases:
  - name: Base
    duration_weeks: 6
  - name: Build
    duration_weeks: 6
  - name: Peak
    duration_weeks: 4
target_metrics:
  weekly_mileage_km: 50
  long_run_km: 25
notes: "Include 2 strength sessions per week."
sensitivity: personal
---
```

---

## Integration Architecture
### Apple Health
- Pull `HKWorkout` objects for running, cycling, strength.
- Link HR, HRV, VO2Max, sleep from HealthKit.

### Google Fit
- Fetch sessions via REST API.
- Sync pace, speed, HR, elevation.

### Garmin / Strava
- JSON export or API ingestion (if enabled).

### Fitbit
- Steps, HR, sleep patterns for recovery analysis.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Strava | Social fitness + good metrics | Poor note-taking | SBF merges notes + data |
| TrainingPeaks | Advanced periodization | Expensive, closed | SBF enables DIY periodization |
| Apple Fitness | Good tracking | Weak analytics | SBF long-term dashboards |

---

## SBF Implementation Notes
- CLI command: `sbf new health.workout`.
- AEI can generate summary insights (fatigue, performance trends).
- Build dashboards: mileage charts, intensity distribution, HRV correlation.
- Enable cross-domain linkage with symptoms, sleep, nutrition, equipment wear.

