# Transport Event Entity

## Overview
Represents a tracking event in the logistics chain

## Schema
```yaml
uid: te-2025-11-28-01
type: transport_event
event_time: 2025-11-28T18:15:00-08:00
event_type: departure
location_uid: loc-vancouver-port
related_leg_uid: leg-2025-11-28-01
related_consignment_uids: [cons-2025-11-001]
status_code: "IN_TRANSIT"
```

## Event Types
- `pickup` - Goods picked up
- `departure` - Transport departed
- `arrival` - Transport arrived
- `delivery` - Goods delivered
- `exception` - Problem occurred

## Relationships
- References: `transport_leg`
- References: `consignment`
- References: `location`

## Used By
- Real-time tracking
- Customer notifications
- Exception management
