/**
 * @sbf/modules-logistics-ops
 * 
 * Logistics Operations Module
 * Freight forwarding, customs, and supply chain management
 */

export const MODULE_NAME = '@sbf/modules-logistics-ops';
export const MODULE_VERSION = '0.1.0';

// Core types
export interface ShipmentOrder {
  uid: string;
  type: 'shipment_order';
  customer_uid: string;
  service_type: string;
  incoterm?: string;
  origin_location_uid: string;
  destination_location_uid: string;
  requested_pickup?: string;
  requested_delivery?: string;
  status: 'quoted' | 'booked' | 'active' | 'delivered' | 'cancelled';
}

export interface Consignment {
  uid: string;
  type: 'consignment';
  shipment_order_uid: string;
  consignor_uid: string;
  consignee_uid: string;
  origin_location_uid: string;
  destination_location_uid: string;
  mode_mix: string[];
  status: 'planned' | 'active' | 'completed';
}

export interface LogisticUnit {
  uid: string;
  type: 'logistic_unit';
  sscc?: string;
  unit_type: string;
  package_count?: number;
  gross_weight_kg?: number;
  contents?: string[];
  equipment_uid?: string;
  status: 'created' | 'loaded' | 'in_transit' | 'delivered';
}

export interface TransportLeg {
  uid: string;
  type: 'transport_leg';
  consignment_uid: string;
  sequence: number;
  mode: 'road' | 'sea' | 'air' | 'rail';
  carrier_uid?: string;
  transport_means_uid?: string;
  origin_location_uid: string;
  destination_location_uid: string;
  planned_departure?: string;
  planned_arrival?: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface TransportEvent {
  uid: string;
  type: 'transport_event';
  event_time: string;
  event_type: string;
  location_uid?: string;
  related_consignment_uids?: string[];
  related_leg_uid?: string;
  status_code?: string;
}

export interface CustomsDeclaration {
  uid: string;
  type: 'customs_declaration';
  consignment_uid: string;
  export_country?: string;
  import_country?: string;
  declaration_type: 'export' | 'import';
  hs_codes?: Array<{ code: string; description?: string }>;
  value_currency?: string;
  value_amount?: number;
  documents?: string[];
  status: 'draft' | 'submitted' | 'cleared' | 'held';
}

// Main export
export default {
  MODULE_NAME,
  MODULE_VERSION,
};
