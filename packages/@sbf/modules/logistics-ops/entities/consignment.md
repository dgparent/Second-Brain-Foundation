# Consignment Entity

## Overview
Represents goods being transported from origin to destination

## Schema
```yaml
uid: cons-2025-11-001
type: consignment
shipment_order_uid: ship-2025-11-001
consignor_uid: org-nao-corp
consignee_uid: org-okir-exports
origin_location_uid: loc-ottawa-01
destination_location_uid: loc-manila-01
mode_mix: [road, sea]
status: active
```

## Status Values
- `planned` - Route planned
- `active` - In transit
- `completed` - Delivered

## Relationships
- Belongs to: `shipment_order`
- Has many: `logistic_unit`
- Has many: `transport_leg`
- Has many: `transport_event`
- Has one: `customs_declaration`

## Used By
- Transport execution
- Tracking system
- Customs processing
