

## `re-alignment-hybrid-sync-contract.md`

````markdown
# Re-Alignment Hybrid Sync Contract  
**Model:** Local-first, Cloud-augmented Hybrid  
**Author:** DGP / 2BF  
**Version:** v1 (Draft)

---

## 1. Purpose

This document defines how data flows, syncs, and resolves between:

- Local vaults (desktop / device)
- Local + network AI (on-prem, LAN)
- Cloud AI + SaaS services

…under a **Local-first, Cloud-augmented** model with a strict **truth hierarchy**:

> If the input is from the user, that is the source of truth.  
> AI content and automations are secondary.  
> The moment a user interacts and builds on lower-level content, it is upgraded to user truth.

This contract must guide:

- Schema design (local DB + Neon)
- Sync endpoints
- Conflict resolution
- How AI + automations write into the system

---

## 2. Truth Hierarchy

Each “piece of information” (entity, field, or fragment) has an **origin level**:

1. **User (U1)** – direct human input (typed, dictated, uploaded, selected, edited, confirmed).
2. **Automation (A2)** – system actions defined/configured by user (rules, workflows).
3. **AI Local (L3)** – AI running fully local on the user’s machine.
4. **AI Local Network (LN4)** – AI running on local network / on-prem nodes (e.g., home lab, office server).
5. **AI Cloud (C5)** – AI services running on external cloud infrastructure (Together.ai, OpenRouter, etc.).

**Rules:**

- Lower numeric value = higher authority.
- Default ordering of trust: `User > Automation > AI Local > AI Local Net > AI Cloud`.
- **Only level 1 (User)** is considered **canonical “truth”** by default.
- The other levels are **proposals, assists, or derived data**, not truth.

---

## 3. Upgrade Rule

> **Upgrade Rule:**  
> If a user *interacts with and builds on* any data from levels 2–5 (A2–C5), the resulting content becomes **User-level (U1)** truth.

“Interacts and builds on” includes:

- Editing an AI suggestion
- Accepting & saving an AI-generated draft
- Converting an automation output into a note/task/entity and explicitly confirming it
- Promoting a suggested entity to “official” in the UI

When this happens:

- The entity/fields get:
  - `truth_level = 1 (User)`
  - `origin_chain` updated to record that it stems from AI/automation
- Any related lower-level copies (cached suggestions, previews) are now subordinate to the new U1 object.

---

## 4. Data Model Extensions

To implement this model, we extend the core entity schema (both local & Neon) with:

### 4.1. Common Fields

Every entity (note, task, automation, device record, etc.) and, where possible, sub-entity fields include:

- `truth_level: SMALLINT`  
  - 1 = User  
  - 2 = Automation  
  - 3 = AI Local  
  - 4 = AI Local Network  
  - 5 = AI Cloud

- `origin_source: TEXT`  
  - e.g., `"user:web"`, `"user:desktop"`, `"automation:rule-123"`, `"ai-local:model-X"`, `"ai-cloud:together-llama-3-70b"`.

- `origin_chain: JSONB`  
  - Array of `{ level, source, timestamp, ref_ids... }` showing provenance.

- `accepted_by_user: BOOLEAN` (default `false`)  
  - `true` when the user explicitly accepts or edits the content.

- `last_modified_by_level: SMALLINT`  
  - Last writer’s level, for conflict resolution.

### 4.2. Local vs Cloud Placement

For **Personal / pseudo-personal tenants (local-first)**:

- **Local DB + filesystem** is the primary store for:
  - All U1 content
  - L3 AI outputs prior to upgrading
  - A2 automations if they run locally

- **Cloud (Neon + object store)** holds:
  - Mirrored copies of entities for sync + compute
  - Mostly **encrypted** or **summarized** content for notes/docs
  - Metadata needed for automations, notifications, multi-device access
  - AI usage logs & embeddings (with clear provenance)

For **Professional / org tenants (cloud-first)**:

- **Cloud** is the primary store for U1, A2, and L3–L5 (depending on deployment).
- Local clients act as heavy clients, caching & syncing down.

---

## 5. Sync Topology

### 5.1. Logical Components

- **Local Vault Core (LVC)** – Python `aei-core` on device
- **Local/On-prem AI** – models running on local GPU / LAN server
- **Cloud Core API** – Node API on Fly.io + Neon
- **Cloud AI** – Together.ai etc., behind the LLM Orchestrator
- **Sync API** – endpoints that coordinate state between LVC and Cloud Core

### 5.2. Primary Data Flows

1. **User-originated writes (U1)**  
   - Happen locally first (LVC, desktop/mobile) or via Cloud UI (web app).
   - Are treated as canonical:
     - If local: they push to cloud via Sync API.
     - If cloud: they pull or push to local depending on mode (local-first vs cloud-first tenant).

