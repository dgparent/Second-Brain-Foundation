/**
 * @sbf/legal-ops - Legal Operations Module
 * 
 * Provides entity definitions, helpers, and workflows for legal practice management
 * including matter lifecycle, court operations, discovery, billing, and compliance.
 * 
 * @packageDocumentation
 */

import type { Entity } from '@sbf/shared';

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface LegalMatterEntity extends Entity {
  type: 'legal.matter';
  metadata: {
    // Core fields
    title: string;
    jurisdiction: string;
    matter_type: 'civil' | 'criminal' | 'corporate' | 'family' | 'real_estate' | 'employment' | 'other';
    client_uid: string;
    status: 'active' | 'pending' | 'closed' | 'on_hold';
    opened_date: string;
    
    // Optional fields
    opposing_uid?: string;
    case_number?: string;
    court_uid?: string;
    description?: string;
    closed_date?: string;
    outcome?: string;
    notes?: string;
  };
}

export interface ClientProfileEntity extends Entity {
  type: 'legal.client';
  metadata: {
    name: string;
    contact: {
      email?: string;
      phone?: string;
      address?: string;
    };
    client_type: 'individual' | 'corporate';
    
    // Optional fields
    company_name?: string;
    tax_id?: string;
    billing_contact?: string;
    notes?: string;
  };
}

export interface CasePartyEntity extends Entity {
  type: 'legal.party';
  metadata: {
    matter_uid: string;
    name: string;
    role: 'plaintiff' | 'defendant' | 'witness' | 'expert' | 'other';
    party_type: 'individual' | 'corporate';
    
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    counsel_uid?: string;
    notes?: string;
  };
}

export interface OpposingCounselEntity extends Entity {
  type: 'legal.opposing_counsel';
  metadata: {
    name: string;
    firm_name?: string;
    contact: {
      email?: string;
      phone?: string;
      address?: string;
    };
    bar_number?: string;
    jurisdiction?: string;
    notes?: string;
  };
}

export interface CourtRecordEntity extends Entity {
  type: 'legal.court_record';
  metadata: {
    matter_uid: string;
    court_name: string;
    jurisdiction: string;
    case_number?: string;
    judge_name?: string;
    court_room?: string;
    filing_date?: string;
    notes?: string;
  };
}

export interface FilingDeadlineEntity extends Entity {
  type: 'legal.filing_deadline';
  metadata: {
    matter_uid: string;
    description: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    origin?: string; // e.g., "Court Rule 18(1)"
    status?: 'pending' | 'completed' | 'extended' | 'missed';
    completed_date?: string;
    extension_date?: string;
    notes?: string;
  };
}

export interface LegalTaskEntity extends Entity {
  type: 'legal.task';
  metadata: {
    matter_uid: string;
    description: string;
    assigned_to: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
    task_type?: string;
    completion_date?: string;
    notes?: string;
  };
}

export interface HearingEventEntity extends Entity {
  type: 'legal.hearing';
  metadata: {
    matter_uid: string;
    date: string;
    time: string;
    location: string;
    hearing_type: 'motion' | 'trial' | 'pretrial' | 'settlement_conference' | 'other';
    
    judge_name?: string;
    room?: string;
    duration_minutes?: number;
    preparation_notes?: string;
    outcome_notes?: string;
    attendees?: string[];
  };
}

export interface EvidenceItemEntity extends Entity {
  type: 'legal.evidence';
  metadata: {
    matter_uid: string;
    description: string;
    
    evidence_type?: 'document' | 'physical' | 'digital' | 'testimony' | 'other';
    related_document_uid?: string;
    chain_of_custody: Array<{
      handler: string;
      time: string;
      action?: string;
    }>;
    location?: string;
    notes?: string;
  };
}

export interface DocumentRecordEntity extends Entity {
  type: 'legal.document';
  metadata: {
    matter_uid: string;
    doc_type: 'evidence' | 'filing' | 'correspondence' | 'research' | 'internal' | 'other';
    file_path?: string;
    
    confidentiality: 'public' | 'privileged' | 'attorney_client' | 'work_product';
    upload_date: string;
    uploaded_by?: string;
    version?: number;
    retention_date?: string;
    notes?: string;
  };
}

export interface DiscoveryRequestEntity extends Entity {
  type: 'legal.discovery_request';
  metadata: {
    matter_uid: string;
    request_type: 'interrogatories' | 'production' | 'admissions' | 'depositions';
    issued_by: string;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'responded' | 'overdue';
    
    description?: string;
    response_uid?: string;
    notes?: string;
  };
}

