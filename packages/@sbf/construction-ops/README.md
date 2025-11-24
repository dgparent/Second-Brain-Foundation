# @sbf/construction-ops

Construction Operations Module for Second Brain Foundation - Comprehensive project management, site operations, safety compliance, quality control, and workforce management for construction projects.

## Overview

This module provides entity definitions and utilities for managing all aspects of construction operations, from project planning to closeout.

## Features

- **Project Management** - Projects, phases, schedules, budgets
- **Site Operations** - Daily logs, work tasks, field documentation
- **Safety & Compliance** - Incidents, inspections, toolbox talks
- **Quality Control** - QC inspections, deficiencies, punch lists
- **Workforce Management** - Workers, subcontractors, certifications
- **Materials & Equipment** - Tracking, usage logs, rentals
- **Document Control** - Permits, drawings, RFIs, change orders

## Entity Types

### Core Entities
- `construction.project` - Construction project details
- `construction.project_phase` - Project phases and milestones
- `construction.site_location` - Site locations and access
- `construction.daily_site_log` - Daily field logs
- `construction.work_task` - Work assignments and tasks

### Safety & QC
- `construction.safety_incident` - Safety incident reporting
- `construction.safety_inspection` - Safety inspections
- `construction.toolbox_talk` - Safety meetings
- `construction.qc_inspection` - Quality control inspections
- `construction.qc_deficiency` - Quality deficiencies

### Documentation
- `construction.permit_document` - Permits and approvals
- `construction.drawing_document` - Engineering drawings
- `construction.rfi` - Requests for information
- `construction.change_order` - Contract changes
- `construction.punch_item` - Punch list items

### Resources
- `construction.material_item` - Materials tracking
- `construction.equipment_item` - Equipment registry
- `construction.equipment_usage_log` - Equipment usage
- `construction.subcontractor` - Subcontractor profiles
- `construction.worker_profile` - Worker information

## Installation

```bash
npm install @sbf/construction-ops
```

## Usage

```typescript
import {
  createConstructionProject,
  createDailySiteLog,
  createSafetyIncident,
  createQCInspection,
  getProjectsByStatus
} from '@sbf/construction-ops';

// Create a new construction project
const project = createConstructionProject({
  project_code: 'MOT-2025-001',
  title: 'Main Office Tower',
  client_uid: 'client-xyz',
  address: '123 Main St, Ottawa',
  start_date: '2025-02-10',
  status: 'active',
  budget: 5000000
});

// Create daily site log
const siteLog = createDailySiteLog({
  project_uid: project.uid,
  site_uid: 'site-001',
  log_date: '2025-11-23',
  logged_by_uid: 'user-123',
  work_performed: 'Concrete pour for foundation',
  weather_conditions: 'Clear, 15°C',
  crew_count: 12
});

// Report safety incident
const incident = createSafetyIncident({
  project_uid: project.uid,
  incident_date: '2025-11-23',
  incident_type: 'near-miss',
  severity: 'medium',
  description: 'Worker nearly struck by swinging load',
  reported_by_uid: 'supervisor-001'
});

// Filter active projects
const activeProjects = getProjectsByStatus(projects, 'active');
```

## Integration Points

This module integrates with:
- **@sbf/financial-framework** - Project budgets, invoices, payments
- **@sbf/task-framework** - Work orders, assignments, follow-ups
- **@sbf/knowledge-framework** - SOPs, safety procedures, training
- **@sbf/relationship-framework** - Clients, subcontractors, suppliers

## License

MIT © Second Brain Foundation
