# Second Brain Foundation
# Security Classification Standard

**Version:** 1.0  
**Status:** Active Specification  
**Purpose:** Developer Reference for AEI, Core Framework, and Entity Metadata

---

# 1. Introduction
This document defines the **complete Security Classification Model** used across the Second Brain Foundation (SBF) ecosystem. It provides a unified, real‑world–grounded framework for:

- Entity sensitivity levels
- AI-access permissions
- Group/organization visibility rules
- Risk‑based modifiers
- Operational handling standards
- Ingestion and processing rules for the AEI

This serves as the authoritative reference for developers implementing:
- The AEI privacy engine
- Metadata validation schemas
- Progressive organization constraints
- Permission-aware inference routing (cloud vs. local)
- Security-aware relationship creation and graph expansion

---

# 2. Master Sensitivity Levels (0–9)

| Level | Name | Description |
|------|------|-------------|
| **0** | **Unrestricted Public** | Fully open. Safe for distribution. |
| **1** | **General Public** | Public but curated. Can be quoted or shared. |
| **2** | **Internal Shareable** | Suitable for sharing inside trusted circles (team/org/family). |
| **3** | **Personal** | User-only information. No cloud AI unless explicitly allowed. |
| **4** | **Private Confidential** | Sensitive personal info. Requires human approval for AEI actions. |
| **5** | **Organizational Confidential** | Sensitive internal information shared with approved groups. |
| **6** | **Secret** | Highly sensitive. Strict privacy. Local AI only with restricted capabilities. |
| **7** | **Organization Secret** | Secret internal materials for specific teams, project groups, or agencies. |
| **8** | **Restricted / Eyes-Only** | Visible only to explicitly named entities. No AI access. |
| **9** | **Cosmic Secret (Ultra)** | Maximum security. No AI processing. No export. Minimal metadata exposure. |

---

# 3. Group & Organization Scopes

Each entity can optionally specify a **scope** describing its organizational visibility.

| Scope | Description |
|-------|-------------|
| **public_group** | Public materials created by an organization. |
| **shareable_group** | Materials intended for limited external distribution. |
| **internal_group** | General private organizational information. |
| **secret_group** | Confidential information belonging to a restricted internal group. |
| **compartmentalized_group** | Highly‑restricted materials with access limited to named subgroups or project teams. |

---

# 4. Data Handling Permissions
These permissions govern how an entity may be processed or shared.

```yaml
sensitivity:
  level: 5
  scope: secret_group
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
  group_access: ["project-apollo", "eng-team"]
  visibility: internal
```

### Permission Descriptions
- **cloud_ai_allowed:** Controls whether cloud providers (OpenAI, Anthropic) may process this entity.
- **local_ai_allowed:** Allows local inference engines (Ollama, LMStudio) to access entity content.
- **export_allowed:** Controls whether entity metadata or content may leave the vault (NotebookLM, external services).
- **group_access:** Explicit group list used to gate access.
- **visibility:** Determines whether entity existence can be discovered by search or relationship traversal.

---

# 5. Risk Modifiers
Risk metadata controls dynamic AEI behaviors and processing constraints.

```yaml
risk:
  probability_damage: 4    # 1–5
  severity_damage: 5       # 1–5
```

| Field | Description |
|--------|-------------|
| **probability_damage** | Likelihood of harm if entity is exposed. |
| **severity_damage** | Magnitude of harm. |

---

# 6. AEI Control Flags

```yaml
control:
  requires_human_approval: true
  requires_audit_log: true
  AEI_restriction_mode: hardened
```

| Control | Meaning |
|----------|---------|
| **requires_human_approval** | AEI must request approval before modifying, linking, summarizing, or restructuring. |
| **requires_audit_log** | All actions involving this entity must be logged. |
| **AEI_restriction_mode** | `permissive`, `cautious`, or `hardened`, determines AI behavior strictness. |

---

# 7. Full Security Classification Matrix

