/**
 * Restaurant HACCP Module Types
 */

export interface BaseEntity {
  uid: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type HazardType = 'biological' | 'chemical' | 'physical' | 'allergen';
export type ControlType = 'preventive' | 'critical-control-point';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'needs-review';
export type FoodCategory = 'meat' | 'poultry' | 'seafood' | 'dairy' | 'produce' | 'dry-goods' | 'prepared';

export interface HACCPPlan extends BaseEntity {
  restaurant_name: string;
  plan_version: string;
  effective_date: Date;
  review_date?: Date;
  approved_by: string;
  approval_date?: Date;
  hazard_analysis_uids: string[];
  control_point_uids: string[];
  monitoring_procedure_uids: string[];
  corrective_action_uids: string[];
  verification_procedure_uids: string[];
  record_keeping_requirements: string[];
  notes?: string;
}

export interface HazardAnalysis extends BaseEntity {
  plan_uid: string;
  process_step: string;
  hazard_type: HazardType;
  hazard_description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  control_measures: string[];
  is_critical_control_point: boolean;
  notes?: string;
}

export interface CriticalControlPoint extends BaseEntity {
  plan_uid: string;
  hazard_analysis_uid: string;
  control_point_name: string;
  process_step: string;
  hazard_controlled: string;
  critical_limits: Array<{
    parameter: string;
    minimum?: number;
    maximum?: number;
    unit?: string;
  }>;
  monitoring_frequency: string;
  monitoring_method: string;
  responsible_person: string;
  corrective_actions: string[];
  verification_procedures: string[];
  record_forms: string[];
}

export interface TemperatureLog extends BaseEntity {
  location_uid: string;
  equipment_type: 'refrigerator' | 'freezer' | 'hot-holding' | 'cooking' | 'receiving';
  equipment_id: string;
  measurement_time: Date;
  temperature: number;
  temperature_unit: TemperatureUnit;
  required_min?: number;
  required_max?: number;
  in_compliance: boolean;
  recorded_by: string;
  corrective_action_taken?: string;
  notes?: string;
}

export interface FoodReceivingLog extends BaseEntity {
  receiving_date: Date;
  supplier_name: string;
  supplier_contact?: string;
  delivery_time: Date;
  items_received: Array<{
    product_name: string;
    category: FoodCategory;
    quantity: number;
    unit: string;
    temperature?: number;
    temperature_unit?: TemperatureUnit;
    lot_number?: string;
    expiry_date?: Date;
    condition: 'acceptable' | 'rejected';
    rejection_reason?: string;
  }>;
  received_by: string;
  overall_status: 'accepted' | 'partially-accepted' | 'rejected';
  notes?: string;
}

export interface CookingLog extends BaseEntity {
  food_item: string;
  food_category: FoodCategory;
  cooking_date: Date;
  cooking_start_time: Date;
  cooking_end_time: Date;
  cooking_method: string;
  internal_temperature: number;
  temperature_unit: TemperatureUnit;
  required_temperature: number;
  temperature_verified_at: Date;
  in_compliance: boolean;
  cooked_by: string;
  verified_by: string;
  corrective_action?: string;
  notes?: string;
}

export interface CoolingLog extends BaseEntity {
  food_item: string;
  food_category: FoodCategory;
  cooling_start_time: Date;
  cooling_start_temp: number;
  cooling_2hr_time?: Date;
  cooling_2hr_temp?: number;
  cooling_4hr_time?: Date;
  cooling_4hr_temp?: number;
  cooling_6hr_time?: Date;
  cooling_6hr_temp?: number;
  temperature_unit: TemperatureUnit;
  in_compliance: boolean;
  cooled_by: string;
  corrective_action?: string;
  notes?: string;
}

export interface CleaningSanitizingLog extends BaseEntity {
  area_equipment: string;
  location: string;
  cleaning_date: Date;
  cleaning_time: Date;
  cleaning_method: string;
  sanitizer_used?: string;
  sanitizer_concentration?: number;
  test_strip_reading?: number;
  in_compliance: boolean;
  cleaned_by: string;
  verified_by?: string;
  notes?: string;
}

export interface EmployeeHealthLog extends BaseEntity {
  employee_uid: string;
  employee_name: string;
  log_date: Date;
  symptoms_reported: string[];
  illness_present: boolean;
  sent_home: boolean;
  return_to_work_date?: Date;
  medical_clearance_required: boolean;
  medical_clearance_received?: boolean;
  notes?: string;
}

export interface SupplierApproval extends BaseEntity {
  supplier_name: string;
  supplier_contact: string;
  supplier_address?: string;
  approval_date: Date;
  approval_status: 'approved' | 'conditional' | 'suspended' | 'rejected';
  food_categories: FoodCategory[];
  certifications: string[];
  inspection_date?: Date;
  inspection_score?: number;
  last_audit_date?: Date;
  next_audit_due?: Date;
  notes?: string;
}

export interface CorrectiveAction extends BaseEntity {
  incident_date: Date;
  control_point_uid?: string;
  temperature_log_uid?: string;
  problem_description: string;
  immediate_action: string;
  root_cause?: string;
  preventive_measures: string[];
  action_taken_by: string;
  action_taken_date: Date;
  verified_by?: string;
  verification_date?: Date;
  effectiveness_verified: boolean;
  notes?: string;
}

export interface ComplianceInspection extends BaseEntity {
  inspection_date: Date;
  inspection_type: 'internal' | 'health-department' | 'third-party';
  inspector_name: string;
  inspector_organization?: string;
  areas_inspected: string[];
  violations_found: Array<{
    violation_code?: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
    corrective_action_required: string;
    corrective_action_uid?: string;
  }>;
  overall_score?: number;
  compliance_status: ComplianceStatus;
  report_document_uid?: string;
  follow_up_required: boolean;
  follow_up_date?: Date;
  notes?: string;
}

export interface AllergenControl extends BaseEntity {
  menu_item: string;
  allergens_present: string[];
  allergen_sources: Array<{
    allergen: string;
    ingredient: string;
  }>;
  cross_contact_risk: 'low' | 'medium' | 'high';
  control_measures: string[];
  staff_training_required: boolean;
  menu_labeling_updated: boolean;
  last_reviewed: Date;
  notes?: string;
}

export interface TrainingRecord extends BaseEntity {
  employee_uid: string;
  employee_name: string;
  training_topic: string;
  training_date: Date;
  trainer_name: string;
  training_method: 'classroom' | 'online' | 'hands-on' | 'video';
  duration_hours: number;
  assessment_passed: boolean;
  assessment_score?: number;
  certification_issued?: string;
  certification_expiry?: Date;
  next_training_due?: Date;
  notes?: string;
}
