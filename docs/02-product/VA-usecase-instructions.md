VA Use Case Instructions (v1)

Second Brain Foundation – Virtual Assistant Enablement

File: VA-usecase-instructions.md
Audience: 2BF devs & AEI designers implementing VA-focused features in v1
Context: VAs will use the 2ndBrain app as their primary “Operations OS” for client work, knowledge, and automation.

1. Objectives & Design Principles
1.1 Business Objective

You will operate a Virtual Assistant (VA) agency. Each VA (or VA pod) should use the 2ndBrain app to:

Centralize all client context (people, systems, SOPs, assets).

Manage tasks, calendars, comms, research, and content.

Automate repetitive workflows (data entry, reporting, summaries, knowledge filing).

Build reusable knowledge (SOPs, templates, briefs) that compound over time.

This is both:

A PKM OS for VAs, and

A workflow automation hub (with AEI + CLI + BMAD).

1.2 Design Principles

Client-centric graph: Everything rolls up to va.client and va.account_workspace.

Process-first, not app-first: Model VA work as SOPs and workflows, not specific SaaS tools.

Automate the “VA-of-the-VA”: AEI should handle meta-work: summaries, routing, correlation, drafting.

Markdown-first: Every artifact is a .md file with YAML frontmatter + body.

BMAD-friendly: All entities/workflows decomposed into Brainstorm → Map → Architect → Deliver steps.

Privacy-safe multi-client: Strong separation & security for each client’s data.

2. Research Summary – VA Work & Gaps
2.1 Major VA Task Clusters

From multiple VA task guides and agency blogs, common VA responsibilities include:
Magic | Virtual Executive Assistants
+2
repstack.co
+2

Admin & Executive Support

Email triage & inbox rules

Calendar management & scheduling

Travel planning

Meeting prep & note-taking

Research & Market Intelligence

Market/competitor research

Lead & prospect research

Data collection and summarization

Content & Marketing

Blog/newsletter drafting

Social media scheduling & engagement

Basic design / asset organization

Ops & Data

Data entry & CRM updates

Spreadsheet upkeep & cleaning

Reporting & dashboards

Customer Support / Client-facing

Responding to simple inquiries

Routing complex cases to humans

Logging issues & resolutions

VAs increasingly use workflow tools (Notion, Asana/Trello, CRMs, Zapier/Make, social schedulers). Automation (e.g., Zapier) is highlighted as crucial to reduce repetitive “glue work.”
GigaBPO
+1

2.2 Pain Points the VA-2BF Stack Should Address

Context scattered across email, Slack, docs, SaaS dashboards.

Same questions answered repeatedly; SOPs exist but are hard to find.
Engageware
+1

Manual updating of spreadsheets/CRMs and reporting dashboards.
Magic | Virtual Executive Assistants
+1

Poor handover between VAs or when client grows / adds new VAs.

No single “memory” of the client: decisions, rationale, and history get lost.

2ndBrain for VAs should become:

“The canonical memory + workflow engine for each client relationship.”

3. VA Role Archetypes & What We Support

We target four archetypes in v1:

Executive / Admin VA

Inbox & calendar management, meeting notes, travel planning, light personal tasks.

Ops / Data VA

Data entry, CRM updates, light bookkeeping, recurring reporting.

Marketing / Content VA

Content calendars, draft posts, blog/newsletter workflows, asset curation.

Research / Strategy VA

Structured research briefs, docs, competitor tracking, client intelligence.

Requirement: The same data model must support all four, with entity-type subsets per role.

4. Core VA Entities & Data Model
4.1 High-Level Entity List

These are new or VA-focused entity types; they extend existing PKM entities.

va.client

va.account_workspace

va.sop (Standard Operating Procedure)

va.service_package

va.task_intake

va.task

va.recurring_task

va.meeting

va.call_log

va.research_brief

va.report

va.content_calendar

va.content_item

va.automation

people.contact (reused)

task.item / task.project (reused but namespaced via relations)

4.1.1 va.client
---
uid: va-client-[slug]
type: va.client
title: "Client – [Name/Company]"
contact_uid: people-[primary-contact]
industry: coaching | agency | ecommerce | SaaS | other
time_zone: "America/Toronto"
primary_channels:
  - email
  - whatsapp
  - slack
tool_stack:
  - "Google Workspace"
  - "HubSpot CRM"
  - "Stripe"
