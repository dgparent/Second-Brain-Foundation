/**
 * @sbf/restaurant-haccp-ops - Restaurant & HACCP Operations Module
 * 
 * Provides entity definitions, helpers, and workflows for food service operations
 * including HACCP compliance, temperature monitoring, cleaning, and incident tracking.
 * 
 * @packageDocumentation
 */

import type { Entity } from '@sbf/shared';

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface FoodItemEntity extends Entity {
  type: 'restaurant.food_item';
  metadata: {
    name: string;
    category: 'protein' | 'produce' | 'dairy' | 'dry_goods' | 'frozen' | 'beverage' | 'other';
    supplier_uid: string;
    
    expiry_date?: string;
    allergens?: string[];
    storage_temp_min_c?: number;
    storage_temp_max_c?: number;
    lot_number?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  };
}

export interface SupplierProfileEntity extends Entity {
  type: 'restaurant.supplier';
  metadata: {
    name: string;
    contact: {
      phone?: string;
      email?: string;
      address?: string;
    };
    
    supplier_type?: string;
    license_number?: string;
    certification?: string;
    rating?: number; // 0-5
    notes?: string;
  };
}

export interface DeliveryRecordEntity extends Entity {
  type: 'restaurant.delivery';
  metadata: {
    supplier_uid: string;
    received_date: string;
    received_by: string;
    
    items?: string[]; // food_item uids
    inspection: {
      appearance: 'pass' | 'fail';
      temperature_c: number;
      packaging_intact: boolean;
      notes?: string;
    };
    rejected?: boolean;
    rejection_reason?: string;
  };
}

export interface StorageLocationEntity extends Entity {
  type: 'restaurant.storage';
  metadata: {
    name: string;
    storage_type: 'walk_in_fridge' | 'freezer' | 'dry_storage' | 'refrigerator' | 'other';
    temp_range_c: {
      min: number;
      max: number;
    };
    
    location?: string;
    capacity?: string;
    notes?: string;
  };
}

export interface TemperatureLogEntity extends Entity {
  type: 'restaurant.temperature_log';
  metadata: {
    storage_uid?: string;
    equipment_uid?: string;
    date_time: string;
    value_c: number;
    pass_fail: 'pass' | 'fail';
    
    recorded_by?: string;
    corrective_action_uid?: string;
    notes?: string;
  };
}

export interface PrepTaskEntity extends Entity {
  type: 'restaurant.prep_task';
  metadata: {
    recipe_uid?: string;
    assigned_to: string;
    description: string;
    due_time: string;
    status: 'pending' | 'in_progress' | 'completed';
    
    quantity?: string;
    completion_time?: string;
    notes?: string;
  };
}

export interface RecipeDocumentEntity extends Entity {
  type: 'restaurant.recipe';
  metadata: {
    name: string;
    category?: string;
    
    ingredients?: Array<{
      food_item_uid?: string;
      name: string;
      quantity: string;
    }>;
    instructions?: string[];
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    yield?: string;
    allergens?: string[];
    notes?: string;
  };
}

export interface EquipmentItemEntity extends Entity {
  type: 'restaurant.equipment';
  metadata: {
    name: string;
    equipment_type: 'refrigerator' | 'freezer' | 'stove' | 'oven' | 'grill' | 'fryer' | 'dishwasher' | 'other';
    
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    installation_date?: string;
    last_service_date?: string;
    next_service_date?: string;
    status?: 'operational' | 'maintenance' | 'broken' | 'retired';
    notes?: string;
  };
}

export interface CleaningTaskEntity extends Entity {
  type: 'restaurant.cleaning_task';
  metadata: {
    area: string;
    freq: 'hourly' | 'daily' | 'weekly' | 'monthly';
    assigned_to: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    
    scheduled_time?: string;
    completion_time?: string;
    verified_by?: string;
    notes?: string;
  };
}

export interface SanitationScheduleEntity extends Entity {
  type: 'restaurant.sanitation_schedule';
  metadata: {
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    areas: string[];
    
    description?: string;
    responsible_role?: string;
    checklist_items?: string[];
    notes?: string;
  };
}

export interface IncidentReportEntity extends Entity {
  type: 'restaurant.incident';
  metadata: {
    incident_type: 'contamination_event' | 'foodborne_illness' | 'pest_sighting' | 'equipment_failure' | 'staff_illness' | 'customer_complaint' | 'other';
    date_time: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    
    food_item_uid?: string;
    equipment_uid?: string;
    reported_by?: string;
    action_taken?: string;
    corrective_action_uid?: string;
    follow_up_required?: boolean;
    notes?: string;
  };
}

export interface StaffTrainingRecordEntity extends Entity {
  type: 'restaurant.training';
  metadata: {
    staff_uid: string;
    training_type: string;
    completion_date: string;
    
    certification_number?: string;
    expiry_date?: string;
    trainer?: string;
    score?: number;
    notes?: string;
  };
}

