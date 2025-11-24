# Restaurant & HACCP Operations Module

This module operationalizes the **Restaurant & HACCP Food Safety Framework** into a complete toolkit for daily restaurant operations, food safety compliance, staff workflows, inventory handling, and automated audit readiness.

It is designed for:
- Restaurants, cafés, bakeries
- Food trucks
- Ghost kitchens
- Catering companies
- Institutional kitchens (schools/hospitals)

---
# 1. Module Purpose
This module enables:
- HACCP-critical monitoring
- Daily opening/closing workflows
- Prep list management
- Cleaning & sanitation cycles
- Supplier and delivery management
- Temperature logging (manual + IoT-ready)
- Food safety compliance documentation
- Incident and corrective action reporting

---
# 2. Module Architecture

## 2.1 Directory Structure
```
@sbf/restaurant-ops/
│
├── entities/
│   ├── food_item.md
│   ├── supplier_profile.md
│   ├── delivery_record.md
│   ├── storage_location.md
│   ├── temperature_log.md
│   ├── prep_task.md
│   ├── recipe_document.md
│   ├── cleaning_task.md
│   ├── sanitation_schedule.md
│   ├── incident_report.md
│   ├── critical_control_point.md
│   ├── corrective_action.md
│   ├── staff_training_record.md
│   ├── waste_log.md
│   └── audit_checklist.md
│
├── workflows/
│   ├── daily-operations.md
│   ├── haccp-flow.md
│   ├── delivery-intake-flow.md
│   ├── inventory-flow.md
│   ├── cleaning-flow.md
│   ├── corrective-action-flow.md
│   └── audit-prep-flow.md
│
├── automation/
│   ├── temp-alerts.md
│   ├── prep-list-generator.md
│   ├── cleaning-scheduler.md
│   ├── expiry-alerts.md
│   ├── supplier-rating-engine.md
│   └── audit-log-compiler.md
│
├── reporting/
│   ├── haccp-dashboard.md
│   ├── daily-summary.md
│   ├── supplier-scorecard.md
│   └── incident-summary.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---
# 3. Entity Schemas

### 3.1 prep_task
```yaml
uid: prep-2025-03-11-01
type: prep_task
recipe_uid: recipe-chicken-bowl-01
assigned_to: staff-112
due_time: 2025-03-11T10:00
quantity: "8 trays"
status: pending
notes: "Increase volume due to lunchtime rush"
```

### 3.2 storage_location
```yaml
uid: storage-walkin-1
type: storage_location
name: "Walk-in Fridge"
temp_range_c:
  min: 0
  max: 4
```

### 3.3 waste_log
```yaml
uid: waste-2025-03-11-01
type: waste_log
food_item_uid: fooditem-001
quantity: "3 kg"
reason: "Expired stock"
date: 2025-03-11
```

### 3.4 audit_checklist
```yaml
uid: audit-2025-q1
type: audit_checklist
haccp_plan_uid: haccp-2025-main
items:
  - item: "Verify cold storage temps maintained"
    status: compliant
  - item: "All staff certified"
    status: needs_review
```

### 3.5 sanitation_schedule
```yaml
uid: clean-sch-2025-daily-01
type: sanitation_schedule
frequency: daily
areas:
  - "Prep Table 1"
  - "Stove Area"
  - "Dish Pit"
```

---
# 4. Workflows

## 4.1 Daily Operations Workflow
- Opening checklist
- Temperature checks
- Prep tasks execution
- Service monitoring
- Cleaning & sanitation
- Closing checklist

## 4.2 HACCP Flow
1. Monitor CCPs
2. Record temperatures
3. Log deviations
4. Trigger corrective actions
5. Update HACCP audit log

## 4.3 Delivery Intake Workflow
1. Delivery arrives
2. Temperature verification
3. Packaging checks
4. Create delivery record
5. Update food inventory

## 4.4 Cleaning & Sanitation Workflow
- Hourly cleaning tasks
- Daily sanitation cycle
- Deep-clean weekly checklist
- Staff assignment

## 4.5 Incident Management Workflow
- Contamination report
- Staff illness report
- Customer illness complaint
- Pest sighting
- Equipment failure

---
# 5. Automation

### 5.1 Temperature Alerts
- Trigger when logs exceed safe ranges
- Optionally ingest IoT sensor data
- Escalations to kitchen lead

### 5.2 Prep List Generator
- Auto-generate prep tasks based on:
  - menu cycle
  - historical sales data
  - expected traffic patterns

### 5.3 Cleaning Scheduler
- Auto-generate hourly/daily cleaning tasks
- Track compliance
- Notify on incomplete tasks

### 5.4 Expiry Alerts
- Identify upcoming expiries
- Send notifications to reduce waste

### 5.5 Supplier Rating Engine
- Score based on:
  - delivery quality
  - temperature readings
  - packaging integrity
  - delay rate

### 5.6 Audit Log Compiler
- Compile HACCP logs into a single report
- Prepare for health inspection reviews

---
# 6. Reporting

## 6.1 HACCP Dashboard
- CCP status
- Recent deviations
- Temperature compliance
- Outstanding corrective actions

## 6.2 Daily Summary
- Completed prep tasks
- Waste logged
- Completed sanitation tasks

## 6.3 Supplier Scorecard
- Rating based on performance metrics
- Delivery compliance

## 6.4 Incident Summary
- Weekly/monthly incident logs
- Severity categories

---
# 7. CLI Commands
### 7.1 `sbf restaurant new-prep`
Creates new prep tasks.

### 7.2 `sbf restaurant log-temp`
Quick logging for temperatures.

### 7.3 `sbf restaurant incident`
Logs incident reports.

### 7.4 `sbf restaurant audit`
Generates audit-prep documents.

### 7.5 `sbf restaurant cleaning`
Manages cleaning & sanitation tasks.

---
# 8. Roadmap
- Phase 1: HACCP monitoring engine
- Phase 2: IoT refrigerator/freezer integration
- Phase 3: Menu-driven prep automation
- Phase 4: Full digital audit binder
- Phase 5: Predictive spoilage & waste reduction AI

