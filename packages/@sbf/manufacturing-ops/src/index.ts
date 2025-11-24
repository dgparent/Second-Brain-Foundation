/**
 * Manufacturing Operations Module
 * 
 * Provides entity definitions for production batch tracking, quality control,
 * equipment maintenance, and SOP governance in manufacturing operations.
 * 
 * @module @sbf/manufacturing-ops
 */

import { Entity } from '@sbf/core';

// ============================================================================
// Core Entities
// ============================================================================

export interface ProductionBatch extends Entity {
  type: 'manufacturing.production_batch';
  metadata: {
    batch_number: string;
    product_code: string;
    production_line_uid: string;
    shift_uid?: string;
    
    // Scheduling
    start_time: string;
    end_time?: string;
    planned_quantity: number;
    actual_quantity?: number;
    
    // Materials & Yield
    material_lot_uids?: string[];
    yield_percentage?: number;
    waste_quantity?: number;
    scrap_quantity?: number;
    
    // Quality
    qc_status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'quarantined';
    
    // Status
    status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
    notes?: string;
  };
}

export interface ProductionLine extends Entity {
  type: 'manufacturing.production_line';
  metadata: {
    line_name: string;
    line_code: string;
    facility_location?: string;
    capacity_per_hour?: number;
    equipment_uids?: string[];
    status: 'operational' | 'maintenance' | 'down' | 'idle';
    current_batch_uid?: string;
  };
}

export interface ShiftLog extends Entity {
  type: 'manufacturing.shift_log';
  metadata: {
    shift_date: string;
    shift_type: 'day' | 'night' | 'swing';
    production_line_uid: string;
    supervisor_uid?: string;
    operator_uids?: string[];
    
    // Production
    batches_completed?: number;
    units_produced?: number;
    
    // Downtime
    downtime_minutes?: number;
    downtime_reason?: string;
    
    // Quality
    defects_reported?: number;
    
    notes?: string;
  };
}

export interface MaterialLot extends Entity {
  type: 'manufacturing.material_lot';
  metadata: {
    material_code: string;
    material_name: string;
    lot_number: string;
    supplier_uid?: string;
    received_date: string;
    expiry_date?: string;
    quantity: number;
    unit: string;
    status: 'available' | 'in-use' | 'depleted' | 'quarantined' | 'expired';
    storage_location?: string;
  };
}

export interface MaterialConsumption extends Entity {
  type: 'manufacturing.material_consumption';
  metadata: {
    batch_uid: string;
    material_lot_uid: string;
    quantity_used: number;
    unit: string;
    timestamp: string;
    operator_uid?: string;
  };
}

export interface FinishedGood extends Entity {
  type: 'manufacturing.finished_good';
  metadata: {
    product_code: string;
    product_name: string;
    batch_uid: string;
    lot_number: string;
    production_date: string;
    expiry_date?: string;
    quantity: number;
    unit: string;
    status: 'produced' | 'inspected' | 'released' | 'quarantined' | 'shipped';
    storage_location?: string;
  };
}

export interface QCInspection extends Entity {
  type: 'manufacturing.qc_inspection';
  metadata: {
    batch_uid?: string;
    finished_good_uid?: string;
    inspection_type: 'in-process' | 'final' | 'receiving' | 'environmental';
    inspection_date: string;
    inspector_uid: string;
    sampling_plan?: string;
    
    // Results
    sample_size?: number;
    defects_found?: number;
    status: 'passed' | 'failed' | 'conditional';
    
    notes?: string;
    photo_uids?: string[];
  };
}

export interface QCTest extends Entity {
  type: 'manufacturing.qc_test';
  metadata: {
    inspection_uid: string;
    test_name: string;
    test_parameter: string;
    specification_min?: number;
    specification_max?: number;
    measured_value?: number;
    unit?: string;
    status: 'passed' | 'failed';
    tested_by_uid?: string;
    test_timestamp: string;
  };
}

export interface QCDefect extends Entity {
  type: 'manufacturing.qc_defect';
  metadata: {
    inspection_uid: string;
    batch_uid?: string;
    defect_type: string;
    defect_code?: string;
    severity: 'minor' | 'major' | 'critical';
    quantity_affected: number;
    description?: string;
    root_cause?: string;
    corrective_action?: string;
    status: 'open' | 'investigating' | 'resolved';
  };
}

