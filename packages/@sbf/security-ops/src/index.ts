/**
 * Security Operations Module
 * 
 * Provides entity definitions for security guard operations, patrol management,
 * incident reporting, access control, and visitor management.
 * 
 * @module @sbf/security-ops
 */

import { Entity } from '@sbf/core';

// ============================================================================
// Core Entities
// ============================================================================

export interface SecuritySite extends Entity {
  type: 'security.site';
  metadata: {
    site_name: string;
    site_code: string;
    address: string;
    site_type: 'commercial' | 'residential' | 'industrial' | 'retail' | 'event';
    client_uid?: string;
    
    // Configuration
    access_points?: number;
    checkpoint_count?: number;
    camera_count?: number;
    
    // Staffing
    guards_required?: number;
    current_guards_on_duty?: number;
    
    status: 'active' | 'inactive' | 'temporary';
    notes?: string;
  };
}

export interface GuardProfile extends Entity {
  type: 'security.guard_profile';
  metadata: {
    full_name: string;
    employee_id?: string;
    license_number?: string;
    license_expiry?: string;
    phone?: string;
    emergency_contact?: string;
    
    // Skills & Certifications
    certifications?: string[];
    trained_sites?: string[];
    
    // Availability
    availability_pattern?: 'full-time' | 'part-time' | 'on-call';
    
    status: 'active' | 'inactive' | 'suspended';
    hire_date?: string;
  };
}

export interface GuardShift extends Entity {
  type: 'security.guard_shift';
  metadata: {
    site_uid: string;
    guard_uid: string;
    shift_date: string;
    shift_type: 'day' | 'night' | 'swing';
    start_time: string;
    end_time?: string;
    
    // Shift details
    position: 'static' | 'mobile' | 'supervisor';
    post_location?: string;
    
    // Status tracking
    check_in_time?: string;
    check_out_time?: string;
    status: 'scheduled' | 'active' | 'completed' | 'no-show' | 'cancelled';
    
    notes?: string;
  };
}

export interface PatrolRoute extends Entity {
  type: 'security.patrol_route';
  metadata: {
    site_uid: string;
    route_name: string;
    route_code?: string;
    checkpoint_uids: string[];
    expected_duration_minutes?: number;
    frequency: 'hourly' | 'every-2h' | 'every-4h' | 'per-shift' | 'as-needed';
    instructions?: string;
    status: 'active' | 'inactive';
  };
}

export interface Checkpoint extends Entity {
  type: 'security.checkpoint';
  metadata: {
    site_uid: string;
    checkpoint_name: string;
    checkpoint_code?: string;
    location_description: string;
    qr_code?: string;
    nfc_tag?: string;
    gps_coordinates?: string;
    
    // Inspection requirements
    items_to_check?: string[];
    
    status: 'active' | 'inactive';
  };
}

export interface PatrolLog extends Entity {
  type: 'security.patrol_log';
  metadata: {
    route_uid: string;
    shift_uid: string;
    guard_uid: string;
    patrol_start_time: string;
    patrol_end_time?: string;
    
    // Checkpoints
    checkpoints_required: number;
    checkpoints_completed: number;
    missed_checkpoints?: string[];
    
    // Findings
    issues_found?: string;
    photos_taken?: string[];
    
    status: 'in-progress' | 'completed' | 'incomplete';
    notes?: string;
  };
}

export interface IncidentReport extends Entity {
  type: 'security.incident_report';
  metadata: {
    site_uid: string;
    incident_date: string;
    incident_time: string;
    reported_by_uid: string;
    
    // Incident details
    incident_type: 'theft' | 'vandalism' | 'trespassing' | 'medical-emergency' | 'fire' | 'suspicious-activity' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description: string;
    
    // People involved
    witness_uids?: string[];
    subject_description?: string;
    
    // Response
    action_taken?: string;
    police_notified?: boolean;
    police_case_number?: string;
    ambulance_called?: boolean;
    
    // Follow-up
    supervisor_notified?: boolean;
    client_notified?: boolean;
    status: 'draft' | 'submitted' | 'under-review' | 'closed';
    
    // Evidence
    evidence_uids?: string[];
  };
}

export interface IncidentEvidence extends Entity {
  type: 'security.incident_evidence';
  metadata: {
    incident_uid: string;
    evidence_type: 'photo' | 'video' | 'document' | 'audio';
    file_url?: string;
    timestamp: string;
    collected_by_uid?: string;
    description?: string;
  };
}

