# Pickup to Delivery Workflow

## Overview
Complete shipment execution from origin to destination

## Stages
1. **Booking** - Order confirmed
2. **Pickup** - Goods collected from origin
3. **Linehaul** - Main transportation leg(s)
4. **Customs** - Border clearance (if international)
5. **Final Mile** - Delivery to destination
6. **Proof of Delivery** - Completion confirmation

## Process Flow
1. Shipment order created
2. Consignment generated
3. Route plan created (transport legs)
4. Dispatch notification
5. Pickup event recorded
6. Transport events tracked per leg
7. Customs processing (if needed)
8. Delivery attempt
9. POD captured
10. Status updated to "delivered"

## Automation
- Auto-create consignment from shipment
- Route optimization
- Carrier tracking sync
- Customer notifications
- Exception alerts

## Key Entities
- `shipment_order`
- `consignment`
- `transport_leg`
- `transport_event`
- `logistic_unit`

## Integration Points
- Financial: Freight billing
- Knowledge: Carrier SOPs
- Relationship: Customer updates
