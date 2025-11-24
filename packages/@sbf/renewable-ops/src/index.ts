/**
 * Renewable Energy Operations Module
 * 
 * Provides entity definitions for solar and wind energy operations,
 * including maintenance, inspections, performance monitoring, and compliance.
 * 
 * @module @sbf/renewable-ops
 */

import { Entity } from '@sbf/core';

// ============================================================================
// Core Entities
// ============================================================================

export interface EnergySite extends Entity {
  type: 'renewable.energy_site';
  metadata: {
    site_name: string;
    site_code: string;
    site_type: 'solar-ground' | 'solar-rooftop' | 'wind-onshore' | 'hybrid';
    location: string;
    gps_coordinates?: string;
    
    // Capacity
    installed_capacity_kw: number;
    commissioned_date?: string;
    
    // Operations
    owner_uid?: string;
    operator_uid?: string;
    epc_contractor_uid?: string;
    
    // Grid connection
    grid_connection_uid?: string;
    export_tariff?: number;
    
    status: 'operational' | 'under-construction' | 'maintenance' | 'decommissioned';
    notes?: string;
  };
}

export interface ArrayBlock extends Entity {
  type: 'renewable.array_block';
  metadata: {
    site_uid: string;
    block_name: string;
    block_code?: string;
    
    // Solar-specific
    panel_count?: number;
    panel_model?: string;
    panel_wattage?: number;
    string_count?: number;
    
    // Configuration
    tilt_angle?: number;
    azimuth?: number;
    
    // Performance
    capacity_kw?: number;
    inverter_uids?: string[];
    
    status: 'operational' | 'degraded' | 'offline' | 'maintenance';
  };
}

export interface TurbineUnit extends Entity {
  type: 'renewable.turbine_unit';
  metadata: {
    site_uid: string;
    turbine_name: string;
    turbine_code?: string;
    
    // Specifications
    manufacturer?: string;
    model?: string;
    capacity_kw: number;
    hub_height_meters?: number;
    rotor_diameter_meters?: number;
    
    // Installation
    installation_date?: string;
    warranty_expiry?: string;
    
    // Performance
    inverter_uid?: string;
    
    status: 'operational' | 'degraded' | 'offline' | 'maintenance';
  };
}

export interface Inverter extends Entity {
  type: 'renewable.inverter';
  metadata: {
    site_uid: string;
    inverter_name: string;
    serial_number?: string;
    manufacturer?: string;
    model?: string;
    capacity_kw: number;
    
    // Connection
    array_block_uid?: string;
    turbine_uid?: string;
    
    // Performance
    efficiency_percentage?: number;
    last_reading_timestamp?: string;
    
    status: 'operational' | 'fault' | 'offline' | 'maintenance';
  };
}

export interface StringLine extends Entity {
  type: 'renewable.string_line';
  metadata: {
    array_block_uid: string;
    string_name: string;
    string_number: number;
    panel_count: number;
    voltage_rating?: number;
    current_rating?: number;
    
    // Performance
    performance_ratio?: number;
    
    status: 'operational' | 'underperforming' | 'offline' | 'fault';
  };
}

export interface WeatherStation extends Entity {
  type: 'renewable.weather_station';
  metadata: {
    site_uid: string;
    station_name: string;
    gps_coordinates?: string;
    
    // Sensors
    irradiance_sensor?: boolean;
    wind_speed_sensor?: boolean;
    temperature_sensor?: boolean;
    humidity_sensor?: boolean;
    
    last_reading_timestamp?: string;
    status: 'operational' | 'offline' | 'calibration-due';
  };
}

export interface GenerationLog extends Entity {
  type: 'renewable.generation_log';
  metadata: {
    site_uid?: string;
    inverter_uid?: string;
    turbine_uid?: string;
    
    timestamp: string;
    
    // Solar generation
    irradiance_w_per_m2?: number;
    panel_temperature_c?: number;
    
    // Wind generation
    wind_speed_m_per_s?: number;
    
    // Power output
    power_output_kw: number;
    energy_kwh?: number;
    
    // Grid
    grid_voltage_v?: number;
    grid_frequency_hz?: number;
    exported_to_grid_kwh?: number;
  };
}

export interface EfficiencyReport extends Entity {
  type: 'renewable.efficiency_report';
  metadata: {
    site_uid: string;
    report_period_start: string;
    report_period_end: string;
    
    // Production
    total_generation_kwh: number;
    expected_generation_kwh?: number;
    performance_ratio_percentage?: number;
    
    // Availability
    availability_percentage?: number;
    downtime_hours?: number;
    
    // Environmental
    irradiance_kwh_per_m2?: number;
    average_wind_speed?: number;
    
    // Financial
    revenue_generated?: number;
    
    notes?: string;
  };
}

