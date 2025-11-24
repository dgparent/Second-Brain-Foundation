# Hospitality Operations Module

This module operationalizes the **Hotels & Hospitality Operations Framework** into a complete operational toolkit for:
- Hotels & resorts
- Inns, lodges, boutique hotels
- Hostels
- Serviced apartments
- Airbnb / vacation rental operators

It coordinates **front desk**, **housekeeping**, **maintenance**, **guest services**, **pricing**, and **incidents** into a unified automation-ready system.

---
# 1. Module Purpose
This module enables:
- Guest reservation lifecycle management
- Automated room turnover & housekeeping workflows
- Maintenance request routing and management
- Incident/security logging
- Staff scheduling & shift management
- Concierge & service request management
- Room status automation
- Occupancy-based pricing workflows
- Multi-property operations

---
# 2. Module Architecture

## 2.1 Directory Structure
```
@sbf/hospitality-ops/
│
├── entities/
│   ├── property.md
│   ├── room.md
│   ├── room_type.md
│   ├── booking_record.md
│   ├── guest_profile.md
│   ├── checkin_record.md
│   ├── checkout_record.md
│   ├── housekeeping_task.md
│   ├── room_status.md
│   ├── maintenance_request.md
│   ├── work_order.md
│   ├── service_request.md
│   ├── incident_report.md
│   ├── staff_profile.md
│   ├── staff_shift.md
│   ├── amenity_item.md
│   ├── pricing_rule.md
│   └── property_inspection.md
│
├── workflows/
│   ├── guest-lifecycle.md
│   ├── housekeeping-flow.md
│   ├── maintenance-flow.md
│   ├── frontdesk-flow.md
│   ├── pricing-flow.md
│   ├── incident-flow.md
│   └── service-request-flow.md
│
├── automation/
│   ├── auto-turnover-tasks.md
│   ├── housekeeping-scheduler.md
│   ├── room-status-updater.md
│   ├── guest-messaging.md
│   ├── incident-escalation.md
│   ├── maintenance-routing.md
│   ├── pricing-engine.md
│   └── occupancy-dashboard.md
│
├── reporting/
│   ├── occupancy-report.md
│   ├── housekeeping-report.md
│   ├── maintenance-report.md
│   ├── incident-summary.md
│   ├── guest-history-report.md
│   └── property-performance.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---
# 3. Entity Schemas

### 3.1 booking_record
```yaml
uid: booking-2025-03-14-01
type: booking_record
guest_uid: guest-004
total_guests: 2
room_uid: room-101
checkin_date: 2025-03-14
checkout_date: 2025-03-16
payment_status: paid
special_requests:
  - "Late check-in"
status: confirmed
```

### 3.2 checkin_record
```yaml
uid: checkin-2025-03-14-01
type: checkin_record
booking_uid: booking-2025-03-14-01
checkin_time: 2025-03-14T20:12
handled_by: staff-fd-001
notes: "Guest requested extra pillows."
```

### 3.3 checkout_record
```yaml
uid: checkout-2025-03-16-01
type: checkout_record
booking_uid: booking-2025-03-14-01
checkout_time: 2025-03-16T11:05
status: completed
notes: "Room left in good condition."
```

### 3.4 housekeeping_task
```yaml
uid: hk-2025-03-16-01
type: housekeeping_task
room_uid: room-101
task_type: turnover
assigned_to: staff-hk-002
priority: high
status: pending
due_time: 2025-03-16T12:00
```

### 3.5 room_status
```yaml
uid: roomstatus-101
type: room_status
room_uid: room-101
status: dirty
updated_at: 2025-03-16T11:12
```

### 3.6 service_request
```yaml
uid: srv-2025-03-15-01
type: service_request
guest_uid: guest-004
room_uid: room-101
request_type: towels
description: "Need extra towels"
status: completed
```

### 3.7 staff_shift
```yaml
uid: shift-2025-03-15-fd-01
type: staff_shift
staff_uid: staff-fd-001
role: frontdesk
start_time: 2025-03-15T07:00
end_time: 2025-03-15T15:00
```

---
# 4. Workflows

## 4.1 Guest Lifecycle Workflow
1. Booking received
2. Pre-arrival messaging
3. Check-in process
4. Stay management (service requests)
5. Incident handling if needed
6. Check-out process
7. Feedback request
8. Guest history recording

## 4.2 Housekeeping Workflow
- Auto-generate tasks after checkout
- Turnover checklist
- Daily cleaning schedule
- Deep-clean cycle
- Inspection and approval

## 4.3 Maintenance Workflow
- New request intake
- Technician assignment
- Work order execution
- Repair verification
- Completion logging

## 4.4 Pricing Workflow
- Apply pricing rules:
  - seasonal
  - occupancy-based
  - event-based
- Sync rate changes

## 4.5 Incident Workflow
- Record incident
- Gather information
- Escalation rules
- Resolution + documentation

## 4.6 Service Request Workflow
- Receive request
- Assign staff
- Fulfill request
- Track completion

---
# 5. Automation

### 5.1 Auto Turnover Tasks
- Triggered when checkout is recorded
- Generates task list:
  - linens
  - bathroom cleaning
  - restocking
  - inspection

### 5.2 Housekeeping Scheduler
- Auto-assign tasks based on:
  - staff capacity
  - priority
  - deadlines

### 5.3 Room Status Updater
- Auto-set room to **dirty** after checkout
- Auto-set to **clean** after inspection

### 5.4 Guest Messaging Automation
- Pre-arrival info
- Mid-stay satisfaction check
- Checkout instructions

### 5.5 Pricing Engine
- Adjust rates based on:
  - occupancy trends
  - day-of-week
  - upcoming local events

### 5.6 Maintenance Routing
- Route plumbing/electrical/HVAC issues to correct staff
- Escalate overdue tickets

### 5.7 Incident Escalation
- Severity-based rules
- Security notifications

---
# 6. Reporting

## 6.1 Occupancy Report
- Daily occupancy
- ADR (Average Daily Rate)
- RevPAR

## 6.2 Housekeeping Report
- Completed tasks
- Delayed tasks
- Room readiness

## 6.3 Maintenance Report
- Open work orders
- MTTR (Mean Time to Repair)
- Category breakdown

## 6.4 Incident Summary
- Count by severity
- Security trends
- Guest impact

## 6.5 Property Performance
- Revenue summary
- Occupancy trends
- Guest satisfaction metrics

---
# 7. CLI Commands

### 7.1 `sbf hospitality new-booking`
Create booking + initialize guest lifecycle.

### 7.2 `sbf hospitality checkin`
Record check-in and update room status.

### 7.3 `sbf hospitality checkout`
Trigger room turnover tasks automatically.

### 7.4 `sbf hospitality housekeeping`
Manage cleaning and room tasks.

### 7.5 `sbf hospitality service`
Manage service requests.

### 7.6 `sbf hospitality report`
Generate occupancy, housekeeping, or performance reports.

---
# 8. Roadmap
- Phase 1: Guest lifecycle & housekeeping basics
- Phase 2: Automated pricing engine
- Phase 3: Guest messaging & concierge AI
- Phase 4: Multi-property orchestration
- Phase 5: F&B integration + cross-department workflows

