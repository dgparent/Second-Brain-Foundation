# Security Operations Module

This module operationalizes the **Security Guard & Incident Reporting Operations Framework** into a complete toolkit for:
- Security guard companies
- Corporate security teams
- Mall/residential security
- Event security management
- Mobile patrol operators

It provides workflows, entities, automation logic, and CLI commands for daily guard operations, incident management, patrol logging, visitor tracking, and compliance.

---
# 1. Module Purpose
This module enables:
- Guard scheduling & workforce management
- Patrol route automation
- Incident reporting & escalation
- Access & visitor logging
- Alarm response workflows
- Equipment assignment & accountability
- Training & certification tracking
- Risk assessment & mitigation workflows
- Multi-site security dashboards

---
# 2. Module Architecture

## 2.1 Directory Structure
```
@sbf/security-ops/
│
├── entities/
│   ├── security_site.md
│   ├── guard_profile.md
│   ├── guard_shift.md
│   ├── patrol_route.md
│   ├── checkpoint.md
│   ├── patrol_log.md
│   ├── incident_report.md
│   ├── incident_evidence.md
│   ├── access_log.md
│   ├── visitor_record.md
│   ├── contractor_record.md
│   ├── alarm_event.md
│   ├── response_action.md
│   ├── equipment_item.md
│   ├── equipment_assignment.md
│   ├── training_record.md
│   └── risk_assessment.md
│
├── workflows/
│   ├── shift-scheduling.md
│   ├── patrol-workflow.md
│   ├── incident-workflow.md
│   ├── access-control-flow.md
│   ├── alarm-response-flow.md
│   ├── equipment-flow.md
│   ├── training-compliance-flow.md
│   └── risk-assessment-flow.md
│
├── automation/
│   ├── shift-reminders.md
│   ├── missed-checkpoint-alerts.md
│   ├── incident-escalation.md
│   ├── visitor-overstay-alerts.md
│   ├── alarm-routing.md
│   ├── equipment-overdue-alerts.md
│   ├── certification-expiry-alerts.md
│   └── risk-report-generator.md
│
├── reporting/
│   ├── patrol-summary.md
│   ├── incident-summary.md
│   ├── access-summary.md
│   ├── equipment-report.md
│   ├── training-status.md
│   └── risk-register.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---
# 3. Entity Schemas

### 3.1 patrol_log
```yaml
uid: patrol-2025-03-12-01
type: patrol_log
guard_uid: guard-223
site_uid: site-ottawa-mall
route_uid: patrol-ottawa-mall-core
timestamp_start: 2025-03-12T10:00
timestamp_end: 2025-03-12T10:35
checkpoints:
  - { uid: cp-mall-entrance, scanned_at: "2025-03-12T10:05" }
  - { uid: cp-foodcourt, scanned_at: "2025-03-12T10:15" }
notes: "Suspicious loitering near food court, resolved."
```

### 3.2 incident_evidence
```yaml
uid: evid-2025-03-12-01
type: incident_evidence
incident_uid: inc-2025-03-12-01
media_type: photo
file_path: "media://security/inc-2025-03-12-01/photo1.jpg"
description: "Stolen item recovered near bench."
```

### 3.3 equipment_assignment
```yaml
uid: equip-assign-2025-03-12-01
type: equipment_assignment
guard_uid: guard-223
equipment_uid: equip-radio-44
assigned_at: 2025-03-12T07:55
returned_at: null
condition: "good"
```

### 3.4 alarm_event
```yaml
uid: alarm-2025-03-12-01
type: alarm_event
site_uid: site-ottawa-mall
alarm_type: fire
triggered_at: 2025-03-12T11:02
status: dispatched
description: "Sensor 7 triggered near loading bay."
```

---
# 4. Workflows

## 4.1 Shift Scheduling Workflow
1. Collect guard availability
2. Auto-generate shift schedule
3. Validate certifications
4. Send shift reminders
5. Manage shift handovers

## 4.2 Patrol Workflow
- Assign route
- Guard performs patrol
- Checkpoint scanning
- Missed checkpoint detection
- Patrol report generation

## 4.3 Incident Management Workflow
1. Guard reports incident
2. Add severity level
3. Attach evidence
4. Auto-escalate if needed
5. Supervisor review
6. Corrective actions

## 4.4 Access Control Flow
- Visitor sign-in
- Identity verification
- Badge issuance
- Entry/exit logging
- Auto-alert on overstays

## 4.5 Alarm Response Flow
- Alarm triggered
- Guard dispatch
- Initial assessment
- Secure area or clear false alarm
- Final incident report

## 4.6 Equipment Management Flow
- Issue radios/PPE/keys
- Record condition
- Track overdue returns

## 4.7 Training Compliance Flow
- Track required certificates
- Notify expiring training
- Record completion status

## 4.8 Risk Assessment Flow
- Hazard identification
- Threat assessment
- Record risk level (low/med/high)
- Recommend mitigation actions

---
# 5. Automation

### 5.1 Shift Reminders
- Notify guards before upcoming shifts

### 5.2 Missed Checkpoint Alerts
- Trigger alerts if checkpoint not scanned within window

### 5.3 Incident Escalation
- High severity incidents auto-tag supervisors
- Trigger emergency protocols

### 5.4 Visitor Overstay Alerts
- Notify supervisors if visitor not checked out

### 5.5 Alarm Routing
- Based on alarm type + site rules

### 5.6 Equipment Overdue Alerts
- Flag overdue returns of radios, vehicles, PPE

### 5.7 Certification Expiry Alerts
- Notify guards 30/7/1 day before expiry

### 5.8 Risk Report Generator
- Compiles monthly risk assessments

---
# 6. Reporting

## 6.1 Patrol Summary
- Completed patrols
- Missed checkpoints
- Incident ties

## 6.2 Incident Summary
- All incidents by severity
- Evidence attachments
- Response actions

## 6.3 Access Summary
- Visitor history
- Contractor logs
- Overstays

## 6.4 Equipment Report
- Assignments
- Maintenance needs
- Loss/damage logs

## 6.5 Training Status Report
- Certification requirements
- Expiring training

## 6.6 Risk Register
- Site-wide risk overview
- Mitigation tasks

---
# 7. CLI Commands

### 7.1 `sbf security new-incident`
Create new incident report.

### 7.2 `sbf security patrol`
Create patrol log with checkpoints.

### 7.3 `sbf security shift`
Manage guard shifts.

### 7.4 `sbf security alarm`
Record alarm events.

### 7.5 `sbf security access`
Manage visitor and contractor logs.

### 7.6 `sbf security report`
Generate summaries for audits.

---
# 8. Roadmap
- Phase 1: Patrol + incidents engine
- Phase 2: Alarms + guard scheduling
- Phase 3: Visitor/contractor portal
- Phase 4: Multi-site command center
- Phase 5: Threat intelligence & predictive risk AI

