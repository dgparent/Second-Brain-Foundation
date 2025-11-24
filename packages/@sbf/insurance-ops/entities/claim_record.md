# Claim Record Entity

## Overview
Represents an insurance claim filed by a policyholder

## Schema
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

## Loss Types
- `property` - Property damage
- `auto` - Vehicle damage
- `liability` - Liability claim
- `other` - Other types

## Status Values
- `open` - Newly filed
- `in_progress` - Being processed
- `closed` - Resolved
- `denied` - Rejected

## Relationships
- References: `insurance_policy`
- References: `claimant_profile`
- Has many: `field_inspection`
- Has many: `estimation_record`
- Has many: `communication_log`

## Used By
- Claims intake
- Adjuster assignment
- Workflow automation
