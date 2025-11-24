# Field Inspection Entity

## Overview
Represents an on-site inspection of damage or loss

## Schema
```yaml
uid: insp-2025-03-10-01
type: field_inspection
claim_uid: claim-2025-03-10-01
inspector_uid: inspector-022
scheduled_date: 2025-03-11
visit_date: 2025-03-11T14:00
location: "129 River St, Ottawa"
notes: "Visible water damage in kitchen and basement."
status: completed
```

## Status Values
- `scheduled` - Appointment set
- `completed` - Inspection done
- `cancelled` - Cancelled

## Relationships
- Belongs to: `claim_record`
- References: inspector (staff)
- Has many: `damage_item`
- Has many: `inspection_evidence`

## Used By
- Inspection workflow
- Evidence collection
- Damage assessment