export interface AuditChecklistEntity extends Entity {
  type: 'restaurant.audit';
  metadata: {
    haccp_plan_uid?: string;
    audit_date: string;
    auditor: string;
    
    items: Array<{
      item: string;
      status: 'compliant' | 'needs_review' | 'non_compliant';
      notes?: string;
    }>;
    overall_status?: 'passed' | 'failed' | 'conditional';
    follow_up_required?: boolean;
    notes?: string;
  };
}

export interface HACCPPlanEntity extends Entity {
  type: 'restaurant.haccp_plan';
  metadata: {
    name: string;
    version: string;
    effective_date: string;
    
    description?: string;
    critical_control_points?: string[]; // UIDs
    review_frequency_months?: number;
    last_review_date?: string;
    next_review_date?: string;
    approved_by?: string;
    notes?: string;
  };
}

export interface CriticalControlPointEntity extends Entity {
  type: 'restaurant.ccp';
  metadata: {
    haccp_plan_uid: string;
    step: string;
    hazard_type: 'biological' | 'chemical' | 'physical';
    critical_limit_temp_c?: number;
    critical_limit_time_min?: number;
    monitoring_frequency_minutes: number;
    responsible_role: string;
    
    description?: string;
    corrective_actions?: string;
    verification_procedures?: string;
    notes?: string;
  };
}

export interface CorrectiveActionEntity extends Entity {
  type: 'restaurant.corrective_action';
  metadata: {
    ccp_uid?: string;
    incident_uid?: string;
    description: string;
    action_taken_by: string;
    date_time: string;
    
    outcome?: string;
    verification?: string;
    follow_up_required?: boolean;
    notes?: string;
  };
}

