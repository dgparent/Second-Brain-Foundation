/**
 * Construction Operations Module
 * 
 * Provides entity definitions and utilities for managing construction projects,
 * site operations, safety compliance, quality control, and workforce management.
 * 
 * @module @sbf/modules-construction-ops
 */

import { Entity } from '@sbf/core';

// ============================================================================
// Core Entities
// ============================================================================

export interface ConstructionProject extends Entity {
  type: 'construction.project';
  metadata: {
    // Core fields
    project_code: string;
    title: string;
    client_uid: string;
    address: string;
    start_date: string;
    end_date?: string;
    status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
    budget?: number;
    
    // Advanced fields
    project_manager_uid?: string;
    contractor_uid?: string;
    permit_uids?: string[];
    drawing_uids?: string[];
    notes?: string;
  };
}

export interface ProjectPhase extends Entity {
  type: 'construction.project_phase';
  metadata: {
    project_uid: string;
    phase_name: string;
    phase_number: number;
    start_date: string;
    end_date?: string;
    status: 'pending' | 'active' | 'completed';
    budget_allocated?: number;
    completion_percentage?: number;
  };
}

export interface SiteLocation extends Entity {
  type: 'construction.site_location';
  metadata: {
    project_uid: string;
    site_name: string;
    address: string;
    gps_coordinates?: string;
    site_supervisor_uid?: string;
    access_instructions?: string;
  };
}

export interface DailySiteLog extends Entity {
  type: 'construction.daily_site_log';
  metadata: {
    project_uid: string;
    site_uid: string;
    log_date: string;
    weather_conditions?: string;
    temperature?: number;
    
    // Workforce
    crew_count?: number;
    subcontractor_count?: number;
    
    // Activities
    work_performed?: string;
    materials_delivered?: string;
    equipment_used?: string[];
    
    // Issues
    delays?: string;
    incidents?: string;
    
    // Media
    photo_uids?: string[];
    logged_by_uid: string;
  };
}

export interface WorkTask extends Entity {
  type: 'construction.work_task';
  metadata: {
    project_uid: string;
    phase_uid?: string;
    task_name: string;
    description?: string;
    assigned_to_uid?: string;
    subcontractor_uid?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    start_date?: string;
    end_date?: string;
    hours_estimated?: number;
    hours_actual?: number;
  };
}

export interface MaterialItem extends Entity {
  type: 'construction.material_item';
  metadata: {
    project_uid: string;
    material_name: string;
    quantity: number;
    unit: string;
    supplier_uid?: string;
    delivery_date?: string;
    cost?: number;
    status: 'ordered' | 'delivered' | 'installed' | 'returned';
  };
}

export interface EquipmentItem extends Entity {
  type: 'construction.equipment_item';
  metadata: {
    equipment_name: string;
    equipment_type: string;
    serial_number?: string;
    ownership: 'owned' | 'rented' | 'leased';
    supplier_uid?: string;
    daily_rate?: number;
    status: 'available' | 'in-use' | 'maintenance' | 'retired';
  };
}

export interface EquipmentUsageLog extends Entity {
  type: 'construction.equipment_usage_log';
  metadata: {
    equipment_uid: string;
    project_uid: string;
    work_task_uid?: string;
    operator_uid?: string;
    start_time: string;
    end_time?: string;
    hours_used?: number;
    fuel_consumed?: number;
    notes?: string;
  };
}

export interface Subcontractor extends Entity {
  type: 'construction.subcontractor';
  metadata: {
    company_name: string;
    trade: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    license_number?: string;
    insurance_expiry?: string;
    rating?: number;
  };
}

export interface WorkerProfile extends Entity {
  type: 'construction.worker_profile';
  metadata: {
    full_name: string;
    trade?: string;
    certification_uids?: string[];
    subcontractor_uid?: string;
    contact_phone?: string;
    emergency_contact?: string;
    status: 'active' | 'inactive';
  };
}

export interface SafetyIncident extends Entity {
  type: 'construction.safety_incident';
  metadata: {
    project_uid: string;
    site_uid?: string;
    incident_date: string;
    incident_type: 'near-miss' | 'first-aid' | 'medical-treatment' | 'lost-time' | 'fatality';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    worker_uid?: string;
    witness_uids?: string[];
    corrective_actions?: string;
    reported_by_uid: string;
    investigation_status: 'pending' | 'investigating' | 'completed';
  };
}

