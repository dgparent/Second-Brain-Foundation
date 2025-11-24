# Legal Operations Module

This module operationalizes the **Legal Workflow Automation Framework** into a complete, automation-ready system for law firms, legal departments, and independent practitioners. It supplies the workflows, entities, automation logic, and CLI integrations that support day-to-day case operations.

Targets:
- Law firms (SME)
- In-house legal teams
- Solo practitioners
- Paralegals
- Litigation support teams

---
# 1. Module Purpose
This module enables:
- Case/matter lifecycle automation
- Filing and documentation workflows
- Discovery and evidence management
- Hearing & court schedule tracking
- Client communications
- Billing & time tracking
- Compliance automation (deadlines, retention)
- Legal research integration

---
# 2. Module Architecture

## 2.1 Directory Structure
```
@sbf/legal-ops/
│
├── entities/
│   ├── legal_matter.md
│   ├── client_profile.md
│   ├── case_party.md
│   ├── opposing_counsel.md
│   ├── court_record.md
│   ├── filing_deadline.md
│   ├── legal_task.md
│   ├── hearing_event.md
│   ├── evidence_item.md
│   ├── document_record.md
│   ├── discovery_request.md
│   ├── discovery_response.md
│   ├── time_entry.md
│   ├── invoice_record.md
│   ├── legal_research_note.md
│   ├── precedent_reference.md
│   ├── compliance_flag.md
│   └── retention_record.md
│
├── workflows/
│   ├── matter-intake.md
│   ├── filing-workflow.md
│   ├── discovery-workflow.md
│   ├── hearing-prep-flow.md
│   ├── document-management-flow.md
│   ├── billing-flow.md
│   └── compliance-flow.md
│
├── automation/
│   ├── filing-calendar-engine.md
│   ├── ocr-classification.md
│   ├── discovery-deadline-engine.md
│   ├── privilege-detector.md
│   ├── time-entry-autosuggest.md
│   ├── client-communication.md
│   └── retention-enforcer.md
│
├── reporting/
│   ├── matter-summary.md
│   ├── discovery-summary.md
│   ├── deadline-report.md
│   ├── evidence-index.md
│   ├── billing-report.md
│   └── compliance-report.md
│
└── cli/
    ├── commands.md
    └── generators.md
```

---
# 3. Entity Schemas

### 3.1 discovery_request
```yaml
uid: disc-req-2025-03-12-01
type: discovery_request
matter_uid: matter-2025-001
request_type: "Request for Production"
issued_by: "paralegal-02"
issue_date: 2025-03-12
due_date: 2025-03-22
status: sent
```

### 3.2 discovery_response
```yaml
uid: disc-resp-2025-03-18-01
type: discovery_response
matter_uid: matter-2025-001
response_to_uid: disc-req-2025-03-12-01
submitted_by: "opposing-counsel-01"
submission_date: 2025-03-18
documents:
  - doc-2025-03-18-01
notes: "Supplemental responses to follow."
```

### 3.3 hearing_event
```yaml
uid: hearing-2025-04-10-01
type: hearing_event
matter_uid: matter-2025-001
date: 2025-04-10
time: "09:30"
location: "Ontario Superior Court, Room 212"
hearing_type: motion
notes: "Prepare exhibits A–F and witness statement."
```

### 3.4 time_entry
```yaml
uid: time-2025-03-12-01
type: time_entry
matter_uid: matter-2025-001
user_uid: paralegal-02
activity: "Draft discovery request"
minutes: 65
rate_per_hour: 125.00
timestamp: 2025-03-12T15:42
```

### 3.5 invoice_record
```yaml
uid: invoice-2025-03-01-01
type: invoice_record
matter_uid: matter-2025-001
issue_date: 2025-03-01
line_items:
  - description: "Paralegal time"
    amount: 238.54
  - description: "Court filing fee"
    amount: 120.00
total_amount: 358.54
status: sent
```

### 3.6 compliance_flag
```yaml
uid: comp-2025-03-12-01
type: compliance_flag
matter_uid: matter-2025-001
item_uid: fd-2025-03-15-01
flag_type: deadline
severity: high
status: pending
notes: "Filing due in 3 days."
```

---
# 4. Workflows

## 4.1 Matter Intake Workflow
1. Create matter metadata
2. Conflict check
3. Assign responsible attorney
4. Generate default tasks & deadlines
5. Create folder structure

## 4.2 Filing Workflow
- Auto-generate filing deadlines
- Prepare documents
- Capture submission receipts
- Upload confirmations

## 4.3 Discovery Workflow
- Create discovery requests
- Track due dates
- Intake and classify responses
- Auto-assign review tasks

## 4.4 Hearing Prep Workflow
- Create checklists
- Track exhibit preparation
- Manage witness info
- Calendar sync

## 4.5 Document Management Workflow
- OCR ingestion engine
- Tag privileged vs non-privileged
- Version control
- Automated retention rules

## 4.6 Billing Workflow
- Track time entries
- Generate invoices
- Send payment reminders

## 4.7 Compliance Workflow
- Rule-driven jurisdiction mapping
- Deadline reminders
- Late-flag escalations
- Automatic compliance report generation

---
# 5. Automation

### 5.1 Filing Calendar Engine
- Computes deadlines based on jurisdiction
- Auto-updates when events change

### 5.2 OCR Classification Engine
- Reads uploaded documents
- Detects document types
- Extracts metadata

### 5.3 Discovery Deadline Engine
- Tracks overdue responses
- Auto-escalation

### 5.4 Privilege Detector
- Flags potentially privileged content using patterns

### 5.5 Time Entry Autosuggest
- Suggests entries based on task logs and activity patterns

### 5.6 Client Communication Automation
- Generates:
  - case updates
  - deadline reminders
  - invoice reminders

### 5.7 Retention Enforcer
- Flags expired retention documents
- Generates destruction lists

---
# 6. Reporting

## 6.1 Matter Summary
- Timeline
- Upcoming deadlines
- Tasks
- Documents
- Evidence list

## 6.2 Discovery Summary
- Outstanding requests
- Received responses
- Review status

## 6.3 Deadline Report
- Filing deadlines
- High-severity compliance flags

## 6.4 Evidence Index
- Evidence categorized + chain of custody

## 6.5 Billing Report
- Hours per matter
- Outstanding invoices
- AR (Accounts Receivable) trends

## 6.6 Compliance Report
- All open compliance flags
- Overdue filings
- Retention schedule status

---
# 7. CLI Commands

### 7.1 `sbf legal new-matter`
Creates a matter with intake steps.

### 7.2 `sbf legal file`
Handles filing tasks and document attachments.

### 7.3 `sbf legal discovery`
Manage discovery requests/responses.

### 7.4 `sbf legal hearing`
Create hearing events.

### 7.5 `sbf legal time`
Add automated time entries.

### 7.6 `sbf legal report`
Generate summaries and compliance reports.

---
# 8. Roadmap
- Phase 1: Filing automation
- Phase 2: Discovery intelligence
- Phase 3: Legal research assistant integration
- Phase 4: Smart compliance engine
- Phase 5: Multi-matter analytics dashboard

