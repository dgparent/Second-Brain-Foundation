# Room Entity

## Overview
Represents a guest room in a hospitality property

## Schema
```yaml
uid: room-101
type: room
property_uid: prop-ottawa-hotel
room_number: "101"
room_type_uid: rt-queen-standard
status: available
amenities:
  - ac
  - wifi
  - tv
  - desk
```

## Status Values
- `available` - Ready for booking
- `occupied` - Guest checked in
- `dirty` - Needs cleaning
- `maintenance` - Under repair

## Relationships
- Belongs to: `property`
- Belongs to: `room_type`
- Has many: `booking_record`
- Has many: `housekeeping_task`
- Has many: `maintenance_request`

## Used By
- Reservation system
- Housekeeping operations
- Maintenance tracking
