Multi-Tenant Architecture & Tenant Types

for Second Brain Foundation / AEI

1. Purpose & Scope

This document defines the future multi-tenant model for the Second Brain Foundation (SBF) app and AEI (AI-Enabled Interface).

Goals:

Support multiple “vaults” (tenants) per user with clean isolation

Cover three primary tenant types:

Personal

Pseudo-personal (delegated/guardian use)

Professional (orgs, teams, groups of interest)

Align with SBF’s existing privacy model, sensitivity metadata and local-first architecture

Follow current multi-tenant SaaS best practices around isolation, access control, and security. 
Frontegg
+1

This is a concept + implementation guide to steer both backend and AEI design.

2. Core Concepts & Terminology
2.1 Tenant

A tenant is a logical container of data, configuration, and users that share a single “vault” view.

Examples:

A single person’s second brain

A child’s/elderly parent’s vault managed by a guardian

A company or team workspace

A topic-based community / group of interest

Every persisted object must be scoped by tenant (e.g., tenant_id).

2.2 User, Subject, Guardian, Member

User – A human with login credentials to the platform.

Subject – The individual the data is about (the “owner” of a pseudo-personal vault – e.g., child, elderly parent).

Guardian – User(s) who manage the subject’s vault in a pseudo-personal tenant.

Member – Any user who has some access role in a tenant (owner, admin, editor, viewer, etc.).

2.3 Tenant Types

Personal Tenant

One user is usually both Subject and Owner.

Default for most users.

Strong ties to local-first and personal privacy controls.

Pseudo-Personal Tenant

Subject usually does not log in (child, disabled, elderly, incarcerated, someone on long vacation).

One or more Guardians (users) manage the vault on their behalf.

Needs stronger audit trails and explicit delegation & consent flows.

Professional Tenant

Represents a company, team, or structured group:

Own business

Department/enterprise account

Group of interest / project group

Multimember roles (owner/admin/member/guest).

Professional-grade controls: SSO, multi-factor, stricter data policies, potential compliance.

Also prepare for large enterprises that may want multi tenant support within their own tenant.

3. High-Level Multi-Tenant Architecture
3.1 Repository & Vault Model

SBF is built around markdown files + YAML frontmatter + AEI rather than a classic SaaS database only.

Multi-tenant model:

Each tenant corresponds to a vault root:

Example folder layout on disk:

vaults/<tenant_id>/Daily/...

vaults/<tenant_id>/People/...

vaults/<tenant_id>/Projects/...

AEI and CLI always operate in a tenant context:

tenant_id must be part of:

Request context

Indexing context (vector DB / graph)

Logging & audit events

3.2 Logical vs Physical Isolation

For future hosted / server deployments we adopt a layered strategy following common SaaS patterns: 
Microsoft Learn
+3
Bytebase
+3
Clerk
+3

Baseline (default) – Shared DB, Shared Schema

All tenants share the same database and schema.

Every record includes tenant_id.

Enforced by row-level security (RLS) and app-level tenant filtering.

Best for large numbers of small tenants.

Premium / Enterprise – Optional DB-per-Tenant

Big or regulated customers can be given dedicated databases.

Provisioning slower, but:

Stronger isolation

Easier per-tenant tuning / compliance

File System

Even if DB is shared, files on disk should be separated per tenant root directory.

AEI must never mix files from different tenant roots in a single tenant context.

4. Data Isolation Strategy

Data isolation is the primary risk in multi-tenant systems. OWASP calls this “tenant isolation escape” and treats it as a critical cloud risk. 
OWASP
+2
Medium
+2

4.1 Tenant-Aware Context

Every backend operation must start by resolving a tenant context:

TenantContext {
  tenant_id: string
  tenant_type: "personal" | "pseudo_personal" | "professional"
  user_id: string
  user_roles: string[]            # within this tenant
  attributes: Record<string, any> # org / subject attributes (for ABAC)
}


Rules:

TenantContext is resolved after auth and before any DB or filesystem call.

All repository methods require tenant_id.

All DB queries must filter by tenant_id (and any other necessary constraints).

4.2 Row-Level Security (Server Mode)

When using a relational DB (Postgres strongly recommended):

Enable Row-Level Security and define policies that enforce:

tenant_id = current_tenant_id

Additional user constraints as needed. 
DEV Community
+2
Microsoft Learn
+2

Application logic must never bypass RLS.

4.3 File System Isolation

Vault layout: vaults/<tenant_slug_or_uuid>/...