export interface DiscoveryResponseEntity extends Entity {
  type: 'legal.discovery_response';
  metadata: {
    matter_uid: string;
    response_to_uid: string;
    submitted_by: string;
    submission_date: string;
    
    documents?: string[];
    status?: 'complete' | 'partial' | 'supplemental_pending';
    notes?: string;
  };
}

export interface TimeEntryEntity extends Entity {
  type: 'legal.time_entry';
  metadata: {
    matter_uid: string;
    user_uid: string;
    activity: string;
    minutes: number;
    rate_per_hour: number;
    timestamp: string;
    
    billable?: boolean;
    task_uid?: string;
    notes?: string;
  };
}

export interface InvoiceRecordEntity extends Entity {
  type: 'legal.invoice';
  metadata: {
    matter_uid: string;
    issue_date: string;
    total_amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    
    line_items: Array<{
      description: string;
      amount: number;
      quantity?: number;
    }>;
    payment_date?: string;
    due_date?: string;
    notes?: string;
  };
}

export interface LegalResearchNoteEntity extends Entity {
  type: 'legal.research_note';
  metadata: {
    matter_uid?: string;
    title: string;
    content: string;
    author_uid: string;
    date: string;
    
    topics?: string[];
    precedent_uids?: string[];
    statute_references?: string[];
    notes?: string;
  };
}

export interface PrecedentReferenceEntity extends Entity {
  type: 'legal.precedent';
  metadata: {
    citation: string;
    case_name: string;
    court: string;
    year: number;
    
    jurisdiction?: string;
    summary?: string;
    key_principles?: string[];
    relevance_score?: number;
    notes?: string;
  };
}

export interface ComplianceFlagEntity extends Entity {
  type: 'legal.compliance_flag';
  metadata: {
    matter_uid: string;
    item_uid: string;
    flag_type: 'deadline' | 'privilege' | 'retention' | 'conflict' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'resolved' | 'escalated';
    
    description?: string;
    resolution_notes?: string;
    resolved_date?: string;
  };
}

