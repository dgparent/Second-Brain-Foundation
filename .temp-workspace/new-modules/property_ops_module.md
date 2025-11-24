# Property Operations Module

This module transforms the **Property Operations Framework** into a fully operational toolkit for:
- Residential property managers
- Commercial building operators
- Landlords & real estate investors
- Facility management teams

It provides actionable workflows, schemas, automations, and reports to manage the full lifecycle of properties, units, tenants, and maintenance operations.

---
# 1. Module Purpose
Enable automation-ready management of:
- Tenant lifecycle
- Rent cycle & invoicing
- Property/Unit operations
- Maintenance requests
- Vendor management
- Inspections
- Legal & operational documentation
- Utility tracking

---
# 2. Module Architecture

## 2.1 Directory Structure
```
@sbf/property-ops/
│
├── entities/
│   ├── property.md
│   ├── building.md
│   ├── unit.md
│   ├── tenant_profile.md
│   ├── lease_contract.md
│   ├── tenant_application.md
│   ├── rent_invoice.md
│   ├── payment_record.md
│   ├── maintenance_request.md
│   ├── work_order.md
│   ├── inspection_record.md
│   ├── vendor_profile.md
│   ├── service_contract.md
│   ├── utility_meter.md
│   └── utility_reading.md
│
├── workflows/
│   ├── tenant-lifecycle.md
│   ├── rent-cycle.md
│   ├── maintenance-flow.md
│   ├── inspection-flow.md
│   └── vendor-management.md
│
├── automation/
│   ├── auto-rent-roll.md
│   ├── late-fee-engine.md
│   ├── maintenance-routing.md
│   ├── vendor-scheduling.md
│   ├── renewal-reminders.md
│   └── utility-meter-ingestion.md
│
├── reporting/
│   ├── property-dashboard.md
│   ├── rent-summary.md
│   ├── maintenance-report.md
│   ├── vendor-performance.md
│   └── tenant-analytics.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---
# 3. Entity Schemas

### 3.1 lease_contract
```yaml
uid: lease-2025-203
type: lease_contract
unit_uid: unit-b1-203
tenant_uid: tenant-2025-03
start_date: 2025-03-01
end_date: 2026-02-28
rent_amount: 1850
deposit_amount: 1850
deposit_status: held
auto_renew: true
notice_period_days: 60
```

### 3.2 tenant_application
```yaml
uid: app-2025-01
type: tenant_application
property_uid: prop-2025-001
applicant_name: "Anna Lopez"
email: "anna@example.com"
income: 62000
employment_status: "Full-time"
references:
  - name: "John Smith"
    phone: "+1-613-123-4455"
application_status: approved
```

### 3.3 payment_record
```yaml
uid: pay-2025-03-01-203
type: payment_record
rent_invoice_uid: inv-rent-2025-03-203
amount: 1850
payment_date: 2025-03-01
method: e_transfer
status: cleared
```

### 3.4 vendor_profile
```yaml
uid: vendor-plumbco
type: vendor_profile
name: "PlumbCo Services"
contact:
  phone: "+1-613-999-1122"
  email: "contact@plumbco.com"
licenses: ["Ontario Plumbing License #8821"]
insurance_expiry: 2025-12-31
rating: 4.7
```

### 3.5 service_contract
```yaml
uid: sc-2025-001
type: service_contract
vendor_uid: vendor-plumbco
property_uid: prop-2025-001
type_of_service: plumbing
start_date: 2025-01-01
end_date: 2025-12-31
cost_per_month: 250
status: active
```

### 3.6 utility_meter
```yaml
uid: meter-b1-203-water
type: utility_meter
unit_uid: unit-b1-203
utility_type: water
installation_date: 2023-06-10
```

### 3.7 utility_reading
```yaml
uid: read-2025-03-10-01
type: utility_reading
meter_uid: meter-b1-203-water
reading_date: 2025-03-10
value: 487.3 # cubic meters
```

---
# 4. Workflows

## 4.1 Tenant Lifecycle Workflow
1. Application received
2. Screening (credit, references)
3. Approval → lease generation
4. Move-in inspection
5. Rent cycle begins
6. Renewal or move-out
7. Move-out inspection
8. Deposit reconciliation

## 4.2 Rent Cycle Workflow
- Generate rent invoices monthly
- Send reminders
- Apply late fees automatically
- Reconcile payments
- Update tenant ledger

## 4.3 Maintenance Workflow
- Tenant or PM submits maintenance request
- Auto-route to appropriate vendor
- Work order creation
- Vendor dispatch
- Completion & verification
- Cost posting

## 4.4 Inspection Workflow
- Move-in/out templates
- Annual safety inspections
- Property-wide checks

## 4.5 Vendor Management Workflow
- Vendor onboarding
- Verification of insurance/licensing
- Performance tracking
- Auto-renewal of service contracts

---
# 5. Automation

### 5.1 Auto Rent Roll
- Generates all rent invoices monthly
- Applies rate changes/renewals

### 5.2 Late Fee Engine
- Adds late fee after grace period
- Sends reminder notification

### 5.3 Maintenance Routing
- Routes requests based on:
  - issue_type
  - vendor specializations
  - proximity (optional)

### 5.4 Vendor Scheduling
- Sends job schedules
- Requests updates

### 5.5 Utility Meter Ingestion
- Imports water/electric/gas readings
- Flags anomalies
- Sends consumption reports

---
# 6. Reporting

### 6.1 Property Dashboard
- Occupancy rate
- Rent collection rate
- Outstanding maintenance
- Vendor SLAs

### 6.2 Rent Summary
- Paid/unpaid rent
- Late fees
- Revenue by property

### 6.3 Maintenance Report
- Open work orders
- Average time-to-complete
- Cost per category

### 6.4 Vendor Performance
- Completion time
- Quality feedback
- SLA adherence

### 6.5 Tenant Analytics
- Tenant duration
- Payment reliability
- Renewal likelihood

---
# 7. CLI Commands
### 7.1 `sbf property new-tenant`
Creates tenant profile + optional lease.

### 7.2 `sbf property new-rent-cycle`
Generates rent invoices.

### 7.3 `sbf property maintenance`
Logs maintenance requests and work orders.

### 7.4 `sbf property inspections`
Manage inspections and generate reports.

### 7.5 `sbf property report`
Generates property-level reports.

---
# 8. Roadmap
- Phase 1: Tenant lifecycle + rent engine
- Phase 2: Maintenance automation
- Phase 3: Vendor portal
- Phase 4: Utility analytics
- Phase 5: Multi-property portfolio dashboard

