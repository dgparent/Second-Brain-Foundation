/**
 * @sbf/property-ops - Property Operations Module
 * 
 * Provides entity definitions, helpers, and workflows for real estate property management
 * including tenant lifecycle, maintenance, rent collection, and inspections.
 * 
 * @packageDocumentation
 */

import type { Entity } from '@sbf/shared';

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface PropertyEntity extends Entity {
  type: 'property.property';
  metadata: {
    title: string;
    address: string;
    property_type: 'residential_single' | 'residential_multi_unit' | 'commercial' | 'mixed_use' | 'industrial';
    owner_uid: string;
    
    num_buildings?: number;
    total_units?: number;
    year_built?: number;
    square_feet?: number;
    lot_size?: number;
    notes?: string;
  };
}

export interface BuildingEntity extends Entity {
  type: 'property.building';
  metadata: {
    property_uid: string;
    building_name: string;
    address?: string;
    floors?: number;
    units?: number;
    year_built?: number;
    notes?: string;
  };
}

export interface UnitEntity extends Entity {
  type: 'property.unit';
  metadata: {
    building_uid: string;
    unit_number: string;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    status: 'vacant' | 'occupied' | 'maintenance' | 'unavailable';
    
    tenant_uid?: string;
    rent_amount?: number;
    floor?: number;
    unit_type?: 'apartment' | 'condo' | 'townhouse' | 'office' | 'retail' | 'other';
    amenities?: string[];
    notes?: string;
  };
}

export interface TenantProfileEntity extends Entity {
  type: 'property.tenant';
  metadata: {
    name: string;
    contact: {
      email?: string;
      phone?: string;
    };
    move_in_date: string;
    
    employer?: string;
    income_verified?: boolean;
    emergency_contact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    move_out_date?: string;
    notes?: string;
  };
}

export interface TenantApplicationEntity extends Entity {
  type: 'property.application';
  metadata: {
    property_uid: string;
    applicant_name: string;
    email: string;
    income: number;
    employment_status: string;
    application_status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
    
    desired_move_in_date?: string;
    references?: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    credit_score?: number;
    background_check_status?: 'pending' | 'passed' | 'failed';
    notes?: string;
  };
}

export interface LeaseContractEntity extends Entity {
  type: 'property.lease';
  metadata: {
    unit_uid: string;
    tenant_uid: string;
    start_date: string;
    end_date: string;
    rent_amount: number;
    deposit_amount: number;
    deposit_status: 'held' | 'returned' | 'applied';
    
    payment_due_day?: number; // 1-31
    auto_renew?: boolean;
    notice_period_days?: number;
    lease_type?: 'fixed' | 'month_to_month' | 'commercial';
    terms?: string;
    notes?: string;
  };
}

export interface RentInvoiceEntity extends Entity {
  type: 'property.rent_invoice';
  metadata: {
    unit_uid: string;
    tenant_uid: string;
    period: string; // e.g., "2025-03"
    amount_due: number;
    status: 'unpaid' | 'partial' | 'paid' | 'overdue';
    
    late_fee?: number;
    due_date?: string;
    issue_date?: string;
    notes?: string;
  };
}

export interface PaymentRecordEntity extends Entity {
  type: 'property.payment';
  metadata: {
    rent_invoice_uid: string;
    amount: number;
    payment_date: string;
    method: 'cash' | 'check' | 'e_transfer' | 'credit_card' | 'wire' | 'other';
    status: 'pending' | 'cleared' | 'failed' | 'refunded';
    
    transaction_id?: string;
    notes?: string;
  };
}

export interface MaintenanceRequestEntity extends Entity {
  type: 'property.maintenance_request';
  metadata: {
    unit_uid: string;
    reported_by: string;
    issue_type: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'pest' | 'other';
    priority: 'low' | 'medium' | 'high' | 'emergency';
    description: string;
    status: 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    
    reported_date?: string;
    work_order_uid?: string;
    completion_date?: string;
    photos?: string[];
    notes?: string;
  };
}

export interface WorkOrderEntity extends Entity {
  type: 'property.work_order';
  metadata: {
    related_request_uid?: string;
    unit_uid?: string;
    assigned_vendor_uid: string;
    description: string;
    status: 'draft' | 'dispatched' | 'in_progress' | 'completed' | 'cancelled';
    
    dispatch_date?: string;
    completion_date?: string;
    cost_estimate?: number;
    cost_actual?: number;
    priority?: 'low' | 'medium' | 'high' | 'emergency';
    notes?: string;
  };
}