export interface RetentionRecordEntity extends Entity {
  type: 'legal.retention';
  metadata: {
    matter_uid: string;
    document_uid: string;
    retention_period_years: number;
    retention_start_date: string;
    destruction_date: string;
    status: 'active' | 'expired' | 'destroyed' | 'permanent';
    
    destruction_date_actual?: string;
    destruction_method?: string;
    authorized_by?: string;
    notes?: string;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createLegalMatter(data: {
  title: string;
  jurisdiction: string;
  matterType: LegalMatterEntity['metadata']['matter_type'];
  clientUid: string;
  status?: LegalMatterEntity['metadata']['status'];
  openedDate?: string;
}): LegalMatterEntity {
  return {
    uid: `matter-${Date.now()}`,
    type: 'legal.matter',
    metadata: {
      title: data.title,
      jurisdiction: data.jurisdiction,
      matter_type: data.matterType,
      client_uid: data.clientUid,
      status: data.status || 'pending',
      opened_date: data.openedDate || new Date().toISOString().split('T')[0],
    },
  };
}

export function createFilingDeadline(data: {
  matterUid: string;
  description: string;
  dueDate: string;
  priority?: FilingDeadlineEntity['metadata']['priority'];
  origin?: string;
}): FilingDeadlineEntity {
  return {
    uid: `fd-${Date.now()}`,
    type: 'legal.filing_deadline',
    metadata: {
      matter_uid: data.matterUid,
      description: data.description,
      due_date: data.dueDate,
      priority: data.priority || 'medium',
      origin: data.origin,
      status: 'pending',
    },
  };
}

export function createEvidenceItem(data: {
  matterUid: string;
  description: string;
  evidenceType?: EvidenceItemEntity['metadata']['evidence_type'];
  documentUid?: string;
}): EvidenceItemEntity {
  return {
    uid: `ev-${Date.now()}`,
    type: 'legal.evidence',
    metadata: {
      matter_uid: data.matterUid,
      description: data.description,
      evidence_type: data.evidenceType,
      related_document_uid: data.documentUid,
      chain_of_custody: [],
    },
  };
}

export function createTimeEntry(data: {
  matterUid: string;
  userUid: string;
  activity: string;
  minutes: number;
  ratePerHour: number;
}): TimeEntryEntity {
  return {
    uid: `time-${Date.now()}`,
    type: 'legal.time_entry',
    metadata: {
      matter_uid: data.matterUid,
      user_uid: data.userUid,
      activity: data.activity,
      minutes: data.minutes,
      rate_per_hour: data.ratePerHour,
      timestamp: new Date().toISOString(),
      billable: true,
    },
  };
}

export function createInvoice(data: {
  matterUid: string;
  lineItems: Array<{ description: string; amount: number }>;
  issueDate?: string;
}): InvoiceRecordEntity {
  const total = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    uid: `invoice-${Date.now()}`,
    type: 'legal.invoice',
    metadata: {
      matter_uid: data.matterUid,
      issue_date: data.issueDate || new Date().toISOString().split('T')[0],
      total_amount: total,
      status: 'draft',
      line_items: data.lineItems,
    },
  };
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export function getMattersByClient(matters: LegalMatterEntity[], clientUid: string): LegalMatterEntity[] {
  return matters.filter(m => m.metadata.client_uid === clientUid);
}

export function getActiveMattersByClient(matters: LegalMatterEntity[], clientUid: string): LegalMatterEntity[] {
  return matters.filter(m => 
    m.metadata.client_uid === clientUid && 
    m.metadata.status === 'active'
  );
}

export function getUpcomingDeadlines(
  deadlines: FilingDeadlineEntity[], 
  daysAhead: number = 30
): FilingDeadlineEntity[] {
  const today = new Date();
  const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  return deadlines
    .filter(d => d.metadata.status === 'pending')
    .filter(d => {
      const dueDate = new Date(d.metadata.due_date);
      return dueDate >= today && dueDate <= futureDate;
    })
    .sort((a, b) => 
      new Date(a.metadata.due_date).getTime() - new Date(b.metadata.due_date).getTime()
    );
}

export function getOverdueDeadlines(deadlines: FilingDeadlineEntity[]): FilingDeadlineEntity[] {
  const today = new Date();
  
  return deadlines
    .filter(d => d.metadata.status === 'pending')
    .filter(d => new Date(d.metadata.due_date) < today)
    .sort((a, b) => 
      new Date(a.metadata.due_date).getTime() - new Date(b.metadata.due_date).getTime()
    );
}

export function calculateMatterBillableHours(timeEntries: TimeEntryEntity[], matterUid: string): number {
  return timeEntries
    .filter(e => e.metadata.matter_uid === matterUid && e.metadata.billable !== false)
    .reduce((total, entry) => total + entry.metadata.minutes, 0) / 60;
}

export function calculateMatterTotalFees(timeEntries: TimeEntryEntity[], matterUid: string): number {
  return timeEntries
    .filter(e => e.metadata.matter_uid === matterUid && e.metadata.billable !== false)
    .reduce((total, entry) => {
      const hours = entry.metadata.minutes / 60;
      return total + (hours * entry.metadata.rate_per_hour);
    }, 0);
}

export function addToCustodyChain(
  evidence: EvidenceItemEntity, 
  handler: string, 
  timestamp?: string
): EvidenceItemEntity {
  return {
    ...evidence,
    metadata: {
      ...evidence.metadata,
      chain_of_custody: [
        ...evidence.metadata.chain_of_custody,
        {
          handler,
          time: timestamp || new Date().toISOString(),
        },
      ],
    },
  };
}

export function getEvidenceByMatter(evidence: EvidenceItemEntity[], matterUid: string): EvidenceItemEntity[] {
  return evidence.filter(e => e.metadata.matter_uid === matterUid);
}

export function getPendingDiscoveryRequests(requests: DiscoveryRequestEntity[]): DiscoveryRequestEntity[] {
  return requests.filter(r => 
    r.metadata.status === 'sent' || r.metadata.status === 'overdue'
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  LegalMatterEntity,
  ClientProfileEntity,
  CasePartyEntity,
  OpposingCounselEntity,
  CourtRecordEntity,
  FilingDeadlineEntity,
  LegalTaskEntity,
  HearingEventEntity,
  EvidenceItemEntity,
  DocumentRecordEntity,
  DiscoveryRequestEntity,
  DiscoveryResponseEntity,
  TimeEntryEntity,
  InvoiceRecordEntity,
  LegalResearchNoteEntity,
  PrecedentReferenceEntity,
  ComplianceFlagEntity,
  RetentionRecordEntity,
};