Never allow “relative path escape” from the tenant root.

AEI file watcher and organization engine must operate per tenant root.

4.4 Indexes (Vector DB / Graph DB)

Each tenant has separate collections / namespaces:

entities_<tenant_id>

notes_<tenant_id>

Knowledge graph nodes and edges store tenant_id.

No cross-tenant index queries unless explicitly requested by an admin in a “multi-tenant admin console” (future feature, not default).

5. Identity, Membership & Access Control
5.1 Authentication vs Tenant Membership

Authentication: Who is this person? (account identity – email, OIDC, etc.)

Tenant Membership: Which tenants does this user belong to, and with what roles?

A user can:

Belong to multiple tenants

Have different roles per tenant (e.g., personal owner, guardian in another, employee in professional tenant).

5.2 Authorization Model: RBAC + ABAC Hybrid

Best practices for multi-tenant app authorization increasingly use a hybrid of RBAC (roles) and ABAC (attributes) for flexibility. 
Qrvey
+4
AWS Documentation
+4
Auth0
+4

We adopt:

RBAC for “who can do what” within tenant:

Roles: tenant_owner, tenant_admin, member, viewer, guardian (pseudo-personal), etc.

ABAC for “under what conditions”:

Attributes: tenant_type, sensitivity, privacy.cloud_ai_allowed, is_guardian, is_subject, org_unit, uses_mfa, etc.

Example rule (conceptual):

“User with role guardian in pseudo-personal tenant can edit notes with sensitivity ≤ confidential but cannot change sensitivity or delete vault.”

5.3 Tenant Roles

Common Roles (all tenant types):

tenant_owner

tenant_admin

member

viewer

Pseudo-Personal Specific:

subject (optional login)

guardian (one or more users with delegated authority)

care_team / operator (optional; limited access for caregivers, VAs, etc.)

Professional Specific:

billing_admin

org_admin

manager (team lead)

guest (restricted external collaborator)

These roles get mapped to concrete permissions (CRUD on notes, entities, AI operations, configuration changes, etc.).

5.4 Cross-Tenant Safety

OWASP stresses that multi-tenant systems must ensure that sessions and tokens are tenant-scoped, preventing token reuse across tenants. 
OWASP Top 10 Proactive Controls
+3
GitHub
+3
OWASP Cheat Sheet Series
+3

Rules:

Session must include tenant_id and be invalid if:

User loses membership in that tenant.

Tenant is deactivated.

UI must always display active tenant and make tenant switching explicit to avoid human mistakes.

6. Tenant-Specific Behavior
6.1 Personal Tenant

Characteristics

Most common entry path.

Subject = User (typically).

Strong emphasis on local-first and fine-grained sensitivity controls.

Defaults

tenant_type = "personal"

sensitivity defaults to personal for new entities.

privacy.local_ai_allowed = true, privacy.cloud_ai_allowed = false by default; user can opt in by sensitivity level.

Recommended UX

“My Vault” view as default after login.

Easy creation of new personal tenants (e.g., “Health Vault”, “Research Vault”) if you decide to support multiple per user.

6.2 Pseudo-Personal Tenant

Designed for individuals who can’t or don’t want to manage their own digital second brain.

Examples:

Children

Elderly parents

Disabled individuals

Incarcerated

Someone traveling or temporarily offline

Key Concepts

Subject is a person entity in the vault (may or may not have a login).

Guardian(s) are users with primary control.

Data Model

Tenant {
  id: string
  type: "pseudo_personal"
  subject_person_uid: string        # maps to People/ entity
  guardians: TenantMembership[]     # members with role "guardian"
  additional_roles: TenantMembership[]
  policies: {
    export_requires_two_guardians?: boolean
    allow_subject_login?: boolean
    audit_retention_days: number
  }
}


Behavior Requirements

Delegation + Consent

On creation, capture how guardians got authority (e.g., parental, legal, verbal consent).

Store this as a provenance note in the vault (e.g., Provenance/guardian-agreement-<uid>.md).

Auditability

Log all high-impact actions by guardians:

Changing sensitivity

Deleting entities

Exporting data

Keep per-tenant audit logs under tenant root.

Optional Subject Access

Subject might later gain login access (e.g., child becomes adult).

Provide a path to:

Promote subject to tenant_owner

Demote or remove guardians

Transfer tenant from pseudo-personal → personal.

Safeguards

Soft delete with retention window (e.g., 30 days) before permanent purge.

Option to require two guardians to approve destructive actions for edge cases.

6.3 Professional Tenant

