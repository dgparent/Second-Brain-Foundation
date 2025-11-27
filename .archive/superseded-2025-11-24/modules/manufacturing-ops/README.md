# @sbf/modules-manufacturing-ops

Manufacturing Operations Module for Second Brain Foundation - Production batch tracking, quality control, equipment maintenance, and SOP governance for manufacturing facilities.

## Overview

This module provides comprehensive entity definitions for managing manufacturing operations across discrete manufacturing, food processing, electronics assembly, and other production environments.

## Features

- **Production Execution** - Batches, lines, shift logs
- **Quality Control** - Inspections, testing, defect tracking
- **Equipment Maintenance** - Preventive, corrective, predictive maintenance
- **SOP Governance** - Document control, revisions, training
- **Material Management** - Lot tracking, consumption, traceability
- **Workforce Operations** - Operator certifications, shift management

## Entity Types

### Production
- `manufacturing.production_batch` - Production batches
- `manufacturing.production_line` - Production lines/equipment
- `manufacturing.shift_log` - Shift production logs
- `manufacturing.material_lot` - Raw material lots
- `manufacturing.material_consumption` - Material usage
- `manufacturing.finished_good` - Finished product lots

### Quality Control
- `manufacturing.qc_inspection` - Quality inspections
- `manufacturing.qc_test` - Quality tests
- `manufacturing.qc_defect` - Defect records

### Documentation
- `manufacturing.sop_document` - Standard operating procedures
- `manufacturing.sop_revision` - SOP revisions
- `manufacturing.sop_training_record` - Training records

### Maintenance
- `manufacturing.equipment_item` - Equipment registry
- `manufacturing.maintenance_log` - Maintenance records
- `manufacturing.downtime_event` - Production downtime
- `manufacturing.calibration_record` - Equipment calibration

### Personnel
- `manufacturing.operator_profile` - Operator profiles

## Installation

```bash
npm install @sbf/modules-manufacturing-ops
```

## Usage

```typescript
import {
  createProductionBatch,
  createQCInspection,
  createDowntimeEvent,
  calculateBatchYield,
  calculateOEE,
  traceBatchToMaterials
} from '@sbf/modules-manufacturing-ops';

// Create production batch
const batch = createProductionBatch({
  batch_number: 'BATCH-2025-001',
  product_code: 'WIDGET-100',
  production_line_uid: 'line-001',
  start_time: '2025-11-23T08:00:00Z',
  planned_quantity: 1000
});

// Create QC inspection
const inspection = createQCInspection({
  batch_uid: batch.uid,
  inspection_type: 'final',
  inspector_uid: 'qc-inspector-001',
  status: 'passed'
});

// Record downtime
const downtime = createDowntimeEvent({
  production_line_uid: 'line-001',
  start_time: '2025-11-23T10:30:00Z',
  downtime_category: 'unplanned-breakdown',
  reason: 'Conveyor belt malfunction'
});

// Calculate batch yield
const yieldPercentage = calculateBatchYield(batch);

// Calculate OEE (Overall Equipment Effectiveness)
const oee = calculateOEE(shiftLog, 480); // 480 minutes = 8 hour shift

// Trace batch to raw materials
const materials = traceBatchToMaterials(batch, consumptions, lots);
```

## Key Metrics

The module supports calculation of:
- **Batch Yield** - Actual vs planned production
- **OEE (Overall Equipment Effectiveness)** - Availability × Performance × Quality
- **Material Traceability** - Batch to raw material lot tracking
- **Downtime Analysis** - Root cause and impact tracking

## Integration Points

This module integrates with:
- **@sbf/financial-framework** - Production costs, material costs
- **@sbf/task-framework** - Work orders, maintenance tasks
- **@sbf/knowledge-framework** - SOPs, training materials
- **@sbf/health-framework** - Safety incidents, compliance

## License

MIT © Second Brain Foundation
