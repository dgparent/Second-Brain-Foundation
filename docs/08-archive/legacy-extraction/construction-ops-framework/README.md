# Construction Operations & Compliance Framework

This framework defines the domain model, ontology, processes, and entity schemas that serve as the foundation for the Construction Operations & Compliance module.

## 1. Overview & Purpose
The Construction Operations & Compliance Framework provides the structural definitions required for managing construction projects, field operations, inspections, safety logs, compliance tracking, equipment usage, workforce management, and site documentation.

It is designed to integrate deeply with:
- SBF task framework
- SBF financial framework
- SBF relationship/CRM framework
- SBF knowledge framework (SOPs, regulations)
- Field‑level logging, photo/video evidence, and automation

## 2. Domain Pillars
- **Project Management** (Schedules, phases, deliverables)
- **Site Operations** (Daily logs, work packages)
- **Safety & Compliance** (Inspections, incidents, toolbox talks)
- **Workforce Management** (Attendance, subcontractors, certifications)
- **Materials & Equipment** (Inventory, rentals, usage logs)
- **Quality Control** (QC plans, punch lists, defect tracking)
- **Documents & Evidence** (Permits, drawings, specifications)

## 3. Core Entities
- `construction_project`
- `project_phase`
- `site_location`
- `daily_site_log`
- `work_task`
- `material_item`
- `equipment_item`
- `equipment_usage_log`
- `subcontractor`
- `worker_profile`
- `safety_incident`
- `safety_inspection`
- `toolbox_talk`
- `qc_inspection`
- `qc_deficiency`
- `permit_document`
- `drawing_document`
- `change_order`
- `rfi` (Request for Information)
- `punch_item`

## 4. Ontology Relationships
- A `construction_project` contains multiple `project_phase` entities.
- Each project has one or more `site_location` records.
- `daily_site_log` belongs to one site and one project.
- `work_task` references project, phase, subcontractor, worker, and equipment.
- `equipment_usage_log` references specific equipment and the work task.
- `safety_incident` and `safety_inspection` reference project, worker, and site.
- `qc_inspection` results in zero or more `qc_deficiency` items.
- `permit_document` and `drawing_document` belong to a project.
- `rfi` belongs to a project and may reference drawings.
- `change_order` modifies contract values and schedules.

## 5. Key Processes
### 5.1 Daily Field Logging
- Activities completed
- Workforce and subcontractor headcount
- Equipment used
- Materials delivered/consumed
- Weather conditions
- Site photos and notes

### 5.2 Safety & Compliance
- Toolbox meetings
- PPE compliance checks
- Safety inspections
- Incident reporting
- Corrective actions tracking

### 5.3 Quality Control
- Pre‑pour inspections
- Framing inspections
- Deficiency lists
- Punch list operations

### 5.4 Documentation Control
- Permit approvals
- Engineering drawings and revisions
- RFIs and responses
- Change orders and approvals

## 6. Canonical YAML Schemas (SBF Style)
Below are base schema templates.

### 6.1 construction_project
```yaml
uid: project-2025-001
type: construction_project
title: "Main Office Tower"
project_code: "MOT-2025"
start_date: 2025-02-10
end_date: 2026-08-30
client_uid: org-client-xyz
address: "123 Main St, Ottawa"
status: active
budget:
  original: 25000000
  current: 27000000
rel:
  - [managed_by, org-contractor-abc]
  - [client, org-client-xyz]
```

### 6.2 daily_site_log
```yaml
uid: dsl-2025-03-04
type: daily_site_log
project_uid: project-2025-001
site_location_uid: site-main-1
date: 2025-03-04
weather:
  conditions: "Cloudy"
  temperature_c: 12
activities:
  - "Concrete pour, Level 2"
  - "Electrical rough-in, Level 1"
workforce_count: 43
subcontractors:
  - subc-concrete-co
  - subc-electro-tech
photos: []
notes: "Concrete delays due to late truck arrival."
```

### 6.3 safety_incident
```yaml
uid: incident-2025-03-04a
type: safety_incident
project_uid: project-2025-001
site_location_uid: site-main-1
reported_by: worker-123
date_time: 2025-03-04T10:15
category: "Slip/Fall"
severity: "Moderate"
description: "Worker slipped on wet surface."
actions_taken:
  - "Area cleaned and signage added."
```

### 6.4 equipment_usage_log
```yaml
uid: eu-2025-03-04-01
type: equipment_usage_log
project_uid: project-2025-001
equipment_uid: equip-excavator-1
work_task_uid: task-foundation-03
hours_used: 6.5
operator_uid: worker-456
fuel_consumption_l: 14.2
```

## 7. Automations Enabled
- Daily log auto-generation
- Safety incident escalation workflows
- QC inspection reminders
- Equipment usage summaries
- Subcontractor attendance tracking
- Change order approval pipelines
- Document revision notifications

## 8. Compliance Areas Supported
- Occupational Health & Safety Act
- Building Codes and Permits
- Environmental impact reporting
- Work hour regulations
- Inspection regimes

## 9. Integration With Other SBF Frameworks
- **Financial** → cost codes, budget tracking, change orders
- **Health** → safety incidents
- **Knowledge** → SOPs, building codes, inspection checklists
- **Relationship** → subcontractors, suppliers
- **Task management** → all jobsite tasks and follow-ups

## 10. Module Roadmap
- Phase 1: Entity definitions + YAML templates
- Phase 2: Automation recipes
- Phase 3: Compliance engine integration
- Phase 4: Dashboard + reporting modules
- Phase 5: Equipment telematics integration

