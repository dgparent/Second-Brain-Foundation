# NEXT-STEPS-EXECUTION-PLAN (v2 — Local‑First, Cloud‑Augmented Hybrid)

This execution plan aligns the entire 2BF refactor with the **Local‑first, Cloud‑augmented Hybrid Model** and the new **Truth Hierarchy**:

1. **User (U1)** – highest truth
2. **Automation (A2)**
3. **AI Local (L3)**
4. **AI Local Network (LN4)**
5. **AI Cloud (C5)** – lowest truth

The system always treats User-generated content as the **canonical source of truth**, and any lower‑level content becomes U1 the moment a user interacts with, edits, or accepts it.

This NEXT‑STEPS plan covers **schema refactor**, **sync system**, **aei-core local-first responsibilities**, **cloud API responsibilities**, **LLM/automation truth-level compliance**, and **multi-channel integration**.

---

# PHASE 0 — Alignment & Foundational Updates (1–2 days)

### **0.1 Add Truth-Level Support Across Schemas**

* Add to **local DB** and **Neon**:

  * `truth_level`
  * `origin_source`
  * `origin_chain` (JSONB)
  * `accepted_by_user`
  * `last_modified_by_level`
* Add `vault_mode` field to tenants: `'local_first' | 'cloud_first'`.

### **0.2 Adopt the Truth Hierarchy In Code**

* Implement constants for levels U1–C5.
* Add helper functions:

  * `is_higher_truth(a, b)`
  * `upgrade_to_user_truth(entity)`
* Document invariants inside Python + Node repos.

### **0.3 Integrate the Hybrid Sync Contract**

* Add `re-alignment-hybrid-sync-contract.md` into `/docs/architecture/`.
* Make this contract authoritative for all refactor work.

---

# PHASE 1 — Local-First Core (Python AEI-Core) (1–2 weeks)

### **1.1 Establish Local Vault as Canonical (for local-first tenants)**

* Local DB + filesystem is primary source of truth.
* All U1 writes originate here.
* AI local outputs (L3) saved as suggestions/drafts.

### **1.2 Implement Truth-Aware Local DB Schema**

* Update entity tables with truth-level fields.
* Ensure file watcher -> entity pipeline assigns:

  * U1 for user-authored content
  * L3 for local AI-generated suggestions

### **1.3 Implement Local Sync Client (stub)**

* Create a module that can:

  * Build `SyncItem[]` from entities
  * Send batches via HTTP (configurable)
* Even if cloud endpoints are not live yet, implement client locally.

### **1.4 Local Acceptance Flow**

* Build internal API call for: `accept_suggestion(entity_id)`:

  * Marks `accepted_by_user = true`
  * Upgrades `truth_level = 1`
  * Appends to `origin_chain`

---

# PHASE 2 — Cloud Core & Sync API (Node + Neon) (1–2 weeks)

### **2.1 Fix Build System & Fully Restore All Node Services**

* Complete pnpm/monorepo build repair.
* Get API, workers, orchestrator, auth-service compiling.
* Ensure migrations run on Neon.

### **2.2 Implement /sync/push**

* Accept `SyncItem[]` from local clients.
* Apply conflict rules:

  1. U1 > A2 > L3 > LN4 > C5
  2. If both U1 → last-write-wins + log event
  3. AI-generated content cannot overwrite U1
* Store in Neon via truth-aware repository functions.

### **2.3 Implement /sync/pull**

* For local-first tenants:

  * Return NEON changes since `version` or timestamp.
  * Cloud suggestions (A2–C5) appear as drafts.
* Ensure strong tenant isolation.

### **2.4 Sync Event Logging**

* All conflicts logged to `security_events` or new `sync_events` table.
* Include truth-level metadata.

### **2.5 Encryption Layer (Incremental)**

* If tenant is `local_first`:

  * Cloud only sees encrypted or summarized versions of note content.
  * Add `content_encrypted` / `encryption_metadata` fields.

---

# PHASE 3 — AI & Automations with Truth-Level Compliance (1–2 weeks)

### **3.1 Truth-Level Enforcement in LLM Orchestrator**

* LLM outputs are stored as:

  * `truth_level = 5` for cloud AI
  * `origin_source = provider/model`
* Store as suggestions unless user accepts.

### **3.2 Local AI (L3) Routing Controls**

* Local AI suggestions saved as L3.
* Provide pipeline for local AI RAG and summarization.

### **3.3 Automation Engine (A2) Truth Rules**

* Automations always write with `truth_level = 2`.
* Automations may generate tasks/notes.
* Automations cannot:

  * Overwrite U1 without explicit user acceptance
  * Hard-delete U1 entities

### **3.4 Upgrade Mechanism**

* When user edits/approves:

  * Mark entity `accepted_by_user = true`
  * Promote to U1
  * Store provenance in `origin_chain`

---

# PHASE 4 — Multi-Channel Integration (Voice, Mobile, IoT) (2–4 weeks)

### **4.1 Per-Channel Origin Sources**

* Annotate interactions with:

  * `user:web`
  * `user:mobile`
  * `user:voice`
  * `automation:<id>`
  * `ai-local:<model>`
  * `ai-cloud:<provider>`

### **4.2 Channel-Specific Truth-Level Constraints**

* Voice & mobile interactions always enter as U1 once accepted by user.
* Voice suggestions from AI → C5.
* IoT telemetry writes into system-owned fields only (`truth_level = 2`).

### **4.3 Approval Flows for High-Risk Actions**

* Voice (Alexa/Google): PIN + capability tables.
* IoT: device ACLs + device_capabilities enforcement.
* Mobile: biometric confirmation for U1 destructive actions.

### **4.4 Unified Multi-Channel Sync**

* Cloud maintains authoritative merged view for cloud-first tenants.
* Local keeps canonical for local-first tenants.
* All channels sync through Node API.

---

# PHASE 5 — Developer Experience, Tests, Observability (ongoing)

### **5.1 DX**

* Add CLI helpers:

  * `sync:push`
  * `sync:pull`
  * `entity:upgrade-truth`

### **5.2 Testing**

* Truth-level tests:

  * L3/L4/C5 cannot overwrite U1
  * U1 vs U1 merge logic
  * Automations vs AI priority
* Sync tests:

  * Push conflicts
  * Pull reconciliation
  * Cross-device local-first consistency

### **5.3 Observability**

* Emit events:

  * `SYNC_PUSH`
  * `SYNC_PULL`
  * `TRUTH_UPGRADE`
  * `CONFLICT_DETECTED`
  * `AI_SUGGESTION_GENERATED`

---

# PHASE 6 — Optional Future Enhancements

### **6.1 CRDT/Operational-Transform Sync**

* For multi-device offline editing.

### **6.2 Encrypted Cloud Search**

* Homomorphic embeddings
* Vector search over encrypted payloads

### **6.3 Per-Tenant AI Model Policy**

* Fine-tuned models per tenant
* Local vs cloud model routing

### **6.4 Distributed Vault Mode**

* Allow shared vaults (family, org teams) with local+cloud hybrid behavior.

---

# Summary

This execution plan re-aligns 2BF to a rock-solid **Local-first, Cloud-augmented Hybrid** foundation. It:

* Makes the **user the source of truth**, always.
* Ensures AI and automations cannot overwrite U1.
* Adds a Truth Hierarchy framework across the entire stack.
* Establishes a robust Sync Contract between local and cloud.
* Enables multi-channel input (web, mobile, voice, IoT) while preserving sovereignty.
* Sets the stage for long-term scalability.

This file should be treated as the MASTER execution roadmap and updated as milestones complete.
