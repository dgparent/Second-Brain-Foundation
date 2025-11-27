# Housekeeping Workflow

## Overview
Room cleaning and turnover management

## Task Types
1. **Turnover** - After checkout (priority: high)
2. **Daily Clean** - Occupied rooms
3. **Deep Clean** - Scheduled maintenance cleaning
4. **Inspection** - Quality checks

## Process Flow
1. Task generated (auto or manual)
2. Assigned to housekeeping staff
3. Staff begins task (status: in_progress)
4. Task completed
5. Inspection (optional)
6. Room status updated to "available"

## Automation
- Auto-generate turnover tasks on checkout
- Distribute tasks based on staff capacity
- Room status sync with PMS
- Quality check reminders

## Key Entities
- `housekeeping_task`
- `room_status`
- `staff_profile`
- `staff_shift`

## KPIs
- Average turnover time
- Tasks completed per shift
- Room readiness rate