export interface InspectionRecord extends Entity {
  type: 'renewable.inspection_record';
  metadata: {
    site_uid: string;
    inspection_date: string;
    inspection_type: 'visual' | 'electrical' | 'mechanical' | 'thermographic' | 'drone' | 'annual-compliance';
    inspector_uid: string;
    
    // Scope
    array_block_uids?: string[];
    turbine_uids?: string[];
    inverter_uids?: string[];
    
    // Findings
    issues_found?: number;
    critical_issues?: number;
    findings_summary?: string;
    
    // Results
    status: 'passed' | 'failed' | 'conditional';
    photos_uids?: string[];
    report_url?: string;
    
    next_inspection_due?: string;
  };
}

export interface MaintenanceRequest extends Entity {
  type: 'renewable.maintenance_request';
  metadata: {
    site_uid: string;
    request_date: string;
    request_type: 'preventive' | 'corrective' | 'emergency';
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    // Asset
    asset_type: 'inverter' | 'panel' | 'turbine' | 'string' | 'weather-station' | 'other';
    asset_uid?: string;
    
    // Issue
    issue_description: string;
    fault_code?: string;
    
    // Assignment
    assigned_to_uid?: string;
    
    status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  };
}

export interface WorkOrder extends Entity {
  type: 'renewable.work_order';
  metadata: {
    maintenance_request_uid?: string;
    site_uid: string;
    work_order_number: string;
    
    // Scheduling
    scheduled_date?: string;
    scheduled_time?: string;
    estimated_duration_hours?: number;
    
    // Assignment
    technician_uids?: string[];
    contractor_uid?: string;
    
    // Work details
    work_description: string;
    parts_required?: string[];
    
    // Execution
    actual_start_time?: string;
    actual_end_time?: string;
    work_performed?: string;
    parts_used?: string[];
    
    // Results
    issue_resolved: boolean;
    follow_up_required?: boolean;
    
    status: 'created' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    completion_notes?: string;
  };
}

export interface SafetyIncident extends Entity {
  type: 'renewable.safety_incident';
  metadata: {
    site_uid: string;
    incident_date: string;
    incident_type: 'electrical-shock' | 'fall' | 'equipment-failure' | 'near-miss' | 'environmental' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    
    // Details
    location: string;
    description: string;
    personnel_involved?: string[];
    witness_uids?: string[];
    
    // Response
    immediate_action_taken?: string;
    medical_attention_required?: boolean;
    
    // Investigation
    root_cause?: string;
    corrective_actions?: string;
    
    reported_by_uid: string;
    status: 'reported' | 'investigating' | 'resolved';
  };
}

export interface EnvironmentalLog extends Entity {
  type: 'renewable.environmental_log';
  metadata: {
    site_uid: string;
    log_date: string;
    
    // Environmental impact
    co2_offset_kg?: number;
    trees_equivalent?: number;
    
    // Wildlife
    bird_strikes?: number;
    wildlife_observations?: string;
    
    // Spill or contamination
    spill_incident?: boolean;
    spill_description?: string;
    
    // Noise
    noise_complaints?: number;
    
    // Compliance
    regulatory_inspection?: boolean;
    violations?: string[];
    
    notes?: string;
  };
}

export interface FaultEvent extends Entity {
  type: 'renewable.fault_event';
  metadata: {
    site_uid: string;
    fault_timestamp: string;
    
    // Asset
    asset_type: 'inverter' | 'panel' | 'turbine' | 'string' | 'weather-station' | 'grid-connection';
    asset_uid?: string;
    
    // Fault details
    fault_code?: string;
    fault_description: string;
    severity: 'minor' | 'major' | 'critical';
    
    // Impact
    production_loss_kwh?: number;
    downtime_hours?: number;
    
    // Resolution
    acknowledged_time?: string;
    acknowledged_by_uid?: string;
    resolved_time?: string;
    resolution_notes?: string;
    
    status: 'active' | 'acknowledged' | 'resolved';
  };
}

export interface TechnicianProfile extends Entity {
  type: 'renewable.technician_profile';
  metadata: {
    full_name: string;
    employee_id?: string;
    certifications?: string[];
    specialization: 'solar' | 'wind' | 'electrical' | 'mechanical' | 'general';
    
    // Qualifications
    high_voltage_certified?: boolean;
    working_at_heights_certified?: boolean;
    certification_expiry_dates?: Record<string, string>;
    
    // Contact
    phone?: string;
    email?: string;
    
    status: 'active' | 'inactive';
  };
}

export interface TechnicianShift extends Entity {
  type: 'renewable.technician_shift';
  metadata: {
    technician_uid: string;
    site_uid: string;
    shift_date: string;
    start_time: string;
    end_time?: string;
    
    // Tasks
    work_order_uids?: string[];
    tasks_completed?: number;
    
    // Travel
    travel_distance_km?: number;
    
    notes?: string;
  };
}

export interface SparePart extends Entity {
  type: 'renewable.spare_part';
  metadata: {
    part_name: string;
    part_number?: string;
    manufacturer?: string;
    
    // Inventory
    quantity_in_stock: number;
    reorder_level?: number;
    unit_cost?: number;
    
    // Compatibility
    compatible_with?: string[];
    
    storage_location?: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'obsolete';
  };
}