service_packages:
  - va-service-[uid]
sops:
  - va-sop-[uid]
active_vas:
  - va-account-[uid]
sensitivity:
  level: 4
  visibility: user
  scope: internal_group
---
[Client summary, notes, preferences, working agreements]

4.1.2 va.account_workspace (VA per client)
---
uid: va-account-[client]-[va-name]
type: va.account_workspace
client_uid: va-client-[slug]
assigned_va: people-[va-contact]
roles:
  - exec_support
  - content_support
status: active
current_projects:
  - va-project-[...]
preferred_hours_per_week: 20
communication_rules:
  response_sla_hours: 12
  daily_update_time: "17:00"
---
[Working notes, account-level info, quick links]

4.1.3 va.sop
---
uid: va-sop-[slug]
type: va.sop
client_uid: va-client-[slug]  # optional, can be generic
title: "SOP – Inbox Zero for Client X"
category: inbox | calendar | content | research | ops | support
trigger: "New email arrives in [client inbox label]"
desired_outcome: "Inbox is processed, only actionable items remain"
frequency: daily
steps:
  - "Check VIP label first"
  - "Archive all newsletters to [folder]"
  - "Flag items needing client decision..."
tools:
  - "Gmail"
  - "2BF CLI"
aei_automation_link: va-automation-[uid]
version: 1.0
owner: people-[uid]
---
[Detailed SOP narrative or checklist]

4.1.4 va.task_intake & va.task

Intake – raw, unstructured request:

---
uid: va-taskintake-[timestamp]
type: va.task_intake
client_uid: va-client-[slug]
account_uid: va-account-[uid]
source: email | voice_note | slack | form
source_ref: "gmail-msg-id-123"
received_at: 2025-11-20T13:00:00-05:00
raw_text: >
  "Can you book flights for next month to Palawan
   leaving between the 3rd and 5th?"
aei_status: parsed | pending
linked_task_uid: va-task-[uid]
---
[Optional notes]


Task – structured and actionable:

---
uid: va-task-[slug]
type: va.task
client_uid: va-client-[slug]
account_uid: va-account-[uid]
title: "Book flights to Palawan (Mar 3–5 window)"
status: todo | in_progress | blocked | done
priority: low | normal | high | urgent
due_date: 2025-02-01
tags:
  - travel
  - exec_support
source_intake_uid: va-taskintake-[uid]
related_sop_uids:
  - va-sop-travel-booking
related_project_uid: task.project-[uid]
---
[Execution notes, decisions, confirmations]

4.2 Research, Meetings & Reporting Entities
va.research_brief
---
uid: va-research-[slug]
type: va.research_brief
client_uid: va-client-[slug]
account_uid: va-account-[uid]
topic: "Competitor analysis – local coffee shops Ottawa"
scope: narrow | broad
deadline: 2025-11-30
status: draft | in_review | final
source_links:
  - "https://..."
aei_summary_uid: info.article-[uid]    # AEI-generated summary entity
---
[Human-readable structured brief / outline]

va.meeting
---
uid: va-meeting-[slug]
type: va.meeting
client_uid: va-client-[slug]
account_uid: va-account-[uid]
datetime: 2025-11-21T10:00:00-05:00
duration_minutes: 45
attendees:
  - people-client
  - people-va
source: zoom | teams | gmeet
recording_ref: "gdrive://..."
notes_uid: personal.journal_entry-[uid]
aei_actions_extracted: true
---
[Optional quick notes; full content in linked notes entity]

va.report
---
uid: va-report-weekly-[client]-2025-11-21
type: va.report
client_uid: va-client-[slug]
account_uid: va-account-[uid]
period:
  from: 2025-11-14
  to: 2025-11-21
report_type: weekly_update | kpi_report | campaign_summary
aei_generated: true
status: draft | sent
deliver_to:
  - people-client
---
[AEI-SYNTHESIZE generated weekly summary + highlights]

4.3 Content & Calendar Entities
va.content_calendar
---
uid: va-contentcal-[client]-2025-12
type: va.content_calendar
client_uid: va-client-[slug]
platforms:
  - instagram
  - facebook
  - linkedin
month: 2025-12
linked_content_items:
  - va-contentitem-[uid]
---
[Overview + strategy notes]