export interface AccessLog extends Entity {
  type: 'security.access_log';
  metadata: {
    site_uid: string;
    access_point: string;
    timestamp: string;
    
    // Person
    person_name?: string;
    person_type: 'employee' | 'visitor' | 'contractor' | 'delivery' | 'unknown';
    credential_id?: string;
    
    // Access
    access_type: 'entry' | 'exit';
    access_granted: boolean;
    denial_reason?: string;
    
    // Verification
    verified_by_uid?: string;
    photo_uid?: string;
    
    notes?: string;
  };
}

export interface VisitorRecord extends Entity {
  type: 'security.visitor_record';
  metadata: {
    site_uid: string;
    visit_date: string;
    
    // Visitor details
    visitor_name: string;
    visitor_company?: string;
    visitor_phone?: string;
    visitor_id_type?: string;
    visitor_id_number?: string;
    
    // Visit details
    purpose: string;
    host_name?: string;
    host_department?: string;
    
    // Badge & Access
    badge_number?: string;
    badge_issued_time?: string;
    badge_returned_time?: string;
    
    // Times
    check_in_time: string;
    expected_duration_minutes?: number;
    check_out_time?: string;
    
    // Security
    escorted: boolean;
    authorized_by_uid?: string;
    photo_uid?: string;
    
    status: 'checked-in' | 'on-site' | 'checked-out' | 'overstayed';
  };
}

export interface ContractorRecord extends Entity {
  type: 'security.contractor_record';
  metadata: {
    site_uid: string;
    contractor_company: string;
    contractor_name: string;
    contractor_phone?: string;
    work_order_number?: string;
    
    // Work details
    work_description: string;
    work_location: string;
    scheduled_start: string;
    scheduled_end: string;
    
    // Access
    badge_issued?: string;
    access_areas?: string[];
    
    // Safety
    safety_briefing_completed?: boolean;
    ppe_verified?: boolean;
    insurance_verified?: boolean;
    
    status: 'approved' | 'on-site' | 'completed' | 'cancelled';
  };
}

export interface AlarmEvent extends Entity {
  type: 'security.alarm_event';
  metadata: {
    site_uid: string;
    alarm_type: 'intrusion' | 'fire' | 'panic' | 'medical' | 'technical';
    alarm_zone?: string;
    trigger_time: string;
    
    // Response
    acknowledged_time?: string;
    acknowledged_by_uid?: string;
    
    // Investigation
    false_alarm: boolean;
    cause?: string;
    
    // Resolution
    resolved_time?: string;
    resolved_by_uid?: string;
    
    status: 'triggered' | 'acknowledged' | 'investigating' | 'resolved' | 'false-alarm';
    notes?: string;
  };
}

export interface ResponseAction extends Entity {
  type: 'security.response_action';
  metadata: {
    incident_uid?: string;
    alarm_uid?: string;
    action_type: 'patrol-dispatch' | 'police-call' | 'evacuation' | 'lockdown' | 'first-aid' | 'investigation';
    action_timestamp: string;
    assigned_to_uid?: string;
    action_taken: string;
    outcome?: string;
    status: 'pending' | 'in-progress' | 'completed';
  };
}

export interface EquipmentItem extends Entity {
  type: 'security.equipment_item';
  metadata: {
    equipment_type: 'radio' | 'flashlight' | 'vest' | 'vehicle' | 'camera' | 'keys' | 'other';
    equipment_id: string;
    description?: string;
    serial_number?: string;
    condition: 'good' | 'fair' | 'poor' | 'broken';
    status: 'available' | 'assigned' | 'maintenance' | 'lost' | 'retired';
    last_maintenance_date?: string;
  };
}

export interface EquipmentAssignment extends Entity {
  type: 'security.equipment_assignment';
  metadata: {
    equipment_uid: string;
    guard_uid: string;
    shift_uid?: string;
    assigned_time: string;
    returned_time?: string;
    condition_on_return?: 'good' | 'fair' | 'poor' | 'broken';
    notes?: string;
  };
}

export interface TrainingRecord extends Entity {
  type: 'security.training_record';
  metadata: {
    guard_uid: string;
    training_type: string;
    training_date: string;
    trainer_uid?: string;
    duration_hours?: number;
    passed: boolean;
    certificate_number?: string;
    expiry_date?: string;
    notes?: string;
  };
}