export interface SafetyInspection extends Entity {
  type: 'construction.safety_inspection';
  metadata: {
    project_uid: string;
    site_uid?: string;
    inspection_date: string;
    inspector_uid: string;
    inspection_type: 'routine' | 'incident-followup' | 'compliance-audit';
    findings?: string;
    violations?: string[];
    corrective_actions?: string;
    status: 'passed' | 'failed' | 'conditional';
  };
}

export interface ToolboxTalk extends Entity {
  type: 'construction.toolbox_talk';
  metadata: {
    project_uid: string;
    talk_date: string;
    topic: string;
    presenter_uid: string;
    attendee_uids: string[];
    duration_minutes?: number;
    notes?: string;
  };
}

export interface QCInspection extends Entity {
  type: 'construction.qc_inspection';
  metadata: {
    project_uid: string;
    phase_uid?: string;
    inspection_date: string;
    inspection_type: 'pre-pour' | 'framing' | 'electrical' | 'plumbing' | 'final';
    inspector_uid: string;
    location?: string;
    findings?: string;
    status: 'passed' | 'failed' | 'conditional';
    photo_uids?: string[];
  };
}

export interface QCDeficiency extends Entity {
  type: 'construction.qc_deficiency';
  metadata: {
    inspection_uid: string;
    project_uid: string;
    deficiency_type: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
    responsible_uid?: string;
    corrective_action?: string;
    status: 'open' | 'in-progress' | 'resolved' | 'accepted';
    resolution_date?: string;
  };
}

export interface PermitDocument extends Entity {
  type: 'construction.permit_document';
  metadata: {
    project_uid: string;
    permit_type: string;
    permit_number?: string;
    issued_by?: string;
    issue_date?: string;
    expiry_date?: string;
    status: 'pending' | 'approved' | 'expired' | 'rejected';
    document_url?: string;
  };
}

export interface DrawingDocument extends Entity {
  type: 'construction.drawing_document';
  metadata: {
    project_uid: string;
    drawing_number: string;
    title: string;
    revision: string;
    issue_date: string;
    discipline: 'architectural' | 'structural' | 'electrical' | 'mechanical' | 'civil';
    document_url?: string;
    superseded_by_uid?: string;
  };
}

export interface ChangeOrder extends Entity {
  type: 'construction.change_order';
  metadata: {
    project_uid: string;
    co_number: string;
    title: string;
    description: string;
    requested_by_uid?: string;
    approved_by_uid?: string;
    cost_impact?: number;
    schedule_impact_days?: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'implemented';
    submission_date?: string;
    approval_date?: string;
  };
}

export interface RFI extends Entity {
  type: 'construction.rfi';
  metadata: {
    project_uid: string;
    rfi_number: string;
    subject: string;
    question: string;
    submitted_by_uid: string;
    submission_date: string;
    response?: string;
    responded_by_uid?: string;
    response_date?: string;
    status: 'open' | 'answered' | 'closed';
    drawing_uids?: string[];
  };
}

export interface PunchItem extends Entity {
  type: 'construction.punch_item';
  metadata: {
    project_uid: string;
    phase_uid?: string;
    item_number: string;
    description: string;
    location: string;
    trade?: string;
    responsible_uid?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'completed' | 'verified';
    created_date: string;
    completion_date?: string;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createConstructionProject(data: {
  project_code: string;
  title: string;
  client_uid: string;
  address: string;
  start_date: string;
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  budget?: number;
  project_manager_uid?: string;
}): ConstructionProject {
  return {
    uid: `construction-project-${Date.now()}`,
    type: 'construction.project',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_code: data.project_code,
      title: data.title,
      client_uid: data.client_uid,
      address: data.address,
      start_date: data.start_date,
      status: data.status || 'planning',
      budget: data.budget,
      project_manager_uid: data.project_manager_uid,
    },
  };
}

export function createDailySiteLog(data: {
  project_uid: string;
  site_uid: string;
  log_date: string;
  logged_by_uid: string;
  work_performed?: string;
  weather_conditions?: string;
  crew_count?: number;
}): DailySiteLog {
  return {
    uid: `site-log-${Date.now()}`,
    type: 'construction.daily_site_log',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      site_uid: data.site_uid,
      log_date: data.log_date,
      logged_by_uid: data.logged_by_uid,
      work_performed: data.work_performed,
      weather_conditions: data.weather_conditions,
      crew_count: data.crew_count,
    },
  };
}

