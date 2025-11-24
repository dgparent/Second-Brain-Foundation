# Legal Workflow Automation Framework

This framework defines the entity structure, workflows, domain ontology, compliance rules, and automation layers for **legal operations** within small to mid-sized law firms, in‑house legal teams, and solo practitioners.

It supports the operational module **@sbf/legal-ops**.

---
# 1. Purpose & Scope
This framework provides a unified structure for:
- Case lifecycle management
- Matter organization and document workflows
- Filing deadlines & court scheduling
- Discovery & evidence management
- Client communication logs
- Legal billing & time tracking
- Compliance & document retention
- Legal research knowledge integration

Target users:
- SME law firms
- In‑house legal departments
- Paralegals
- Litigation support
- Solo legal practitioners

---
# 2. Domain Pillars
- **Case/Matter Lifecycle Management**
- **Legal Document Management**
- **Task & Deadline Tracking**
- **Filing & Court Scheduling**
- **Discovery & Evidence Management**
- **Client Relationship & Communication Logs**
- **Legal Research & Precedents**
- **Compliance & Retention Requirements**

---
# 3. Core Entities
- `legal_matter`
- `case_party`
- `opposing_counsel`
- `court_record`
- `filing_deadline`
- `legal_task`
- `hearing_event`
- `evidence_item`
- `document_record`
- `discovery_request`
- `discovery_response`
- `client_profile`
- `time_entry`
- `invoice_record`
- `legal_research_note`
- `precedent_reference`
- `compliance_flag`
- `retention_record`

---
# 4. Ontology Relationships
- A `legal_matter` contains clients, opposing parties, tasks, deadlines, hearings, and documents.
- `court_record` ties a matter to jurisdiction and case numbers.
- `filing_deadline` relates to legal rules and triggers tasks.
- `document_record` may be evidence or filing.
- `evidence_item` connects to discovery requests/responses.
- `legal_research_note` references precedents, statutes, or prior matters.
- `time_entry` rolls up into `invoice_record`.
- `compliance_flag` attaches to documents or tasks with regulatory significance.

---
# 5. Core Processes

## 5.1 Matter Intake Workflow
- Capture client information
- Conflict check
- Assign case number
- Categorize (civil, criminal, corporate, etc.)
- Create matter folder structure

## 5.2 Filing & Court Scheduling Workflow
- Identify filing deadlines
- Map jurisdictional rules
- Generate filing tasks
- Prepare documents
- Track submission + confirmations

## 5.3 Discovery Workflow
- Create discovery requests
- Manage evidence intake
- OCR & classify documents
- Track responses and obligations

## 5.4 Hearing & Court Appearance Workflow
- Schedule hearings
- Prepare notes and exhibits
- Calendar integrations

## 5.5 Document Management Workflow
- Store legal documents with metadata
- Apply versioning
- Tag privileged vs non-privileged
- Retention schedule enforcement

## 5.6 Billing & Time Tracking Workflow
- Log time entries
- Assign rates
- Generate invoices
- Track accounts receivable

---
# 6. YAML Schemas

## 6.1 legal_matter
```yaml
uid: matter-2025-001
type: legal_matter
title: "Lopez v. GreenTech"
jurisdiction: "Ontario Superior Court"
matter_type: civil
client_uid: client-anna-lopez
opposing_uid: org-greentech
status: active
opened_date: 2025-02-01
```

## 6.2 filing_deadline
```yaml
uid: fd-2025-03-15-01
type: filing_deadline
matter_uid: matter-2025-001
description: "Statement of Claim Filing"
due_date: 2025-03-15
origin: "Court Rule 18(1)"
priority: high
```

## 6.3 document_record
```yaml
uid: doc-2025-03-10-01
type: document_record
matter_uid: matter-2025-001
doc_type: evidence
file_path: "docs/matter-2025-001/photo1.jpg"
confidentiality: privileged
upload_date: 2025-03-10
```

## 6.4 evidence_item
```yaml
uid: ev-2025-03-10-01
type: evidence_item
matter_uid: matter-2025-001
description: "Photo of damaged equipment"
related_document_uid: doc-2025-03-10-01
chain_of_custody:
  - { handler: "Anna Lopez", time: "2025-03-09T14:00" }
  - { handler: "Paralegal #3", time: "2025-03-10T10:00" }
```

## 6.5 legal_task
```yaml
uid: ltask-2025-03-10-01
type: legal_task
matter_uid: matter-2025-001
description: "Prepare discovery request set A"
assigned_to: "paralegal-02"
status: in_progress
due_date: 2025-03-12
```

---
# 7. Automation Capabilities
- Auto‑generated filing calendars
- Rule-based deadline computation (jurisdiction-specific)
- Document OCR, classification, and tagging
- Automatic discovery response reminders
- Legal research summarization + linking
- Privilege detection (pattern‑based)
- Client communication templates
- Time entry auto‑suggestion based on activity

---
# 8. Compliance Requirements
- Document retention and destruction rules
- Privileged information protection
- Court formatting standards
- Electronic filing standards
- Jurisdictional procedural rules
- Conflict of interest checks

---
# 9. Integration With SBF Frameworks
- **Knowledge** → statutes, precedents, research notes
- **Task** → filing tasks, discovery tasks, hearing prep
- **Relationship** → clients, opposing counsel, court contacts
- **Financial** → billing, time entries, invoices
- **Health** → staff workload optimization (optional)

---
# 10. Roadmap
- Phase 1: Matter management structures
- Phase 2: Filing calendar automation
- Phase 3: Document intelligence + OCR classification
- Phase 4: Legal research assistant + precedents engine
- Phase 5: Compliance and retention enforcement engine

