# @sbf/restaurant-haccp-ops

**Restaurant & HACCP Operations Module for Second Brain Foundation**

Comprehensive food service and safety module supporting HACCP compliance, temperature monitoring, cleaning schedules, and incident tracking.

## Features

- **HACCP Compliance** - Critical control points, monitoring, corrective actions
- **Temperature Management** - Automated logging, alerts, compliance tracking
- **Cleaning & Sanitation** - Scheduled tasks, compliance verification
- **Supplier Management** - Delivery acceptance, quality scoring, traceability
- **Incident Tracking** - Contamination, illness, equipment failure reporting
- **Staff Training** - Certification tracking, expiry alerts
- **Audit Readiness** - Automated log compilation, compliance reporting

## Installation

```bash
npm install @sbf/restaurant-haccp-ops
```

## Usage

```typescript
import { 
  createTemperatureLog, 
  createCriticalControlPoint, 
  createIncidentReport,
  getExpiringItems,
  calculateTemperatureComplianceRate
} from '@sbf/restaurant-haccp-ops';

// Log temperature reading
const tempLog = createTemperatureLog({
  storageUid: "storage-walkin-1",
  valueC: 2.5,
  criticalLimitC: 4.0,
  recordedBy: "staff-001"
});

// Create critical control point
const ccp = createCriticalControlPoint({
  haccpPlanUid: "haccp-2025",
  step: "Cooking Chicken",
  hazardType: "biological",
  criticalLimitTempC: 74,
  monitoringFreqMin: 60,
  responsibleRole: "Kitchen Lead"
});

// Report incident
const incident = createIncidentReport({
  incidentType: "contamination_event",
  severity: "high",
  description: "Possible cross-contamination with raw poultry",
  actionTaken: "Discarded affected batch, sanitized station"
});

// Check expiring items
const expiring = getExpiringItems(foodItems, 7);

// Calculate compliance rate
const complianceRate = calculateTemperatureComplianceRate(temperatureLogs);
```

## Entities (17)

- `food_item` - Food inventory
- `supplier_profile` - Suppliers
- `delivery_record` - Deliveries
- `storage_location` - Storage areas
- `temperature_log` - Temperature monitoring
- `prep_task` - Prep assignments
- `recipe_document` - Recipes
- `equipment_item` - Kitchen equipment
- `cleaning_task` - Cleaning tasks
- `sanitation_schedule` - Cleaning schedules
- `incident_report` - Safety incidents
- `staff_training_record` - Training records
- `audit_checklist` - Compliance audits
- `haccp_plan` - HACCP plans
- `critical_control_point` - CCPs
- `corrective_action` - CCP violations
- `waste_log` - Waste tracking

## License

MIT - Part of Second Brain Foundation