2. **Automation & AI writes (A2–C5)**  
   - Must always include:
     - `truth_level` (2–5)
     - `origin_source`
   - Are **never allowed to overwrite U1** content silently.
   - Can:
     - Create proposals (drafts, suggestions)
     - Create derived entities (summaries, embeddings, logs)
     - Update fields marked as “system-owned” (e.g., internal metrics)

---

## 6. Sync Contract

### 6.1. Core Entities

A **SyncItem** represents a unit of change that can be synced:

```json
{
  "entity_type": "note" | "task" | "automation" | "device" | "...",
  "entity_id": "uuid-or-stable-id",
  "tenant_id": "uuid",
  "truth_level": 1,
  "origin_source": "user:desktop",
  "origin_chain": [ /* provenance array */ ],
  "version": 7,
  "last_modified_at": "2025-11-24T16:00:00Z",
  "payload": { /* entity fields, possibly encrypted */ },
  "deleted": false
}
````

The same structure is used for **local → cloud** and **cloud → local**.

### 6.2. Endpoints

Minimal sync endpoints:

* `POST /sync/push`

  * Client → Server
  * Accepts an array of `SyncItem`s from Local Vault Core or from Cloud UI (for cloud-first tenants).
  * Server stores, versions, and applies conflict rules.

* `GET /sync/pull?since=<timestamp-or-version>`

  * Client ← Server
  * Returns changes since a given version or time for that tenant.

Optionally:

* `POST /sync/conflict-resolve`

  * For explicit merges when automatic resolution is ambiguous.

### 6.3. Conflict Resolution Rules

Given a local and cloud version of the same entity:

1. **Different tenants → no comparison** (multi-tenant isolation)

2. If one side is **deleted**:

   * Respect the side with **higher truth level**, unless the other side is **more recent AND also U1**.

3. If both sides exist and differ:

   * **Case A: One side is U1, the other is A2–C5**

     * **U1 wins**, unless the user explicitly accepts the other.

   * **Case B: Both are U1**

     * Use **last write wins** based on `last_modified_at`, but:

       * Log the conflict in `security_events` / `sync_events`.
       * Optional: keep diffs in a conflict-resolutions table.

   * **Case C: Neither is U1 (A2–C5)**

     * Prefer the **lower truth_level** (Automation over AI, local over network, network over cloud).
     * If same level: last write wins.

4. **Upgrade Rule at Sync Time**

   * If a incoming change has `accepted_by_user = true`, **set `truth_level = 1`** regardless of previous level.

---

## 7. Write Rules per Level

### 7.1. User (U1)

* Can write anywhere (local or cloud UI).
* Always sets `truth_level = 1`.
* Can override A2–C5 content.
* Triggers sync to keep mirrors up-to-date.

### 7.2. Automation (A2)

* Executes rules created/approved by user.
* Writes with `truth_level = 2`.
* May:

  * Create tasks/notes marked as automation-generated.
  * Update system fields (status, scheduled_run_at).
* Cannot:

  * Change user ownership or tenant membership.
  * Hard-delete U1 entities without explicit U1 action.

### 7.3. AI Local (L3), AI Local Network (LN4), AI Cloud (C5)

All AI levels:

* Must mark outputs with correct `truth_level` and `origin_source`.
* May create:

  * Draft notes
  * Suggested tasks
  * Summaries / classifications
* Cannot:

  * Immediately replace U1 content.
  * Change security- or billing-related fields.

**Difference by level:**

* **L3 (AI Local):**

  * Can see *more raw data* locally (per tenant privacy config).
  * Cloud may only see: embeddings, redacted summaries, or encrypted blobs.

* **LN4 (AI Local Network):**

  * Similar to L3 but on a LAN / on-prem cluster.
  * Access determined by network-level policies.

* **C5 (AI Cloud):**

  * Restricted input:

    * Redacted or vector-based views
    * Only what tenant policy allows
  * Outputs are **lowest trust by default**.

---

## 8. Local-First vs Cloud-First Tenants

### 8.1. Local-First Tenants (Personal, Pseudo-personal)

* `vault_mode = 'local_first'`
* Canonical DB is local; Neon is a **mirror + compute** store.
* Sync flows:

  * U1 changes:

    * Local → Cloud via `/sync/push`.
  * A2–C5 changes:

    * If generated locally, they live local until user accepts or sync policy propagates them.
    * If generated in cloud, they are proposals; local can pull & show them as suggestions.

### 8.2. Cloud-First Tenants (Professional / Org)

* `vault_mode = 'cloud_first'`
* Canonical DB is Neon; local clients act as heavy clients against cloud.
* U1 can still originate from local or web, but Neon remains primary.

---

## 9. Implementation Priorities

For v1, focus on:

1. Adding `truth_level`, `origin_source`, `origin_chain`, `accepted_by_user` to entities in both local DB and Neon.
2. Implementing `/sync/push` and `/sync/pull` endpoints and simple conflict resolution.
3. Ensuring all AI + automation services populate correct `truth_level` and never overwrite U1 without explicit user action.
4. Surfacing “upgrade to user truth” as a clear, discrete action in the UI.

This contract is intended to evolve—but the **truth hierarchy and Upgrade Rule should remain stable** as core system invariants.

```