export interface VendorProfileEntity extends Entity {
  type: 'property.vendor';
  metadata: {
    name: string;
    contact: {
      phone?: string;
      email?: string;
      address?: string;
    };
    
    specialties?: string[];
    licenses?: string[];
    insurance_expiry?: string;
    rating?: number; // 0-5
    hourly_rate?: number;
    notes?: string;
  };
}

export interface InspectionRecordEntity extends Entity {
  type: 'property.inspection';
  metadata: {
    unit_uid: string;
    inspection_type: 'move_in' | 'move_out' | 'annual' | 'maintenance' | 'compliance' | 'other';
    inspector_uid: string;
    date: string;
    
    condition_rating?: 'excellent' | 'good' | 'fair' | 'poor';
    photos?: string[];
    issues_found?: string[];
    recommendations?: string[];
    notes?: string;
  };
}

export interface ServiceContractEntity extends Entity {
  type: 'property.service_contract';
  metadata: {
    vendor_uid: string;
    property_uid: string;
    type_of_service: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'expired' | 'cancelled';
    
    cost_per_month?: number;
    cost_per_year?: number;
    auto_renew?: boolean;
    terms?: string;
    notes?: string;
  };
}

export interface UtilityMeterEntity extends Entity {
  type: 'property.utility_meter';
  metadata: {
    unit_uid: string;
    utility_type: 'water' | 'electricity' | 'gas' | 'heat' | 'other';
    meter_number?: string;
    installation_date?: string;
    notes?: string;
  };
}

