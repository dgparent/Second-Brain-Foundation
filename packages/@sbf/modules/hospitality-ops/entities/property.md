# Property Entity

## Overview
Represents a hospitality property (hotel, resort, inn, etc.)

## Schema
```yaml
uid: prop-ottawa-hotel
type: property
name: "Ottawa Grand Hotel"
address: "123 Main St, Ottawa, ON"
room_count: 120
property_type: hotel
amenities:
  - parking
  - wifi
  - pool
  - restaurant
```

## Relationships
- Has many: `room`
- Has many: `staff_profile`
- Has many: `property_inspection`

## Used By
- Front desk operations
- Housekeeping management
- Maintenance tracking
