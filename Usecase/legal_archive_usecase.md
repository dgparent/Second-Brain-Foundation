# Legal Archive & Documentation Management Use Case

## Overview
This use case provides a structured system for organizing legal documents, contracts, agreements, identification records, certificates, compliance papers, and property-related files. It ensures long-term accessibility, proper metadata, renewal tracking, and cross-domain linking (home admin, finance, business, travel).

---

## User Goals
- Store and organize all important legal and administrative documents in one place.
- Track expiry dates for IDs, licenses, permits, visas, insurance policies.
- Maintain versions of agreements and amendments.
- Keep a historical log of legal events (leases, claims, disputes, resolutions).
- Quickly retrieve documents during emergencies, travel, or legal processes.

---

## Problems & Pain Points
- Documents scattered across email, cloud drives, government portals, paper folders.
- Users forget expiry dates for critical IDs (passports, licenses).
- Hard to find the latest versions of agreements.
- No cross-domain linking for documents related to property, finance, or health.
- Most document storage tools lack structured metadata or task integrations.

---

## Data Requirements
- **Document metadata:** type, category, issue date, expiry date, issuer.
- **Files:** PDF, image, scanned copies.
- **Relationships:** properties, accounts, travel, family, business.
- **Events:** renewals, claims, disputes.
- **Compliance:** regulatory requirements by jurisdiction.

---

## Entity Model
### Entity: `legal.document`
### Entity: `legal.case`
### Entity: `legal.renewal`

Key relationships:
- `attached_to`: property, person, account, trip
- `requires_action`: renewal tasks
- `supports`: legal processes or disputes

---

## YAML Example — Legal Document
```yaml
---
uid: legal-passport-derrick-2030
type: legal.document
title: "Canadian Passport – Derrick Parent"
category: identification
issuer: "Government of Canada"
issue_date: 2020-05-14
expiry_date: 2030-05-14
document_path: "/documents/legal/passport-derrick-2030.pdf"
linked_entities:
  - trip-davao-2026
  - contact-derrick-parent
notes: "Ensure 6-month validity before international travel."
sensitivity: confidential
---
```

---

## YAML Example — Property-Linked Document
```yaml
---
uid: legal-property-title-davao
type: legal.document
title: "Land Title Inquiry – Davao Homestead"
category: property_record
issuer: "Davao City Registry"
issue_date: 2025-01-08
document_path: "/documents/legal/davao-title-inquiry.pdf"
linked_entities:
  - property-davao-homestead-1
notes: "Check agricultural zoning restrictions and right-of-way documentation."
sensitivity: confidential
---
```

---

## YAML Example — Renewal Log
```yaml
---
uid: renewal-passport-2030
type: legal.renewal
document_uid: legal-passport-derrick-2030
renewal_type: passport
recommended_start: 2029-11-01
deadline: 2030-05-14
status: pending
notes: "Verify new biometric requirements before application."
sensitivity: confidential
---
```

---

## Integration Architecture
### Email Ingestion
- Extract attachments such as contracts, receipts, and permits.

### PDF & Image OCR
- Automatic metadata extraction (issuer, dates, names).

### Government Portals
- Manual upload of downloaded statements, permits, certificates.

### Calendar Reminders
- Auto-create reminders for document renewal deadlines.

### Finance Integration
- Link legal documents to accounts, insurance, tax filings.

### Property & Home Admin
- Connect deeds, permits, inspections, and utility registration documents.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Dropbox/Google Drive | Great file storage | Weak metadata & relationships | SBF adds structured legal graph |
| 1Password Documents | Secure | Shallow tagging | SBF semantic + cross-domain linking |
| Notion templates | Flexible | No OCR automation | SBF automated ingestion + renewal system |

---

## SBF Implementation Notes
- CLI: `sbf new legal.document`, `sbf new legal.renewal`.
- AEI: detect missing documents, extract metadata, schedule renewals.
- Dashboard: legal overview, expiry timeline, property & financial linkage.
- Cross-domain integration: finance, home, travel, identity, business.