| Level | Name | Cloud AI | Local AI | Export | Human Approval | Group Access | Example |
|------|------|----------|----------|--------|----------------|--------------|---------|
| **0** | Unrestricted Public | Yes | Yes | Yes | No | Everyone | Public articles |
| **1** | General Public | Yes | Yes | Yes | No | Everyone | Public guides |
| **2** | Internal Shareable | Optional | Yes | Optional | No | Team/org | Internal memos |
| **3** | Personal | **No** | Yes | Optional | No | User only | Daily notes |
| **4** | Private Confidential | **No** | Yes | No | Yes | User only | Finances |
| **5** | Organizational Confidential | **No** | Yes | No | Yes | Named groups | Internal strategy |
| **6** | Secret | **No** | Limited | No | Yes | Whitelisted | Health/legal info |
| **7** | Organization Secret | **No** | Limited | No | Yes | Project teams | R&D, sensitive ops |
| **8** | Restricted / Eyes-Only | **No** | **No** | No | Mandatory | Explicit list | Critical legal files |
| **9** | Cosmic Secret | **No** | **No** | **No** | Mandatory | User only | Master keys |

---

# 8. AEI Behavior Matrix

| Level | AEI Behavior | Allowed Operations |
|-------|--------------|--------------------|
| **0–2** | Fully enabled | Organize, extract entities, link, summarize |
| **3** | Local-only | Organize and summarize locally; no cloud inference |
| **4–5** | Restricted | Preview-only modifications; user approval required |
| **6–7** | Strongly restricted | Metadata‑only scanning; no body processing |
| **8** | Eyes-only | AEI cannot load content at all |
| **9** | Locked | AEI cannot read or reference entity |

---

# 9. Additional Real‑World Security Levels
These levels extend the base model for advanced organizational or enterprise deployments.

### 9.1 Operational
Time-sensitive data that becomes harmless after a deadline.

### 9.2 Compartmentalized
Only specific named entities, persons, or roles may access.

### 9.3 Deceptive Canary
Intentionally marked files used to detect unauthorized access.

### 9.4 Anonymized Data
Stripped of personal identifiers; safe for broader processing.

### 9.5 Pseudonymous Entities
Content where personal identity is concealed behind controlled pseudonyms.

---

# 10. Standard YAML Template

```yaml
sensitivity:
  level: 7
  scope: secret_group
  privacy:
    cloud_ai_allowed: false
    local_ai_allowed: true
    export_allowed: false
  group_access: ["project-apollo", "engineering-team"]
  visibility: internal

risk:
  probability_damage: 4
  severity_damage: 5

control:
  requires_human_approval: true
  requires_audit_log: true
  AEI_restriction_mode: hardened
```

---

# 11. Developer Implementation Guidelines

### 11.1 Validation Layer
- Enforce schema in:
  - entity templates
  - CLI validator
  - AEI ingestion pipeline
- Reject or warn on invalid fields.

### 11.2 AEI Ingestion Rules
- Respect **cloud/local AI permissions** during extraction.
- Enforce **visibility** when constructing relationship graphs.
- Apply **risk modifiers** to set AI operation boundaries.
- Log actions when `requires_audit_log = true`.

### 11.3 Permission-Aware Querying
- Graph traversal should respect:
  - sensitivity.level
  - group_access
  - visibility

### 11.4 Context-Aware AI Routing
- Cloud AI is only used when `cloud_ai_allowed: true`.
- Local models serve as fallback.
- No inference is allowed at levels 8–9.

---

# 12. Future Extensions
- Encryption key metadata for secure offline storage.
- Multi-entity access policies.
- Automated classifier for sensitivity recommendations.
- Adaptive risk scoring based on user activity.

---

# 13. Conclusion
This document defines the **complete, extensible security model** for the Second Brain Foundation. It ensures that all data—personal, organizational, or highly classified—is protected under a unified, explicit, enforceable standard.

Developers must implement all ingestion, processing, and organizational logic with strict adherence to this specification to maintain data integrity, sovereignty, and user trust.

