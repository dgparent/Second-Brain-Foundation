# Construction Operations Module

This document defines the operational module for construction workflows. It builds on the Construction Ops & Compliance Framework and provides:
- Actionable module architecture
- Event schemas
- Task pipelines
- Automation flows
- Reporting structures
- CLI command definitions

## 1. Module Purpose
This module operationalizes the construction framework into daily-use tooling:
- Field management
- Workforce coordination
- Safety compliance
- Equipment operations
- QC inspections
- Documentation handling
- Permit workflows

It is designed for:
- General contractors
- Subcontractors
- Inspectors
- Safety officers
- Project managers

## 2. Module Architecture
### 2.1 Directory Structure
```
@sbf/construction-ops/
│
├── entities/
│   ├── construction_project.md
│   ├── daily_site_log.md
│   ├── safety_incident.md
│   ├── qc_inspection.md
│   ├── work_task.md
│   ├── material_item.md
│   ├── equipment_item.md
│   └── change_order.md
│
├── events/
│   ├── site_event.md
│   ├── safety_event.md
│   ├── qc_event.md
│   └── equipment_event.md
│
├── automation/
│   ├── safety-alerts.md
│   ├── qc-reminders.md
│   ├── daily-log-generator.md
│   ├── subcontractor-tracking.md
│   └── document-revision-alerts.md
│
├── reporting/
│   ├── weekly-summary.md
│   ├── qc-summary.md
│   ├── safety-dashboard.md
│   └── equipment-usage-report.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

## 3. Entity Schemas
Below are the operational schemas used by the module.

### 3.1 work_task
```yaml
uid: task-2025-03-10-001
type: work_task
project_uid: project-2025-001
phase_uid: phase-rough-in-01
assigned_to:
  - subc-electrical-co
  - worker-567
status: in_progress
start_date: 2025-03-10
end_date: 2025-03-12
materials_required:
  - mat-copper-wire-12
  - mat-pvc-conduit-03
equipment_required:
  - equip-scissor-lift-2
notes: "Electrical rough-in for Level 3."
```

### 3.2 qc_inspection
```yaml
uid: qc-2025-03-10-01
type: qc_inspection
project_uid: project-2025-001
phase_uid: phase-framing-01
inspector_uid: worker-301
date: 2025-03-10
checklist:
  framing_nails: pass
  alignment: issues_found
  moisture: pass
photo_evidence: []
deficiencies:
  - def-2025-03-10-framing-01
```

### 3.3 change_order
```yaml
uid: co-2025-03-05-01
type: change_order
project_uid: project-2025-001
issued_by: client
requested_by: org-client-xyz
status: pending
value_change: 25000
schedule_impact_days: 3
reason: "Added electrical outlets Level 4"
```

### 3.4 equipment_event
```yaml
uid: eqev-2025-03-10-01
type: equipment_event
project_uid: project-2025-001
equipment_uid: equip-excavator-1
event_type: "refuel"
date_time: 2025-03-10T11:00
fuel_added_l: 25.0
operator_uid: worker-129
```

## 4. Automation Pipelines
### 4.1 Daily Log Generator
- Trigger: end-of-day
- Inputs: tasks, weather, workforce, safety logs
- Output: `daily_site_log`
- Automation:
  - Merge work tasks marked complete
  - Extract photos from site folder
  - Pull subcontractor attendance from relationship module
  - Generate PDF/markdown summary

### 4.2 Safety Alerts
- Trigger: new `safety_incident`
- Automation:
  - Auto-notify supervisor
  - Create follow-up task
  - Auto-generate incident form
  - Update project safety dashboard

### 4.3 QC Reminders
- Trigger: upcoming phase milestones
- Automation:
  - Auto-create QC inspections
  - Assign inspectors
  - Generate checklists from knowledge framework SOPs

## 5. Reporting
### 5.1 Weekly Summary Report
Contains:
- Completed tasks
- Safety incidents
- Equipment usage
- Material deliveries
- Workforce headcount trends

### 5.2 Equipment Usage Report
- Total hours
- Fuel consumption
- Operator assignments
- Maintenance reminders

### 5.3 QC Summary
- Total inspections
- Pass/fail ratio
- Outstanding deficiencies
- Timeline drift impact

## 6. CLI Commands
### 6.1 `sbf construction new-project`
Creates:
- construction_project
- directory structure
- default phases

### 6.2 `sbf construction log`
Interactive dialog to create:
- daily_site_log
- safety_incident
- qc_inspection
- equipment_event

### 6.3 `sbf construction checklist`
Loads checklists from knowledge framework.

### 6.4 `sbf construction report`
Generates reports from the reporting folder.

## 7. Module Workflow Engine
### States
- `planned`
- `in_progress`
- `blocked`
- `needs_review`
- `complete`

### Allowed Transitions
- planned → in_progress
- in_progress → blocked
- blocked → in_progress
- in_progress → needs_review
- needs_review → complete

## 8. Roadmap
- Phase 1: CLI scaffolding
- Phase 2: Advanced QC rules
- Phase 3: Subcontractor portal integration
- Phase 4: AI video/photo defect recognition
- Phase 5: Compliance export to regulatory bodies

