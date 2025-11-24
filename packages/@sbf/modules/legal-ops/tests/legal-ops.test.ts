/**
 * Tests for Legal Operations Module
 */

import {
  createLegalMatter,
  createFilingDeadline,
  createDiscoveryRequest,
  createDiscoveryResponse,
  createEvidenceItem,
  createDocumentRecord,
  createTimeEntry,
  createInvoiceRecord,
  createClientProfile,
  createHearingEvent,
  createLegalResearchNote,
  createPrecedentReference,
  getMattersByStatus,
  getMattersByType,
  getMattersByClient,
  getUpcomingDeadlines,
  getOverdueDeadlines,
  getDiscoveryByStatus,
  getOverdueDiscovery,
  authenticateEvidence,
  addChainOfCustody,
  signDocument,
  calculateTotalBillableTime,
  markTimeEntriesInvoiced,
  getMatterStatistics,
  getDiscoveryStatistics,
  getBillingStatistics,
  closeMatter,
  markDeadlineFiled,
  runConflictCheck,
  addMatterToClient,
} from '../src/helpers';

describe('Legal Operations Module', () => {
  describe('Legal Matter Management', () => {
    it('should create a legal matter', () => {
      const matter = createLegalMatter({
        matter_number: '2025-001',
        title: 'Smith v. Jones',
        matter_type: 'civil-litigation',
        status: 'intake',
        client_uids: ['client-001'],
        lead_attorney_uid: 'atty-001',
        jurisdiction: 'CA Superior Court',
        practice_area: 'Personal Injury',
        billing_type: 'contingency',
      });

      expect(matter.matter_number).toBe('2025-001');
      expect(matter.title).toBe('Smith v. Jones');
      expect(matter.matter_type).toBe('civil-litigation');
      expect(matter.status).toBe('intake');
      expect(matter.confidential).toBe(true);
    });

    it('should filter matters by status', () => {
      const matters = [
        createLegalMatter({ status: 'active' }),
        createLegalMatter({ status: 'intake' }),
        createLegalMatter({ status: 'active' }),
      ];

      const activeMatters = getMattersByStatus(matters, 'active');
      expect(activeMatters).toHaveLength(2);
    });

    it('should filter matters by type', () => {
      const matters = [
        createLegalMatter({ matter_type: 'civil-litigation' }),
        createLegalMatter({ matter_type: 'criminal-defense' }),
        createLegalMatter({ matter_type: 'civil-litigation' }),
      ];

      const civilMatters = getMattersByType(matters, 'civil-litigation');
      expect(civilMatters).toHaveLength(2);
    });

    it('should filter matters by client', () => {
      const matters = [
        createLegalMatter({ client_uids: ['client-001'] }),
        createLegalMatter({ client_uids: ['client-002'] }),
        createLegalMatter({ client_uids: ['client-001', 'client-003'] }),
      ];

      const clientMatters = getMattersByClient(matters, 'client-001');
      expect(clientMatters).toHaveLength(2);
    });

    it('should close a matter', () => {
      const matter = createLegalMatter({ status: 'active' });
      const closed = closeMatter(matter);

      expect(closed.status).toBe('closed');
      expect(closed.close_date).toBeDefined();
    });
  });

  describe('Filing Deadlines', () => {
    it('should create a filing deadline', () => {
      const deadline = createFilingDeadline({
        matter_uid: 'matter-001',
        title: 'File Answer',
        deadline_date: new Date('2025-12-01'),
        filing_type: 'Answer to Complaint',
        responsible_attorney_uid: 'atty-001',
        priority: 'high',
      });

      expect(deadline.title).toBe('File Answer');
      expect(deadline.priority).toBe('high');
      expect(deadline.status).toBe('pending');
    });

    it('should get upcoming deadlines', () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 10);
      const farFuture = new Date(today);
      farFuture.setDate(today.getDate() + 60);

      const deadlines = [
        createFilingDeadline({ deadline_date: futureDate }),
        createFilingDeadline({ deadline_date: farFuture }),
        createFilingDeadline({ deadline_date: new Date(today) }),
      ];

      const upcoming = getUpcomingDeadlines(deadlines, 30);
      expect(upcoming.length).toBeLessThanOrEqual(2);
    });

    it('should get overdue deadlines', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const deadlines = [
        createFilingDeadline({ deadline_date: pastDate }),
        createFilingDeadline({ deadline_date: new Date() }),
      ];

      const overdue = getOverdueDeadlines(deadlines);
      expect(overdue).toHaveLength(1);
    });

    it('should mark deadline as filed', () => {
      const deadline = createFilingDeadline({ status: 'pending' });
      const filed = markDeadlineFiled(deadline, new Date(), 'CONF-12345');

      expect(filed.status).toBe('filed');
      expect(filed.confirmation_number).toBe('CONF-12345');
      expect(filed.filed_date).toBeDefined();
    });
  });

  describe('Discovery Management', () => {
    it('should create a discovery request', () => {
      const request = createDiscoveryRequest({
        matter_uid: 'matter-001',
        request_type: 'interrogatories',
        issued_by_uid: 'atty-001',
        issued_to_party_uid: 'party-002',
        due_date: new Date('2025-12-01'),
        request_text: 'Provide all documents related to...',
      });

      expect(request.request_type).toBe('interrogatories');
      expect(request.status).toBe('draft');
    });

    it('should create a discovery response', () => {
      const response = createDiscoveryResponse({
        matter_uid: 'matter-001',
        request_uid: 'disc-req-001',
        response_type: 'request-for-production',
        received_from_party_uid: 'party-002',
      });

      expect(response.status).toBe('pending');
    });

    it('should filter discovery by status', () => {
      const requests = [
        createDiscoveryRequest({ status: 'sent' }),
        createDiscoveryRequest({ status: 'responded' }),
        createDiscoveryRequest({ status: 'sent' }),
      ];

      const sent = getDiscoveryByStatus(requests, 'sent');
      expect(sent).toHaveLength(2);
    });

    it('should identify overdue discovery', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const requests = [
        createDiscoveryRequest({ status: 'sent', due_date: pastDate }),
        createDiscoveryRequest({ status: 'sent', due_date: new Date() }),
      ];

      const overdue = getOverdueDiscovery(requests);
      expect(overdue).toHaveLength(1);
    });
  });

  describe('Evidence Management', () => {
    it('should create an evidence item', () => {
      const evidence = createEvidenceItem({
        matter_uid: 'matter-001',
        evidence_type: 'document',
        title: 'Contract Agreement',
        description: 'Original signed contract',
        source: 'Client files',
        collected_by_uid: 'paralegal-001',
        storage_location: 'Evidence Room A',
      });

      expect(evidence.evidence_type).toBe('document');
      expect(evidence.status).toBe('collected');
      expect(evidence.authenticated).toBe(false);
    });

    it('should add chain of custody', () => {
      const evidence = createEvidenceItem({ matter_uid: 'matter-001' });
      const updated = addChainOfCustody(
        evidence,
        'atty-002',
        'paralegal-001',
        'Transferred for review'
      );

      expect(updated.chain_of_custody).toHaveLength(1);
      expect(updated.chain_of_custody[0].transferred_to).toBe('atty-002');
    });

    it('should authenticate evidence', () => {
      const evidence = createEvidenceItem({ matter_uid: 'matter-001' });
      const authenticated = authenticateEvidence(evidence, 'expert-001');

      expect(authenticated.authenticated).toBe(true);
      expect(authenticated.status).toBe('authenticated');
      expect(authenticated.authenticated_by_uid).toBe('expert-001');
    });
  });

  describe('Document Management', () => {
    it('should create a document record', () => {
      const doc = createDocumentRecord({
        matter_uid: 'matter-001',
        document_type: 'Motion',
        title: 'Motion to Dismiss',
        file_path: '/matters/2025-001/motions/mtd.pdf',
        author_uid: 'atty-001',
        signing_required: true,
      });

      expect(doc.document_type).toBe('Motion');
      expect(doc.signing_required).toBe(true);
      expect(doc.signed).toBe(false);
    });

    it('should sign a document', () => {
      const doc = createDocumentRecord({
        signing_required: true,
        signed: false,
      });

      const signed = signDocument(doc, 'atty-001');

      expect(signed.signed).toBe(true);
      expect(signed.signed_by_uid).toBe('atty-001');
      expect(signed.signing_date).toBeDefined();
    });
  });

  describe('Time Tracking & Billing', () => {
    it('should create a time entry', () => {
      const entry = createTimeEntry({
        matter_uid: 'matter-001',
        attorney_uid: 'atty-001',
        duration_minutes: 120,
        category: 'research',
        description: 'Legal research on damages',
        hourly_rate: 350,
        billable: true,
      });

      expect(entry.duration_minutes).toBe(120);
      expect(entry.amount).toBe(700); // 2 hours * $350
      expect(entry.billable).toBe(true);
    });

    it('should calculate total billable time', () => {
      const entries = [
        createTimeEntry({ duration_minutes: 60, hourly_rate: 350, billable: true }),
        createTimeEntry({ duration_minutes: 120, hourly_rate: 350, billable: true }),
        createTimeEntry({ duration_minutes: 30, hourly_rate: 350, billable: false }),
      ];

      const total = calculateTotalBillableTime(entries);
      expect(total).toBe(1050); // (1 + 2) hours * $350
    });

    it('should create an invoice', () => {
      const invoice = createInvoiceRecord({
        matter_uid: 'matter-001',
        client_uid: 'client-001',
        invoice_number: 'INV-2025-001',
        subtotal: 5000,
        expenses: 250,
        tax: 420,
      });

      expect(invoice.total).toBe(5670);
      expect(invoice.balance).toBe(5670);
      expect(invoice.status).toBe('draft');
    });

    it('should mark time entries as invoiced', () => {
      const entries = [
        createTimeEntry({ invoiced: false }),
        createTimeEntry({ invoiced: false }),
      ];

      const invoiced = markTimeEntriesInvoiced(entries, 'invoice-001');

      expect(invoiced.every(e => e.invoiced)).toBe(true);
      expect(invoiced.every(e => e.invoice_uid === 'invoice-001')).toBe(true);
    });
  });

  describe('Client Management', () => {
    it('should create a client profile', () => {
      const client = createClientProfile({
        name: 'Acme Corporation',
        client_type: 'business',
        contact_email: 'legal@acme.com',
        contact_phone: '555-1234',
      });

      expect(client.name).toBe('Acme Corporation');
      expect(client.client_type).toBe('business');
      expect(client.active).toBe(true);
      expect(client.conflict_checked).toBe(false);
    });

    it('should add matter to client', () => {
      const client = createClientProfile({ matter_uids: [] });
      const updated = addMatterToClient(client, 'matter-001');

      expect(updated.matter_uids).toContain('matter-001');
    });

    it('should run conflict check', () => {
      const client = createClientProfile({ conflict_checked: false });
      const checked = runConflictCheck(client);

      expect(checked.conflict_checked).toBe(true);
      expect(checked.conflict_check_date).toBeDefined();
    });
  });

  describe('Hearings', () => {
    it('should create a hearing event', () => {
      const hearing = createHearingEvent({
        matter_uid: 'matter-001',
        title: 'Motion Hearing',
        event_type: 'hearing',
        scheduled_date: new Date('2025-12-15'),
        location: 'Courtroom 3A',
        judge_name: 'Hon. Jane Smith',
        attending_attorneys: ['atty-001', 'atty-002'],
        purpose: 'Hearing on Motion to Dismiss',
      });

      expect(hearing.event_type).toBe('hearing');
      expect(hearing.attending_attorneys).toHaveLength(2);
    });
  });

  describe('Legal Research', () => {
    it('should create a legal research note', () => {
      const note = createLegalResearchNote({
        topic: 'Punitive Damages in Product Liability',
        summary: 'Research on punitive damages standards',
        researcher_uid: 'atty-001',
        sources: [
          {
            type: 'case-law',
            citation: 'BMW v. Gore, 517 U.S. 559 (1996)',
            relevance: 'Establishes constitutional limits',
          },
        ],
      });

      expect(note.topic).toBe('Punitive Damages in Product Liability');
      expect(note.sources).toHaveLength(1);
    });

    it('should create a precedent reference', () => {
      const precedent = createPrecedentReference({
        case_name: 'Brown v. Board of Education',
        citation: '347 U.S. 483 (1954)',
        court: 'U.S. Supreme Court',
        decision_date: new Date('1954-05-17'),
        jurisdiction: 'Federal',
        summary: 'Separate but equal is unconstitutional',
        key_holdings: ['Equal Protection Clause applies to education'],
      });

      expect(precedent.case_name).toBe('Brown v. Board of Education');
      expect(precedent.key_holdings).toHaveLength(1);
    });
  });

  describe('Analytics', () => {
    it('should generate matter statistics', () => {
      const matters = [
        createLegalMatter({ status: 'active', matter_type: 'civil-litigation' }),
        createLegalMatter({ status: 'active', matter_type: 'criminal-defense' }),
        createLegalMatter({ status: 'closed', matter_type: 'civil-litigation' }),
        createLegalMatter({ status: 'intake', matter_type: 'family-law' }),
      ];

      const stats = getMatterStatistics(matters);

      expect(stats.total).toBe(4);
      expect(stats.active).toBe(2);
      expect(stats.closed).toBe(1);
      expect(stats.intake).toBe(1);
    });

    it('should generate discovery statistics', () => {
      const requests = [
        createDiscoveryRequest({ status: 'sent' }),
        createDiscoveryRequest({ status: 'responded' }),
        createDiscoveryRequest({ status: 'sent' }),
      ];

      const stats = getDiscoveryStatistics(requests);

      expect(stats.total).toBe(3);
      expect(stats.sent).toBe(2);
      expect(stats.responded).toBe(1);
    });

    it('should generate billing statistics', () => {
      const invoices = [
        createInvoiceRecord({ subtotal: 5000, expenses: 0, tax: 0, amount_paid: 5000, status: 'paid' }),
        createInvoiceRecord({ subtotal: 3000, expenses: 0, tax: 0, amount_paid: 0, status: 'sent' }),
      ];

      const stats = getBillingStatistics(invoices);

      expect(stats.total_invoices).toBe(2);
      expect(stats.total_billed).toBe(8000);
      expect(stats.total_paid).toBe(5000);
      expect(stats.total_outstanding).toBe(3000);
    });
  });
});
