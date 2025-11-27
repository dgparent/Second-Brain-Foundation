AEI Automation & Scheduler Implementation Guide

Version: 0.1 (Draft)
Target: 2BF / AEI core, frameworks, domain modules, VA tools, and external integrations
Audience: Backend + frontend devs, framework authors, module authors, AEI/CLI tooling maintainers

1. Purpose & Scope

This document defines how to implement AI-assisted automation and scheduling across the entire Second Brain Foundation stack:

A single Automation Engine + Scheduler that any:

framework (Financial, Health, Knowledge, etc.),

domain module,

AEI use case (VA stack, CRM, R&D, KMDB),

and external integration

can use to define, schedule, and run automations.

It operationalizes the project’s vision of scheduled background actions (reminders, periodic searches, maintenance) and scheduled knowledge base enrichment as first-class capabilities.

It must also respect the system’s commitment to transparent, auditable automation rules within clearly defined boundaries.

2. Core Concepts
2.1 Glossary

Automation Rule
A persistent, named definition that ties together:

Trigger(s) → when to run

Action(s) → what to do

Schedule → optional time pattern (if not purely event-driven)

Context → entities / vault / domain scope

Safety → sensitivity + privacy + approval requirements

Trigger
A condition that can fire an automation:

Time-based (cron, interval, specific date)

Event-based (entity created/updated, relationship change, VA task created, etc.)

External (webhook, queue message, OS event)

Action
A composable step invoked when the trigger fires:

Framework/Domain workflow (e.g., FinancialAggregationWorkflow)

AEI operation (summarize, enrich, classify, link)

Notification (AEI chat, email, webhook, mobile push)

External system call (HTTP, queue, etc.)

Execution Context
The “sandbox” for a run:

Actor (who “owns” this rule)

Vault + domain scope

Allowed sensitivity levels & AI modes (local vs cloud)

Time zone, locale, language preferences

Dry-run vs live mode

Run
A single execution instance of an Automation Rule:

Has run_id, timestamps, outcome (success, partial, fail), logs, affected entities.

3. High-Level Architecture
3.1 Position in 2BF Architecture

Within the fullstack architecture, the Automation Engine is a shared backend service (library + background worker) that:

Lives alongside the AEI core, organization engine, and frameworks.

Is accessible from:

AEI chat (BMAD-style commands)

CLI (sbf automation subcommands)

Domain modules (framework workflows)

Future desktop/web UI components

3.2 Components

Automation Registry

Stores definitions of Automation Rules (per vault).

Backed by markdown + frontmatter or JSON index:

automations/ folder in the vault for human-readable rules.

Supports CRUD: create, update, enable/disable, delete, list.

Scheduler

Evaluates all time-based triggers.

Uses a cron-like mechanism that is:

Vault-local (desktop daemon) and/or

Optional server-side scheduler for remote/cloud use.

Event Bus

Emits domain events:

entity.created, entity.updated, relationship.changed

va.task.created, crm.contact.updated, etc.

Automation Engine subscribes and evaluates event-based triggers.

Action Dispatcher

Executes actions defined in Automation Rules:

Calls framework workflows (e.g. aggregation, trend analysis)

Invokes AEI operations (summarization, entity extraction, enrichment).

Sends notifications and external calls.

Handles retries, backoff, and idempotence.

Run Log & Audit Layer

Persistent history for all automation runs.

Records:

Trigger type, context, sensitivity level touched.

Which entities were read/modified.

Which AI model(s) were used.

Supports later inspection for compliance and debugging.

4. Automation Definition Schema
4.1 Storage Strategy

Location: automations/ folder in the vault (local-first).

Format: Markdown file with YAML frontmatter or .automation.json.

Naming: automation-<short-name>.md (or .json).

Example (markdown + frontmatter):

---
uid: automation-daily-knowledge-digest-001
name: Daily Knowledge Digest
owner_uid: person-derrick-parent-001
enabled: true
schedule:
  type: cron
  expression: "0 7 * * *"    # Every day at 07:00
triggers:
  - kind: time
    id: primary-schedule
  - kind: manual
    id: run-on-demand
scope:
  vault: default
  frameworks: [knowledge]
  domains: ["learning", "research"]
  sensitivity:
    max_level: confidential
    allow_cloud_ai: false
    allow_local_ai: true
actions:
  - kind: workflow
    id: knowledge-digest
    framework: knowledge
    workflow: DailyDigestWorkflow
    params:
      lookback_hours: 24
      max_items: 50
  - kind: notification
    channel: aei-chat
    template: "Your daily knowledge digest is ready."
safety:
  requires_confirmation: false
  dry_run: false
  max_entities_touched: 500
created_at: 2025-11-22T00:00:00Z
updated_at: 2025-11-22T00:00:00Z
---
Optional human-readable description of what this automation does.

4.2 TypeScript Interfaces (Backend)

At minimum:

