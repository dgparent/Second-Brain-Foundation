# @sbf/modules-legal-ops

Legal operations module for law firms, legal departments, and solo practitioners.

## Features

- **Case/Matter Management** - Comprehensive matter lifecycle tracking
- **Discovery Workflows** - Discovery requests, responses, and evidence management
- **Filing Deadlines** - Critical deadline tracking with jurisdiction rules
- **Evidence Tracking** - Chain of custody and authentication
- **Document Management** - Legal document organization with privilege tracking
- **Time Tracking & Billing** - Billable time tracking and invoicing
- **Client Management** - Client profiles with conflict checking
- **Legal Research** - Research notes and precedent tracking
- **Compliance & Retention** - Document retention and compliance flags

## Installation

```bash
npm install @sbf/modules-legal-ops
```

## Usage

### Legal Matter Management

```typescript
import { createLegalMatter, getMattersByStatus } from '@sbf/modules-legal-ops';

// Create a new matter
const matter = createLegalMatter({
  matter_number: '2025-001',
  title: 'Smith v. Jones',
  matter_type: 'civil-litigation',
  client_uids: ['client-123'],
  lead_attorney_uid: 'atty-456',
  jurisdiction: 'CA Superior Court',
  billing_type: 'contingency',
});

// Filter matters by status
const activeMatters = getMattersByStatus(allMatters, 'active');
```

### Filing Deadlines

```typescript
import { createFilingDeadline, getUpcomingDeadlines } from '@sbf/modules-legal-ops';

// Create a filing deadline
const deadline = createFilingDeadline({
  matter_uid: 'matter-001',
  title: 'File Answer',
  deadline_date: new Date('2025-12-01'),
  filing_type: 'Answer to Complaint',
  responsible_attorney_uid: 'atty-001',
  priority: 'high',
});

// Get upcoming deadlines (next 30 days)
const upcoming = getUpcomingDeadlines(allDeadlines, 30);
```

### Discovery Management

```typescript
import { createDiscoveryRequest, getOverdueDiscovery } from '@sbf/modules-legal-ops';

// Create discovery request
const request = createDiscoveryRequest({
  matter_uid: 'matter-001',
  request_type: 'interrogatories',
  issued_by_uid: 'atty-001',
  issued_to_party_uid: 'party-002',
  due_date: new Date('2025-12-15'),
  request_text: 'Provide all documents related to...',
});

// Find overdue discovery
const overdue = getOverdueDiscovery(allRequests);
```

### Evidence Management

```typescript
import { createEvidenceItem, addChainOfCustody, authenticateEvidence } from '@sbf/modules-legal-ops';

// Create evidence item
let evidence = createEvidenceItem({
  matter_uid: 'matter-001',
  evidence_type: 'document',
  title: 'Contract Agreement',
  source: 'Client files',
  collected_by_uid: 'paralegal-001',
  storage_location: 'Evidence Room A',
});

// Add chain of custody entry
evidence = addChainOfCustody(
  evidence,
  'atty-002',
  'paralegal-001',
  'Transferred for review'
);

// Authenticate evidence
evidence = authenticateEvidence(evidence, 'expert-001');
```

### Time Tracking & Billing

```typescript
import { createTimeEntry, createInvoiceRecord, calculateTotalBillableTime } from '@sbf/modules-legal-ops';

// Create time entry
const entry = createTimeEntry({
  matter_uid: 'matter-001',
  attorney_uid: 'atty-001',
  duration_minutes: 120,
  category: 'research',
  description: 'Legal research on damages',
  hourly_rate: 350,
  billable: true,
});

// Calculate total billable time
const total = calculateTotalBillableTime(timeEntries);

// Create invoice
const invoice = createInvoiceRecord({
  matter_uid: 'matter-001',
  client_uid: 'client-001',
  invoice_number: 'INV-2025-001',
  subtotal: 5000,
  expenses: 250,
  tax: 420,
});
```

### Analytics

```typescript
import { getMatterStatistics, getDiscoveryStatistics, getBillingStatistics } from '@sbf/modules-legal-ops';

// Matter statistics
const matterStats = getMatterStatistics(allMatters);
console.log(`Active matters: ${matterStats.active}`);
console.log(`Closed matters: ${matterStats.closed}`);

// Discovery statistics
const discoveryStats = getDiscoveryStatistics(allRequests);
console.log(`Overdue discovery: ${discoveryStats.overdue}`);

// Billing statistics
const billingStats = getBillingStatistics(allInvoices);
console.log(`Total outstanding: $${billingStats.total_outstanding}`);
```

## Entity Types

### Core Entities
- `LegalMatter` - Case/matter records
- `CaseParty` - Parties involved in matters
- `OpposingCounsel` - Opposing attorney information
- `CourtRecord` - Court and docket information
- `ClientProfile` - Client information and preferences

### Workflow Entities
- `FilingDeadline` - Filing deadlines and requirements
- `HearingEvent` - Court hearings and events
- `DiscoveryRequest` - Outgoing discovery requests
- `DiscoveryResponse` - Incoming discovery responses
- `EvidenceItem` - Evidence with chain of custody
- `DocumentRecord` - Legal documents with privilege tracking

### Billing Entities
- `TimeEntry` - Billable and non-billable time
- `InvoiceRecord` - Client invoices

### Research Entities
- `LegalResearchNote` - Research findings
- `PrecedentReference` - Case law and precedents

### Compliance Entities
- `ComplianceFlag` - Regulatory compliance tracking
- `RetentionRecord` - Document retention tracking

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Clean
```bash
npm run clean
```

## License

MIT
