# Nutrition & Weight Management Use Case

## Overview
This use case provides a structured system for tracking meals, macronutrients, micronutrients, hydration, weight, body composition, and dietary phases (e.g., cutting, bulking, keto). It creates a unified data model that integrates food logs with wearable data and health metrics.

---

## User Goals
- Log meals and nutritional intake.
- Track calories, macros, hydration, and micronutrients.
- Record weight, body fat %, and body measurements.
- Identify patterns: food → symptoms, food → energy levels, food → weight change.
- Track progress toward dietary goals.

---

## Problems & Pain Points
- Nutrition apps lock data in silos.
- Users switch apps often; exports are inconsistent.
- Hard to correlate food intake with body metrics or symptoms.
- Long-term nutritional patterns are difficult to analyze.

---

## Data Requirements
- **Meal entries:** foods, quantity, calories, macros, micros.
- **Biometric measures:** weight, body fat %, waist/hip/chest.
- **Relationships:** symptoms, workouts, energy/mood logs.
- **Diet phases:** bulking, cutting, fasting, keto, maintenance.

---

## Entity Model
### Entity: `health.nutrition_log`
### Entity: `health.body_metric`

Key relationships:
- `logged_by`: person
- `correlates_with`: symptoms, energy levels
- `affected_by`: workout load
- `part_of_phase`: diet cycle

---

## YAML Example – Nutrition Log
```yaml
---
uid: nutrition-2025-11-12-breakfast
type: health.nutrition_log
title: "Breakfast – Eggs & Oats"
date: 2025-11-12
meal_type: breakfast
foods:
  - name: "Scrambled eggs"
    quantity: "2 eggs"
    calories: 140
    protein_g: 12
    fat_g: 10
  - name: "Oatmeal"
    quantity: "1 cup"
    calories: 150
    carbs_g: 27
    protein_g: 5
    fat_g: 3
total_macros:
  calories: 290
  protein_g: 17
  carbs_g: 27
  fat_g: 13
context:
  mood: "normal"
  hunger_level: 6
linked_metrics:
  - metric_uid: metric-weight-2025-11-12
sensitivity: personal
---
```

---

## YAML Example – Body Metric
```yaml
---
uid: bodymetric-2025-11-12-weight
type: health.body_metric
metric_type: weight
value: 82.4
unit: kg
date: 2025-11-12
source_system: apple_health_export
notes: "Slight water retention after heavy meal day"
sensitivity: personal
---
```

---

## Integration Architecture
### Apple Health
- Supports weight, body fat %, lean mass.
- Nutrition import possible from compatible apps (Cronometer, MyFitnessPal).

### Google Fit
- Weight and body metrics via REST API.
- Nutrition support limited; manual log required.

### Fitbit
- Calories, weight, hydration.

### Cronometer / MyFitnessPal
- CSV exports can be parsed into SBF nutrition logs.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Cronometer | Superb micronutrient detail | Manual entry heavy | SBF correlation + dashboards |
| MyFitnessPal | Massive food DB | Paywalls, ads | Unified export + graph linking |
| LoseIt! | Good UX | Siloed | Long-term trend analysis in SBF |

---

## SBF Implementation Notes
- CLI: `sbf new health.nutrition_log`, `sbf new health.body_metric`.
- AEI can auto-create insights: caloric surplus/deficit, macro trends.
- Dashboards: moving weight averages, calorie trends, macro balance.
- Cross-domain linking with workouts, symptoms, mood/energy, and goals.

