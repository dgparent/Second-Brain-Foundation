# Room Status Updater

## Purpose
Automatically maintain accurate room status throughout lifecycle

## Status Transitions
- Booking confirmed → stays "available"
- Check-in → "occupied"
- Checkout → "dirty"
- Housekeeping complete → "available"
- Maintenance request → "maintenance"
- Maintenance complete → "available" or previous status

## Trigger Events
- `checkin_record` created
- `checkout_record` created
- `housekeeping_task` status → "completed"
- `maintenance_request` created
- `work_order` status → "completed"

## Logic
1. Listen for relevant events
2. Determine appropriate status change
3. Update `room_status` entity
4. Timestamp the change
5. Log status history
6. Trigger downstream automations

## Integration
- PMS sync (if external system exists)
- Housekeeping dashboard
- Booking engine availability
- Front desk display

## Audit Trail
- All status changes logged
- Includes timestamp and trigger event
- Historical status viewable
