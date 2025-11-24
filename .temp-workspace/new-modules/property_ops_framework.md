# Real Estate Property Operations Framework

This framework defines the entity models, workflows, compliance needs, and operations structure for **Real Estate Property Management**, including multi-unit residential, commercial buildings, mixed‑use developments, and landlord/tenant lifecycle management.

This supports the operational module **@sbf/property-ops**.

---

# 1. Purpose & Scope
This framework provides a universal structure for:
- Property management
- Tenant lifecycle operations
- Building maintenance
- Rent + financial tracking
- Inspections & compliance
- Vendor/supplier management
- Document control (leases, maintenance logs, move‑in/out reports)

Targets:
- Property managers
- Real estate investors
- Multi-unit landlords
- Condominium corporations
- Commercial real estate operators
- Facility managers

---

# 2. Domain Pillars
- **Tenant Lifecycle** (applications → screening → lease → payments → renewal)
- **Property & Unit Management** (details, conditions, occupancy)
- **Maintenance Operations** (tickets, work orders, vendors)
- **Inspections** (move-in, move-out, annual, compliance)
- **Rent & Financial Ops** (rent roll, fees, deposit tracking)
- **Compliance & Documentation** (leases, notices, reports)
- **Vendor & Staff Management** (contractors, cleaners, repair teams)
- **Asset Performance Analytics**

---

# 3. Core Entities
- `property`
- `building`
- `unit`
- `tenant_profile`
- `tenant_application`
- `lease_contract`
- `rent_invoice`
- `payment_record`
- `maintenance_request`
- `work_order`
- `vendor_profile`
- `inspection_record`
- `property_document`
- `occupancy_record`
- `notice_document`
- `service_contract`
- `utility_meter`
- `utility_reading`

---

# 4. Ontology Relationships
- A `property` contains zero or more `building` records.
- A `building` contains `unit` objects.
- A `unit` has 0–1 `tenant_profile` currently occupying.
- `tenant_application` leads to a `lease_contract`.
- `rent_invoice` → `payment_record` (many payments possible).
- `maintenance_request` becomes `work_order`.
- `vendor_profile` fulfills `work_order`.
- `inspection_record` references property, unit, and inspector.
- `property_document` includes leases, notices, inspection reports.
- `utility_meter` attaches to building/unit.
- `utility_reading` accumulates over time.

---

# 5. Core Processes

## 5.1 Tenant Lifecycle Process
1. Application intake
2. Screening (credit, references, employment)
3. Approval/denial
4. Lease preparation & signing
5. Move-in inspection
6. Monthly rent cycle
7. Maintenance requests
8. Renewal or move-out
9. Move-out inspection
10. Deposit settlement

## 5.2 Maintenance Operations
- Ticket logged by tenant or PM
- Work order creation
- Vendor assignment
- Job completion + cost record
- Quality check
- Invoice payment

## 5.3 Financial & Rent Cycle
- Rent roll generation monthly
- Late fees automation
- Utility pass-through charges
- Deposit tracking
- Payment reminders

## 5.4 Inspections
- Move-in/move-out
- Annual safety inspections
- Unit condition surveys
- Property-wide exterior inspections

## 5.5 Vendor & Staff Management
- Contractor onboarding
- Insurance & license validation
- Service contracts
- Performance rating

---

# 6. YAML Schemas

## 6.1 property
```yaml
uid: prop-2025-001
type: property
title: "Riverside Apartments"
address: "129 River St, Ottawa"
property_type: residential_multi_unit
owner_uid: org-abc-properties
num_buildings: 3
notes: "Renovated 2022"
```

## 6.2 unit
```yaml
uid: unit-b1-203
type: unit
building_uid: bldg-1
unit_number: 203
bedrooms: 2
bathrooms: 1
square_feet: 890
status: occupied
tenant_uid: tenant-2025-03
rent_amount: 1850
```

## 6.3 tenant_profile
```yaml
uid: tenant-2025-03
type: tenant_profile
name: "Anna Lopez"
move_in_date: 2025-03-01
contact:
  email: "anna@example.com"
  phone: "+1-613-123-8899"
employer: "TechCorp"
income_verified: true
```

## 6.4 maintenance_request
```yaml
uid: mr-2025-03-10-01
type: maintenance_request
unit_uid: unit-b1-203
reported_by: tenant-2025-03
issue_type: plumbing
priority: high
description: "Leaking under kitchen sink"
status: new
```

## 6.5 work_order
```yaml
uid: wo-2025-03-10-01
type: work_order
related_request_uid: mr-2025-03-10-01
assigned_vendor_uid: vendor-plumbco
dispatch_date: 2025-03-10
completion_date: null
cost_estimate: 120.00
status: dispatched
```

## 6.6 rent_invoice
```yaml
uid: inv-rent-2025-03-203
type: rent_invoice
unit_uid: unit-b1-203
tenant_uid: tenant-2025-03
period: "2025-03"
amount_due: 1850
late_fee: 0
status: unpaid
```

## 6.7 inspection_record
```yaml
uid: ins-2025-03-01-001
type: inspection_record
unit_uid: unit-b1-203
inspection_type: move_in
inspector_uid: pm-004
date: 2025-03-01
photos: []
notes: "Unit in good condition. Minor paint scuffs."
```

---

# 7. Automation Capabilities
- Auto-rent roll generation
- Late payment notices
- Maintenance ticket routing
- Vendor scheduling
- Compliance renewals (e.g., fire safety certificates)
- Renewal reminders
- Move-in/out report auto-generation
- Utility meter data ingestion & anomaly alerts

---

# 8. Compliance Requirements
- Residential tenancy law
- Fire & safety codes
- Building code inspections
- Insurance verification
- Accessibility compliance
- Document retention standards

---

# 9. Integration With SBF Frameworks
- **Financial** → rent invoices, payments, work order costs
- **Task** → all PM follow-up tasks
- **Relationship** → tenants, contractors, owners
- **Knowledge** → lease templates, legal documents
- **Health** → building incidents (if needed)

---

# 10. Roadmap
- Phase 1: Basic PM + rent cycle
- Phase 2: Maintenance automation engine
- Phase 3: Tenant portal + ticketing
- Phase 4: Utility meter integrations
- Phase 5: Multi-property investor dashboard