export interface AutomationRule {
  uid: string;
  name: string;
  ownerUid: string;
  enabled: boolean;
  schedule?: Schedule;
  triggers: Trigger[];
  scope: AutomationScope;
  actions: AutomationAction[];
  safety: AutomationSafetyConfig;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type Trigger =
  | TimeTrigger
  | EventTrigger
  | ExternalTrigger
  | ManualTrigger;

export type Schedule =
  | { type: 'cron'; expression: string }
  | { type: 'interval'; seconds: number }
  | { type: 'once'; runAt: string };

export interface AutomationScope {
  vault: string;
  frameworks?: string[];
  domains?: string[];
  sensitivity?: {
    maxLevel: string; // ties into sensitivity model
    allowCloudAi: boolean;
    allowLocalAi: boolean;
    exportAllowed?: boolean;
  };
}

export type AutomationAction =
  | WorkflowAction
  | AEIOperationAction
  | NotificationAction
  | ExternalCallAction;


These should follow the Entity and sensitivity patterns in the framework guide (e.g., extensible metadata, sensitivity and privacy flags).

5. Trigger Types
5.1 Time-Based Triggers

Cron (0 7 * * *): classic cron syntax.

Interval (every N seconds/minutes/hours).

Once (run once at specific timestamp).

Requirements:

Use vault time zone (user-configurable).

Persist last run timestamp to avoid double runs after restart.

Optional jitter for large batches (e.g., run between 02:00–03:00).

5.2 Event-Based Triggers

Event triggers are configured against the Event Bus:

entity.created, entity.updated, entity.deleted

relationship.added, relationship.removed

va.task.created, va.task.completed (VA use cases)

crm.contact.updated, ticket.closed, etc.

Example:

triggers:
  - kind: event
    event_type: entity.updated
    filter:
      entity_type: HealthMetricEntity
      conditions:
        - path: "metadata.metric"
          op: "eq"
          value: "weight"
        - path: "metadata.value"
          op: "gt"
          value: 95


This ties directly into the framework entities defined for Health and others.

5.3 External Triggers

Webhook: AEI exposes an HTTP endpoint for external systems to trigger automations.

Queue / Message: internal queue message (e.g., from sync connectors).

Example:

triggers:
  - kind: external
    source: "webhook"
    token: "secret-or-hmac-key"

5.4 Manual Triggers

On-demand via:

AEI chat command (/automation run <uid>)

CLI (sbf automation run <uid>)

UI “Run now” button

6. Action Types
6.1 Workflow Actions (Framework/Domain)

Use framework workflows (aggregation, correlation, trend analysis, etc.).

- kind: workflow
  framework: financial
  workflow: FinancialAggregationWorkflow
  params:
    startDate: "2025-01-01"
    endDate: "2025-01-31"
    period: "monthly"
    eventTypes: ["income", "expense"]

6.2 AEI Operation Actions

Use AEI core capabilities:

Summarize daily notes into entities.

Enrich entities with missing fields via scheduled search.

Auto-classify sensitivity for new content.

- kind: aei_operation
  operation: "summarize_daily_notes"
  params:
    lookback_hours: 24
    output_entity_type: "KnowledgeNodeEntity"

6.3 Notification Actions

AEI chat message

Email

Desktop notification

Webhook

- kind: notification
  channel: "aei-chat"
  template: "New high-priority health metric alerts generated: {{count}}"

6.4 External Call Actions

HTTP POST to client system

Queue publish (Kafka, RabbitMQ, etc. – future)

- kind: external_call
  method: POST
  url: "https://example.com/hooks/2bf"
  body_template:
    run_id: "{{run_id}}"
    changed_entities: "{{entities}}"

7. Execution & Scheduling Semantics
7.1 Core Loop

Load active rules from Automation Registry.

Evaluate triggers:

Time-based: cron/interval evaluation.

Event-based: invoked by Event Bus subscriber.

Build execution context (scope, sensitivity, AI permissions).

Run actions in order:

Optionally parallelizable when configured.

Record run into audit log (success or failure).

Apply backoff/retry policies on failure.

7.2 Idempotence & Safety

Each rule must define an idempotence key strategy:

e.g., rule_uid + date + entity_uid to avoid double-processing.

Safety guardrails:

max_entities_touched per run (hard limit).

Optional dry_run mode to preview changes.

requires_confirmation flag for high-impact actions.

7.3 Error Handling

Categorize errors:

Transient: network issues, rate limits → retry with backoff.

Permanent: invalid config, permission denied → mark as failed and notify.

Expose errors to:

AEI chat (“last run failed, here’s why”),

CLI (sbf automation status),

Future UI (dashboard).

8. Integration Points (All Use Cases / Domains)
8.1 Framework modules

Every framework (Financial, Health, Knowledge, etc.) should:

Expose automation-ready workflows:

Clear input params → Automation Engine can bind them.

Deterministic behavior and predictable side effects.

Provide template automations per common use case:

Financial: monthly cashflow report, spending alerts.

Health: threshold alerts, weekly trend digest.

Knowledge: spaced repetition, scheduled enrichment.

These templates are published as markdown files under a shared directory so domain modules can import/clone them.

8.2 Domain modules

Domain modules (e.g., Budgeting, Portfolio, Fitness, CRM, VA-Ops) should:

Register default automations on installation:

E.g., “Send weekly budget overview every Sunday 18:00”.

Provide command handlers for AEI:

e.g. /auto budget weekly → instantiates a copy of a template automation with user-specific parameters.

8.3 AEI Chat

AEI should support commands (BMAD-style):

automation.list

automation.show <uid>

automation.create (guided wizard)

automation.enable/disable <uid>

automation.run <uid>

These commands interact with the Automation Registry and give conversational feedback.

8.4 CLI (sbf)

Extend the CLI with an automation command group:

sbf automation list

sbf automation show <uid>

sbf automation validate (schema + safety validation)

sbf automation run <uid>

sbf automation scaffold (generate a template automation file)

The CLI should reuse the existing vault abstraction and schema validation patterns.

8.5 VA Use Cases

For the Virtual Assistant business leveraging 2BF:

Provide a VA-Automation framework with entities like:

VATask, VAClient, VAPlaybook.

Pre-define automations for:

Daily VA task digest per client.

SLA breach alerts (tasks approaching due date).

Lead follow-up cadences (e.g., day 1 / 3 / 7 / 14 followups).

Ensure each VA workspace has:

A small set of suggested automations activated by default.

A library of recipes (markdown automations) that can be turned on per client.

9. Security, Privacy & Compliance
9.1 Sensitivity & Privacy Model

Automation must integrate with the tiered sensitivity and privacy model:

Use scope.sensitivity in AutomationRule to:

Cap maximum sensitivity level a rule can touch.

Distinguish cloud AI vs local AI usage per rule.

Automation that would breach these constraints must fail fast and log the violation.

9.2 Transparent Automation

In line with the project brief:

Automation rules must be:

Visible (discoverable) to the user.

Explainable (what it does, when it runs).

Overrideable (user can disable, delete, or adjust).

UI/AEI must never hide “shadow automations” doing work behind the scenes without an explicit rule.

9.3 Auditability

Every run is logged with:

What triggered it.

Which entities were read/written.

Which AI models were used.

Provide:

automation.runs list <uid> via AEI or CLI.

Filter by date, outcome, error type.

10. Developer Workflow (BMAD + Scaffolding)
10.1 Recommended Dev Steps

For any new automation capability:

Blueprint (B)

Define the use case scenario (user story).

Identify triggers, actions, scope, safety.

Model (M)

Map to frameworks & workflows (Financial, Health, Knowledge, VA).

Design the AutomationRule schema instance.

Automate (A)

Implement necessary workflows (if missing).

Define the AutomationRule file.

Add tests for the rule and workflows.

Deploy (D)

Register rule templates for AEI & CLI.

Validate within a sample vault using sbf automation validate.

Document in README / framework docs.

10.2 Scaffolding

Add an automation template generator to the existing CLI scaffolding:

sbf automation scaffold:

Prompts for name, schedule, trigger type, frameworks/domains, safety caps.

Writes a starter .md or .json file into automations/.

11. Example Automations (Cross-Domain)
11.1 Knowledge: Scheduled Enrichment

Use case: nightly knowledge base enrichment for tracked topics.

Trigger: Time (daily at 02:00).

Action:

AEI searches public sources for gaps in ResourceEntity fields.

Proposes new links and citations.

Safety:

Only public or personal sensitivity entities (no confidential/secret).

11.2 Financial: Weekly Cashflow Summary

Trigger: Time (every Monday at 08:00).

Action:

Run FinancialAggregationWorkflow for last 7 days.

Post summary to AEI chat and optionally email.

Scope:

frameworks: [financial], max_level: confidential.

11.3 Health: Weight Change Alert

Trigger: entity.updated on HealthMetricEntity with metric = weight.

Condition: weight change > 2kg within 7 days.

Action: notify user + create a HealthEventEntity “Check-in recommended”.

11.4 VA: Follow-up Cadence Automation

Trigger: va.lead.created.

Actions:

Schedule follow-up tasks at day 1, 3, 7, 14 with templated messages (reflecting proven follow-up patterns).

Notify VA in daily digest.

12. Implementation Checklist

Before merging any automation-related work:

 Core

 AutomationRule TS interfaces implemented.

 Automation Registry (CRUD) implemented.

 Scheduler loop (time-based) in place.

 Event Bus integration for event-based triggers.

 Safety & Privacy

 Sensitivity & AI mode constraints enforced.

 Max entities / dry-run / confirmation flags supported.

 Audit log for all runs.

 Integrations

 At least one automation template per framework (Financial, Health, Knowledge).

 AEI commands for listing and running automations.

 CLI automation command group wired and documented.

 Docs & Templates

 Template automation files for common scenarios.

 README updates in each framework to show how to define automations.

 VA-specific automation recipes documented for the VA business use cases.

Next step for devs:
Use this guide as the reference when you implement the @sbf/automation-core package, extend the CLI, and add automation templates to each framework and VA-related module.