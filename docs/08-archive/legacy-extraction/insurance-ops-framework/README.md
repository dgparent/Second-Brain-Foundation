# Insurance Claims & Field Inspection Operations Framework

This framework defines the ontology, entities, workflows, compliance requirements, and automation logic needed for **insurance claims processing**, **field inspections**, **loss adjustment**, and **incident documentation**.

It supports:
- Property insurance
- Auto insurance
- Commercial claims
- Liability claims
- Catastrophic event response (CAT)
- Internal insurance teams & independent adjusters
- Inspection contractors

This framework will power the operational module **@sbf/insurance-ops**.

---
# 1. Purpose & Scope
The framework provides a unified structure for:
- Intake, triage, and classification of claims
- Field inspection workflows
- Evidence collection (photos, videos, measurements)
- Adjuster notes and communications
- Repair vendor coordination
- Damage estimation
- Claims lifecycle tracking
- Compliance with insurance regulations

Targets:
- Insurers
- TPAs (Third-Party Administrators)
- Public/independent adjusters
- Restoration contractors
- Risk assessors
- Inspection service providers

---
# 2. Domain Pillars
- **Claims Intake & Triage** – FNOL (First Notice of Loss), claim creation
- **Field Inspections** – scheduling, on-site assessments
- **Damage Assessment** – scoring, measurements, cause-of-loss
- **Evidence & Documentation** – photos, videos, statements
- **Estimates & Reports** – repair scope, cost estimate, adjuster reports
- **Vendor Coordination** – restoration, auto repair, contractors
- **Compliance & Deadlines** – regulatory rules, SLA timers
- **Customer Communication Logs**
- **Fraud Indicators & Risk Analysis**

---
# 3. Core Entities
- `insurance_policy`
- `claim_record`
- `claimant_profile`
- `fnol_report`
- `inspection_request`
- `field_inspection`
- `damage_item`
- `inspection_evidence`
- `adjuster_note`
- `estimation_record`
- `repair_vendor`
- `repair_order`
- `payment_summary`
- `regulatory_deadline`
- `communication_log`
- `fraud_indicator`
- `claim_document`

---
# 4. Ontology Relationships
- A `claim_record` references one `insurance_policy`.
- `fnol_report` creates a `claim_record`.
- `inspection_request` triggers a `field_inspection`.
- A `field_inspection` contains multiple `damage_item` objects.
- `inspection_evidence` links to `field_inspection`.
- `estimation_record` is based on `damage_item` lists.
- `repair_order` is created when a vendor is assigned.
- `communication_log` references claim and participants.
- `regulatory_deadline` attaches to claim and jurisdiction.
- `claim_document` contains all generated reports, photos, forms.

---
# 5. Core Processes

## 5.1 FNOL → Claim Creation
1. Customer submits FNOL
2. Policy check & validation
3. Claim is created with classification (auto/property/liability)
4. Assign adjuster

## 5.2 Inspection Workflow
1. Inspection requested
2. Scheduling
3. Site visit
4. Damage assessment
5. Photos/videos captured
6. Report generation

## 5.3 Damage & Estimate Workflow
1. Identify damage items
2. Categorize by severity + cause
3. Estimate repair or replacement
4. Generate cost estimate
5. Prepare adjuster summary

## 5.4 Repair & Vendor Workflow
- Vendor assignment
- Work authorization
- Progress tracking
- Final repair verification
- Document invoices

## 5.5 Regulatory Compliance Workflow
- SLA timers (e.g., respond in 10 days)
- Required forms
- Follow-up deadlines
- Reporting for regulators

## 5.6 Fraud Detection Workflow
- Trigger flags on suspicious patterns
- Cross-check with historical data
- Document fraud indicators

---
# 6. YAML Schemas

## 6.1 claim_record
```yaml
uid: claim-2025-03-10-01
type: claim_record
policy_uid: policy-123456
claimant_uid: claimant-001
loss_type: property
loss_date: 2025-03-09
reported_date: 2025-03-10
status: open
assigned_adjuster: adj-019
severity: moderate
cause_of_loss: "Water leak from broken pipe"
```

## 6.2 field_inspection
```yaml
uid: insp-2025-03-10-01
type: field_inspection
claim_uid: claim-2025-03-10-01
inspector_uid: inspector-022
scheduled_date: 2025-03-11
visit_date: 2025-03-11T14:00
location: "129 River St, Ottawa"
notes: "Visible water damage in kitchen and basement."
```

## 6.3 damage_item
```yaml
uid: dmg-2025-03-11-01
type: damage_item
inspection_uid: insp-2025-03-10-01
category: water_damage
area: kitchen
severity: medium
estimated_cost: 850.00
notes: "Cabinet base swollen; flooring warped."
```

## 6.4 estimation_record
```yaml
uid: est-2025-03-11-01
type: estimation_record
claim_uid: claim-2025-03-10-01
estimator_uid: adj-019
items:
  - dmg-2025-03-11-01
  - dmg-2025-03-11-02
subtotal: 2100.00
tax: 273.00
total: 2373.00
```

## 6.5 communication_log
```yaml
uid: comm-2025-03-10-01
type: communication_log
claim_uid: claim-2025-03-10-01
participant:
  name: "Anna Lopez"
  role: claimant
method: phone
date_time: 2025-03-10T10:45
summary: "Discussed inspection appointment."
```

## 6.6 fraud_indicator
```yaml
uid: fraud-2025-03-10-01
type: fraud_indicator
claim_uid: claim-2025-03-10-01
indicator_type: repeat_claims
description: "Claimant has 3 similar claims in last 18 months."
severity: medium
```

---
# 7. Automation Capabilities
- FNOL auto-classification
- Adjuster assignment based on load + skill
- Inspection scheduling assistant
- Automated damage clustering from photos
- Cost estimation suggestions (AI)
- Compliance deadline timers
- Automated claimant communication templates
- Fraud pattern detection engine

---
# 8. Compliance Requirements
- Insurance regulatory SLAs
- Good faith communication rules
- Required notice forms
- Data retention laws
- Privacy regulations

---
# 9. Integration With SBF Frameworks
- **Financial** → payout summaries, repair invoices
- **Task** → inspection tasks, follow-up tasks
- **Knowledge** → SOPs, estimation guidelines, policy rules
- **Relationship** → claimant, vendors, adjusters
- **Health** → inspector risk logs if needed

---
# 10. Roadmap
- Phase 1: Claims entities + inspection engine
- Phase 2: Damage categorization AI
- Phase 3: Vendor marketplace integration
- Phase 4: Compliance dashboard
- Phase 5: Predictive fraud analysis

