# Logistics Operations Module

This module operationalizes the **Logistics, Freight Forwarding & Customs Framework** into actionable tooling for:
- freight forwarders
- customs brokers
- couriers
- trucking companies
- exporters/importers
- warehouse operators
- 3PL/4PL organizations

It includes:
- Operational entities
- Events & workflows
- Automation flows
- Routing logic
- Compliance tasks
- Reporting structures
- CLI command library

---

# 1. Module Purpose
To provide a complete, automation-ready logistics operations system integrated with SBF frameworks, including:
- Shipment creation & routing
- Consignment & logistic unit management
- Customs processing
- Transport event ingestion
- Warehouse inbound/outbound
- Billing & invoices
- Exception management

---

# 2. Module Architecture
## 2.1 Directory Layout
```
@sbf/logistics-ops/
│
├── entities/
│   ├── shipment_order.md
│   ├── consignment.md
│   ├── logistic_unit.md
│   ├── goods_item.md
│   ├── transport_leg.md
│   ├── transport_event.md
│   ├── customs_declaration.md
│   ├── transport_equipment.md
│   ├── transport_means.md
│   ├── warehouse_location.md
│   └── invoice.md
│
├── workflows/
│   ├── booking-flow.md
│   ├── pickup-to-delivery-flow.md
│   ├── customs-clearance-flow.md
│   ├── exception-handling-flow.md
│   └── warehouse-inbound-outbound-flow.md
│
├── automation/
│   ├── auto-route-plan.md
│   ├── carrier-sync.md
│   ├── customs-ai.md
│   ├── daily-dashboard.md
│   └── freight-billing.md
│
├── reporting/
│   ├── kpi-dashboard.md
│   ├── shipment-timeline-report.md
│   ├── warehouse-activity-report.md
│   └── billing-summary.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---

# 3. Entity Schemas

### 3.1 shipment_order
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

### 3.2 consignment
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

### 3.3 logistic_unit
```yaml
uid: unit-sscc-003700099999999999
type: logistic_unit
sscc: "003700099999999999"
unit_type: container
contents:
  - goodsitem-2025-001
gross_weight_kg: 18500
equipment_uid: cont-MRSU1234567
status: loaded
```

### 3.4 goods_item
```yaml
uid: goodsitem-2025-001
type: goods_item
description: "Telecom components"
hs_code: "8517.70"
quantity: 74
weight_kg: 18500
value_usd: 52000
package_type: pallet
```

### 3.5 transport_leg
```yaml
uid: leg-2025-11-28-01
type: transport_leg
sequence: 2
mode: sea
carrier_uid: org-oceanline
transport_means_uid: vessel-imo-9876543
origin_location_uid: loc-vancouver-01
destination_location_uid: loc-manila-port
departure_planned: 2025-11-28T18:00:00-08:00
arrival_planned: 2025-12-16T09:00:00+08:00
status: planned
```

### 3.6 transport_event
```yaml
uid: te-2025-11-28-01
type: transport_event
event_time: 2025-11-28T18:15:00-08:00
event_type: departure
location_uid: loc-vancouver-01
related_leg_uid: leg-2025-11-28-01
related_consignment_uids: [cons-2025-11-001]
status: IN_TRANSIT
```

### 3.7 customs_declaration
```yaml
uid: customs-2025-11-001
type: customs_declaration
consignment_uid: cons-2025-11-001
declaration_type: export
hs_codes:
  - { code: "8517.70", value_usd: 52000 }
documents:
  - doc-commercial-invoice-2025-01
  - doc-packing-list-2025-01
status: submitted
```

### 3.8 transport_equipment
```yaml
uid: cont-MRSU1234567
type: transport_equipment
identifier: "MRSU1234567"
category: container
size_type_code: "40HC"
owned_by: org-containerlessor
status: full
```

### 3.9 transport_means
```yaml
uid: vessel-imo-9876543
type: transport_means
identifier: "IMO9876543"
means_type: vessel
operator_uid: org-oceanline
capacity_teu: 18000
```

### 3.10 invoice
```yaml
uid: inv-2025-0021
type: invoice
issuer_uid: org-2bf-logistics
payer_uid: org-nao-corp
invoice_date: 2025-12-22
currency: USD
items:
  - description: "Ocean freight FCL"
    amount: 3400
  - description: "Fuel surcharge"
    amount: 150
  - description: "Documentation fee"
    amount: 75
total: 3625
```

---

# 4. Workflow Definitions

## 4.1 Booking Flow
1. Receive shipment request
2. Auto-generate quote (optional)
3. Customer accepts → status becomes `booked`
4. Create consignment
5. Assign carrier and equipment if needed
6. Generate route plan
7. Notify operations team

## 4.2 Pickup → Delivery Flow
1. Dispatch driver
2. Pickup event (scan logistic unit)
3. Linehaul departure
4. Tracking events sync from carrier API
5. Arrival at destination hub
6. Delivery attempt → Delivery success
7. Generate POD

## 4.3 Customs Clearance Flow
1. Create customs declaration
2. Attach documents
3. Auto-check HS codes
4. Submit to customs API (future)
5. Await decision
6. Clearance event
7. Hold/Inspection if applicable

## 4.4 Exception Handling Flow
- Delays
- Damages
- Temperature excursions
- Incorrect documents
- Customs hold
- Missed connection
- Customer escalation

Automation:
- Create exception record
- Assign responsible team
- Generate customer-facing updates

## 4.5 Warehouse Inbound/Outbound Flow
- Inbound receiving → scanning
- Put-away
- Inventory allocation
- Picking list generation
- Outbound staging
- Loading validation

---

# 5. Automations
## 5.1 Auto Route Plan
- Based on origin/destination
- Select best carrier/mode
- Create legs

## 5.2 Carrier Sync
- Connect to APIs
- Pull tracking updates
- Create `transport_event`
- Update shipment timeline

## 5.3 Customs-AI
- OCR and parse invoices and packing lists
- Suggest HS codes
- Validate valuation rules
- Auto-generate declaration draft

## 5.4 Daily Logistics Dashboard
- List active shipments
- Show events in last 24 hours
- Highlight delays/exceptions
- ETA predictions

## 5.5 Freight Billing Automation
- Calculate charges based on rules
- Generate invoice drafts
- Send to finance module

---

# 6. Reporting
## 6.1 KPI Dashboard
- On-time pickup rate
- On-time delivery rate
- Exception rate
- Clearance times
- Warehouse throughput
- TEU/tonnage moved

## 6.2 Shipment Timeline Report
- Event-by-event timeline
- Delays identified automatically
- Mode breakdown

## 6.3 Billing Summary Report
- Charges per customer
- Surcharges
- Outstanding invoices

---

# 7. CLI Commands
### 7.1 `sbf logistics new-shipment`
Creates shipment + consignment structure.

### 7.2 `sbf logistics track`
Pulls all latest carrier updates.

### 7.3 `sbf logistics customs`
Wizard to generate customs declaration.

### 7.4 `sbf logistics scan <sscc>`
Loads logistic unit info.

### 7.5 `sbf logistics report`
Generates any report.

---

# 8. Roadmap
- Phase 1: Core entities + CLI generation
- Phase 2: Customs AI pipeline
- Phase 3: Carrier API federation engine
- Phase 4: Warehouse module extension
- Phase 5: ETA prediction engine using ML

---

This module now forms the operational backbone for logistics automation inside the SBF ecosystem.

