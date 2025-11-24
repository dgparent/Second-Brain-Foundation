# @sbf/security-ops

Security Operations Module for Second Brain Foundation - Guard management, patrol operations, incident reporting, access control, and visitor management for security teams.

## Overview

This module provides comprehensive entity definitions for managing security guard operations across commercial, residential, industrial, retail, and event security environments.

## Features

- **Guard Workforce Management** - Scheduling, shifts, certifications
- **Patrol Operations** - Routes, checkpoints, logs
- **Incident Reporting** - Comprehensive incident documentation
- **Access Control** - Entry/exit logs, visitor management
- **Alarm Response** - Alarm events and response tracking
- **Equipment Management** - Radios, vehicles, PPE tracking
- **Training & Compliance** - Certification and training records

## Entity Types

### Core Operations
- `security.site` - Security site profiles
- `security.guard_profile` - Guard personnel profiles
- `security.guard_shift` - Guard shift scheduling
- `security.patrol_route` - Patrol routes and schedules
- `security.checkpoint` - Patrol checkpoints
- `security.patrol_log` - Patrol completion logs

### Incident Management
- `security.incident_report` - Incident reports
- `security.incident_evidence` - Evidence collection
- `security.alarm_event` - Alarm triggers and responses
- `security.response_action` - Response actions taken

### Access Control
- `security.access_log` - Access entry/exit logs
- `security.visitor_record` - Visitor management
- `security.contractor_record` - Contractor access

### Equipment & Training
- `security.equipment_item` - Equipment registry
- `security.equipment_assignment` - Equipment assignments
- `security.training_record` - Training and certifications
- `security.risk_assessment` - Security risk assessments

## Installation

```bash
npm install @sbf/security-ops
```

## Usage

```typescript
import {
  createGuardShift,
  createIncidentReport,
  createVisitorRecord,
  createAlarmEvent,
  createPatrolLog,
  getActiveShifts,
  getOpenIncidents,
  getOverstayedVisitors
} from '@sbf/security-ops';

// Schedule guard shift
const shift = createGuardShift({
  site_uid: 'site-mall-001',
  guard_uid: 'guard-john-doe',
  shift_date: '2025-11-23',
  shift_type: 'night',
  start_time: '20:00',
  position: 'mobile'
});

// Create incident report
const incident = createIncidentReport({
  site_uid: 'site-mall-001',
  incident_date: '2025-11-23',
  incident_time: '22:30',
  reported_by_uid: shift.metadata.guard_uid,
  incident_type: 'trespassing',
  severity: 'medium',
  location: 'Loading dock area',
  description: 'Two individuals found in restricted area after hours'
});

// Register visitor
const visitor = createVisitorRecord({
  site_uid: 'site-office-tower',
  visit_date: '2025-11-23',
  visitor_name: 'Jane Smith',
  purpose: 'Meeting with HR department',
  check_in_time: '09:00',
  escorted: false
});

// Record alarm event
const alarm = createAlarmEvent({
  site_uid: 'site-warehouse-002',
  alarm_type: 'intrusion',
  trigger_time: '2025-11-23T03:15:00Z',
  alarm_zone: 'Perimeter - East Side'
});

// Get all overstayed visitors
const overstayed = getOverstayedVisitors(visitors);
```

## Key Features

### Patrol Management
- QR/NFC checkpoint scanning
- GPS verification
- Missed checkpoint alerts
- Photo documentation

### Incident Reporting
- Comprehensive incident details
- Evidence collection (photos, videos)
- Witness tracking
- Police/emergency service integration

### Access Control
- Entry/exit logging
- Badge management
- Visitor tracking
- Contractor verification

## Integration Points

This module integrates with:
- **@sbf/task-framework** - Work assignments, follow-ups
- **@sbf/knowledge-framework** - Security SOPs, emergency procedures
- **@sbf/relationship-framework** - Client communications, vendor management

## License

MIT © Second Brain Foundation