export interface RiskAssessment extends Entity {
  type: 'security.risk_assessment';
  metadata: {
    site_uid: string;
    assessment_date: string;
    assessor_uid: string;
    
    // Risk identification
    risk_category: 'physical-security' | 'access-control' | 'fire-safety' | 'emergency-response' | 'other';
    risk_description: string;
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    
    // Mitigation
    current_controls?: string;
    recommended_actions?: string;
    
    status: 'draft' | 'approved' | 'implemented';
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createGuardShift(data: {
  site_uid: string;
  guard_uid: string;
  shift_date: string;
  shift_type: 'day' | 'night' | 'swing';
  start_time: string;
  position: 'static' | 'mobile' | 'supervisor';
}): GuardShift {
  return {
    uid: `shift-${Date.now()}`,
    type: 'security.guard_shift',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      guard_uid: data.guard_uid,
      shift_date: data.shift_date,
      shift_type: data.shift_type,
      start_time: data.start_time,
      position: data.position,
      status: 'scheduled',
    },
  };
}

export function createIncidentReport(data: {
  site_uid: string;
  incident_date: string;
  incident_time: string;
  reported_by_uid: string;
  incident_type: 'theft' | 'vandalism' | 'trespassing' | 'medical-emergency' | 'fire' | 'suspicious-activity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
}): IncidentReport {
  return {
    uid: `incident-${Date.now()}`,
    type: 'security.incident_report',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      incident_date: data.incident_date,
      incident_time: data.incident_time,
      reported_by_uid: data.reported_by_uid,
      incident_type: data.incident_type,
      severity: data.severity,
      location: data.location,
      description: data.description,
      status: 'draft',
    },
  };
}

export function createVisitorRecord(data: {
  site_uid: string;
  visit_date: string;
  visitor_name: string;
  purpose: string;
  check_in_time: string;
  escorted: boolean;
}): VisitorRecord {
  return {
    uid: `visitor-${Date.now()}`,
    type: 'security.visitor_record',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      visit_date: data.visit_date,
      visitor_name: data.visitor_name,
      purpose: data.purpose,
      check_in_time: data.check_in_time,
      escorted: data.escorted,
      status: 'checked-in',
    },
  };
}

export function createAlarmEvent(data: {
  site_uid: string;
  alarm_type: 'intrusion' | 'fire' | 'panic' | 'medical' | 'technical';
  trigger_time: string;
  alarm_zone?: string;
}): AlarmEvent {
  return {
    uid: `alarm-${Date.now()}`,
    type: 'security.alarm_event',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      alarm_type: data.alarm_type,
      alarm_zone: data.alarm_zone,
      trigger_time: data.trigger_time,
      false_alarm: false,
      status: 'triggered',
    },
  };
}

export function createPatrolLog(data: {
  route_uid: string;
  shift_uid: string;
  guard_uid: string;
  checkpoints_required: number;
}): PatrolLog {
  return {
    uid: `patrol-${Date.now()}`,
    type: 'security.patrol_log',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      route_uid: data.route_uid,
      shift_uid: data.shift_uid,
      guard_uid: data.guard_uid,
      patrol_start_time: new Date().toISOString(),
      checkpoints_required: data.checkpoints_required,
      checkpoints_completed: 0,
      status: 'in-progress',
    },
  };
}

// Query helpers
export function getActiveShifts(shifts: GuardShift[]): GuardShift[] {
  return shifts.filter(s => s.metadata.status === 'active');
}

export function getOpenIncidents(incidents: IncidentReport[]): IncidentReport[] {
  return incidents.filter(i => i.metadata.status !== 'closed');
}

export function getOverstayedVisitors(visitors: VisitorRecord[]): VisitorRecord[] {
  const now = new Date();
  return visitors.filter(v => {
    if (v.metadata.status !== 'on-site' && v.metadata.status !== 'checked-in') {
      return false;
    }
    if (!v.metadata.expected_duration_minutes) {
      return false;
    }
    const checkIn = new Date(v.metadata.check_in_time);
    const expectedCheckout = new Date(checkIn.getTime() + v.metadata.expected_duration_minutes * 60000);
    return now > expectedCheckout;
  });
}

export function calculatePatrolCompletionRate(log: PatrolLog): number {
  if (log.metadata.checkpoints_required === 0) return 0;
  return (log.metadata.checkpoints_completed / log.metadata.checkpoints_required) * 100;
}

export function getExpiredTraining(records: TrainingRecord[]): TrainingRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return records.filter(r => 
    r.metadata.expiry_date && 
    r.metadata.expiry_date < today
  );
}
