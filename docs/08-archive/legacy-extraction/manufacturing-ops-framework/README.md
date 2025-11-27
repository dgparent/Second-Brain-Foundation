# Manufacturing QC, SOP, & Maintenance Operations Framework

This framework defines the domain ontology, lifecycle processes, entity schemas, and operational logic for **Manufacturing Quality Control**, **Standard Operating Procedure Management**, and **Equipment Maintenance**.

It supports:
- Discrete manufacturing
- Food processing
- Electronics assembly
- Automotive parts
- Packaging factories
- Pharma-lite (non-GMP, GMP-ready)

This framework becomes the foundation for the operational module **@sbf/manufacturing-ops**.

---

# 1. Purpose & Scope
The Manufacturing Ops Framework provides:
- A universal structure for **batch production**, **QC inspections**, **SOP compliance**, and **equipment maintenance**.
- Traceability from raw material → production batch → finished good.
- Entity templates to record deviations, waste, downtime, and line performance.
- Integration with SBF’s financial, health/safety, knowledge (SOP library), task, and relationship frameworks.

---

# 2. Domain Pillars
- **Production Execution** – batches, line runs, shift logs.
- **Quality Control & Assurance** – inspections, sampling, testing.
- **Equipment Maintenance** – preventive, corrective, predictive.
- **SOP Governance** – controlled documents, revisions, approvals.
- **Inventory & Materials** – consumption, yield, waste.
- **Workforce Ops** – shift assignments, operator certification.
- **Regulatory & Compliance** – ISO 9001, HACCP-lite, traceability.

---

# 3. Core Entities
- `production_batch`
- `production_line`
- `shift_log`
- `material_lot`
- `material_consumption`
- `finished_good`
- `qc_inspection`
- `qc_test`
- `qc_defect`
- `sop_document`
- `sop_revision`
- `sop_training_record`
- `equipment_item`
- `maintenance_log`
- `downtime_event`
- `calibration_record`
- `operator_profile`

---

# 4. Ontology Relationships
- A `production_batch` consumes `material_lot` items.
- A batch is made on a specific `production_line`.
- A batch produces one or more `finished_good` lots.
- `qc_inspection` references a production batch and may create `qc_defect`.
- `sop_document` governs work tasks and QC steps.
- `maintenance_log` references `equipment_item`.
- `downtime_event` interrupts a `production_line`.
- `operator_profile` links to shift logs and SOP training.
- `calibration_record` maintains traceability for equipment.

---

# 5. Core Processes

## 5.1 Production Execution Flow
- Create production batch
- Assign materials
- Run batch (start/stop times)
- Record yields
- Record waste & scrap
- Log operator activities

## 5.2 QC Flow
- Sampling plan generation
- In-process inspections
- Finished product testing
- Defect classification
- Non-conformance report
- CAPA (Corrective and Preventive Actions)

## 5.3 SOP Governance
- SOP revision history
- Approval workflow
- Operator training validation
- Compliance audits

## 5.4 Equipment Maintenance
- Preventive maintenance schedule
- Corrective maintenance
- Breakdown analysis
- Calibration cycles

## 5.5 Material Traceability
- Material lots received
- Consumption logs
- Batch genealogy linking
- Finished goods trace-back

---

# 6. Canonical YAML Schemas

## 6.1 production_batch
```yaml
uid: batch-2025-03-10-01
type: production_batch
line_uid: line-1
description: "Assembly Run – PCB Module"
start_time: 2025-03-10T08:00
end_time: 2025-03-10T15:30
materials:
  - lot-a123
  - lot-b879
yield_units: 980
waste_units: 20
operators:
  - op-201
  - op-214
status: completed
```

## 6.2 qc_inspection
```yaml
uid: qc-2025-03-10-01
type: qc_inspection
batch_uid: batch-2025-03-10-01
sampling_method: random
sample_size: 20
inspector_uid: op-301
tests:
  - test-2025-03-10-vis-01
  - test-2025-03-10-elec-01
result: pass
notes: "Minor cosmetic defects within tolerance."
```

## 6.3 maintenance_log
```yaml
uid: maint-2025-03-10-01
type: maintenance_log
equipment_uid: equip-smt-press-1
maintenance_type: preventive
description: "Lubrication & belt inspection"
performed_by: tech-019
date: 2025-03-10
status: completed
```

## 6.4 sop_document
```yaml
uid: sop-2025-assembly-01
type: sop_document
title: "Assembly Line Procedure – PCB Module"
version: 3
effective_date: 2025-02-01
approved_by: qa-manager-01
related_equipment:
  - equip-smt-press-1
```

## 6.5 downtime_event
```yaml
uid: down-2025-03-10-01
type: downtime_event
line_uid: line-1
start_time: 2025-03-10T10:40
end_time: 2025-03-10T11:05
reason: "Sensor misalignment"
impact_minutes: 25
```

---

# 7. Automation Features
- Auto-generate sampling plans per SOP
- Predictive maintenance reminders
- Root cause detection via patterns
- Waste/scrap trend detection
- Shift performance scorecards
- Automatic QC defect clustering
- Intelligent traceability graph linking materials→batch→finished goods

---

# 8. Compliance Areas
- ISO 9001 (Quality)
- ISO 22000 (Food safety, lite)
- GMP-lite / GMP-ready controls
- Equipment calibration traceability
- Batch traceability
- Non-conformance reporting (NCR)
- CAPA workflow tracking

---

# 9. Integration With Other SBF Frameworks
- **Financial Framework** → cost of scrap, downtime cost, batch costing
- **Task Framework** → maintenance & QC tasks
- **Knowledge Framework** → SOP library, training guides
- **Health Framework** → safety incidents on production floor
- **Relationship Framework** → suppliers, audit bodies

---

# 10. Roadmap
- Phase 1: Entity Definitions + QC basics
- Phase 2: Equipment maintenance engine
- Phase 3: SOP compliance & digital signatures
- Phase 4: CAPA workflow automation
- Phase 5: Predictive Quality AI layer

