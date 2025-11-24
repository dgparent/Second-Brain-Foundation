import {
  createLegalMatter,
  createFilingDeadline,
  createEvidenceItem,
  createTimeEntry,
  createInvoice,
  getMattersByClient,
  getUpcomingDeadlines,
  calculateMatterBillableHours,
  calculateMatterTotalFees,
  addToCustodyChain,
} from '../index';

describe('@sbf/legal-ops', () => {
  describe('Entity Creation', () => {
    it('should create a legal matter', () => {
      const matter = createLegalMatter({
        title: "Smith v. ABC Corp",
        jurisdiction: "Ontario Superior Court",
        matterType: "civil",
        clientUid: "client-001",
      });

      expect(matter.type).toBe('legal.matter');
      expect(matter.metadata.title).toBe("Smith v. ABC Corp");
      expect(matter.metadata.matter_type).toBe('civil');
      expect(matter.metadata.status).toBe('pending');
    });

    it('should create a filing deadline', () => {
      const deadline = createFilingDeadline({
        matterUid: "matter-001",
        description: "Statement of Claim",
        dueDate: "2025-04-15",
        priority: "high",
      });

      expect(deadline.type).toBe('legal.filing_deadline');
      expect(deadline.metadata.priority).toBe('high');
      expect(deadline.metadata.status).toBe('pending');
    });

    it('should create an evidence item', () => {
      const evidence = createEvidenceItem({
        matterUid: "matter-001",
        description: "Contract document",
        evidenceType: "document",
      });

      expect(evidence.type).toBe('legal.evidence');
      expect(evidence.metadata.chain_of_custody).toEqual([]);
    });

    it('should create a time entry', () => {
      const timeEntry = createTimeEntry({
        matterUid: "matter-001",
        userUid: "user-001",
        activity: "Research case law",
        minutes: 120,
        ratePerHour: 250,
      });

      expect(timeEntry.type).toBe('legal.time_entry');
      expect(timeEntry.metadata.minutes).toBe(120);
      expect(timeEntry.metadata.billable).toBe(true);
    });

    it('should create an invoice', () => {
      const invoice = createInvoice({
        matterUid: "matter-001",
        lineItems: [
          { description: "Legal research", amount: 500 },
          { description: "Court filing", amount: 120 },
        ],
      });

      expect(invoice.type).toBe('legal.invoice');
      expect(invoice.metadata.total_amount).toBe(620);
      expect(invoice.metadata.status).toBe('draft');
    });
  });

  describe('Query Functions', () => {
    it('should filter matters by client', () => {
      const matters = [
        createLegalMatter({
          title: "Case 1",
          jurisdiction: "Ontario",
          matterType: "civil",
          clientUid: "client-001",
        }),
        createLegalMatter({
          title: "Case 2",
          jurisdiction: "Ontario",
          matterType: "civil",
          clientUid: "client-002",
        }),
      ];

      const filtered = getMattersByClient(matters, "client-001");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].metadata.title).toBe("Case 1");
    });

    it('should calculate billable hours for a matter', () => {
      const timeEntries = [
        createTimeEntry({
          matterUid: "matter-001",
          userUid: "user-001",
          activity: "Research",
          minutes: 120,
          ratePerHour: 250,
        }),
        createTimeEntry({
          matterUid: "matter-001",
          userUid: "user-001",
          activity: "Drafting",
          minutes: 90,
          ratePerHour: 250,
        }),
      ];

      const hours = calculateMatterBillableHours(timeEntries, "matter-001");
      expect(hours).toBe(3.5); // 210 minutes / 60
    });

    it('should calculate total fees for a matter', () => {
      const timeEntries = [
        createTimeEntry({
          matterUid: "matter-001",
          userUid: "user-001",
          activity: "Research",
          minutes: 120,
          ratePerHour: 250,
        }),
      ];

      const total = calculateMatterTotalFees(timeEntries, "matter-001");
      expect(total).toBe(500); // 2 hours * $250
    });
  });

  describe('Evidence Chain of Custody', () => {
    it('should add entries to chain of custody', () => {
      let evidence = createEvidenceItem({
        matterUid: "matter-001",
        description: "Physical evidence",
      });

      evidence = addToCustodyChain(evidence, "Officer Smith");
      evidence = addToCustodyChain(evidence, "Evidence Clerk");

      expect(evidence.metadata.chain_of_custody).toHaveLength(2);
      expect(evidence.metadata.chain_of_custody[0].handler).toBe("Officer Smith");
      expect(evidence.metadata.chain_of_custody[1].handler).toBe("Evidence Clerk");
    });
  });
});