export interface UtilityReadingEntity extends Entity {
  type: 'property.utility_reading';
  metadata: {
    meter_uid: string;
    reading_date: string;
    value: number;
    unit?: string; // e.g., "kWh", "m³", "therms"
    notes?: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createProperty(data: {
  title: string;
  address: string;
  propertyType: PropertyEntity['metadata']['property_type'];
  ownerUid: string;
}): PropertyEntity {
  return {
    uid: `prop-${Date.now()}`,
    type: 'property.property',
    metadata: {
      title: data.title,
      address: data.address,
      property_type: data.propertyType,
      owner_uid: data.ownerUid,
    },
  };
}

export function createUnit(data: {
  buildingUid: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rentAmount?: number;
}): UnitEntity {
  return {
    uid: `unit-${Date.now()}`,
    type: 'property.unit',
    metadata: {
      building_uid: data.buildingUid,
      unit_number: data.unitNumber,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      square_feet: data.squareFeet,
      status: 'vacant',
      rent_amount: data.rentAmount,
    },
  };
}

export function createLease(data: {
  unitUid: string;
  tenantUid: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
}): LeaseContractEntity {
  return {
    uid: `lease-${Date.now()}`,
    type: 'property.lease',
    metadata: {
      unit_uid: data.unitUid,
      tenant_uid: data.tenantUid,
      start_date: data.startDate,
      end_date: data.endDate,
      rent_amount: data.rentAmount,
      deposit_amount: data.depositAmount,
      deposit_status: 'held',
      payment_due_day: 1,
      notice_period_days: 60,
    },
  };
}

export function createRentInvoice(data: {
  unitUid: string;
  tenantUid: string;
  period: string;
  amountDue: number;
}): RentInvoiceEntity {
  return {
    uid: `inv-rent-${Date.now()}`,
    type: 'property.rent_invoice',
    metadata: {
      unit_uid: data.unitUid,
      tenant_uid: data.tenantUid,
      period: data.period,
      amount_due: data.amountDue,
      status: 'unpaid',
      issue_date: new Date().toISOString().split('T')[0],
    },
  };
}

export function createMaintenanceRequest(data: {
  unitUid: string;
  reportedBy: string;
  issueType: MaintenanceRequestEntity['metadata']['issue_type'];
  priority: MaintenanceRequestEntity['metadata']['priority'];
  description: string;
}): MaintenanceRequestEntity {
  return {
    uid: `mr-${Date.now()}`,
    type: 'property.maintenance_request',
    metadata: {
      unit_uid: data.unitUid,
      reported_by: data.reportedBy,
      issue_type: data.issueType,
      priority: data.priority,
      description: data.description,
      status: 'new',
      reported_date: new Date().toISOString().split('T')[0],
    },
  };
}

export function createWorkOrder(data: {
  requestUid?: string;
  unitUid?: string;
  vendorUid: string;
  description: string;
  costEstimate?: number;
}): WorkOrderEntity {
  return {
    uid: `wo-${Date.now()}`,
    type: 'property.work_order',
    metadata: {
      related_request_uid: data.requestUid,
      unit_uid: data.unitUid,
      assigned_vendor_uid: data.vendorUid,
      description: data.description,
      status: 'draft',
      cost_estimate: data.costEstimate,
    },
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export function getVacantUnits(units: UnitEntity[]): UnitEntity[] {
  return units.filter(u => u.metadata.status === 'vacant');
}

export function getOccupiedUnits(units: UnitEntity[]): UnitEntity[] {
  return units.filter(u => u.metadata.status === 'occupied');
}

export function getUnitsByBuilding(units: UnitEntity[], buildingUid: string): UnitEntity[] {
  return units.filter(u => u.metadata.building_uid === buildingUid);
}

export function getUnpaidInvoices(invoices: RentInvoiceEntity[]): RentInvoiceEntity[] {
  return invoices.filter(i => i.metadata.status === 'unpaid' || i.metadata.status === 'overdue');
}

export function getOverdueInvoices(invoices: RentInvoiceEntity[]): RentInvoiceEntity[] {
  return invoices.filter(i => i.metadata.status === 'overdue');
}

export function calculateOccupancyRate(units: UnitEntity[]): number {
  if (units.length === 0) return 0;
  const occupied = units.filter(u => u.metadata.status === 'occupied').length;
  return (occupied / units.length) * 100;
}

export function calculateCollectionRate(invoices: RentInvoiceEntity[]): number {
  if (invoices.length === 0) return 0;
  const paid = invoices.filter(i => i.metadata.status === 'paid').length;
  return (paid / invoices.length) * 100;
}

export function getOpenMaintenanceRequests(requests: MaintenanceRequestEntity[]): MaintenanceRequestEntity[] {
  return requests.filter(r => 
    r.metadata.status === 'new' || 
    r.metadata.status === 'assigned' || 
    r.metadata.status === 'in_progress'
  );
}

export function getMaintenanceByPriority(
  requests: MaintenanceRequestEntity[], 
  priority: MaintenanceRequestEntity['metadata']['priority']
): MaintenanceRequestEntity[] {
  return requests.filter(r => r.metadata.priority === priority);
}

export function calculateMonthlyRevenue(invoices: RentInvoiceEntity[], period: string): number {
  return invoices
    .filter(i => i.metadata.period === period)
    .reduce((total, inv) => total + inv.metadata.amount_due, 0);
}

export function getExpiringLeases(leases: LeaseContractEntity[], daysAhead: number = 60): LeaseContractEntity[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return leases
    .filter(l => {
      const endDate = new Date(l.metadata.end_date);
      return endDate >= today && endDate <= futureDate;
    })
    .sort((a, b) => 
      new Date(a.metadata.end_date).getTime() - new Date(b.metadata.end_date).getTime()
    );
}

export function getVendorsBySpecialty(vendors: VendorProfileEntity[], specialty: string): VendorProfileEntity[] {
  return vendors.filter(v => 
    v.metadata.specialties?.includes(specialty)
  );
}

export function calculateAverageMaintenanceCost(workOrders: WorkOrderEntity[]): number {
  const completed = workOrders.filter(w => 
    w.metadata.status === 'completed' && w.metadata.cost_actual
  );
  
  if (completed.length === 0) return 0;
  
  const total = completed.reduce((sum, wo) => sum + (wo.metadata.cost_actual || 0), 0);
  return total / completed.length;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  PropertyEntity,
  BuildingEntity,
  UnitEntity,
  TenantProfileEntity,
  TenantApplicationEntity,
  LeaseContractEntity,
  RentInvoiceEntity,
  PaymentRecordEntity,
  MaintenanceRequestEntity,
  WorkOrderEntity,
  VendorProfileEntity,
  InspectionRecordEntity,
  ServiceContractEntity,
  UtilityMeterEntity,
  UtilityReadingEntity,
};
