# @sbf/property-ops

**Property Operations Module for Second Brain Foundation**

Comprehensive real estate property management module supporting tenant lifecycle, maintenance operations, rent collection, and inspections.

## Features

- **Tenant Lifecycle** - Application, screening, lease management, move-in/out
- **Property Management** - Multi-unit tracking, occupancy monitoring
- **Maintenance Operations** - Request routing, work orders, vendor coordination
- **Financial Operations** - Rent roll, late fees, deposit tracking
- **Inspections** - Move-in/out, annual, compliance inspections
- **Vendor Management** - Contractor onboarding, licensing, performance tracking

## Installation

```bash
npm install @sbf/property-ops
```

## Usage

```typescript
import { createUnit, createLease, createRentInvoice, calculateOccupancyRate } from '@sbf/property-ops';

// Create a rental unit
const unit = createUnit({
  buildingUid: "bldg-001",
  unitNumber: "203",
  bedrooms: 2,
  bathrooms: 1,
  squareFeet: 890,
  rentAmount: 1850
});

// Create a lease
const lease = createLease({
  unitUid: unit.uid,
  tenantUid: "tenant-001",
  startDate: "2025-03-01",
  endDate: "2026-02-28",
  rentAmount: 1850,
  depositAmount: 1850
});

// Generate rent invoice
const invoice = createRentInvoice({
  unitUid: unit.uid,
  tenantUid: "tenant-001",
  period: "2025-03",
  amountDue: 1850
});

// Calculate occupancy rate
const rate = calculateOccupancyRate(units);
```

## Entities (18)

- `property` - Property records
- `building` - Buildings within properties
- `unit` - Individual units
- `tenant_profile` - Tenant information
- `tenant_application` - Applications
- `lease_contract` - Lease agreements
- `rent_invoice` - Rent billing
- `payment_record` - Payments
- `maintenance_request` - Maintenance tickets
- `work_order` - Work orders
- `vendor_profile` - Contractors
- `inspection_record` - Inspections
- `property_document` - Documents
- `occupancy_record` - Occupancy tracking
- `notice_document` - Legal notices
- `service_contract` - Vendor contracts
- `utility_meter` - Utility meters
- `utility_reading` - Consumption data

## License

MIT - Part of Second Brain Foundation