export interface SOPDocument extends Entity {
  type: 'manufacturing.sop_document';
  metadata: {
    sop_number: string;
    title: string;
    category: 'production' | 'quality' | 'safety' | 'maintenance' | 'environmental';
    revision: string;
    effective_date: string;
    review_date?: string;
    approved_by_uid?: string;
    status: 'draft' | 'active' | 'superseded' | 'retired';
    document_url?: string;
  };
}

export interface SOPRevision extends Entity {
  type: 'manufacturing.sop_revision';
  metadata: {
    sop_uid: string;
    revision_number: string;
    revision_date: string;
    changes_summary: string;
    revised_by_uid: string;
    approved_by_uid?: string;
    approval_date?: string;
  };
}

export interface SOPTrainingRecord extends Entity {
  type: 'manufacturing.sop_training_record';
  metadata: {
    sop_uid: string;
    operator_uid: string;
    training_date: string;
    trainer_uid?: string;
    assessment_score?: number;
    status: 'completed' | 'pending' | 'failed';
    expiry_date?: string;
  };
}

export interface EquipmentItem extends Entity {
  type: 'manufacturing.equipment_item';
  metadata: {
    equipment_code: string;
    equipment_name: string;
    equipment_type: string;
    serial_number?: string;
    manufacturer?: string;
    installation_date?: string;
    production_line_uid?: string;
    status: 'operational' | 'maintenance' | 'down' | 'calibration-due';
    last_maintenance_date?: string;
    next_maintenance_date?: string;
  };
}

export interface MaintenanceLog extends Entity {
  type: 'manufacturing.maintenance_log';
  metadata: {
    equipment_uid: string;
    maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'breakdown';
    scheduled_date?: string;
    completed_date?: string;
    technician_uid?: string;
    work_performed?: string;
    parts_replaced?: string[];
    downtime_minutes?: number;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    cost?: number;
  };
}

export interface DowntimeEvent extends Entity {
  type: 'manufacturing.downtime_event';
  metadata: {
    production_line_uid: string;
    equipment_uid?: string;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
    downtime_category: 'planned-maintenance' | 'unplanned-breakdown' | 'changeover' | 'quality-issue' | 'material-shortage' | 'other';
    reason: string;
    impact_on_production?: number;
    resolved_by_uid?: string;
    notes?: string;
  };
}

export interface CalibrationRecord extends Entity {
  type: 'manufacturing.calibration_record';
  metadata: {
    equipment_uid: string;
    calibration_date: string;
    calibration_due_date?: string;
    performed_by_uid?: string;
    calibration_standard?: string;
    results: 'passed' | 'failed' | 'adjusted';
    certificate_number?: string;
    notes?: string;
  };
}

export interface OperatorProfile extends Entity {
  type: 'manufacturing.operator_profile';
  metadata: {
    full_name: string;
    employee_id?: string;
    role: 'operator' | 'technician' | 'supervisor' | 'qa-inspector';
    certified_lines?: string[];
    sop_training_uids?: string[];
    hire_date?: string;
    status: 'active' | 'inactive';
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createProductionBatch(data: {
  batch_number: string;
  product_code: string;
  production_line_uid: string;
  start_time: string;
  planned_quantity: number;
}): ProductionBatch {
  return {
    uid: `batch-${Date.now()}`,
    type: 'manufacturing.production_batch',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      batch_number: data.batch_number,
      product_code: data.product_code,
      production_line_uid: data.production_line_uid,
      start_time: data.start_time,
      planned_quantity: data.planned_quantity,
      qc_status: 'pending',
      status: 'planned',
    },
  };
}

export function createQCInspection(data: {
  batch_uid: string;
  inspection_type: 'in-process' | 'final' | 'receiving' | 'environmental';
  inspector_uid: string;
  status: 'passed' | 'failed' | 'conditional';
}): QCInspection {
  return {
    uid: `qc-inspection-${Date.now()}`,
    type: 'manufacturing.qc_inspection',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      batch_uid: data.batch_uid,
      inspection_type: data.inspection_type,
      inspection_date: new Date().toISOString(),
      inspector_uid: data.inspector_uid,
      status: data.status,
    },
  };
}

