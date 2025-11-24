# Shipment Order Entity

## Overview
Represents a customer's shipping request

## Schema
```yaml
uid: ship-2025-11-001
type: shipment_order
customer_uid: org-nao-corp
service_type: FCL
incoterm: CIF
origin_location_uid: loc-ottawa-01
destination_location_uid: loc-manila-01
requested_pickup: 2025-11-25T14:00:00-05:00
requested_delivery: 2025-12-20T17:00:00+08:00
references:
  customer_po: "PO-2025-19"
status: booked
```

## Status Values
- `quoted` - Quote provided
- `booked` - Order confirmed
- `active` - In transit
- `delivered` - Completed
- `cancelled` - Cancelled

## Relationships
- References: customer organization
- Has many: `consignment`
- Has many: `freight_charge`

## Used By
- Booking workflows
- Route planning
- Billing automation