Represents organizations, teams, or groups of interest.

Types:

Own small business

Formal enterprise team account

Professional VA hub using SBF for clients

Community or interest group

Tenant Model

Tenant {
  id: string
  type: "professional"
  display_name: string
  slug: string
  billing_account_id?: string
  org_metadata: {
    legal_name?: string
    country?: string
    industry?: string
    size?: string
  }
  features: {
    sso_enabled: boolean
    max_members: number
    retention_days: number
    enable_cross_workspace_search: boolean
  }
}


Professional-Specific Requirements

Org-Style Membership

Users invited by email; must accept invitation.

Role matrix:

billing_admin – manages billing and plan

org_admin – manages users, security policies

manager – manages subset of users/projects

member – normal user

guest – limited, project-specific permissions

SSO and External IDPs (Future)

Use OIDC/SAML for enterprise.

Map IdP group/claims → tenant roles (ABAC). 
Microsoft Learn
+2
Okta Developer
+2

Multiple Workspaces / Domains

One professional tenant may later have sub-tenants or spaces (e.g., separate workspace per client for VA business).

For v1, keep it simple: one tenant = one workspace.

Compliance & Policies

Tenant-level policy config:

Min password length / MFA requirement

Allowed AI providers (local only vs cloud allowed)

Data residency (if you add regions later)

Retention & legal hold flags

7. Integration with Existing SBF Metadata & AEI

SBF already defines rich metadata: sensitivity, privacy, lifecycle, bmom, rel, etc.

7.1 Adding Tenant Metadata to Entities

Extend frontmatter to include:

uid: topic-sleep-001
tenant_id: tnt-1234
type: topic
title: Sleep Optimization
sensitivity: personal
privacy:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: true
# ...


All AEI operations must respect both:

Tenant boundary (tenant_id)

Entity sensitivity/privacy

7.2 AEI Backend & Tenant Context

Per fullstack architecture, AEI runs as a local service with API endpoints like /api/v1/entities, /api/v1/daily, etc.

Changes:

Every API call must:

Take tenant_id as part of auth/session.

Enforce tenant isolation at service layer.

File watcher runs per tenant root.

Vector DB collections / graphs are per tenant.

8. Operational Considerations
8.1 Tenant Lifecycle

Provisioning

Create tenant record

Create tenant root directory

Initialize SBF folder structure under that root (Daily, People, Places, etc.)

Onboarding

Create initial README.md and a “Welcome” daily note.

For pseudo-personal: create Subject entity + guardian provenance note.

Offboarding / Deletion

Mark tenant as pending_delete.

Freeze access (except export).

After retention window, purge data from:

File system

DB

Indexes

Logs (as per policy)

8.2 Backup & Restore

Backups should be tenant-aware:

Support full system backups.

Also support per-tenant export (tar.gz of vault + minimal metadata).

Restores should allow:

Full environment restore.

Per-tenant restore into a new tenant (e.g., migration / out-of-band recovery).

8.3 Rate Limiting & Fair Use

In multi-tenant environments, prevent noisy neighbors:

Per-tenant limits:

Requests per minute

AI tokens per day

Storage quota

9. Implementation Checklist (v1)

Data & Models

 Define Tenant and TenantMembership models (DB + in-memory).

 Add tenant_id to all persisted entities (DB + frontmatter).

 Create consistent tenant_id format (UUID or slug + counter).

Backend / AEI

 Implement TenantContext extraction from auth/session.

 Wrap all DB/FS operations to require tenant_id.

 Configure RLS policies if using Postgres.

 Namespace vector DB and graph DB per tenant.

Auth & Roles

 Implement membership CRUD (invite, accept, remove).

 Implement role matrix for each tenant type.

 Implement ABAC engine hooks that can read entity sensitivity/privacy + tenant_type.

Tenant Types

 Personal: default tenant type on registration.

 Pseudo-personal:

 Subject + guardian modeling

 Guardian-specific restrictions and audit logging

 Professional:

 Org metadata

 Admin/billing roles

 Basic org policies (MFA required, etc.)

UX

 Tenant switcher in UI with clear active tenant indicator.

 Tenant creation flows per type (personal, pseudo-personal, professional).

 “My tenants” page listing all memberships with roles.

Security

 Review against OWASP tenant isolation + access control guidance. 
appsecmaster.net
+3
OWASP
+3
OWASP Cheat Sheet Series
+3

 Ensure no API can access resources without tenant_id and membership check.

 Add per-tenant logging & monitoring.