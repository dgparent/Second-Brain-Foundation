# Auto Turnover Tasks

## Purpose
Automatically generate housekeeping tasks when guest checks out

## Trigger
- `checkout_record` created
- Room status changes to "dirty"

## Logic
1. Detect checkout event
2. Identify room needing turnover
3. Create `housekeeping_task` with:
   - task_type: "turnover"
   - priority: "high"
   - due_time: checkout + 2 hours
4. Assign to available housekeeping staff
5. Update room status to "dirty"

## Configuration
- Default turnover window: 2 hours
- Priority rules based on next booking
- Staff assignment algorithm (round-robin, capacity-based)

## Notifications
- Staff receives task notification
- Front desk alerted if urgent booking
- Manager dashboard updated

## Dependencies
- `booking_record`
- `checkout_record`
- `staff_profile`
- `housekeeping_task`
