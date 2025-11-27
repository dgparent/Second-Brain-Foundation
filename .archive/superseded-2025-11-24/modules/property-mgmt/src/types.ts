/**
 * Property Management Module Types
 */

export interface BaseEntity {
  uid: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export type PropertyType = 'residential' | 'commercial' | 'mixed-use' | 'industrial';
export type UnitType = 'apartment' | 'house' | 'condo' | 'office' | 'retail' | 'warehouse';
export type UnitStatus = 'vacant' | 'occupied' | 'maintenance' | 'unavailable';
export type LeaseStatus = 'draft' | 'active' | 'expiring-soon' | 'expired' | 'terminated' | 'renewed';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus = 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export type InspectionType = 'move-in' | 'move-out' | 'annual' | 'safety' | 'compliance';
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'late' | 'failed';

export interface Property extends BaseEntity {
  property_name: string;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  year_built?: number;
  square_footage?: number;
  lot_size?: number;
  owner_uid?: string;
  manager_uid: string;
  acquisition_date?: Date;
  acquisition_price?: number;
  current_value?: number;
  tax_parcel_id?: string;
  notes?: string;
  tags: string[];
}

export interface Unit extends BaseEntity {
  property_uid: string;
  unit_number: string;
  unit_type: UnitType;
  status: UnitStatus;
  bedrooms: number;
  bathrooms: number;
  square_footage: number;
  floor_number?: number;
  monthly_rent: number;
  deposit_amount: number;
  current_tenant_uid?: string;
  current_lease_uid?: string;
  last_renovated?: Date;
  amenities: string[];
  pet_friendly: boolean;
  smoking_allowed: boolean;
  notes?: string;
}

export interface TenantProfile extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  employment_info?: {
    employer: string;
    position: string;
    monthly_income: number;
  };
  current_unit_uid?: string;
  active_lease_uid?: string;
  move_in_date?: Date;
  move_out_date?: Date;
  lease_history_uids: string[];
  payment_history_uids: string[];
  screening_score?: number;
  background_check_completed: boolean;
  credit_check_completed: boolean;
  notes?: string;
}

export interface LeaseContract extends BaseEntity {
  property_uid: string;
  unit_uid: string;
  tenant_uids: string[];
  start_date: Date;
  end_date: Date;
  status: LeaseStatus;
  monthly_rent: number;
  security_deposit: number;
  deposit_paid: boolean;
  lease_term_months: number;
  payment_day_of_month: number;
  late_fee_amount?: number;
  late_fee_grace_days?: number;
  auto_renewal: boolean;
  renewal_notice_days?: number;
  lease_document_uid?: string;
  special_terms?: string;
  utilities_included: string[];
  pet_deposit?: number;
  notes?: string;
}

export interface RentInvoice extends BaseEntity {
  lease_uid: string;
  tenant_uid: string;
  unit_uid: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  period_start: Date;
  period_end: Date;
  rent_amount: number;
  additional_charges: Array<{
    description: string;
    amount: number;
  }>;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: PaymentStatus;
  late_fee_applied?: number;
  notes?: string;
}

export interface PaymentRecord extends BaseEntity {
  invoice_uid: string;
  tenant_uid: string;
  payment_date: Date;
  amount: number;
  payment_method: 'cash' | 'check' | 'bank-transfer' | 'credit-card' | 'online';
  transaction_id?: string;
  notes?: string;
}

export interface MaintenanceRequest extends BaseEntity {
  property_uid: string;
  unit_uid?: string;
  submitted_by_uid: string;
  submitted_by_type: 'tenant' | 'manager' | 'inspector' | 'other';
  request_date: Date;
  category: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assigned_vendor_uid?: string;
  work_order_uid?: string;
  estimated_cost?: number;
  actual_cost?: number;
  completion_date?: Date;
  photos: string[];
  notes?: string;
}

export interface WorkOrder extends BaseEntity {
  maintenance_request_uid?: string;
  property_uid: string;
  unit_uid?: string;
  work_order_number: string;
  title: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assigned_vendor_uid: string;
  scheduled_date?: Date;
  completed_date?: Date;
  estimated_cost: number;
  actual_cost?: number;
  labor_hours?: number;
  materials_used: Array<{
    item: string;
    quantity: number;
    cost: number;
  }>;
  completion_notes?: string;
  tenant_access_required: boolean;
  tenant_notified: boolean;
}

export interface VendorProfile extends BaseEntity {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address?: string;
  service_categories: string[];
  license_number?: string;
  insurance_verified: boolean;
  insurance_expiry?: Date;
  hourly_rate?: number;
  rating?: number;
  work_order_history_uids: string[];
  notes?: string;
}

export interface InspectionRecord extends BaseEntity {
  property_uid: string;
  unit_uid?: string;
  inspection_type: InspectionType;
  inspection_date: Date;
  inspector_uid: string;
  tenant_uid?: string;
  checklist_items: Array<{
    area: string;
    item: string;
    condition: 'good' | 'fair' | 'poor' | 'damaged';
    notes?: string;
    photo_urls?: string[];
  }>;
  overall_condition: 'excellent' | 'good' | 'fair' | 'poor';
  issues_found: string[];
  required_repairs: string[];
  estimated_repair_cost?: number;
  report_document_uid?: string;
  tenant_signature?: string;
  inspector_signature?: string;
  signature_date?: Date;
  notes?: string;
}

export interface PropertyDocument extends BaseEntity {
  property_uid?: string;
  unit_uid?: string;
  tenant_uid?: string;
  lease_uid?: string;
  document_type: string;
  title: string;
  file_path: string;
  file_hash?: string;
  upload_date: Date;
  uploaded_by_uid: string;
  confidential: boolean;
  expiry_date?: Date;
  tags: string[];
  notes?: string;
}

export interface OccupancyRecord extends BaseEntity {
  property_uid: string;
  unit_uid: string;
  tenant_uid: string;
  lease_uid: string;
  move_in_date: Date;
  move_out_date?: Date;
  move_in_inspection_uid?: string;
  move_out_inspection_uid?: string;
  keys_issued: number;
  keys_returned?: number;
  forwarding_address?: string;
  notes?: string;
}
