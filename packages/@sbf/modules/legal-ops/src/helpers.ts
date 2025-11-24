/**
 * Legal Operations Helper Functions
 */

import {
  LegalMatter,
  CaseParty,
  OpposingCounsel,
  CourtRecord,
  FilingDeadline,
  HearingEvent,
  DiscoveryRequest,
  DiscoveryResponse,
  EvidenceItem,
  DocumentRecord,
  TimeEntry,
  InvoiceRecord,
  LegalResearchNote,
  PrecedentReference,
  ComplianceFlag,
  RetentionRecord,
  ClientProfile,
  MatterStatus,
  MatterType,
  DiscoveryStatus,
  EvidenceStatus,
  DocumentPrivilege,
} from './types';

// ============================================================================
// LEGAL MATTER FUNCTIONS
// ============================================================================

export function createLegalMatter(data: Partial<LegalMatter>): LegalMatter {
  return {
    uid: data.uid || `matter-${Date.now()}`,
    type: 'legal_matter',
    matter_number: data.matter_number || '',
    title: data.title || '',
    matter_type: data.matter_type || 'civil-litigation',
    status: data.status || 'intake',
    client_uids: data.client_uids || [],
    opposing_party_uids: data.opposing_party_uids || [],
    opposing_counsel_uids: data.opposing_counsel_uids || [],
    lead_attorney_uid: data.lead_attorney_uid || '',
    supporting_staff_uids: data.supporting_staff_uids || [],
    billing_type: data.billing_type || 'hourly',
    jurisdiction: data.jurisdiction || '',
    practice_area: data.practice_area || '',
    confidential: data.confidential ?? true,
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as LegalMatter;
}

export function getMattersByStatus(matters: LegalMatter[], status: MatterStatus): LegalMatter[] {
  return matters.filter(m => m.status === status);
}

export function getMattersByType(matters: LegalMatter[], type: MatterType): LegalMatter[] {
  return matters.filter(m => m.matter_type === type);
}

export function getMattersByClient(matters: LegalMatter[], clientUid: string): LegalMatter[] {
  return matters.filter(m => m.client_uids.includes(clientUid));
}

export function getMattersByAttorney(matters: LegalMatter[], attorneyUid: string): LegalMatter[] {
  return matters.filter(m => 
    m.lead_attorney_uid === attorneyUid || m.supporting_staff_uids.includes(attorneyUid)
  );
}

export function updateMatterStatus(matter: LegalMatter, newStatus: MatterStatus): LegalMatter {
  return {
    ...matter,
    status: newStatus,
    updated_at: new Date(),
  };
}

export function closeMatter(matter: LegalMatter, closeDate: Date = new Date()): LegalMatter {
  return {
    ...matter,
    status: 'closed',
    close_date: closeDate,
    updated_at: new Date(),
  };
}

// ============================================================================
// FILING DEADLINE FUNCTIONS
// ============================================================================

export function createFilingDeadline(data: Partial<FilingDeadline>): FilingDeadline {
  return {
    uid: data.uid || `filing-${Date.now()}`,
    type: 'filing_deadline',
    matter_uid: data.matter_uid || '',
    title: data.title || '',
    deadline_date: data.deadline_date || new Date(),
    filing_type: data.filing_type || '',
    status: data.status || 'pending',
    responsible_attorney_uid: data.responsible_attorney_uid || '',
    related_task_uids: data.related_task_uids || [],
    document_uids: data.document_uids || [],
    extension_requested: data.extension_requested ?? false,
    priority: data.priority || 'medium',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as FilingDeadline;
}

export function getUpcomingDeadlines(
  deadlines: FilingDeadline[],
  daysAhead: number = 30
): FilingDeadline[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return deadlines
    .filter(d => d.status === 'pending' && d.deadline_date <= cutoffDate)
    .sort((a, b) => a.deadline_date.getTime() - b.deadline_date.getTime());
}

export function getOverdueDeadlines(deadlines: FilingDeadline[]): FilingDeadline[] {
  const now = new Date();
  return deadlines.filter(d => d.status === 'pending' && d.deadline_date < now);
}

export function markDeadlineFiled(
  deadline: FilingDeadline,
  filedDate: Date = new Date(),
  confirmationNumber?: string
): FilingDeadline {
  return {
    ...deadline,
    status: 'filed',
    filed_date: filedDate,
    confirmation_number: confirmationNumber,
    updated_at: new Date(),
  };
}

// ============================================================================
// DISCOVERY FUNCTIONS
// ============================================================================

export function createDiscoveryRequest(data: Partial<DiscoveryRequest>): DiscoveryRequest {
  return {
    uid: data.uid || `disc-req-${Date.now()}`,
    type: 'discovery_request',
    matter_uid: data.matter_uid || '',
    request_type: data.request_type || 'interrogatories',
    issued_by_uid: data.issued_by_uid || '',
    issued_to_party_uid: data.issued_to_party_uid || '',
    issue_date: data.issue_date || new Date(),
    due_date: data.due_date || new Date(),
    status: data.status || 'draft',
    request_text: data.request_text || '',
    follow_up_required: data.follow_up_required ?? false,
    related_evidence_uids: data.related_evidence_uids || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as DiscoveryRequest;
}

export function createDiscoveryResponse(data: Partial<DiscoveryResponse>): DiscoveryResponse {
  return {
    uid: data.uid || `disc-resp-${Date.now()}`,
    type: 'discovery_response',
    matter_uid: data.matter_uid || '',
    response_type: data.response_type || 'interrogatories',
    received_from_party_uid: data.received_from_party_uid || '',
    received_date: data.received_date || new Date(),
    status: data.status || 'pending',
    document_uids: data.document_uids || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as DiscoveryResponse;
}

export function getDiscoveryByStatus(
  requests: DiscoveryRequest[],
  status: DiscoveryStatus
): DiscoveryRequest[] {
  return requests.filter(r => r.status === status);
}

export function getOverdueDiscovery(requests: DiscoveryRequest[]): DiscoveryRequest[] {
  const now = new Date();
  return requests.filter(r => r.status !== 'responded' && r.due_date < now);
}

// ============================================================================
// EVIDENCE FUNCTIONS
// ============================================================================

export function createEvidenceItem(data: Partial<EvidenceItem>): EvidenceItem {
  return {
    uid: data.uid || `evidence-${Date.now()}`,
    type: 'evidence_item',
    matter_uid: data.matter_uid || '',
    evidence_type: data.evidence_type || 'document',
    status: data.status || 'collected',
    title: data.title || '',
    description: data.description || '',
    source: data.source || '',
    collection_date: data.collection_date || new Date(),
    collected_by_uid: data.collected_by_uid || '',
    chain_of_custody: data.chain_of_custody || [],
    storage_location: data.storage_location || '',
    authenticated: data.authenticated ?? false,
    privilege_level: data.privilege_level || 'none',
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as EvidenceItem;
}

export function addChainOfCustody(
  evidence: EvidenceItem,
  transferredTo: string,
  transferredBy: string,
  notes?: string
): EvidenceItem {
  return {
    ...evidence,
    chain_of_custody: [
      ...evidence.chain_of_custody,
      {
        date: new Date(),
        transferred_to: transferredTo,
        transferred_by: transferredBy,
        notes,
      },
    ],
    updated_at: new Date(),
  };
}

export function authenticateEvidence(
  evidence: EvidenceItem,
  authenticatedByUid: string
): EvidenceItem {
  return {
    ...evidence,
    status: 'authenticated',
    authenticated: true,
    authenticated_by_uid: authenticatedByUid,
    authentication_date: new Date(),
    updated_at: new Date(),
  };
}

export function getEvidenceByStatus(
  evidence: EvidenceItem[],
  status: EvidenceStatus
): EvidenceItem[] {
  return evidence.filter(e => e.status === status);
}

export function getPrivilegedEvidence(evidence: EvidenceItem[]): EvidenceItem[] {
  return evidence.filter(e => e.privilege_level !== 'none');
}

// ============================================================================
// DOCUMENT FUNCTIONS
// ============================================================================

export function createDocumentRecord(data: Partial<DocumentRecord>): DocumentRecord {
  return {
    uid: data.uid || `doc-${Date.now()}`,
    type: 'document_record',
    matter_uid: data.matter_uid || '',
    document_type: data.document_type || '',
    title: data.title || '',
    file_path: data.file_path || '',
    version: data.version || 1,
    author_uid: data.author_uid || '',
    created_date: data.created_date || new Date(),
    privilege_level: data.privilege_level || 'none',
    confidential: data.confidential ?? false,
    signing_required: data.signing_required ?? false,
    signed: data.signed ?? false,
    related_evidence_uids: data.related_evidence_uids || [],
    ocr_completed: data.ocr_completed ?? false,
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as DocumentRecord;
}

export function signDocument(
  document: DocumentRecord,
  signedByUid: string
): DocumentRecord {
  return {
    ...document,
    signed: true,
    signed_by_uid: signedByUid,
    signing_date: new Date(),
    updated_at: new Date(),
  };
}

export function getDocumentsByPrivilege(
  documents: DocumentRecord[],
  privilege: DocumentPrivilege
): DocumentRecord[] {
  return documents.filter(d => d.privilege_level === privilege);
}

export function getUnsignedDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  return documents.filter(d => d.signing_required && !d.signed);
}

// ============================================================================
// TIME ENTRY & BILLING FUNCTIONS
// ============================================================================

export function createTimeEntry(data: Partial<TimeEntry>): TimeEntry {
  const duration = data.duration_minutes || 0;
  const rate = data.hourly_rate || 0;
  const amount = (duration / 60) * rate;
  
  return {
    uid: data.uid || `time-${Date.now()}`,
    type: 'time_entry',
    matter_uid: data.matter_uid || '',
    attorney_uid: data.attorney_uid || '',
    entry_date: data.entry_date || new Date(),
    duration_minutes: duration,
    category: data.category || 'other',
    description: data.description || '',
    billable: data.billable ?? true,
    hourly_rate: rate,
    amount: data.billable !== false ? amount : 0,
    invoiced: data.invoiced ?? false,
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as TimeEntry;
}

export function createInvoiceRecord(data: Partial<InvoiceRecord>): InvoiceRecord {
  const subtotal = data.subtotal || 0;
  const expenses = data.expenses || 0;
  const tax = data.tax || 0;
  const total = subtotal + expenses + tax;
  
  return {
    uid: data.uid || `invoice-${Date.now()}`,
    type: 'invoice_record',
    matter_uid: data.matter_uid || '',
    client_uid: data.client_uid || '',
    invoice_number: data.invoice_number || '',
    invoice_date: data.invoice_date || new Date(),
    due_date: data.due_date || new Date(),
    period_start: data.period_start || new Date(),
    period_end: data.period_end || new Date(),
    time_entry_uids: data.time_entry_uids || [],
    subtotal,
    expenses,
    tax,
    total,
    amount_paid: data.amount_paid || 0,
    balance: total - (data.amount_paid || 0),
    status: data.status || 'draft',
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as InvoiceRecord;
}

export function getTimeEntriesByMatter(
  entries: TimeEntry[],
  matterUid: string
): TimeEntry[] {
  return entries.filter(e => e.matter_uid === matterUid);
}

export function getBillableTimeEntries(entries: TimeEntry[]): TimeEntry[] {
  return entries.filter(e => e.billable && !e.invoiced);
}

export function getUninvoicedTimeEntries(entries: TimeEntry[]): TimeEntry[] {
  return entries.filter(e => e.billable && !e.invoiced);
}

export function calculateTotalBillableTime(entries: TimeEntry[]): number {
  return entries
    .filter(e => e.billable)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
}

export function markTimeEntriesInvoiced(
  entries: TimeEntry[],
  invoiceUid: string
): TimeEntry[] {
  return entries.map(e => ({
    ...e,
    invoiced: true,
    invoice_uid: invoiceUid,
    updated_at: new Date(),
  }));
}

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

export function createClientProfile(data: Partial<ClientProfile>): ClientProfile {
  return {
    uid: data.uid || `client-${Date.now()}`,
    type: 'client_profile',
    name: data.name || '',
    client_type: data.client_type || 'individual',
    active: data.active ?? true,
    conflict_checked: data.conflict_checked ?? false,
    matter_uids: data.matter_uids || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as ClientProfile;
}

export function addMatterToClient(client: ClientProfile, matterUid: string): ClientProfile {
  return {
    ...client,
    matter_uids: [...client.matter_uids, matterUid],
    updated_at: new Date(),
  };
}

export function runConflictCheck(client: ClientProfile): ClientProfile {
  return {
    ...client,
    conflict_checked: true,
    conflict_check_date: new Date(),
    updated_at: new Date(),
  };
}

// ============================================================================
// HEARING FUNCTIONS
// ============================================================================

export function createHearingEvent(data: Partial<HearingEvent>): HearingEvent {
  return {
    uid: data.uid || `hearing-${Date.now()}`,
    type: 'hearing_event',
    matter_uid: data.matter_uid || '',
    title: data.title || '',
    event_type: data.event_type || 'hearing',
    scheduled_date: data.scheduled_date || new Date(),
    location: data.location || '',
    attending_attorneys: data.attending_attorneys || [],
    purpose: data.purpose || '',
    preparation_task_uids: data.preparation_task_uids || [],
    exhibit_uids: data.exhibit_uids || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as HearingEvent;
}

export function getUpcomingHearings(
  hearings: HearingEvent[],
  daysAhead: number = 30
): HearingEvent[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysAhead);
  
  return hearings
    .filter(h => h.scheduled_date <= cutoffDate && h.scheduled_date >= new Date())
    .sort((a, b) => a.scheduled_date.getTime() - b.scheduled_date.getTime());
}

// ============================================================================
// RESEARCH FUNCTIONS
// ============================================================================

export function createLegalResearchNote(data: Partial<LegalResearchNote>): LegalResearchNote {
  return {
    uid: data.uid || `research-${Date.now()}`,
    type: 'legal_research_note',
    topic: data.topic || '',
    summary: data.summary || '',
    content: data.content || '',
    researcher_uid: data.researcher_uid || '',
    research_date: data.research_date || new Date(),
    sources: data.sources || [],
    precedent_uids: data.precedent_uids || [],
    related_matter_uids: data.related_matter_uids || [],
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as LegalResearchNote;
}

export function createPrecedentReference(data: Partial<PrecedentReference>): PrecedentReference {
  return {
    uid: data.uid || `precedent-${Date.now()}`,
    type: 'precedent_reference',
    case_name: data.case_name || '',
    citation: data.citation || '',
    court: data.court || '',
    decision_date: data.decision_date || new Date(),
    jurisdiction: data.jurisdiction || '',
    summary: data.summary || '',
    key_holdings: data.key_holdings || [],
    relevance_to_practice: data.relevance_to_practice || '',
    used_in_matter_uids: data.used_in_matter_uids || [],
    tags: data.tags || [],
    created_at: new Date(),
    updated_at: new Date(),
    ...data,
  } as PrecedentReference;
}

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

export function getMatterStatistics(matters: LegalMatter[]) {
  return {
    total: matters.length,
    byStatus: matters.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<MatterStatus, number>),
    byType: matters.reduce((acc, m) => {
      acc[m.matter_type] = (acc[m.matter_type] || 0) + 1;
      return acc;
    }, {} as Record<MatterType, number>),
    active: matters.filter(m => m.status === 'active').length,
    intake: matters.filter(m => m.status === 'intake').length,
    closed: matters.filter(m => m.status === 'closed').length,
  };
}

export function getDiscoveryStatistics(requests: DiscoveryRequest[]) {
  return {
    total: requests.length,
    draft: requests.filter(r => r.status === 'draft').length,
    sent: requests.filter(r => r.status === 'sent').length,
    responded: requests.filter(r => r.status === 'responded').length,
    overdue: getOverdueDiscovery(requests).length,
  };
}

export function getBillingStatistics(invoices: InvoiceRecord[]) {
  return {
    total_invoices: invoices.length,
    total_billed: invoices.reduce((sum, inv) => sum + inv.total, 0),
    total_paid: invoices.reduce((sum, inv) => sum + inv.amount_paid, 0),
    total_outstanding: invoices.reduce((sum, inv) => sum + inv.balance, 0),
    paid_invoices: invoices.filter(inv => inv.status === 'paid').length,
    overdue_invoices: invoices.filter(inv => inv.status === 'overdue').length,
  };
}
