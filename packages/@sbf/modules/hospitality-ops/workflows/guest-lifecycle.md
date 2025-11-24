# Guest Lifecycle Workflow

## Overview
Complete journey from booking to checkout

## Stages
1. **Reservation** - Booking created
2. **Pre-Arrival** - Communication and preparation
3. **Check-In** - Guest arrival processing
4. **Stay Management** - Service requests and incidents
5. **Check-Out** - Departure processing
6. **Post-Stay** - Feedback and history

## Automation Triggers
- Pre-arrival email 24h before check-in
- Auto-create housekeeping task on checkout
- Auto-update room status throughout
- Guest satisfaction survey after checkout

## Key Entities
- `booking_record`
- `checkin_record`
- `checkout_record`
- `guest_profile`
- `service_request`

## Integration Points
- Financial: Billing and payments
- Task: Service requests
- Relationship: Guest CRM