export function createDowntimeEvent(data: {
  production_line_uid: string;
  start_time: string;
  downtime_category: 'planned-maintenance' | 'unplanned-breakdown' | 'changeover' | 'quality-issue' | 'material-shortage' | 'other';
  reason: string;
}): DowntimeEvent {
  return {
    uid: `downtime-${Date.now()}`,
    type: 'manufacturing.downtime_event',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      production_line_uid: data.production_line_uid,
      start_time: data.start_time,
      downtime_category: data.downtime_category,
      reason: data.reason,
    },
  };
}

export function createMaintenanceLog(data: {
  equipment_uid: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'breakdown';
  scheduled_date?: string;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}): MaintenanceLog {
  return {
    uid: `maintenance-${Date.now()}`,
    type: 'manufacturing.maintenance_log',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      equipment_uid: data.equipment_uid,
      maintenance_type: data.maintenance_type,
      scheduled_date: data.scheduled_date,
      status: data.status || 'scheduled',
    },
  };
}

export function createSOPDocument(data: {
  sop_number: string;
  title: string;
  category: 'production' | 'quality' | 'safety' | 'maintenance' | 'environmental';
  revision: string;
  effective_date: string;
}): SOPDocument {
  return {
    uid: `sop-${Date.now()}`,
    type: 'manufacturing.sop_document',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      sop_number: data.sop_number,
      title: data.title,
      category: data.category,
      revision: data.revision,
      effective_date: data.effective_date,
      status: 'draft',
    },
  };
}

// Query helpers
export function getActiveBatches(batches: ProductionBatch[]): ProductionBatch[] {
  return batches.filter(b => b.metadata.status === 'in-progress');
}

export function getBatchesByQCStatus(
  batches: ProductionBatch[],
  qc_status: 'pending' | 'in-progress' | 'passed' | 'failed' | 'quarantined'
): ProductionBatch[] {
  return batches.filter(b => b.metadata.qc_status === qc_status);
}

export function getOverdueCalibrations(calibrations: CalibrationRecord[]): CalibrationRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return calibrations.filter(c => 
    c.metadata.calibration_due_date && 
    c.metadata.calibration_due_date < today
  );
}

export function calculateBatchYield(batch: ProductionBatch): number {
  if (!batch.metadata.actual_quantity || !batch.metadata.planned_quantity) {
    return 0;
  }
  return (batch.metadata.actual_quantity / batch.metadata.planned_quantity) * 100;
}

export function calculateOEE(
  shift: ShiftLog,
  plannedProductionTime: number
): { availability: number; performance: number; quality: number; oee: number } {
  const downtimeMinutes = shift.metadata.downtime_minutes || 0;
  const actualProductionTime = plannedProductionTime - downtimeMinutes;
  
  const availability = actualProductionTime / plannedProductionTime;
  
  // Simplified performance calculation
  const performance = 1.0; // Would need ideal cycle time data
  
  const unitsProduced = shift.metadata.units_produced || 0;
  const defects = shift.metadata.defects_reported || 0;
  const quality = unitsProduced > 0 ? (unitsProduced - defects) / unitsProduced : 0;
  
  const oee = availability * performance * quality;
  
  return {
    availability: Math.round(availability * 100) / 100,
    performance: Math.round(performance * 100) / 100,
    quality: Math.round(quality * 100) / 100,
    oee: Math.round(oee * 100) / 100,
  };
}

export function traceBatchToMaterials(
  batch: ProductionBatch,
  consumptions: MaterialConsumption[],
  lots: MaterialLot[]
): { material_name: string; lot_number: string; quantity: number }[] {
  const batchConsumptions = consumptions.filter(c => c.metadata.batch_uid === batch.uid);
  
  return batchConsumptions.map(consumption => {
    const lot = lots.find(l => l.uid === consumption.metadata.material_lot_uid);
    return {
      material_name: lot?.metadata.material_name || 'Unknown',
      lot_number: lot?.metadata.lot_number || 'Unknown',
      quantity: consumption.metadata.quantity_used,
    };
  });
}
