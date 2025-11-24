/**
 * Restaurant HACCP Helper Functions
 */

import {
  HACCPPlan, HazardAnalysis, CriticalControlPoint, TemperatureLog,
  FoodReceivingLog, CookingLog, CoolingLog, CleaningSanitizingLog,
  EmployeeHealthLog, SupplierApproval, CorrectiveAction,
  ComplianceInspection, AllergenControl, TrainingRecord,
  TemperatureUnit, HazardType, ComplianceStatus, FoodCategory
} from './types';

// HACCP Plan Functions
export function createHACCPPlan(data: Partial<HACCPPlan>): HACCPPlan {
  return {
    uid: data.uid || `haccp-plan-${Date.now()}`,
    type: 'haccp_plan',
    restaurant_name: data.restaurant_name || '',
    plan_version: data.plan_version || '1.0',
    effective_date: data.effective_date || new Date(),
    approved_by: data.approved_by || '',
    hazard_analysis_uids: data.hazard_analysis_uids || [],
    control_point_uids: data.control_point_uids || [],
    monitoring_procedure_uids: data.monitoring_procedure_uids || [],
    corrective_action_uids: data.corrective_action_uids || [],
    verification_procedure_uids: data.verification_procedure_uids || [],
    record_keeping_requirements: data.record_keeping_requirements || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as HACCPPlan;
}

// Hazard Analysis Functions
export function createHazardAnalysis(data: Partial<HazardAnalysis>): HazardAnalysis {
  return {
    uid: data.uid || `hazard-${Date.now()}`,
    type: 'hazard_analysis',
    plan_uid: data.plan_uid || '',
    process_step: data.process_step || '',
    hazard_type: data.hazard_type || 'biological',
    hazard_description: data.hazard_description || '',
    severity: data.severity || 'medium',
    likelihood: data.likelihood || 'medium',
    risk_level: data.risk_level || 'medium',
    control_measures: data.control_measures || [],
    is_critical_control_point: data.is_critical_control_point ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as HazardAnalysis;
}

// Critical Control Point Functions
export function createCriticalControlPoint(data: Partial<CriticalControlPoint>): CriticalControlPoint {
  return {
    uid: data.uid || `ccp-${Date.now()}`,
    type: 'critical_control_point',
    plan_uid: data.plan_uid || '',
    hazard_analysis_uid: data.hazard_analysis_uid || '',
    control_point_name: data.control_point_name || '',
    process_step: data.process_step || '',
    hazard_controlled: data.hazard_controlled || '',
    critical_limits: data.critical_limits || [],
    monitoring_frequency: data.monitoring_frequency || '',
    monitoring_method: data.monitoring_method || '',
    responsible_person: data.responsible_person || '',
    corrective_actions: data.corrective_actions || [],
    verification_procedures: data.verification_procedures || [],
    record_forms: data.record_forms || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as CriticalControlPoint;
}

// Temperature Log Functions
export function createTemperatureLog(data: Partial<TemperatureLog>): TemperatureLog {
  const temp = data.temperature || 0;
  const min = data.required_min;
  const max = data.required_max;
  
  let inCompliance = true;
  if (min !== undefined && temp < min) inCompliance = false;
  if (max !== undefined && temp > max) inCompliance = false;

  return {
    uid: data.uid || `temp-log-${Date.now()}`,
    type: 'temperature_log',
    location_uid: data.location_uid || '',
    equipment_type: data.equipment_type || 'refrigerator',
    equipment_id: data.equipment_id || '',
    measurement_time: data.measurement_time || new Date(),
    temperature: temp,
    temperature_unit: data.temperature_unit || 'celsius',
    required_min: min,
    required_max: max,
    in_compliance: data.in_compliance ?? inCompliance,
    recorded_by: data.recorded_by || '',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as TemperatureLog;
}

export function getNonCompliantTemperatures(logs: TemperatureLog[]): TemperatureLog[] {
  return logs.filter(log => !log.in_compliance);
}

export function getRecentTemperatures(logs: TemperatureLog[], hoursAgo: number = 24): TemperatureLog[] {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);
  return logs.filter(log => log.measurement_time >= cutoffTime);
}

// Food Receiving Log Functions
export function createFoodReceivingLog(data: Partial<FoodReceivingLog>): FoodReceivingLog {
  const items = data.items_received || [];
  const allAccepted = items.every(item => item.condition === 'acceptable');
  const allRejected = items.every(item => item.condition === 'rejected');
  
  let overallStatus: 'accepted' | 'partially-accepted' | 'rejected' = 'accepted';
  if (allRejected) overallStatus = 'rejected';
  else if (!allAccepted) overallStatus = 'partially-accepted';

  return {
    uid: data.uid || `receiving-${Date.now()}`,
    type: 'food_receiving_log',
    receiving_date: data.receiving_date || new Date(),
    supplier_name: data.supplier_name || '',
    delivery_time: data.delivery_time || new Date(),
    items_received: items,
    received_by: data.received_by || '',
    overall_status: data.overall_status || overallStatus,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as FoodReceivingLog;
}

// Cooking Log Functions
export function createCookingLog(data: Partial<CookingLog>): CookingLog {
  const internalTemp = data.internal_temperature || 0;
  const requiredTemp = data.required_temperature || 0;
  const inCompliance = internalTemp >= requiredTemp;

  return {
    uid: data.uid || `cooking-${Date.now()}`,
    type: 'cooking_log',
    food_item: data.food_item || '',
    food_category: data.food_category || 'prepared',
    cooking_date: data.cooking_date || new Date(),
    cooking_start_time: data.cooking_start_time || new Date(),
    cooking_end_time: data.cooking_end_time || new Date(),
    cooking_method: data.cooking_method || '',
    internal_temperature: internalTemp,
    temperature_unit: data.temperature_unit || 'celsius',
    required_temperature: requiredTemp,
    temperature_verified_at: data.temperature_verified_at || new Date(),
    in_compliance: data.in_compliance ?? inCompliance,
    cooked_by: data.cooked_by || '',
    verified_by: data.verified_by || '',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as CookingLog;
}

// Cooling Log Functions
export function createCoolingLog(data: Partial<CoolingLog>): CoolingLog {
  return {
    uid: data.uid || `cooling-${Date.now()}`,
    type: 'cooling_log',
    food_item: data.food_item || '',
    food_category: data.food_category || 'prepared',
    cooling_start_time: data.cooling_start_time || new Date(),
    cooling_start_temp: data.cooling_start_temp || 0,
    temperature_unit: data.temperature_unit || 'celsius',
    in_compliance: data.in_compliance ?? true,
    cooled_by: data.cooled_by || '',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as CoolingLog;
}

// Cleaning/Sanitizing Log Functions
export function createCleaningSanitizingLog(data: Partial<CleaningSanitizingLog>): CleaningSanitizingLog {
  return {
    uid: data.uid || `cleaning-${Date.now()}`,
    type: 'cleaning_sanitizing_log',
    area_equipment: data.area_equipment || '',
    location: data.location || '',
    cleaning_date: data.cleaning_date || new Date(),
    cleaning_time: data.cleaning_time || new Date(),
    cleaning_method: data.cleaning_method || '',
    in_compliance: data.in_compliance ?? true,
    cleaned_by: data.cleaned_by || '',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as CleaningSanitizingLog;
}

// Employee Health Log Functions
export function createEmployeeHealthLog(data: Partial<EmployeeHealthLog>): EmployeeHealthLog {
  return {
    uid: data.uid || `health-log-${Date.now()}`,
    type: 'employee_health_log',
    employee_uid: data.employee_uid || '',
    employee_name: data.employee_name || '',
    log_date: data.log_date || new Date(),
    symptoms_reported: data.symptoms_reported || [],
    illness_present: data.illness_present ?? false,
    sent_home: data.sent_home ?? false,
    medical_clearance_required: data.medical_clearance_required ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as EmployeeHealthLog;
}

// Supplier Approval Functions
export function createSupplierApproval(data: Partial<SupplierApproval>): SupplierApproval {
  return {
    uid: data.uid || `supplier-${Date.now()}`,
    type: 'supplier_approval',
    supplier_name: data.supplier_name || '',
    supplier_contact: data.supplier_contact || '',
    approval_date: data.approval_date || new Date(),
    approval_status: data.approval_status || 'approved',
    food_categories: data.food_categories || [],
    certifications: data.certifications || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as SupplierApproval;
}

export function getApprovedSuppliers(suppliers: SupplierApproval[]): SupplierApproval[] {
  return suppliers.filter(s => s.approval_status === 'approved');
}

// Corrective Action Functions
export function createCorrectiveAction(data: Partial<CorrectiveAction>): CorrectiveAction {
  return {
    uid: data.uid || `corrective-${Date.now()}`,
    type: 'corrective_action',
    incident_date: data.incident_date || new Date(),
    problem_description: data.problem_description || '',
    immediate_action: data.immediate_action || '',
    preventive_measures: data.preventive_measures || [],
    action_taken_by: data.action_taken_by || '',
    action_taken_date: data.action_taken_date || new Date(),
    effectiveness_verified: data.effectiveness_verified ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as CorrectiveAction;
}

// Compliance Inspection Functions
export function createComplianceInspection(data: Partial<ComplianceInspection>): ComplianceInspection {
  return {
    uid: data.uid || `inspection-${Date.now()}`,
    type: 'compliance_inspection',
    inspection_date: data.inspection_date || new Date(),
    inspection_type: data.inspection_type || 'internal',
    inspector_name: data.inspector_name || '',
    areas_inspected: data.areas_inspected || [],
    violations_found: data.violations_found || [],
    compliance_status: data.compliance_status || 'compliant',
    follow_up_required: data.follow_up_required ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as ComplianceInspection;
}

export function getCriticalViolations(inspections: ComplianceInspection[]) {
  return inspections.flatMap(inspection =>
    inspection.violations_found
      .filter(v => v.severity === 'critical')
      .map(v => ({ ...v, inspection_uid: inspection.uid, inspection_date: inspection.inspection_date }))
  );
}

// Allergen Control Functions
export function createAllergenControl(data: Partial<AllergenControl>): AllergenControl {
  return {
    uid: data.uid || `allergen-${Date.now()}`,
    type: 'allergen_control',
    menu_item: data.menu_item || '',
    allergens_present: data.allergens_present || [],
    allergen_sources: data.allergen_sources || [],
    cross_contact_risk: data.cross_contact_risk || 'low',
    control_measures: data.control_measures || [],
    staff_training_required: data.staff_training_required ?? false,
    menu_labeling_updated: data.menu_labeling_updated ?? false,
    last_reviewed: data.last_reviewed || new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as AllergenControl;
}

// Training Record Functions
export function createTrainingRecord(data: Partial<TrainingRecord>): TrainingRecord {
  return {
    uid: data.uid || `training-${Date.now()}`,
    type: 'training_record',
    employee_uid: data.employee_uid || '',
    employee_name: data.employee_name || '',
    training_topic: data.training_topic || '',
    training_date: data.training_date || new Date(),
    trainer_name: data.trainer_name || '',
    training_method: data.training_method || 'classroom',
    duration_hours: data.duration_hours || 0,
    assessment_passed: data.assessment_passed ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as TrainingRecord;
}

// Analytics Functions
export function getComplianceStatistics(
  temperatureLogs: TemperatureLog[],
  cookingLogs: CookingLog[],
  inspections: ComplianceInspection[]
) {
  const tempCompliance = temperatureLogs.filter(log => log.in_compliance).length;
  const tempTotal = temperatureLogs.length;
  const tempRate = tempTotal > 0 ? (tempCompliance / tempTotal) * 100 : 100;

  const cookingCompliance = cookingLogs.filter(log => log.in_compliance).length;
  const cookingTotal = cookingLogs.length;
  const cookingRate = cookingTotal > 0 ? (cookingCompliance / cookingTotal) * 100 : 100;

  const compliantInspections = inspections.filter(i => i.compliance_status === 'compliant').length;
  const totalInspections = inspections.length;
  const inspectionRate = totalInspections > 0 ? (compliantInspections / totalInspections) * 100 : 100;

  return {
    temperature_compliance_rate: tempRate.toFixed(2) + '%',
    cooking_compliance_rate: cookingRate.toFixed(2) + '%',
    inspection_compliance_rate: inspectionRate.toFixed(2) + '%',
    total_temperature_logs: tempTotal,
    non_compliant_temperatures: tempTotal - tempCompliance,
    total_cooking_logs: cookingTotal,
    non_compliant_cooking: cookingTotal - cookingCompliance,
    total_inspections: totalInspections,
    critical_violations: getCriticalViolations(inspections).length,
  };
}