va.content_item
---
uid: va-contentitem-[slug]
type: va.content_item
client_uid: va-client-[slug]
account_uid: va-account-[uid]
platform: instagram
status: idea | draft | scheduled | published
publish_date: 2025-12-15
campaign_tag: "holiday-promo-2025"
asset_refs:
  - "canva://design/..."
copy_ref: info.article-[uid]
---
[Inline or linked draft copy, hashtags, etc.]

4.4 Automation Entities
va.automation
---
uid: va-automation-[slug]
type: va.automation
client_uid: va-client-[slug]
scope: inbox | calendar | research | reporting | content
description: "Turn travel-related emails into travel tasks + research briefs"
trigger:
  source: gmail
  filter: "subject contains 'flight' OR 'hotel' AND from:[client]"
actions:
  - "AEI_INGEST → va.task_intake"
  - "AEI_PARSE → va.task"
  - "Create travel checklist task if not present"
status: enabled | disabled | test
owner: people-[va]
linked_sop_uid: va-sop-[uid]
bm_ad_profile: "VA-AUTOMATION-TRAVEL"
---
[Dev notes about implementation via CLI, APIs, or external automations]

5. Key VA Workflows & Automation Targets

Below are priority v1 workflows and how we expect the app + AEI to support/automate them.

5.1 Email → Task / SOP / Knowledge

Goal: Turn messy inbox into structured va.task, va.sop, and va.research_brief entities.

Flow:

Ingest

Source: Gmail / Outlook API or manual paste.

AEI_INGEST creates va.task_intake with raw email body + metadata.

Parse & Classify

AEI_INGEST/AEI_CORRELATE:

Determine type: task, info-only, research request, calendar event, FYI.

If task → create va.task and link back to intake.

If research → create va.research_brief.

If recurring pattern → suggest/update va.sop.

Automations

va.automation definitions for:

Travel emails → travel tasks + travel briefs.

Invoice/billing emails → finance tasks.

Content approvals → va.content_item status changes.

BMAD hooks (for dev):

Brainstorm: map common email patterns per client.

Map: design va.sop + va.automation combos.

Architect: build CLI recipes (copilot-cli flows) that:

read latest email exports

call AEI_INGEST

commit new/updated .md.

Deliver: schedule via cron or external automation runner.

5.2 Calendar & Meeting Support

Goal: Automate meeting prep, notes, and follow-up for VAs supporting busy clients.

Flow:

Sync upcoming events (via API or export).

AEI_INGEST creates/updates va.meeting entities.

For each meeting:

Pre-meeting:

AEI_SYNTHESIZE “context brief” from linked entities (va.client, va.research_brief, va.tasks).

Post-meeting:

Ingest transcript / notes.

AEI_INGEST → create personal.journal_entry/info.article.

AEI_CORRELATE → extract action items → va.task / task.item.

Weekly AEI_SYNTHESIZE job builds va.report of meetings + outcomes.

5.3 Research & Competitive Intelligence

Goal: Turn ad-hoc VA research into structured, reusable knowledge.

Flow:

VA receives request → logs va.research_brief.

During research:

Source links → info.article / info.saved_item.

Highlights → info.highlight.

AEI_SYNTHESIZE:

Consolidate highlights → final research brief summary.

Generate candidate pki.permanent_notes for long-term strategies/insights.

Link these to:

Client strategies

Content calendars

Lead lists (future v1.x)

5.4 Content Calendar & Social Media Support

Goal: Provide a simple content-calendar model + automation hooks.

Flow:

va.content_calendar for each month.

va.content_item per post:

AEI_INGEST can:

transform a prompt or research brief into draft copy.

Automation:

Export content to CSV or integration-ready JSON for schedulers (e.g., Buffer, Hootsuite)
Zapier
+1
.

AEI_SYNTHESIZE:

Recap posts published + metrics (via manual import or API in future).

5.5 Ops / Data / Reporting

Goal: Reduce manual spreadsheet grinding; use the vault as a source-of-truth for reports.

Flow:

VA imports or logs daily/weekly operations data (structured or CSV).

AEI_INGEST converts rows → entities (finance.transaction, ops.metric, etc.).

AEI_CORRELATE:

Link metrics to va.client, va.service_package, and projects.

AEI_SYNTHESIZE:

Build va.report (weekly) for each client:

tasks completed

tasks pending

key metrics

issues/risks

opportunities / suggestions