---

## Adjusted Next Steps (Execution Plan v2 – Aligned with Hybrid Sync Contract)

Here’s an updated high-level Next Steps plan that folds in the sync contract and the truth hierarchy. This is meant to replace/augment the previous `NEXT-STEPS-EXECUTION-PLAN.md` phases.

### Phase 0 – Alignment & Schema Updates (1–2 days)

1. **Add Truth Fields to Schemas**
   - Local DB (aei-core) and Neon:
     - `truth_level`
     - `origin_source`
     - `origin_chain` (JSONB)
     - `accepted_by_user`
     - `last_modified_by_level`

2. **Add Tenant Vault Mode**
   - `vault_mode: 'local_first' | 'cloud_first'` per tenant.
   - Mark your own personal tenants as `local_first` as the reference implementation.

3. **Document Truth-Level Invariants**
   - Add `re-alignment-hybrid-sync-contract.md` to `/docs/architecture/`.
   - Add short “developer note” in both Python and Node repos summarizing:
     - `User > Automation > AI Local > AI Local Net > AI Cloud`
     - Upgrade Rule

---

### Phase 1 – Local-First Core (Python AEI Core) (1–2 weeks)

1. **Local Vault Canonicalization**
   - Ensure aei-core:
     - Treats user actions (desktop UI / CLI) as `truth_level = 1`.
     - Tracks L3 AI outputs with `truth_level = 3`.
     - Distinguishes between “draft/suggestion” and “accepted by user”.

2. **Local Sync Client (Stub)**
   - Implement a simple “sync client” module in aei-core:
     - Prepares an array of `SyncItem`s.
     - Has pluggable transport (HTTP) but can be pointed to `localhost` for now.

3. **File Watcher → Entity → Truth-aware DB**
   - Existing file watcher:
     - Map file changes to entities.
     - Mark initial imports as `truth_level = 1` (user-authored).
   - Any AI annotation / summary runs:
     - Store as separate entities or fields with `truth_level = 3`.

---

### Phase 2 – Cloud Core & Sync API (Node + Neon) (1–2 weeks)

1. **Fix Build & Migrations**
   - Get Node/Fly.io services compiling again.
   - Apply updated migrations in Neon (truth fields, vault_mode).

2. **Implement `/sync/push` and `/sync/pull`**
   - In the API service:
     - Accept `SyncItem[]` from local.
     - Apply conflict rules (truth-level then timestamp).
     - Store changes in Neon.
   - For `local_first` tenants:
     - Treat incoming local U1 as canonical.
   - For `cloud_first` tenants:
     - Align with existing cloud-led logic.

3. **Basic Conflict Resolution Logging**
   - Write `sync_events` / `security_events` entries whenever:
     - Conflicts arise between U1 and others.
     - A non-U1 update is discarded in favor of U1.

---

### Phase 3 – AI & Automations Respecting Truth Levels (1–2 weeks)

1. **LLM Orchestrator Integration**
   - Update LLM orchestrator so all outputs:
     - Have `truth_level = 3, 4, or 5` depending on where they run.
     - Are stored as **suggestions**, not directly overwriting U1 content.
   - Persist LLM outputs with proper `origin_source` (model name, provider).

2. **Automation Engine Integration**
   - Automations:
     - Write with `truth_level = 2`.
     - Log their origin rule/flow in `origin_source`.
   - Automations may:
     - Create tasks/notes.
     - Modify system fields and statuses.
   - They may not:
     - Hard-delete U1 without explicit user action.

3. **Upgrade Flow in UI**
   - Web & desktop UI:
     - When user accepts AI/automation suggestions:
       - Set `accepted_by_user = true`.
       - Upgrade `truth_level` to `1`.
       - Emit proper sync events so mirrors update.

---

### Phase 4 – Multi-Channel Application (Voice, Mobile, IoT) (ongoing)

1. **Channel-tagged `origin_source`**
   - Web: `user:web`
   - Desktop local: `user:desktop`
   - Mobile: `user:mobile`
   - Voice: `user:voice`
   - IoT/Automation: `automation:rule-XYZ`, `ai-cloud:model-XYZ` etc.

2. **Per-Channel Capability Enforcement**
   - Tie the multi-channel auth model to:
     - Which actions can generate U1 vs A2–C5.
     - How/when user confirmations are required (PIN, 2FA).

3. **Telemetry & Suggestions from IoT / Voice**
   - IoT and Voice outputs always come in as:
     - A2 (automation-level), or
     - AI-level suggestions.
   - Only become U1 if user confirms or edits them.

---

If you’d like, I can now take your existing `NEXT-STEPS-EXECUTION-PLAN.md`, rewrite it line-by-line into a v2 that ***embeds*** this truth model and sync contract directly as checkboxes/tasks (so you can drop it into the repo and start executing).
::contentReference[oaicite:0]{index=0}
```
