# Restaurant & HACCP Food Safety Operations Framework

This framework defines the domain ontology, workflows, critical control points, documentation requirements, and automation elements required to operate **restaurants, commercial kitchens, food trucks, cafés, and food-production environments** under HACCP principles.

This serves as the foundation for the **@sbf/restaurant-ops** and **@sbf/haccp-ops** modules.

---

# 1. Purpose & Scope
This framework ensures:
- Food safety compliance (HACCP, local food codes)
- Operational consistency
- Staff accountability
- Traceability from supplier → storage → prep → service
- Daily checklists & logs for regulatory audits
- Automated reporting and scheduling

Targets:
- Restaurants
- Ghost kitchens
- Bakeries
- Food trucks
- Cafés
- Catering services
- Institutional kitchens (schools, hospitals)

---

# 2. Domain Pillars
- **Food Safety & HACCP** (Critical Control Points, monitoring, corrective actions)
- **Daily Operations** (opening/closing, prep lists)
- **Equipment & Storage** (temperature logs, inspections)
- **Inventory & Suppliers** (deliveries, traceability)
- **Cleaning & Sanitation** (scheduled + reactive tasks)
- **Incident Tracking** (foodborne illness reports, contamination events)
- **Staff Training & Certifications** (food handler certs)
- **Regulatory Documentation & Audits**

---

# 3. Core Entities
- `food_item`
- `supplier_profile`
- `delivery_record`
- `storage_location`
- `temperature_log`
- `prep_task`
- `recipe_document`
- `equipment_item`
- `cleaning_task`
- `sanitation_schedule`
- `incident_report`
- `staff_training_record`
- `audit_checklist`
- `haccp_plan`
- `critical_control_point`
- `corrective_action`
- `waste_log`

---

# 4. Ontology Relationships
- A `haccp_plan` contains several `critical_control_point` entries.
- `delivery_record` updates `inventory` and may trigger `temperature_log` entries.
- `temperature_log` references storage or equipment.
- `prep_task` uses `food_item` and links to `recipe_document`.
- `cleaning_task` references `sanitation_schedule`.
- `incident_report` references CCP and corrective actions.
- `staff_training_record` links to staff and SOPs.
- `audit_checklist` references HACCP plan and logs.

---

# 5. Core Processes

## 5.1 HACCP Process Flow
1. Hazard identification
2. Determine Critical Control Points (CCPs)
3. Define critical limits (temperature, time)
4. Monitoring process
5. Corrective actions
6. Verification procedures
7. Recordkeeping + audit

## 5.2 Daily Operational Flow
- Opening checklists
- Temperature checks
- Prep list execution
- Service operations
- Cleaning + sanitation tasks
- Closing checklist

## 5.3 Inventory & Supplier Flow
- Supplier vetting
- Delivery acceptance (quality, temperature)
- Put-away
- FIFO & expiry checks
- Waste logging

## 5.4 Incident Management
- Contamination event
- Staff illness
- Pest sighting
- Equipment breakdown
- Customer foodborne illness complaints

## 5.5 Audit Preparation
- Pull logs
- Verify training
- Validate CCP logs
- Generate HACCP annual review

---

# 6. YAML Schemas

## 6.1 food_item
```yaml
uid: fooditem-001
type: food_item
name: "Chicken Breast"
category: protein
supplier_uid: supplier-abc
expiry_date: 2025-03-11
allergens: []
```

## 6.2 delivery_record
```yaml
uid: delivery-2025-03-10-001
type: delivery_record
supplier_uid: supplier-abc
items:
  - fooditem-001
received_date: 2025-03-10
inspection:
  appearance: pass
  temperature_c: 3.4
  packaging_intact: true
```

## 6.3 temperature_log
```yaml
uid: templog-2025-03-10-01
type: temperature_log
storage_uid: storage-walkin-1
date_time: 2025-03-10T08:00
value_c: 2.5
pass_fail: pass
```

## 6.4 critical_control_point
```yaml
uid: ccp-chicken-cook
type: critical_control_point
haccp_plan_uid: haccp-2025-main
step: "Cooking Chicken"
critical_limit_temp_c: 74
monitoring_frequency_minutes: 60
responsible_role: "Kitchen Lead"
```

## 6.5 corrective_action
```yaml
uid: ca-2025-03-10-01
type: corrective_action
ccp_uid: ccp-chicken-cook
description: "Chicken temp below critical limit—extended cooking time by 5 minutes."
action_taken_by: staff-211
date_time: 2025-03-10T12:15
```

## 6.6 cleaning_task
```yaml
uid: clean-2025-03-10-01
type: cleaning_task
area: "Prep Table 1"
freq: hourly
assigned_to: staff-112
status: completed
```

## 6.7 incident_report
```yaml
uid: inc-2025-03-10-01
type: incident_report
incident_type: contamination_event
food_item_uid: fooditem-001
description: "Possible cross-contamination with raw poultry."
action_taken: "Discarded affected batch, sanitized station."
date_time: 2025-03-10T14:30
severity: medium
```

---

# 7. Automation Capabilities
- Temperature log reminders
- Automatic HACCP monitoring alerts
- Critical failure escalation workflows
- Prep list generation per menu cycle
- Cleaning task scheduler (hourly/daily/weekly)
- Food expiry alerts
- Staff certification renewal reminders
- Audit log generator
- Supplier scorecard automation

---

# 8. Compliance Requirements
- HACCP core principles
- Local food safety regulations
- Health inspections
- Allergen tracking
- Sanitation schedules
- Employee food handler certification
- Temperature monitoring compliance

---

# 9. Integration with SBF Frameworks
- **Health Framework** → food safety issues & staff illness tracking
- **Task Framework** → cleaning tasks, prep tasks
- **Financial Framework** → supplier invoices, food cost tracking
- **Knowledge Framework** → SOPs, recipe documents, HACCP plans
- **Relationship Framework** → suppliers, staff

---

# 10. Roadmap
- Phase 1: HACCP entity foundation
- Phase 2: Daily operations + prep list automation
- Phase 3: IoT temperature sensor integration
- Phase 4: AI-powered contamination detection
- Phase 5: Full audit & regulatory submission engine

