# Health Appointments & Care Coordination Use Case

## Overview
This use case provides a structured way to track medical appointments, consultations, diagnostic tests, follow-up plans, referrals, and healthcare provider information. It supports longitudinal care, continuity across multiple clinics/specialists, and preparation for medical visits.

---

## User Goals
- Maintain complete record of all health appointments.
- Track recommendations, follow-ups, referrals, and procedures.
- Store and link documents (lab results, imaging, after-visit summaries).
- Understand care timelines and how conditions evolve over time.
- Prepare accurately for upcoming appointments.

---

## Problems & Pain Points
- Medical information scattered across portals, paper documents, email, and memory.
- Difficult to recall what happened at appointments from months/years ago.
- Hard to maintain a unified view of all providers and specialties.
- No cross-linking between appointments → medications → symptoms → metrics.
- EHR export formats inconsistent (PDF, FHIR JSON, XML).

---

## Data Requirements
- **Appointment metadata:** provider, date/time, location (physical/virtual), specialty.
- **Visit purpose:** chief complaint, reason for visit.
- **Outcomes:** recommendations, treatment changes, diagnostics requested.
- **Relationships:** conditions, medications, symptoms, lab documents.
- **Documents:** PDFs, lab reports, imaging summaries.

---

## Entity Model
### Entity: `health.appointment`
### Entity: `health.provider`
### Entity: `health.health_document`

Key relationships:
- `conducted_by`: provider
- `documents`: test results, summaries
- `results_in`: medication changes
- `linked_conditions`: diagnoses discussed
- `requires_followup`: future appointments or tasks

---

## YAML Example — Appointment
```yaml
---
uid: appointment-2025-11-15-orthopedic
type: health.appointment
title: "Orthopedic Follow-Up"
date: 2025-11-15
time: "14:00"
provider_uid: provider-dr-hamilton
reason: "Persistent right knee pain"
notes:
  subjective: "Pain worsens after long walks"
  objective: "Mild swelling"
  assessment: "Probable tendon inflammation"
  plan:
    - "Order MRI"
    - "Increase physical therapy sessions"
linked_conditions:
  - cond-knee-osteoarthritis
linked_documents:
  - doc-mri-order-2025
tags:
  - musculoskeletal
  - knee
sensitivity: confidential
created_at: 2025-11-15T17:40:00-05:00
updated_at: 2025-11-15T17:50:00-05:00
---
```

---

## YAML Example — Provider
```yaml
---
uid: provider-dr-hamilton
type: health.provider
name: "Dr. Robert Hamilton"
specialty: orthopedic_surgery
clinic: "Ottawa Sports Medicine Clinic"
phone: "+1-613-123-4567"
location: "Ottawa, ON"
notes: "Specialist in knee injuries"
sensitivity: normal
---
```

---

## Integration Architecture
### Apple Health
- Limited direct appointment support.
- Attach visit summaries from PDF imports.

### Google Fit
- No native support; appointments stored manually or imported via FHIR.

### FHIR (Future Integration)
- **FHIR Encounter** (appointments and visits) provides structured format.
- **FHIR DocumentReference** for lab results and imaging.
- **FHIR Practitioner** for providers.

### Patient Portals
- MyChart, Telus Health, NHS, and others: export PDFs via manual ingestion.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| MyChart/Patient Portals | Official medical data | Siloed, poor PKM functions | SBF imports & links data |
| CareClinic | Appointment tracking | Closed ecosystem | Full graph linking in SBF |
| Google Calendar | Simple reminders | No medical structure | SBF structured medical records |

---

## SBF Implementation Notes
- CLI: `sbf new health.appointment`, `sbf new health.provider`.
- Documents stored in `/documents/health/` with UID references.
- AEI assists with appointment preparation and review summaries.
- Dashboard: care timeline, provider graph, pending follow-ups.

