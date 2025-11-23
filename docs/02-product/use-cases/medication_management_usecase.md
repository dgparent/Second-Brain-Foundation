# Medication Management Use Case

## Overview
A comprehensive system for tracking medications, adherence, dosage changes, side effects, and treatment outcomes. This use case standardizes personal medication records and links them to symptoms, metrics, conditions, and appointments.

---

## User Goals
- Maintain an accurate list of active and past medications.
- Track adherence and missed doses.
- Document dosage adjustments and treatment plans.
- Correlate medication changes with symptoms and health metrics.
- Export a medication history for healthcare providers.

---

## Problems & Pain Points
- Users forget dosage schedules and medication histories.
- No correlation between medication periods and health outcomes.
- Medication lists often spread across apps, notes, or paper documents.
- Healthcare professionals frequently ask for accurate medication histories, which users struggle to recall.

---

## Data Requirements
- **MedicationOrder:** name, dose, route, frequency, prescriber, indication.
- **MedicationIntake:** timestamped adherence logs.
- **Side effects:** linked symptom events.
- **Timeline:** start/end dates, titration changes.
- **Relationships:** conditions, appointments, symptoms.

---

## Entity Model
### Entity: `health.medication_order`
### Entity: `health.medication_intake`
Key relationships:
- `treats`: conditions
- `associated_with`: symptom events
- `modified_by`: dosage changes
- `documented_in`: appointments

---

## YAML Example – Medication Order
```yaml
---
uid: medorder-meloxicam-2025
type: health.medication_order
title: "Meloxicam 15mg Daily"
medication_name: Meloxicam
dose: "15 mg"
route: oral
frequency: daily
indication: "Chronic knee inflammation"
prescriber: Dr. Alvarez
start_date: 2025-09-15
end_date: null
linked_conditions:
  - condition_uid: cond-knee-osteoarthritis
notes: "Monitor GI side effects"
sensitivity: confidential
created_at: 2025-09-15T10:00:00-05:00
updated_at: 2025-09-15T10:05:00-05:00
---
```

---

## YAML Example – Intake Event
```yaml
---
uid: intake-meloxicam-2025-11-12-0800
type: health.medication_intake
medication_order_uid: medorder-meloxicam-2025
date: 2025-11-12
time: "08:00"
adherence: taken
notes: "Slight stomach discomfort"
linked_symptoms:
  - symptom_uid: symptom-2025-11-12-stomach-pain
sensitivity: confidential
---
```

---

## Integration Architecture
### Apple Health
- HealthKit supports `MedicationRecord` objects.
- Import dosage schedules via manual entry or supported apps.

### Google Fit
- Limited native medication support; supplements captured manually.

### EHR Systems (FHIR)
- **FHIR MedicationRequest**, **MedicationStatement**, **MedicationAdministration** are fully structured.
- Future SBF importers can parse FHIR bundles.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Medisafe | Adherence reminders | Weak export | SBF graph + export |
| CareClinic | Good symptom + meds | Closed silo | SBF cross-domain linking |
| Apple Health Medications | Good scanning + reminders | Weak analysis | SBF enhances correlations |

---

## SBF Implementation Notes
- CLI commands: `sbf new health.medication_order`, `sbf new health.medication_intake`.
- AEI can detect missing doses via rule-based prompts.
- Timeline view: medication periods mapped to symptom severity graphs.
- Useful for chronic illness management, psychiatric treatment tracking, pain management.

