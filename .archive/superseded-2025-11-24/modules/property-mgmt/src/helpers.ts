/**
 * Property Management Helper Functions
 */

import {
  Property, Unit, TenantProfile, LeaseContract, RentInvoice, PaymentRecord,
  MaintenanceRequest, WorkOrder, VendorProfile, InspectionRecord,
  PropertyDocument, OccupancyRecord,
  PropertyType, UnitStatus, LeaseStatus, MaintenanceStatus, MaintenancePriority,
  InspectionType, PaymentStatus
} from './types';

// Property Functions
export function createProperty(data: Partial<Property>): Property {
  return {
    uid: data.uid || `property-${Date.now()}`,
    type: 'property',
    property_name: data.property_name || '',
    property_type: data.property_type || 'residential',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    zip_code: data.zip_code || '',
    total_units: data.total_units || 0,
    manager_uid: data.manager_uid || '',
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as Property;
}

// Unit Functions
export function createUnit(data: Partial<Unit>): Unit {
  return {
    uid: data.uid || `unit-${Date.now()}`,
    type: 'unit',
    property_uid: data.property_uid || '',
    unit_number: data.unit_number || '',
    unit_type: data.unit_type || 'apartment',
    status: data.status || 'vacant',
    bedrooms: data.bedrooms || 0,
    bathrooms: data.bathrooms || 0,
    square_footage: data.square_footage || 0,
    monthly_rent: data.monthly_rent || 0,
    deposit_amount: data.deposit_amount || 0,
    amenities: data.amenities || [],
    pet_friendly: data.pet_friendly ?? false,
    smoking_allowed: data.smoking_allowed ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as Unit;
}

export function getVacantUnits(units: Unit[]): Unit[] {
  return units.filter(u => u.status === 'vacant');
}

export function getOccupiedUnits(units: Unit[]): Unit[] {
  return units.filter(u => u.status === 'occupied');
}

export function updateUnitStatus(unit: Unit, status: UnitStatus): Unit {
  return {
    ...unit,
    status,
    updated_at: new Date(),
  };
}

// Tenant Functions
export function createTenantProfile(data: Partial<TenantProfile>): TenantProfile {
  return {
    uid: data.uid || `tenant-${Date.now()}`,
    type: 'tenant_profile',
    first_name: data.first_name || '',
    last_name: data.last_name || '',
    email: data.email || '',
    phone: data.phone || '',
    lease_history_uids: data.lease_history_uids || [],
    payment_history_uids: data.payment_history_uids || [],
    background_check_completed: data.background_check_completed ?? false,
    credit_check_completed: data.credit_check_completed ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as TenantProfile;
}

// Lease Functions
export function createLeaseContract(data: Partial<LeaseContract>): LeaseContract {
  return {
    uid: data.uid || `lease-${Date.now()}`,
    type: 'lease_contract',
    property_uid: data.property_uid || '',
    unit_uid: data.unit_uid || '',
    tenant_uids: data.tenant_uids || [],
    start_date: data.start_date || new Date(),
    end_date: data.end_date || new Date(),
    status: data.status || 'draft',
    monthly_rent: data.monthly_rent || 0,
    security_deposit: data.security_deposit || 0,
    deposit_paid: data.deposit_paid ?? false,
    lease_term_months: data.lease_term_months || 12,
    payment_day_of_month: data.payment_day_of_month || 1,
    auto_renewal: data.auto_renewal ?? false,
    utilities_included: data.utilities_included || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as LeaseContract;
}

export function getActiveLeases(leases: LeaseContract[]): LeaseContract[] {
  return leases.filter(l => l.status === 'active');
}

export function getExpiringLeases(leases: LeaseContract[], daysAhead: number = 60): LeaseContract[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  return leases.filter(l => l.status === 'active' && l.end_date <= cutoffDate);
}

export function renewLease(lease: LeaseContract, newEndDate: Date): LeaseContract {
  return {
    ...lease,
    end_date: newEndDate,
    status: 'renewed',
    updated_at: new Date(),
  };
}

// Rent & Payment Functions
export function createRentInvoice(data: Partial<RentInvoice>): RentInvoice {
  const rentAmount = data.rent_amount || 0;
  const additionalCharges = data.additional_charges || [];
  const additionalTotal = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  const total = rentAmount + additionalTotal;

  return {
    uid: data.uid || `invoice-${Date.now()}`,
    type: 'rent_invoice',
    lease_uid: data.lease_uid || '',
    tenant_uid: data.tenant_uid || '',
    unit_uid: data.unit_uid || '',
    invoice_number: data.invoice_number || '',
    invoice_date: data.invoice_date || new Date(),
    due_date: data.due_date || new Date(),
    period_start: data.period_start || new Date(),
    period_end: data.period_end || new Date(),
    rent_amount: rentAmount,
    additional_charges: additionalCharges,
    total_amount: total,
    amount_paid: data.amount_paid || 0,
    balance: total - (data.amount_paid || 0),
    status: data.status || 'pending',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as RentInvoice;
}

export function createPaymentRecord(data: Partial<PaymentRecord>): PaymentRecord {
  return {
    uid: data.uid || `payment-${Date.now()}`,
    type: 'payment_record',
    invoice_uid: data.invoice_uid || '',
    tenant_uid: data.tenant_uid || '',
    payment_date: data.payment_date || new Date(),
    amount: data.amount || 0,
    payment_method: data.payment_method || 'bank-transfer',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as PaymentRecord;
}

export function getOverdueInvoices(invoices: RentInvoice[]): RentInvoice[] {
  const now = new Date();
  return invoices.filter(inv => inv.status === 'pending' && inv.due_date < now);
}

export function getTotalRentDue(invoices: RentInvoice[]): number {
  return invoices.reduce((sum, inv) => sum + inv.balance, 0);
}

// Maintenance Functions
export function createMaintenanceRequest(data: Partial<MaintenanceRequest>): MaintenanceRequest {
  return {
    uid: data.uid || `maint-req-${Date.now()}`,
    type: 'maintenance_request',
    property_uid: data.property_uid || '',
    submitted_by_uid: data.submitted_by_uid || '',
    submitted_by_type: data.submitted_by_type || 'tenant',
    request_date: data.request_date || new Date(),
    category: data.category || '',
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'medium',
    status: data.status || 'open',
    photos: data.photos || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as MaintenanceRequest;
}

export function createWorkOrder(data: Partial<WorkOrder>): WorkOrder {
  return {
    uid: data.uid || `work-order-${Date.now()}`,
    type: 'work_order',
    property_uid: data.property_uid || '',
    work_order_number: data.work_order_number || '',
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    priority: data.priority || 'medium',
    status: data.status || 'open',
    assigned_vendor_uid: data.assigned_vendor_uid || '',
    estimated_cost: data.estimated_cost || 0,
    materials_used: data.materials_used || [],
    tenant_access_required: data.tenant_access_required ?? false,
    tenant_notified: data.tenant_notified ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as WorkOrder;
}

export function getOpenMaintenanceRequests(requests: MaintenanceRequest[]): MaintenanceRequest[] {
  return requests.filter(r => r.status === 'open');
}

export function getEmergencyMaintenance(requests: MaintenanceRequest[]): MaintenanceRequest[] {
  return requests.filter(r => r.priority === 'emergency' && r.status !== 'completed');
}

// Vendor Functions
export function createVendorProfile(data: Partial<VendorProfile>): VendorProfile {
  return {
    uid: data.uid || `vendor-${Date.now()}`,
    type: 'vendor_profile',
    company_name: data.company_name || '',
    contact_name: data.contact_name || '',
    email: data.email || '',
    phone: data.phone || '',
    service_categories: data.service_categories || [],
    insurance_verified: data.insurance_verified ?? false,
    work_order_history_uids: data.work_order_history_uids || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as VendorProfile;
}

// Inspection Functions
export function createInspectionRecord(data: Partial<InspectionRecord>): InspectionRecord {
  return {
    uid: data.uid || `inspection-${Date.now()}`,
    type: 'inspection_record',
    property_uid: data.property_uid || '',
    inspection_type: data.inspection_type || 'move-in',
    inspection_date: data.inspection_date || new Date(),
    inspector_uid: data.inspector_uid || '',
    checklist_items: data.checklist_items || [],
    overall_condition: data.overall_condition || 'good',
    issues_found: data.issues_found || [],
    required_repairs: data.required_repairs || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as InspectionRecord;
}

// Analytics Functions
export function getPropertyStatistics(properties: Property[], units: Unit[]) {
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'occupied').length;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  return {
    total_properties: properties.length,
    total_units: totalUnits,
    occupied_units: occupiedUnits,
    vacant_units: vacantUnits,
    occupancy_rate: occupancyRate.toFixed(2) + '%',
    maintenance_units: units.filter(u => u.status === 'maintenance').length,
  };
}

export function getFinancialStatistics(invoices: RentInvoice[], payments: PaymentRecord[]) {
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const overdueInvoices = getOverdueInvoices(invoices);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return {
    total_billed: totalBilled,
    total_paid: totalPaid,
    total_outstanding: totalOutstanding,
    total_overdue: totalOverdue,
    overdue_count: overdueInvoices.length,
  };
}

export function getMaintenanceStatistics(requests: MaintenanceRequest[], workOrders: WorkOrder[]) {
  return {
    total_requests: requests.length,
    open_requests: requests.filter(r => r.status === 'open').length,
    in_progress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    emergency_requests: requests.filter(r => r.priority === 'emergency').length,
    total_work_orders: workOrders.length,
    avg_completion_time: calculateAverageCompletionTime(requests),
  };
}

function calculateAverageCompletionTime(requests: MaintenanceRequest[]): number {
  const completedRequests = requests.filter(r => r.status === 'completed' && r.completion_date);
  if (completedRequests.length === 0) return 0;

  const totalDays = completedRequests.reduce((sum, r) => {
    const days = Math.floor((r.completion_date!.getTime() - r.request_date.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return totalDays / completedRequests.length;
}
