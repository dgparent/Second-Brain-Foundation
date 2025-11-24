# Booking Record Entity

## Overview
Represents a guest reservation and stay

## Schema
```yaml
uid: booking-2025-03-14-01
type: booking_record
guest_uid: guest-004
room_uid: room-101
checkin_date: 2025-03-14
checkout_date: 2025-03-16
status: confirmed
price_total: 320.00
special_requests:
  - "Late check-in"
```

## Status Values
- `confirmed` - Reservation confirmed
- `checked_in` - Guest has arrived
- `checked_out` - Stay completed
- `cancelled` - Booking cancelled

## Relationships
- References: `guest_profile`
- References: `room`
- Has one: `checkin_record`
- Has one: `checkout_record`

## Used By
- Front desk operations
- Revenue management
- Guest lifecycle automation
