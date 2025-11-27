# Property Operations Framework

**Domain:** Real Estate Property Management  
**Version:** 1.0.0  
**Status:** Production Ready

The Property Operations Framework provides structure for managing residential and commercial properties including tenant lifecycle, maintenance, rent collection, inspections, and vendor management.

## Core Entities (18)

- `property` - Property record
- `building` - Building within property
- `unit` - Individual units
- `tenant_profile` - Tenant information
- `tenant_application` - Application process
- `lease_contract` - Lease agreements
- `rent_invoice` - Rent billing
- `payment_record` - Payment tracking
- `maintenance_request` - Tenant/PM requests
- `work_order` - Maintenance work orders
- `vendor_profile` - Contractor information
- `inspection_record` - Property inspections
- `property_document` - Leases, notices, reports
- `occupancy_record` - Occupancy tracking
- `notice_document` - Legal notices
- `service_contract` - Vendor contracts
- `utility_meter` - Utility meters
- `utility_reading` - Consumption tracking

## Key Features

**Tenant Lifecycle** - Application, screening, lease, renewal, move-out  
**Property Management** - Multi-unit tracking, occupancy, condition monitoring  
**Maintenance Operations** - Request routing, work orders, vendor coordination  
**Financial Operations** - Rent roll, late fees, deposit tracking, utility billing  
**Inspections** - Move-in/out, annual, compliance, condition surveys  
**Vendor Management** - Contractor onboarding, licensing, performance tracking

## Integration Points

- **Financial Framework** → Rent, payments, work order costs
- **Task Framework** → PM follow-ups, maintenance tasks
- **Relationship Framework** → Tenants, contractors, owners
- **Knowledge Framework** → Lease templates, legal docs

## License

MIT - Part of Second Brain Foundation
