# @sbf/legal-ops

**Legal Operations Module for Second Brain Foundation**

Comprehensive legal practice management module supporting matter lifecycle, court operations, discovery, billing, time tracking, and compliance documentation.

## Features

- **Matter Management** - Case intake, conflict checking, lifecycle tracking
- **Court Operations** - Filing deadlines, hearing scheduling, jurisdictional rules
- **Discovery & Evidence** - Request/response tracking, chain of custody, privilege detection
- **Document Management** - OCR classification, version control, retention rules
- **Billing & Time Tracking** - Time entries, invoicing, rate management
- **Research & Precedents** - Legal research notes, case law references
- **Compliance** - Document retention, regulatory tracking

## Installation

```bash
npm install @sbf/legal-ops
```

## Usage

```typescript
import { createLegalMatter, createFilingDeadline, getUpcomingDeadlines } from '@sbf/legal-ops';

// Create a new legal matter
const matter = createLegalMatter({
  title: "Smith v. ABC Corp",
  jurisdiction: "Ontario Superior Court",
  matterType: "civil",
  clientUid: "client-001",
  status: "active"
});

// Add a filing deadline
const deadline = createFilingDeadline({
  matterUid: matter.uid,
  description: "Statement of Claim",
  dueDate: "2025-04-15",
  priority: "high",
  origin: "Court Rule 18(1)"
});

// Get upcoming deadlines
const upcoming = getUpcomingDeadlines(deadlines, 30);
```

## Entities (18)

- `legal_matter` - Core case/matter records
- `client_profile` - Client information
- `case_party` - Parties involved
- `opposing_counsel` - Opposing attorneys
- `court_record` - Court details
- `filing_deadline` - Critical dates
- `legal_task` - Work assignments
- `hearing_event` - Court appearances
- `evidence_item` - Evidence with chain of custody
- `document_record` - Legal documents
- `discovery_request` - Discovery requests
- `discovery_response` - Discovery responses
- `time_entry` - Billable time tracking
- `invoice_record` - Client invoicing
- `legal_research_note` - Research documentation
- `precedent_reference` - Case law references
- `compliance_flag` - Compliance tracking
- `retention_record` - Document retention

## License

MIT - Part of Second Brain Foundation
