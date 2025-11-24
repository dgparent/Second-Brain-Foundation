# Hotels & Hospitality Operations Framework

This framework defines the full operational structure, domain ontology, workflows, and data entities required for **hospitality operations**, including:
- Hotels
- Resorts
- Hostels
- Boutique hotels
- Lodges, Inns, B&Bs
- Serviced apartments
- Vacation rental operations (Airbnb-style)

It supports the operational module **@sbf/hospitality-ops**.

---
# 1. Purpose & Scope
This framework establishes the foundation for managing:
- Guest lifecycle (booking → check-in → stay → check-out)
- Housekeeping operations
- Maintenance workflows
- Front desk operations
- Food & Beverage (optional integration)
- Room inventory & pricing
- Staff scheduling & tasking
- Guest incidents & security events
- Property inspections and standards
- Hospitality compliance

Designed for:
- Hotel managers
- Hospitality operations teams
- Cleaning staff
- Front desk teams
- Maintenance teams
- Multi-property operators

---
# 2. Domain Pillars
- **Guest Lifecycle Ops**
- **Front Desk & Reservations**
- **Housekeeping & Room Turnover**
- **Maintenance & Work Orders**
- **Room Inventory & Pricing**
- **Guest Communication & Concierge Services**
- **Incidents, Safety & Security**
- **Compliance & Standards**

---
# 3. Core Entities
- `property`
- `room`
- `room_type`
- `booking_record`
- `guest_profile`
- `checkin_record`
- `checkout_record`
- `housekeeping_task`
- `room_status`
- `maintenance_request`
- `work_order`
- `incident_report`
- `staff_profile`
- `staff_shift`
- `service_request`
- `amenity_item`
- `pricing_rule`
- `property_inspection`
- `housekeeping_schedule`

---
# 4. Ontology Relationships
- A `property` contains many `room` objects.
- Each `room` belongs to a `room_type` (e.g., deluxe suite).
- `booking_record` references guest and room.
- `checkin_record` & `checkout_record` reference bookings.
- `housekeeping_task` updates `room_status`.
- `maintenance_request` becomes a `work_order`.
- `service_request` links to guest & room.
- `staff_profile` links to `staff_shift`.
- `property_inspection` relates to property and staff.
- `pricing_rule` governs room rates.

---
# 5. Core Processes

## 5.1 Guest Lifecycle
1. Reservation received
2. Booking record creation
3. Guest arrival notification
4. Check-in process
5. Stay management (service requests, incidents)
6. Check-out
7. Billing & receipts

## 5.2 Housekeeping Operations
- Room turnover after checkout
- Daily cleaning schedule
- Deep clean schedules
- Inventory replenishment (linen, amenities)
- Quality inspections

## 5.3 Maintenance Operations
- Guest-reported issues
- Staff-logged issues
- Work order creation
- Vendor assignment (optional)
- Repairs + verification

## 5.4 Front Desk Operations
- Guest communication
- Reservation changes
- Payment processing
- Special requests
- Late check-out / early check-in handling

## 5.5 Pricing & Inventory Management
- Rate plans
- Seasonal pricing
- Weekend/holiday modifiers
- Occupancy-based pricing

## 5.6 Security & Incident Handling
- Guest incidents
- Injury logs
- Property damage
- Missing items
- Suspicious behavior

---
# 6. YAML Schemas

## 6.1 room
```yaml
uid: room-101
type: room
property_uid: prop-ottawa-hotel
room_number: "101"
room_type_uid: rt-queen-standard
status: available
amenities:
  - ac
  - wifi
  - tv
  - desk
```

## 6.2 booking_record
```yaml
uid: booking-2025-03-1012
type: booking_record
guest_uid: guest-2025-01
room_uid: room-101
checkin_date: 2025-03-14
checkout_date: 2025-03-16
status: confirmed
price_total: 320.00
```

## 6.3 housekeeping_task
```yaml
uid: hk-2025-03-16-01
type: housekeeping_task
room_uid: room-101
task_type: turnover
assigned_to: staff-hk-002
status: pending
priority: high
due_time: 2025-03-16T11:00
```

## 6.4 incident_report
```yaml
uid: inc-2025-03-15-01
type: incident_report
room_uid: room-101
guest_uid: guest-2025-01
type_of_incident: noise_complaint
severity: low
description: "Guest in room 103 reported loud noise from 101"
notes: "Spoke to guest, resolved issue."
```

## 6.5 maintenance_request
```yaml
uid: mr-2025-03-15-01
type: maintenance_request
room_uid: room-101
reported_by: staff-hk-002
issue_type: plumbing
description: "Bathroom sink draining slowly"
priority: medium
status: new
```

---
# 7. Automation Capabilities
- Auto-generated cleaning schedules
- Turnover task creation after checkout
- Maintenance routing to specific staff
- Guest messaging templates
- Pricing adjustments based on occupancy
- Incident escalation
- Staff shift reminders
- Room readiness tracking
- KPI dashboards (occupancy, ADR, RevPAR)

---
# 8. Compliance Areas
- Health & safety standards
- Fire code compliance
- Cleaning protocol adherence
- Incident documentation
- Property inspections
- Accessibility laws

---
# 9. Integration with SBF Frameworks
- **Financial** → room charges, invoices, vendor payments
- **Task** → housekeeping tasks, shifts, maintenance tasks
- **Health** → injury reports
- **Knowledge** → SOPs, cleaning protocols
- **Relationship** → guests, vendors, staff

---
# 10. Roadmap
- Phase 1: Housekeeping engine
- Phase 2: Guest communication layer
- Phase 3: Pricing engine
- Phase 4: Multi-property view
- Phase 5: F&B integration

