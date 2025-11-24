/**
 * @sbf/hospitality-ops
 * 
 * Hospitality Operations Module
 * Hotels, resorts, housekeeping, and guest management
 */

export const MODULE_NAME = '@sbf/hospitality-ops';
export const MODULE_VERSION = '0.1.0';

// Core types
export interface Property {
  uid: string;
  type: 'property';
  name: string;
  address: string;
  room_count?: number;
}

export interface Room {
  uid: string;
  type: 'room';
  property_uid: string;
  room_number: string;
  room_type_uid: string;
  status: 'available' | 'occupied' | 'dirty' | 'maintenance';
  amenities?: string[];
}

export interface BookingRecord {
  uid: string;
  type: 'booking_record';
  guest_uid: string;
  room_uid: string;
  checkin_date: string;
  checkout_date: string;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  price_total?: number;
}

export interface HousekeepingTask {
  uid: string;
  type: 'housekeeping_task';
  room_uid: string;
  task_type: 'turnover' | 'daily_clean' | 'deep_clean' | 'inspection';
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_time?: string;
}

export interface MaintenanceRequest {
  uid: string;
  type: 'maintenance_request';
  room_uid: string;
  reported_by: string;
  issue_type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'completed';
}

export interface IncidentReport {
  uid: string;
  type: 'incident_report';
  room_uid?: string;
  guest_uid?: string;
  type_of_incident: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  notes?: string;
}

// Main export
export default {
  MODULE_NAME,
  MODULE_VERSION,
};
