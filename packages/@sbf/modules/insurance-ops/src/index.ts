/**
 * @sbf/modules-insurance-ops
 * 
 * Insurance Operations Module
 * Claims processing, field inspections, and loss adjustment
 */

export const MODULE_NAME = '@sbf/modules-insurance-ops';
export const MODULE_VERSION = '0.1.0';

// Core types
export interface ClaimRecord {
  uid: string;
  type: 'claim_record';
  policy_uid: string;
  claimant_uid: string;
  loss_type: 'property' | 'auto' | 'liability' | 'other';
  loss_date: string;
  reported_date: string;
  status: 'open' | 'in_progress' | 'closed' | 'denied';
  assigned_adjuster?: string;
  severity?: 'low' | 'moderate' | 'high' | 'catastrophic';
  cause_of_loss?: string;
}

export interface FNOLReport {
  uid: string;
  type: 'fnol_report';
  policy_uid: string;
  claimant_uid: string;
  loss_date: string;
  reported_date: string;
  loss_description: string;
  location?: string;
  attachments?: string[];
}

export interface FieldInspection {
  uid: string;
  type: 'field_inspection';
  claim_uid: string;
  inspector_uid: string;
  scheduled_date?: string;
  visit_date?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface DamageItem {
  uid: string;
  type: 'damage_item';
  inspection_uid: string;
  category: string;
  area?: string;
  severity: 'minor' | 'medium' | 'major';
  estimated_cost?: number;
  notes?: string;
}

export interface InspectionEvidence {
  uid: string;
  type: 'inspection_evidence';
  inspection_uid: string;
  media_type: 'photo' | 'video' | 'document';
  file_path: string;
  description?: string;
}

export interface EstimationRecord {
  uid: string;
  type: 'estimation_record';
  claim_uid: string;
  estimator_uid: string;
  items: string[];
  subtotal: number;
  tax?: number;
  total: number;
  status: 'draft' | 'submitted' | 'approved';
}

export interface RepairOrder {
  uid: string;
  type: 'repair_order';
  claim_uid: string;
  vendor_uid: string;
  authorized_by: string;
  work_description: string;
  cost_estimate: number;
  status: 'draft' | 'authorized' | 'in_progress' | 'completed';
}

export interface FraudIndicator {
  uid: string;
  type: 'fraud_indicator';
  claim_uid: string;
  indicator_type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

// Main export
export default {
  MODULE_NAME,
  MODULE_VERSION,
};
