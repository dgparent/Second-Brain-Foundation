/**
 * Legal Operations Module
 * 
 * Provides case/matter management, discovery workflows, filing deadlines,
 * evidence management, legal research integration, and billing tracking
 * for law firms and legal departments.
 */

// ============================================================================
// BASE ENTITY TYPE
// ============================================================================

export interface BaseEntity {
  uid: string;
  type: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// CORE TYPES
// ============================================================================

export type MatterStatus = 'intake' | 'active' | 'discovery' | 'trial' | 'settlement' | 'appeal' | 'closed' | 'archived';
export type MatterType = 'civil-litigation' | 'criminal-defense' | 'corporate' | 'family-law' | 'employment' | 'real-estate' | 'intellectual-property' | 'bankruptcy' | 'other';
export type PartyRole = 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'third-party' | 'witness' | 'expert';
export type FilingStatus = 'pending' | 'filed' | 'accepted' | 'rejected' | 'amended';
export type DiscoveryType = 'interrogatories' | 'request-for-production' | 'request-for-admission' | 'deposition' | 'subpoena';
export type DiscoveryStatus = 'draft' | 'sent' | 'received' | 'responded' | 'objected' | 'overdue';
export type EvidenceType = 'document' | 'photograph' | 'video' | 'audio' | 'physical-object' | 'digital-data' | 'testimony';
export type EvidenceStatus = 'collected' | 'reviewed' | 'analyzed' | 'authenticated' | 'admitted' | 'excluded';
export type DocumentPrivilege = 'none' | 'attorney-client' | 'work-product' | 'settlement-negotiation' | 'other';
export type BillingType = 'hourly' | 'flat-fee' | 'contingency' | 'retainer' | 'pro-bono';
export type TimeEntryCategory = 'research' | 'drafting' | 'court-appearance' | 'client-meeting' | 'discovery' | 'travel' | 'administrative' | 'other';

// ============================================================================
// ENTITY INTERFACES
// ============================================================================

/**
 * Legal Matter (Case)
 * Central entity representing a legal case or matter
 */
export interface LegalMatter extends BaseEntity {
  matter_number: string;
  title: string;
  matter_type: MatterType;
  status: MatterStatus;
  client_uids: string[];
  opposing_party_uids: string[];
  opposing_counsel_uids: string[];
  court_record_uid?: string;
  lead_attorney_uid: string;
  supporting_staff_uids: string[];
  filing_date?: Date;
  close_date?: Date;
  statute_of_limitations?: Date;
  billing_type: BillingType;
  billing_rate?: number;
  retainer_amount?: number;
  estimated_value?: number;
  jurisdiction: string;
  venue?: string;
  practice_area: string;
  confidential: boolean;
  tags: string[];
  notes?: string;
}

/**
 * Case Party
 * Represents parties involved in a legal matter
 */
export interface CaseParty extends BaseEntity {
  matter_uid: string;
  party_role: PartyRole;
  name: string;
  entity_type: 'individual' | 'corporation' | 'government' | 'organization';
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  represented_by_counsel: boolean;
  counsel_uid?: string;
  notes?: string;
}

/**
 * Opposing Counsel
 */
export interface OpposingCounsel extends BaseEntity {
  name: string;
  firm_name?: string;
  bar_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  matters_involved: string[];
  communication_preference?: string;
  notes?: string;
}

/**
 * Court Record
 * Tracks court-specific information for a matter
 */
export interface CourtRecord extends BaseEntity {
  matter_uid: string;
  court_name: string;
  court_type: string;
  case_number: string;
  judge_name?: string;
  filing_date: Date;
  jurisdiction: string;
  venue: string;
  docket_link?: string;
  notes?: string;
}

/**
 * Filing Deadline
 * Tracks critical legal deadlines and filing requirements
 */
export interface FilingDeadline extends BaseEntity {
  matter_uid: string;
  title: string;
  deadline_date: Date;
  filing_type: string;
  jurisdiction_rule?: string;
  status: FilingStatus;
  responsible_attorney_uid: string;
  related_task_uids: string[];
  document_uids: string[];
  filed_date?: Date;
  confirmation_number?: string;
  extension_requested: boolean;
  extension_granted_until?: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Hearing Event
 * Represents court hearings, depositions, and other scheduled events
 */
export interface HearingEvent extends BaseEntity {
  matter_uid: string;
  title: string;
  event_type: 'hearing' | 'trial' | 'deposition' | 'mediation' | 'arbitration' | 'conference';
  scheduled_date: Date;
  duration_minutes?: number;
  location: string;
  virtual_link?: string;
  judge_name?: string;
  attending_attorneys: string[];
  purpose: string;
  preparation_task_uids: string[];
  exhibit_uids: string[];
  outcome?: string;
  transcript_uid?: string;
  notes?: string;
}

/**
 * Discovery Request
 * Outgoing discovery requests to opposing parties
 */
export interface DiscoveryRequest extends BaseEntity {
  matter_uid: string;
  request_type: DiscoveryType;
  issued_by_uid: string;
  issued_to_party_uid: string;
  issue_date: Date;
  due_date: Date;
  status: DiscoveryStatus;
  request_text: string;
  response_uid?: string;
  objection_notes?: string;
  follow_up_required: boolean;
  related_evidence_uids: string[];
  notes?: string;
}

/**
 * Discovery Response
 * Incoming discovery responses and obligations
 */
export interface DiscoveryResponse extends BaseEntity {
  matter_uid: string;
  request_uid?: string;
  response_type: DiscoveryType;
  received_from_party_uid: string;
  received_date: Date;
  due_date?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'objected' | 'overdue';
  response_text?: string;
  document_uids: string[];
  reviewed_by_uid?: string;
  review_date?: Date;
  notes?: string;
}

/**
 * Evidence Item
 * Physical or digital evidence related to a matter
 */
export interface EvidenceItem extends BaseEntity {
  matter_uid: string;
  evidence_type: EvidenceType;
  status: EvidenceStatus;
  title: string;
  description: string;
  source: string;
  collection_date: Date;
  collected_by_uid: string;
  chain_of_custody: Array<{
    date: Date;
    transferred_to: string;
    transferred_by: string;
    notes?: string;
  }>;
  storage_location: string;
  file_path?: string;
  file_hash?: string;
  authenticated: boolean;
  authenticated_by_uid?: string;
  authentication_date?: Date;
  related_discovery_uid?: string;
  exhibit_number?: string;
  privilege_level: DocumentPrivilege;
  tags: string[];
  notes?: string;
}

/**
 * Document Record
 * Legal documents (pleadings, motions, briefs, contracts, etc.)
 */
export interface DocumentRecord extends BaseEntity {
  matter_uid: string;
  document_type: string;
  title: string;
  file_path: string;
  file_hash?: string;
  version: number;
  author_uid: string;
  created_date: Date;
  filed_date?: Date;
  privilege_level: DocumentPrivilege;
  confidential: boolean;
  signing_required: boolean;
  signed: boolean;
  signed_by_uid?: string;
  signing_date?: Date;
  related_filing_uid?: string;
  related_evidence_uids: string[];
  ocr_completed: boolean;
  searchable_text?: string;
  tags: string[];
  notes?: string;
}

/**
 * Time Entry
 * Billable and non-billable time tracking
 */
export interface TimeEntry extends BaseEntity {
  matter_uid: string;
  attorney_uid: string;
  entry_date: Date;
  duration_minutes: number;
  category: TimeEntryCategory;
  description: string;
  billable: boolean;
  hourly_rate?: number;
  amount?: number;
  invoice_uid?: string;
  invoiced: boolean;
  notes?: string;
}

/**
 * Invoice Record
 * Legal billing and invoicing
 */
export interface InvoiceRecord extends BaseEntity {
  matter_uid: string;
  client_uid: string;
  invoice_number: string;
  invoice_date: Date;
  due_date: Date;
  period_start: Date;
  period_end: Date;
  time_entry_uids: string[];
  subtotal: number;
  expenses: number;
  tax: number;
  total: number;
  amount_paid: number;
  balance: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_date?: Date;
  payment_method?: string;
  notes?: string;
}

/**
 * Legal Research Note
 * Research findings, case law, statutes
 */
export interface LegalResearchNote extends BaseEntity {
  matter_uid?: string;
  topic: string;
  summary: string;
  content: string;
  researcher_uid: string;
  research_date: Date;
  sources: Array<{
    type: 'case-law' | 'statute' | 'regulation' | 'article' | 'treatise' | 'other';
    citation: string;
    link?: string;
    relevance: string;
  }>;
  precedent_uids: string[];
  related_matter_uids: string[];
  tags: string[];
}

/**
 * Precedent Reference
 * Case law and legal precedents
 */
export interface PrecedentReference extends BaseEntity {
  case_name: string;
  citation: string;
  court: string;
  decision_date: Date;
  jurisdiction: string;
  summary: string;
  key_holdings: string[];
  relevance_to_practice: string;
  full_text_link?: string;
  used_in_matter_uids: string[];
  tags: string[];
}

/**
 * Compliance Flag
 * Regulatory and compliance tracking
 */
export interface ComplianceFlag extends BaseEntity {
  matter_uid?: string;
  document_uid?: string;
  requirement_type: string;
  description: string;
  regulatory_source: string;
  due_date?: Date;
  status: 'pending' | 'in-compliance' | 'non-compliant' | 'exempt';
  responsible_uid: string;
  verification_date?: Date;
  verified_by_uid?: string;
  notes?: string;
}

/**
 * Retention Record
 * Document retention policy tracking
 */
export interface RetentionRecord extends BaseEntity {
  entity_uid: string;
  entity_type: 'matter' | 'document' | 'evidence';
  retention_policy: string;
  retention_period_years: number;
  creation_date: Date;
  destruction_eligible_date: Date;
  destruction_date?: Date;
  destroyed_by_uid?: string;
  legal_hold: boolean;
  legal_hold_reason?: string;
  legal_hold_date?: Date;
  notes?: string;
}

/**
 * Client Profile
 * Client information for legal matters
 */
export interface ClientProfile extends BaseEntity {
  name: string;
  client_type: 'individual' | 'business' | 'government' | 'non-profit';
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  billing_address?: string;
  tax_id?: string;
  active: boolean;
  conflict_checked: boolean;
  conflict_check_date?: Date;
  matter_uids: string[];
  billing_preferences?: {
    billing_type: BillingType;
    payment_terms_days?: number;
    preferred_payment_method?: string;
  };
  communication_preferences?: {
    email?: boolean;
    phone?: boolean;
    portal?: boolean;
  };
  notes?: string;
}
