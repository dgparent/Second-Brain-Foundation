# Home Administration & Household Management Use Case

## Overview
This use case defines a structured system for managing the administrative, logistical, and operational aspects of home life—maintenance, repairs, bills, warranties, household inventory, schedules, and recurring responsibilities. It centralizes scattered information and enables household-level planning with cross-domain intelligence.

---

## User Goals
- Track home maintenance tasks, schedules, and repair history.
- Maintain records for utilities, warranties, contractors, and appliances.
- Track household inventory (consumables & equipment).
- Link maintenance to financial spending and budgeting.
- Manage recurring events: cleaning, property taxes, vehicle maintenance.
- Maintain compliance with housing regulations (varies by region).

---

## Problems & Pain Points
- Home information is scattered (email, receipts, manuals, spreadsheets).
- Difficult to track when maintenance was last done.
- No unified dashboard for home administration.
- People forget about warranties, tax deadlines, and inspection schedules.
- Hard to understand long-term costs of home ownership and repairs.

---

## Data Requirements
- **Maintenance logs:** date, task, contractor, cost.
- **Household inventory:** appliances, tools, consumables.
- **Warranty info:** expiration, provider, coverage.
- **Utility bills:** amounts, dates, account details.
- **Property details:** documents, permits, tax records.

---

## Entity Model
### Entity: `home.property`
### Entity: `home.maintenance`
### Entity: `home.appliance`
### Entity: `home.warranty`

Key relationships:
- `connected_to`: bills, warranties, contractors
- `requires`: maintenance tasks
- `contains`: appliances, inventory
- `incurs`: financial costs

---

## YAML Example — Property
```yaml
---
uid: property-davao-homestead-1
type: home.property
title: "Davao Homestead Build Plan"
location: "Davao, Philippines"
acquired_date: null
property_type: future_build
documents:
  - doc-land-title-lookup-2025
notes: "Need to check agricultural zoning and solar potential."
sensitivity: confidential
---
```

---

## YAML Example — Maintenance Log
```yaml
---
uid: maintenance-2025-10-10-ac-cleaning
type: home.maintenance
property_uid: property-davao-homestead-1
date: 2025-10-10
task: "Split-type AC cleaning"
contractor: "Davao CoolTech Services"
cost: 1500
currency: PHP
status: completed
notes: "Improved airflow; next cleaning recommended in 6 months."
---
```

---

## YAML Example — Appliance
```yaml
---
uid: appliance-lg-inverter-2024
type: home.appliance
name: "LG Dual Inverter AC (1.5HP)"
purchase_date: 2024-06-18
purchase_price: 28500
currency: PHP
serial_number: "LG-INV-AC-15520"
warranty_uid: warranty-lg-ac-2024
notes: "Energy-efficient model; check yearly maintenance schedule."
sensitivity: normal
---
```

---

## YAML Example — Warranty
```yaml
---
uid: warranty-lg-ac-2024
type: home.warranty
appliance_uid: appliance-lg-inverter-2024
provider: "LG Philippines"
start_date: 2024-06-18
end_date: 2026-06-18
coverage: "Parts & labor for compressor and electronics"
document: "/documents/home/lg-ac-warranty.pdf"
sensitivity: normal
---
```

---

## Integration Architecture
### Email / PDF Ingestion
- Bills, receipts, warranties → stored & indexed.

### Calendar Integrations
- Maintenance reminders synced to calendars.

### IoT Device Metadata
- Smart appliance logs optional.

### Finance Integration
- Maintenance costs automatically linked to budget categories.

### Image Capture
- Snap photos of appliances, receipts, labels, serial numbers.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Sortly | Good inventory mgmt | Paid & siloed | SBF full home+finance link |
| Nest/Home IoT apps | Device logs | Device-specific | SBF universal home mgmt |
| Notion templates | Flexible | Manual, not automated | SBF ingestion + reminders |

---

## SBF Implementation Notes
- CLI: `sbf new home.property`, `sbf new home.maintenance`.
- AEI: detect maintenance schedules, cost insights.
- Dashboard: maintenance calendar, inventory value, home cost breakdown.
- Cross-domain links: finance (bills), health (environmental triggers), tasks.

