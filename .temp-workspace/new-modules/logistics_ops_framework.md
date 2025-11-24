# Logistics, Freight Forwarding & Customs Operations Framework

This framework defines the ontology, entities, workflows, and structural components for the Logistics, Freight Forwarding, Transportation, and Customs domain.

It is designed for:
- Domestic couriers
- Freight forwarders (3PL/4PL/NVOCC)
- Customs brokers
- Exporters/Importers
- Warehouse operators
- Trucking companies
- Ocean, Air, Rail, and RoRo carriers

This framework serves as the foundation for the operational module: **@sbf/logistics-ops**.

---

# 1. Purpose & Role of the Framework
The Logistics Framework provides:
- Canonical definitions for shipments, consignments, logistics units, events, carriers, bookings, and customs processes.
- Full traceability from origin → destination across any transport mode.
- Support for multi-modal routing: road, sea, air, rail, inland waterways, and RoRo.
- Standard alignment with: GS1, UN/CEFACT, IATA ONE Record.
- Integration with SBF Financial, Knowledge, Relationship, Health (for compliance), and Task systems.

---

# 2. Domain Pillars
Core pillars of the logistics domain:
- **Bookings & Orders** (quotes, bookings, routing)
- **Consignments & Shipments** (core logistics objects)
- **Logistic Units** (parcels, pallets, containers, ULDs)
- **Transport Equipment** (containers, trailers, wagons)
- **Transport Means** (vehicles, vessels, aircraft)
- **Events & Status Updates** (pickup, departure, arrival, POD)
- **Warehouse Ops** (inbound/outbound, WMS)
- **Customs & Regulatory** (declarations, documents, HS codes)
- **Billing & Charges** (freight rates, surcharges)

---

# 3. Core Entities
The following are canonical entities:
- `shipment_order`
- `consignment`
- `goods_item`
- `logistic_unit` (SSCC-level)
- `transport_equipment`
- `transport_means`
- `transport_leg`
- `transport_event`
- `warehouse_location`
- `inventory_record`
- `bill_of_lading`
- `air_waybill`
- `cmr_note`
- `customs_declaration`
- `customs_document`
- `freight_charge`
- `invoice`
- `carrier`
- `freight_forwarder`
- `warehouse_operator`
- `driver`
- `vehicle_profile`
- `route_plan`

---

# 4. Ontology Relationships
- A `shipment_order` produces one or more `consignment` objects.
- A `consignment` is transported using one or more `transport_leg` objects.
- A `transport_leg` uses exactly one `transport_means`.
- A `logistic_unit` belongs to a consignment and may be placed inside `transport_equipment` (container/trailer).
- `transport_event` references one or more `logistic_unit`, `consignment`, or `transport_leg`.
- `goods_item` is contained inside a `logistic_unit`.
- `customs_declaration` references consignment, goods, and documents.
- `freight_charge` references shipment or consignment.
- `invoice` bundles many freight charges.

---

# 5. Core Processes

## 5.1 Booking & Planning
- Create shipment order
- Provide quote + service selection
- Confirm booking
- Create consignment + logistic units
- Generate route plan (auto or manual)

## 5.2 Pickup, Linehaul, Delivery
- Pickup event → loaded event → departure event
- Tracking events for each leg
- Exception events (damages, delays)
- Destination arrival
- Delivery scan
- Proof of Delivery

## 5.3 Customs Processing
- HS code assignment
- Export declaration
- Import declaration
- Duty/tax estimation
- Attach documents: invoice, packing list, permits
- Customs clearance event

## 5.4 Warehouse & Inventory
- Inbound scanning
- Put-away
- Inventory allocation
- Picking + packing
- Outbound staging
- Loading validation

## 5.5 Billing
- Calculate freight charges
- Apply surcharges (fuel, congestion, dangerous goods)
- Generate invoice
- Send invoice to customer

---

# 6. Canonical YAML Schemas
Below are fundamental schemas.

## 6.1 shipment_order
```yaml
uid: ship-2025-11-001
type: shipment_order
title: "Shipment – Ottawa to Manila"
customer_uid: org-nao-corp
service_type: FCL
incoterm: CIF
origin_location_uid: loc-ottawa-01
destination_location_uid: loc-manila-01
requested_pickup: 2025-11-25T14:00:00-05:00
requested_delivery: 2025-12-20T17:00:00+08:00
priority: standard
references:
  customer_po: "PO-2025-19"
rel:
  - [requested_by, org-nao-corp]
```

## 6.2 consignment
```yaml
uid: cons-2025-11-001
type: consignment
shipment_order_uid: ship-2025-11-001
consignor_uid: org-nao-corp
consignee_uid: org-okir-exports
origin_location_uid: loc-ottawa-01
destination_location_uid: loc-manila-01
mode_mix:
  - road
  - sea
```

## 6.3 logistic_unit
```yaml
uid: unit-sscc-003700099999999999
type: logistic_unit
sscc: "003700099999999999"
unit_type: container
package_count: 20
gross_weight_kg: 18500
contents:
  - goodsitem-2025-01
equipment_uid: cont-MRSU1234567
```

## 6.4 transport_leg
```yaml
uid: leg-2025-11-28-01
type: transport_leg
consignment_uid: cons-2025-11-001
sequence: 2
mode: sea
carrier_uid: org-oceanline
transport_means_uid: vessel-imo-9876543
origin_location_uid: loc-vancouver-port
destination_location_uid: loc-manila-port
planned_departure: 2025-11-28T18:00:00-08:00
planned_arrival: 2025-12-16T09:00:00+08:00
status: planned
```

## 6.5 transport_event
```yaml
uid: te-2025-11-28-01
type: transport_event
event_time: 2025-11-28T18:15:00-08:00
event_type: departure
location_uid: loc-vancouver-port
related_consignment_uids:
  - cons-2025-11-001
related_leg_uid: leg-2025-11-28-01
status_code: "IN_TRANSIT"
```

## 6.6 customs_declaration
```yaml
uid: customs-2025-11-001
type: customs_declaration
consignment_uid: cons-2025-11-001
export_country: CA
import_country: PH
declaration_type: export
hs_codes:
  - code: "8517.70"
    description: "Telecom parts"
value_currency: USD
value_amount: 52000
documents:
  - doc-commercial-invoice-01
  - doc-packing-list-01
```

---

# 7. Automation Capabilities
- Auto-generate consignment from shipment
- Auto-build multimodal route plan
- Sync carrier tracking via API
- Parse B/L, AWB, CMR documents
- Auto-classify HS codes
- Generate estimated duties/taxes
- Build exception alert flows
- Generate daily shipment dashboards

---

# 8. Compliance Areas
- Export/Import laws
- Dangerous goods declarations
- Controlled goods
- Cold chain requirements
- Customs valuation
- Carrier-specific compliance
- GS1 SSCC handling

---

# 9. Integration With Other SBF Frameworks
- **Financial** → freight charges, invoices
- **Knowledge** → regulations, HS codes, SOPs
- **Relationship** → carriers, brokers, customers
- **Task mgmt** → shipment follow-ups, clearance tasks

---

# 10. Roadmap
- Phase 1: Entity definitions + routing
- Phase 2: Customs AI automation
- Phase 3: Warehouse and inventory extensions
- Phase 4: Carrier API federation
- Phase 5: Global tracking orchestration