6. BMAD-Method Integration (for Github Copilot CLI)

We want devs & power users to use BMAD with Copilot CLI to build VA automations.

6.1 BMAD Stages

B – Brainstorm

Identify client types, VA role, recurring workflows.

List “top 20 recurring tasks” per client.

M – Map

Map each task → entity types (va.task, va.sop, va.automation, etc.).

Decide how these entities relate (graph edges).

A – Architect

Architect CLI commands & pipelines:

e.g., 2bf va:intake:email, 2bf va:weekly-report.

D – Deliver

Implement, test, and schedule workflows.

6.2 Example CLI-Oriented Pseudocode (for devs using Copilot CLI)

Not actual commands, but shape we want to support:

# 1. Pull latest email exports for a given client
2bf va:pull-email --client acme-co --since "2025-11-01"

# 2. Run AEI ingestion on raw messages -> va.task_intake + va.task
2bf va:ingest-email --client acme-co --mode tasks

# 3. Generate a daily VA briefing
2bf va:daily-brief --client acme-co > reports/acme-co-brief-2025-11-20.md

# 4. Weekly report generation (AEI_SYNTHESIZE)
2bf va:weekly-report --client acme-co --from 2025-11-14 --to 2025-11-21


Instruction to devs:
Design CLI scaffolding commands that operate on the VA entity types defined above and integrate with AEI_INGEST / AEI_CORRELATE / AEI_SYNTHESIZE modes.

7. Security, Privacy & Multi-Client Considerations

The VA environment is multi-tenant from the VA’s perspective (many clients in one vault), but logically isolated per-client:

Every entity that is client-specific MUST carry client_uid.

Security levels:

Default sensitivity.level >= 4 for client data.

AEI code likely something like: SEC:4-PERS or SEC:4-INT depending on context.

AEI must never cross-link data between different va.client entities unless:

entity is explicitly marked as generic (e.g., a generic SOP template),

or user explicitly allows cross-client SOP reuse.

Developer rule:
AEI_CORRELATE must treat client_uid as a hard boundary except for generic entities (va.sop with no client_uid, global notes, etc.).

8. v1 Scope vs. Future Enhancements
8.1 v1 MUST-HAVES

Entity templates:

va.client, va.account_workspace, va.sop, va.task_intake, va.task, va.meeting, va.research_brief, va.report, va.content_calendar, va.content_item, va.automation.

Core workflows:

Email → task / brief / SOP suggestion.

Meeting ingestion & weekly reports.

Simple content calendar management.

Basic AEI integration:

AEI_INGEST for tasks/research/notes.

AEI_SYNTHESIZE for weekly client report.

AEI_CORRELATE for linking tasks to SOPs, clients, projects.

8.2 v1.1+ Ideas (Out of Scope for Initial Build, but Inform Design)

Bi-directional CRM sync (HubSpot/Pipedrive/Close).

Direct social scheduler integration (publish content from vault).

Advanced service packages & billing integration (tie time logs to invoices).

Multi-VA collaboration features (handoff dashboards, multi-account summaries).

VA performance analytics (tasks per week, SLA compliance, etc.).

9. Developer Implementation Notes

Scaffolding

Provide 2bf CLI generators for each VA entity:

2bf scaffold va.client

2bf scaffold va.sop

2bf scaffold va.task etc.

Templates

Include .md template files under something like:

templates/va/va.client.md

templates/va/va.sop.md

AEI Modes

Extend AEI_INGEST to:

Detect VA-related content and output va.task_intake / va.task / va.research_brief.

Extend AEI_SYNTHESIZE to:

Produce va.report for a given client & time window.

BMAD Documentation

Add a VA-BMAD-Playbook.md (future) describing sample BMAD flows for each VA archetype.

10. Summary

This VA-usecase-instructions.md defines:

The entities, workflows, and automation targets that V1 of 2ndBrain must support to turn it into a powerful OS for Virtual Assistants.

A clear mapping from real-world VA tasks → structured knowledge graph → AEI workflows.

A BMAD-aligned framing (Brainstorm, Map, Architect, Deliver) so GitHub Copilot CLI can assist in developing and evolving these features.

Next steps for devs:

Implement entity templates and scaffolding.

Wire AEI ingestion & synthesis flows around VA entities.

Prototype 2–3 end-to-end VA workflows (email → task, meeting → report, research → brief) and validate with test data.