export interface WasteLogEntity extends Entity {
  type: 'restaurant.waste';
  metadata: {
    food_item_uid?: string;
    quantity: string;
    reason: 'expired' | 'spoiled' | 'contaminated' | 'overproduction' | 'damaged' | 'other';
    date: string;
    
    logged_by?: string;
    disposal_method?: string;
    cost_estimate?: number;
    notes?: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createFoodItem(data: {
  name: string;
  category: FoodItemEntity['metadata']['category'];
  supplierUid: string;
  expiryDate?: string;
  allergens?: string[];
}): FoodItemEntity {
  return {
    uid: `food-${Date.now()}`,
    type: 'restaurant.food_item',
    metadata: {
      name: data.name,
      category: data.category,
      supplier_uid: data.supplierUid,
      expiry_date: data.expiryDate,
      allergens: data.allergens || [],
    },
  };
}

export function createTemperatureLog(data: {
  storageUid?: string;
  equipmentUid?: string;
  valueC: number;
  criticalLimitC: number;
  recordedBy?: string;
}): TemperatureLogEntity {
  return {
    uid: `temp-${Date.now()}`,
    type: 'restaurant.temperature_log',
    metadata: {
      storage_uid: data.storageUid,
      equipment_uid: data.equipmentUid,
      date_time: new Date().toISOString(),
      value_c: data.valueC,
      pass_fail: data.valueC <= data.criticalLimitC ? 'pass' : 'fail',
      recorded_by: data.recordedBy,
    },
  };
}

export function createCriticalControlPoint(data: {
  haccpPlanUid: string;
  step: string;
  hazardType: CriticalControlPointEntity['metadata']['hazard_type'];
  criticalLimitTempC?: number;
  monitoringFreqMin: number;
  responsibleRole: string;
}): CriticalControlPointEntity {
  return {
    uid: `ccp-${Date.now()}`,
    type: 'restaurant.ccp',
    metadata: {
      haccp_plan_uid: data.haccpPlanUid,
      step: data.step,
      hazard_type: data.hazardType,
      critical_limit_temp_c: data.criticalLimitTempC,
      monitoring_frequency_minutes: data.monitoringFreqMin,
      responsible_role: data.responsibleRole,
    },
  };
}

export function createIncidentReport(data: {
  incidentType: IncidentReportEntity['metadata']['incident_type'];
  severity: IncidentReportEntity['metadata']['severity'];
  description: string;
  actionTaken?: string;
}): IncidentReportEntity {
  return {
    uid: `incident-${Date.now()}`,
    type: 'restaurant.incident',
    metadata: {
      incident_type: data.incidentType,
      date_time: new Date().toISOString(),
      severity: data.severity,
      description: data.description,
      action_taken: data.actionTaken,
    },
  };
}

export function createCleaningTask(data: {
  area: string;
  freq: CleaningTaskEntity['metadata']['freq'];
  assignedTo: string;
}): CleaningTaskEntity {
  return {
    uid: `clean-${Date.now()}`,
    type: 'restaurant.cleaning_task',
    metadata: {
      area: data.area,
      freq: data.freq,
      assigned_to: data.assignedTo,
      status: 'pending',
    },
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export function getExpiringItems(foodItems: FoodItemEntity[], daysAhead: number = 7): FoodItemEntity[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return foodItems
    .filter(item => item.metadata.expiry_date)
    .filter(item => {
      const expiryDate = new Date(item.metadata.expiry_date!);
      return expiryDate >= today && expiryDate <= futureDate;
    })
    .sort((a, b) => 
      new Date(a.metadata.expiry_date!).getTime() - new Date(b.metadata.expiry_date!).getTime()
    );
}

export function getFailedTemperatureLogs(logs: TemperatureLogEntity[]): TemperatureLogEntity[] {
  return logs.filter(log => log.metadata.pass_fail === 'fail');
}

export function getRecentIncidents(incidents: IncidentReportEntity[], daysBack: number = 30): IncidentReportEntity[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  
  return incidents
    .filter(incident => new Date(incident.metadata.date_time) >= cutoffDate)
    .sort((a, b) => 
      new Date(b.metadata.date_time).getTime() - new Date(a.metadata.date_time).getTime()
    );
}

export function getCriticalIncidents(incidents: IncidentReportEntity[]): IncidentReportEntity[] {
  return incidents.filter(i => i.metadata.severity === 'critical' || i.metadata.severity === 'high');
}

export function getPendingCleaningTasks(tasks: CleaningTaskEntity[]): CleaningTaskEntity[] {
  return tasks.filter(t => t.metadata.status === 'pending');
}

export function getExpiringCertifications(
  trainingRecords: StaffTrainingRecordEntity[], 
  daysAhead: number = 30
): StaffTrainingRecordEntity[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return trainingRecords
    .filter(record => record.metadata.expiry_date)
    .filter(record => {
      const expiryDate = new Date(record.metadata.expiry_date!);
      return expiryDate >= today && expiryDate <= futureDate;
    })
    .sort((a, b) => 
      new Date(a.metadata.expiry_date!).getTime() - new Date(b.metadata.expiry_date!).getTime()
    );
}

export function calculateWasteCost(wasteLogs: WasteLogEntity[], period?: string): number {
  let filtered = wasteLogs;
  
  if (period) {
    filtered = wasteLogs.filter(log => log.metadata.date.startsWith(period));
  }
  
  return filtered.reduce((total, log) => total + (log.metadata.cost_estimate || 0), 0);
}

export function getWasteByReason(
  wasteLogs: WasteLogEntity[], 
  reason: WasteLogEntity['metadata']['reason']
): WasteLogEntity[] {
  return wasteLogs.filter(log => log.metadata.reason === reason);
}

export function calculateTemperatureComplianceRate(logs: TemperatureLogEntity[]): number {
  if (logs.length === 0) return 0;
  const passed = logs.filter(log => log.metadata.pass_fail === 'pass').length;
  return (passed / logs.length) * 100;
}

export function getDeliveriesBySupplier(deliveries: DeliveryRecordEntity[], supplierUid: string): DeliveryRecordEntity[] {
  return deliveries.filter(d => d.metadata.supplier_uid === supplierUid);
}

export function calculateSupplierRejectionRate(deliveries: DeliveryRecordEntity[], supplierUid: string): number {
  const supplierDeliveries = getDeliveriesBySupplier(deliveries, supplierUid);
  if (supplierDeliveries.length === 0) return 0;
  
  const rejected = supplierDeliveries.filter(d => d.metadata.rejected).length;
  return (rejected / supplierDeliveries.length) * 100;
}

export function getCCPsByHazardType(
  ccps: CriticalControlPointEntity[], 
  hazardType: CriticalControlPointEntity['metadata']['hazard_type']
): CriticalControlPointEntity[] {
  return ccps.filter(ccp => ccp.metadata.hazard_type === hazardType);
}

export function getOverdueEquipmentMaintenance(equipment: EquipmentItemEntity[]): EquipmentItemEntity[] {
  const today = new Date();
  
  return equipment
    .filter(e => e.metadata.next_service_date)
    .filter(e => new Date(e.metadata.next_service_date!) < today)
    .filter(e => e.metadata.status !== 'retired');
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  FoodItemEntity,
  SupplierProfileEntity,
  DeliveryRecordEntity,
  StorageLocationEntity,
  TemperatureLogEntity,
  PrepTaskEntity,
  RecipeDocumentEntity,
  EquipmentItemEntity,
  CleaningTaskEntity,
  SanitationScheduleEntity,
  IncidentReportEntity,
  StaffTrainingRecordEntity,
  AuditChecklistEntity,
  HACCPPlanEntity,
  CriticalControlPointEntity,
  CorrectiveActionEntity,
  WasteLogEntity,
};