export interface PartUsageRecord extends Entity {
  type: 'renewable.part_usage_record';
  metadata: {
    work_order_uid: string;
    spare_part_uid: string;
    quantity_used: number;
    used_date: string;
    technician_uid?: string;
  };
}

export interface GridInterconnectionRecord extends Entity {
  type: 'renewable.grid_interconnection_record';
  metadata: {
    site_uid: string;
    utility_company: string;
    connection_point: string;
    
    // Capacity
    approved_capacity_kw: number;
    export_limit_kw?: number;
    
    // Agreement
    ppa_agreement?: boolean;
    tariff_rate?: number;
    contract_expiry?: string;
    
    // Metering
    import_meter_id?: string;
    export_meter_id?: string;
    
    status: 'active' | 'pending' | 'disconnected';
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createEnergySite(data: {
  site_name: string;
  site_code: string;
  site_type: 'solar-ground' | 'solar-rooftop' | 'wind-onshore' | 'hybrid';
  location: string;
  installed_capacity_kw: number;
}): EnergySite {
  return {
    uid: `energy-site-${Date.now()}`,
    type: 'renewable.energy_site',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_name: data.site_name,
      site_code: data.site_code,
      site_type: data.site_type,
      location: data.location,
      installed_capacity_kw: data.installed_capacity_kw,
      status: 'operational',
    },
  };
}

export function createGenerationLog(data: {
  site_uid: string;
  inverter_uid?: string;
  power_output_kw: number;
  timestamp?: string;
}): GenerationLog {
  return {
    uid: `gen-log-${Date.now()}`,
    type: 'renewable.generation_log',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      inverter_uid: data.inverter_uid,
      timestamp: data.timestamp || new Date().toISOString(),
      power_output_kw: data.power_output_kw,
    },
  };
}

export function createMaintenanceRequest(data: {
  site_uid: string;
  request_type: 'preventive' | 'corrective' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  asset_type: 'inverter' | 'panel' | 'turbine' | 'string' | 'weather-station' | 'other';
  issue_description: string;
}): MaintenanceRequest {
  return {
    uid: `maint-req-${Date.now()}`,
    type: 'renewable.maintenance_request',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      request_date: new Date().toISOString(),
      request_type: data.request_type,
      priority: data.priority,
      asset_type: data.asset_type,
      issue_description: data.issue_description,
      status: 'pending',
    },
  };
}

export function createFaultEvent(data: {
  site_uid: string;
  asset_type: 'inverter' | 'panel' | 'turbine' | 'string' | 'weather-station' | 'grid-connection';
  fault_description: string;
  severity: 'minor' | 'major' | 'critical';
}): FaultEvent {
  return {
    uid: `fault-${Date.now()}`,
    type: 'renewable.fault_event',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      fault_timestamp: new Date().toISOString(),
      asset_type: data.asset_type,
      fault_description: data.fault_description,
      severity: data.severity,
      status: 'active',
    },
  };
}

export function createWorkOrder(data: {
  site_uid: string;
  work_order_number: string;
  work_description: string;
  maintenance_request_uid?: string;
}): WorkOrder {
  return {
    uid: `wo-${Date.now()}`,
    type: 'renewable.work_order',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    metadata: {
      site_uid: data.site_uid,
      work_order_number: data.work_order_number,
      work_description: data.work_description,
      maintenance_request_uid: data.maintenance_request_uid,
      issue_resolved: false,
      status: 'created',
    },
  };
}

// Query helpers
export function getActiveFaults(faults: FaultEvent[]): FaultEvent[] {
  return faults.filter(f => f.metadata.status === 'active');
}

export function getCriticalFaults(faults: FaultEvent[]): FaultEvent[] {
  return faults.filter(f => f.metadata.severity === 'critical' && f.metadata.status === 'active');
}

export function getOpenMaintenanceRequests(requests: MaintenanceRequest[]): MaintenanceRequest[] {
  return requests.filter(r => r.metadata.status !== 'completed' && r.metadata.status !== 'cancelled');
}

export function calculatePerformanceRatio(
  actual_generation_kwh: number,
  expected_generation_kwh: number
): number {
  if (expected_generation_kwh === 0) return 0;
  return Math.round((actual_generation_kwh / expected_generation_kwh) * 100 * 100) / 100;
}

export function calculateAvailability(
  total_hours: number,
  downtime_hours: number
): number {
  if (total_hours === 0) return 0;
  return Math.round(((total_hours - downtime_hours) / total_hours) * 100 * 100) / 100;
}

export function getLowStockParts(parts: SparePart[]): SparePart[] {
  return parts.filter(p => 
    p.metadata.reorder_level && 
    p.metadata.quantity_in_stock <= p.metadata.reorder_level
  );
}

export function calculateCO2Offset(energy_kwh: number): number {
  // Assuming 0.5 kg CO2 per kWh (typical grid emission factor)
  return Math.round(energy_kwh * 0.5 * 100) / 100;
}
