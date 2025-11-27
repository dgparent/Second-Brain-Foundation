# Security Guard & Incident Reporting Operations Framework

This framework establishes the ontology, workflows, compliance layers, and automation logic required for **security operations**, including:
- Private security guard services
- Mall and facility security teams
- Corporate security departments
- Event security
- Residential building security
- Patrol and mobile response teams

This framework is the basis for the operational module **@sbf/security-ops**.

---
# 1. Purpose & Scope
This framework supports:
- Guard shift planning & scheduling
- Patrol routing & checkpoint logging
- Incident reporting & escalation
- Access control logs
- Alarm response workflows
- Visitor & contractor management
- Equipment management (radios, PPE, vehicles)
- Compliance & training requirements
- Security risk assessments

Targets:
- Security companies
- In-house security teams
- Patrol units
- Loss prevention teams
- Facility managers

---
# 2. Domain Pillars
- **Guard Workforce Management**
- **Patrol & Checkpoint Routing**
- **Incident Reporting System**
- **Access Control & Visitor Logging**
- **Alarm & Emergency Response**
- **Equipment & Asset Tracking**
- **Training & Certification Compliance**
- **Risk Assessment & Threat Analysis**

---
# 3. Core Entities
- `security_site`
- `guard_profile`
- `guard_shift`
- `patrol_route`
- `checkpoint`
- `patrol_log`
- `incident_report`
- `incident_evidence`
- `access_log`
- `visitor_record`
- `contractor_record`
- `alarm_event`
- `response_action`
- `equipment_item`
- `equipment_assignment`
- `training_record`
- `risk_assessment`

---
# 4. Ontology Relationships
- A `security_site` contains checkpoints, patrol routes, and access points.
- Each `guard_shift` links to a guard and a site.
- `patrol_route` contains multiple `checkpoint` items.
- `patrol_log` references guard, route, checkpoints, and timestamps.
- An `incident_report` may include `incident_evidence`.
- `access_log` records entries/exits of visitors/contractors.
- `alarm_event` triggers `response_action` tasks.
- `equipment_assignment` tracks who holds equipment.
- `training_record` links to guards.
- `risk_assessment` links to sites and incidents.

---
# 5. Core Processes

## 5.1 Guard Shift Scheduling
- Availability collection
- Shift assignment
- Skill-based role assignment (mobile vs static)
- Break & handover management

## 5.2 Patrol Operations
- Patrol route creation
- Checkpoint scanning (QR/RFID/GPS)
- Missed checkpoint alerts
- Patrol completion logs

## 5.3 Incident Management Workflow
1. Incident occurs
2. Guard records details (photos, notes)
3. Severity classification
4. Supervisor review
5. Corrective actions assigned
6. Report finalization and filing

## 5.4 Access Control Workflow
- Visitor sign-in
- Contractor verification
- Badge or access pass issuance
- Check-out logging

## 5.5 Alarm Response Workflow
- Alarm triggered
- Dispatch guard team
- Scene assessment
- Lockdown or clearance actions
- Final report

## 5.6 Equipment Tracking Workflow
- Radios issued/returned
- Vehicle logs
- PPE tracking
- Maintenance of equipment

## 5.7 Training Compliance Workflow
- Collect training requirements per role
- Track renewals (first aid, use of force)
- Record certification completions

## 5.8 Risk Assessment Workflow
- Identify hazards
- Analyze threats
- Determine mitigation actions
- Record residual risk levels

---
# 6. YAML Schemas

## 6.1 security_site
```yaml
uid: site-ottawa-mall
type: security_site
name: "Ottawa Central Mall"
location: "129 River St, Ottawa"
site_type: retail
num_checkpoints: 14
office_contact: "+1-613-292-1122"
```

## 6.2 guard_profile
```yaml
uid: guard-223
type: guard_profile
name: "Michael Torres"
certifications:
  - first_aid
  - security_license_classG
roles:
  - mobile_patrol
  - front_desk
status: active
```

## 6.3 guard_shift
```yaml
uid: shift-2025-03-12-01
type: guard_shift
guard_uid: guard-223
site_uid: site-ottawa-mall
start_time: 2025-03-12T08:00
end_time: 2025-03-12T16:00
assigned_role: mobile_patrol
```

## 6.4 patrol_route
```yaml
uid: patrol-ottawa-mall-core
type: patrol_route
site_uid: site-ottawa-mall
route_name: "Core Route"
checkpoints:
  - cp-mall-entrance
  - cp-foodcourt
  - cp-basement
  - cp-rooftop
```

## 6.5 incident_report
```yaml
uid: inc-2025-03-12-01
type: incident_report
site_uid: site-ottawa-mall
reported_by: guard-223
type_of_incident: theft
severity: medium
description: "Shoplifter detained near store 14."
timestamp: 2025-03-12T14:45
```

## 6.6 access_log
```yaml
uid: access-2025-03-12-01
type: access_log
site_uid: site-ottawa-mall
visitor_name: "John Peterson"
purpose: "HVAC maintenance"
entry_time: 2025-03-12T09:30
exit_time: null
status: onsite
```

---
# 7. Automation Capabilities
- Guard shift reminder system
- Missed checkpoint alerts
- Automated incident escalation
- Visitor overstay alerts
- Alarm response routing
- Equipment overdue return alerts
- Expiring certification notifications
- Risk report generators

---
# 8. Compliance Requirements
- Security guard licensing laws
- Use-of-force regulations
- Access control & data logs retention
- Incident reporting standards
- Workplace safety regulations
- Emergency preparedness standards

---
# 9. Integration with SBF Frameworks
- **Task** → patrol tasks, incident actions, shift tasks
- **Relationship** → guards, visitors, contractors
- **Knowledge** → SOPs, site procedures, emergency plans
- **Health** → injury incidents
- **Financial** → equipment costs, vendor contracts

---
# 10. Roadmap
- Phase 1: Incident + patrol engine
- Phase 2: Guard scheduling
- Phase 3: Alarm response system
- Phase 4: Visitor management portal
- Phase 5: Multi-site command dashboard