export function createSafetyIncident(data: {
  project_uid: string;
  incident_date: string;
  incident_type: 'near-miss' | 'first-aid' | 'medical-treatment' | 'lost-time' | 'fatality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reported_by_uid: string;
}): SafetyIncident {
  return {
    uid: `safety-incident-${Date.now()}`,
    type: 'construction.safety_incident',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      incident_date: data.incident_date,
      incident_type: data.incident_type,
      severity: data.severity,
      description: data.description,
      reported_by_uid: data.reported_by_uid,
      investigation_status: 'pending',
    },
  };
}

export function createQCInspection(data: {
  project_uid: string;
  inspection_date: string;
  inspection_type: 'pre-pour' | 'framing' | 'electrical' | 'plumbing' | 'final';
  inspector_uid: string;
  status: 'passed' | 'failed' | 'conditional';
}): QCInspection {
  return {
    uid: `qc-inspection-${Date.now()}`,
    type: 'construction.qc_inspection',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      inspection_date: data.inspection_date,
      inspection_type: data.inspection_type,
      inspector_uid: data.inspector_uid,
      status: data.status,
    },
  };
}

export function createChangeOrder(data: {
  project_uid: string;
  co_number: string;
  title: string;
  description: string;
  cost_impact?: number;
  schedule_impact_days?: number;
}): ChangeOrder {
  return {
    uid: `change-order-${Date.now()}`,
    type: 'construction.change_order',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      co_number: data.co_number,
      title: data.title,
      description: data.description,
      cost_impact: data.cost_impact,
      schedule_impact_days: data.schedule_impact_days,
      status: 'draft',
    },
  };
}

export function createRFI(data: {
  project_uid: string;
  rfi_number: string;
  subject: string;
  question: string;
  submitted_by_uid: string;
}): RFI {
  return {
    uid: `rfi-${Date.now()}`,
    type: 'construction.rfi',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      rfi_number: data.rfi_number,
      subject: data.subject,
      question: data.question,
      submitted_by_uid: data.submitted_by_uid,
      submission_date: new Date().toISOString(),
      status: 'open',
    },
  };
}

export function createPunchItem(data: {
  project_uid: string;
  item_number: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
}): PunchItem {
  return {
    uid: `punch-item-${Date.now()}`,
    type: 'construction.punch_item',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      project_uid: data.project_uid,
      item_number: data.item_number,
      description: data.description,
      location: data.location,
      priority: data.priority,
      status: 'open',
      created_date: new Date().toISOString(),
    },
  };
}

// Query helpers
export function getProjectsByStatus(
  projects: ConstructionProject[],
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
): ConstructionProject[] {
  return projects.filter(p => p.metadata.status === status);
}

export function getOpenSafetyIncidents(incidents: SafetyIncident[]): SafetyIncident[] {
  return incidents.filter(i => i.metadata.investigation_status !== 'completed');
}

export function getOverduePermits(permits: PermitDocument[]): PermitDocument[] {
  const today = new Date().toISOString().split('T')[0];
  return permits.filter(p => 
    p.metadata.expiry_date && 
    p.metadata.expiry_date < today && 
    p.metadata.status === 'approved'
  );
}

export function calculateProjectBudgetStatus(
  project: ConstructionProject,
  changeOrders: ChangeOrder[]
): { original: number; adjustments: number; current: number } {
  const original = project.metadata.budget || 0;
  const adjustments = changeOrders
    .filter(co => co.metadata.project_uid === project.uid && co.metadata.status === 'approved')
    .reduce((sum, co) => sum + (co.metadata.cost_impact || 0), 0);
  
  return {
    original,
    adjustments,
    current: original + adjustments,
  };
}
