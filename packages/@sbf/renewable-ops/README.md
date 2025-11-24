# @sbf/renewable-ops

Renewable Energy Operations Module for Second Brain Foundation - Solar and wind energy site operations, maintenance, performance monitoring, and compliance tracking.

## Overview

This module provides comprehensive entity definitions for managing renewable energy operations across solar farms, rooftop installations, wind farms, and hybrid energy systems.

## Features

- **Asset Management** - Sites, arrays, turbines, inverters
- **Performance Monitoring** - Generation logs, efficiency tracking
- **Preventive Maintenance** - Scheduled inspections and maintenance
- **Reactive Maintenance** - Fault detection and work orders
- **Compliance & Safety** - Environmental logs, safety incidents
- **Technician Management** - Workforce scheduling and certifications
- **Inventory Management** - Spare parts and usage tracking

## Entity Types

### Site & Assets
- `renewable.energy_site` - Energy generation sites
- `renewable.array_block` - Solar panel arrays
- `renewable.turbine_unit` - Wind turbines
- `renewable.inverter` - Inverter equipment
- `renewable.string_line` - Solar panel strings
- `renewable.weather_station` - Weather monitoring

### Performance
- `renewable.generation_log` - Power generation data
- `renewable.efficiency_report` - Performance reports
- `renewable.fault_event` - Equipment faults

### Maintenance
- `renewable.inspection_record` - Site inspections
- `renewable.maintenance_request` - Maintenance requests
- `renewable.work_order` - Maintenance work orders

### Operations
- `renewable.technician_profile` - Technician profiles
- `renewable.technician_shift` - Shift scheduling
- `renewable.spare_part` - Spare parts inventory
- `renewable.part_usage_record` - Parts usage tracking

### Compliance
- `renewable.safety_incident` - Safety incidents
- `renewable.environmental_log` - Environmental impact tracking
- `renewable.grid_interconnection_record` - Grid connection details

## Installation

```bash
npm install @sbf/renewable-ops
```

## Usage

```typescript
import {
  createEnergySite,
  createGenerationLog,
  createMaintenanceRequest,
  createFaultEvent,
  createWorkOrder,
  calculatePerformanceRatio,
  calculateAvailability,
  calculateCO2Offset
} from '@sbf/renewable-ops';

// Create energy site
const site = createEnergySite({
  site_name: 'Sunnyside Solar Farm',
  site_code: 'SOLAR-001',
  site_type: 'solar-ground',
  location: 'Rural County, State',
  installed_capacity_kw: 5000
});

// Log power generation
const genLog = createGenerationLog({
  site_uid: site.uid,
  inverter_uid: 'inv-001',
  power_output_kw: 4250,
  timestamp: '2025-11-23T12:00:00Z'
});

// Create maintenance request
const maintenanceReq = createMaintenanceRequest({
  site_uid: site.uid,
  request_type: 'corrective',
  priority: 'high',
  asset_type: 'inverter',
  issue_description: 'Inverter 3 showing fault code E204'
});

// Record fault event
const fault = createFaultEvent({
  site_uid: site.uid,
  asset_type: 'inverter',
  fault_description: 'DC overvoltage protection triggered',
  severity: 'major'
});

// Create work order
const workOrder = createWorkOrder({
  site_uid: site.uid,
  work_order_number: 'WO-2025-123',
  work_description: 'Replace faulty inverter DC contactor',
  maintenance_request_uid: maintenanceReq.uid
});

// Calculate performance ratio
const pr = calculatePerformanceRatio(4500, 5000); // 90%

// Calculate site availability
const availability = calculateAvailability(720, 12); // 98.3%

// Calculate CO2 offset
const co2Saved = calculateCO2Offset(100000); // kWh to kg CO2
```

## Key Metrics

The module supports calculation of:
- **Performance Ratio (PR)** - Actual vs expected generation
- **Availability** - Uptime percentage
- **CO2 Offset** - Environmental impact tracking
- **Energy Production** - kWh generation tracking

## Supported Technologies

- **Solar Ground Mount** - Large-scale solar farms
- **Solar Rooftop** - Commercial/residential installations
- **Wind Onshore** - Wind turbine farms
- **Hybrid Systems** - Solar + wind + battery storage

## Integration Points

This module integrates with:
- **@sbf/financial-framework** - Revenue tracking, ROI analysis
- **@sbf/task-framework** - Work orders, preventive maintenance schedules
- **@sbf/knowledge-framework** - Maintenance procedures, safety SOPs
- **@sbf/health-framework** - Safety incidents, environmental compliance

## License

MIT © Second Brain Foundation
