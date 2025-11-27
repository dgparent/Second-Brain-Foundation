# VA Tool Suite - Libraries Overview

**Created:** 2025-11-20  
**Purpose:** Documentation of VA-relevant open-source tools for Second Brain Foundation integration

---

## 🎯 Executive Summary

This document provides a comprehensive overview of 9 open-source libraries that are directly relevant to building a VA (Virtual Assistant) operations platform. These tools cover workflow automation, client communication, scheduling, customer support, and dashboard/portal creation.

**Total VA-Specific Libraries:** 9  
**Combined Stars:** ~170k+  
**All Open Source:** ✅  
**Self-Hostable:** ✅

---

## 📊 Libraries by Priority

### 🔴 HIGH PRIORITY - Core Automation (Build First)

#### 1. Activepieces ⭐ 8.6k
- **Category:** Workflow Automation
- **License:** MIT (Community), Commercial (Enterprise)
- **Tech Stack:** TypeScript, Nx monorepo
- **Why Critical:** Type-safe automation pieces, MCP support for AI agents, 280+ integrations

**VA Use Cases:**
- Email → Task automation
- Calendar → Report generation  
- Social media publishing
- CRM synchronization

**SBF Integration:**
- Creates `va.automation` entities
- Triggers from external sources (email, calendar)
- Posts to SBF API for entity creation
- Client-specific workflow isolation

**Path:** `./activepieces/README.md`

---

#### 2. n8n ⭐ 48k
- **Category:** Workflow Automation  
- **License:** Fair-code (Sustainable Use + Enterprise)
- **Tech Stack:** TypeScript + Node.js
- **Why Critical:** Code-when-needed flexibility, AI-native (LangChain), 400+ integrations

**VA Use Cases:**
- Complex multi-step workflows
- AI-powered task routing
- Client onboarding automation
- Weekly report generation with AI

**SBF Integration:**
- Custom SBF nodes for entity management
- Inline JavaScript for data transformation
- AI agents for intelligent automation
- Multi-client credential management

**Path:** `./n8n/README.md`

---

### 🟡 MEDIUM PRIORITY - Client Interaction (Build Second)

#### 3. Chatwoot ⭐ 21k
- **Category:** Customer Support / Omnichannel Inbox
- **License:** MIT
- **Tech Stack:** Ruby on Rails + Vue.js
- **Why Important:** Multi-channel support, AI agent (Captain), Help Center

**VA Use Cases:**
- Client support ticket management
- Multi-channel communication (Email, WhatsApp, Social)
- Knowledge base for client self-service
- Conversation → Task escalation

**SBF Integration:**
- Creates `va.customer_support` workspace entities
- Webhook to SBF on high-priority conversations
- Sync SOPs to Help Center
- Track support metrics per client

**Path:** `./chatwoot/README.md`

---

#### 4. Cal.com ⭐ 34k
- **Category:** Scheduling / Calendar Management
- **License:** AGPLv3 (Open), Commercial (Enterprise)
- **Tech Stack:** TypeScript + Next.js
- **Why Important:** White-label scheduling, team coordination, workflow automation

**VA Use Cases:**
- Client meeting scheduling
- VA team round-robin booking
- Meeting → Task extraction
- Client-specific booking pages

**SBF Integration:**
- Creates `va.calendar_config` and `va.meeting` entities
- Webhook on booking events
- Extract meeting notes to tasks
- Track client interaction frequency

**Path:** `./cal-com/README.md`

---

#### 5. NocoBase ⭐ 12k
- **Category:** No-Code Database / App Builder
- **License:** AGPLv3
- **Tech Stack:** TypeScript + React
- **Why Important:** Custom dashboards, client portals, plugin system

**VA Use Cases:**
- VA agency operations dashboard
- Client self-service portal
- Custom forms and workflows
- Visual task/project tracking

**SBF Integration:**
- Build SBF data source plugin
- Create VA-specific templates
- Visual layer over Memory Engine
- Client-facing reports and dashboards

**Path:** `./nocobase/README.md` (shared file with Zammad)

---

### 🟢 LOW PRIORITY - Specialized Tools (Consider Later)

#### 6. Zammad ⭐ 4.5k
- **Category:** Helpdesk / Ticketing
- **License:** AGPLv3
- **Tech Stack:** Ruby on Rails + CoffeeScript
- **Use Case:** Alternative to Chatwoot for ticketing

**Decision:** ✅ Documented, ❌ Not prioritized  
**Reason:** Chatwoot provides similar functionality with better features  
**Extract:** Macro system for canned responses

**Path:** `./zammad/README.md`

---

#### 7. EspoCRM ⭐ 1.8k
- **Category:** CRM (Customer Relationship Management)
- **License:** AGPLv3
- **Tech Stack:** PHP + JavaScript
- **Use Case:** Sales-focused VA agencies, pipeline tracking

**Decision:** ✅ Documented, ❌ Not prioritized  
**Reason:** SBF client management (`va.client`) may be sufficient  
**Consider:** If VA agency does heavy sales work

**Path:** `./espocrm/README.md` (shared file)

---

#### 8. Huginn ⭐ 43k
- **Category:** Automation / Agent System
- **License:** MIT
- **Tech Stack:** Ruby
- **Use Case:** Web monitoring, RSS tracking, event-driven workflows

**Decision:** ✅ Documented, 🟡 Extract patterns only  
**Reason:** Overlaps with Activepieces/n8n but has interesting agent architecture  
**Extract:** Agent-based architecture patterns, event system

**Path:** `./huginn/README.md` (shared file)

---

#### 9. LibreDesk
- **Category:** Helpdesk
- **Status:** 🔴 SKIP
- **Reason:** Repository inactive (2 years), minimal documentation
- **Alternative:** Use Chatwoot or Zammad

**Path:** `./libredesk/README.md` (shared file)

---

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────────────┐
│          External VA Tool Suite                     │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Activepieces │  │     n8n      │ Automation     │
│  │ (Type-safe)  │  │ (AI-native)  │ Layer          │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                  │                        │
│  ┌──────▼──────┐  ┌───────▼────────┐               │
│  │  Chatwoot   │  │   Cal.com      │ Client        │
│  │  (Support)  │  │  (Scheduling)  │ Interaction   │
│  └──────┬──────┘  └───────┬────────┘               │
│         │                  │                        │
│  ┌──────▼──────────────────▼────────┐               │
│  │       NocoBase (Dashboards)      │ UI Layer      │
│  └──────┬───────────────────────────┘               │
└─────────┼───────────────────────────────────────────┘
          │ Webhooks / API Calls
┌─────────▼──────────────────────────────────────────┐
│         SBF AEI Integration Layer                  │
│  ┌──────────────────────────────────────────────┐  │
│  │ - Process automation triggers                │  │
│  │ - Parse support conversations                │  │
│  │ - Extract meeting data                       │  │
│  │ - Create/update VA entities                  │  │
│  │ - Route by client_uid                        │  │
│  └──────────────────┬───────────────────────────┘  │
└─────────────────────┼──────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────┐
│         SBF Memory Engine                          │
│  ┌──────────────────────────────────────────────┐  │
│  │ VA Entity Types:                             │  │
│  │ - va.automation (workflow configs)           │  │
│  │ - va.customer_support (support workspace)    │  │
│  │ - va.calendar_config (scheduling)            │  │
│  │ - va.meeting (from bookings)                 │  │
│  │ - va.task (from automation/support)          │  │
│  │ - va.report (synthesized from all)           │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 📋 New VA Entity Types Required

Based on these tools, we need to create:

### 1. va.automation
Configuration for workflow automations
```yaml
uid: va-automation-001
type: va.automation
platform: activepieces | n8n
flow_id: external_flow_identifier
client_uid: va-client-xxx
trigger: email_received | calendar_event | webhook
actions: [create_task, notify, update_crm]
```

### 2. va.customer_support
Client support workspace configuration
```yaml
uid: va-support-001
type: va.customer_support
client_uid: va-client-xxx
platform: chatwoot
account_id: external_account_id
channels: [email, whatsapp, chat]
assigned_vas: [va-account-alice, va-account-bob]
```

### 3. va.calendar_config
VA availability and booking configuration
```yaml
uid: va-calendar-001
type: va.calendar_config
va_uid: va-account-alice
platform: calcom
booking_links:
  - slug: alice/30min
    event_type_id: 123
    clients: [client-a, client-b]
```

### 4. va.meeting (enhanced)
Meeting entities from bookings
```yaml
uid: va-meeting-001
type: va.meeting
client_uid: va-client-xxx
va_uid: va-account-alice
scheduled_time: ISO8601
duration_minutes: 30
platform: calcom | zoom | teams
booking_id: external_id
pre_meeting_responses: {...}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Automation (Weeks 1-4)

**Week 1-2: Activepieces Integration**
- [ ] Extract piece framework architecture
- [ ] Build SBF webhook piece
- [ ] Create va.automation entity type
- [ ] Test email → task automation

**Week 3-4: n8n Integration**
- [ ] Extract AI workflow patterns
- [ ] Build custom SBF nodes
- [ ] Implement client onboarding automation
- [ ] Test complex multi-step workflows

### Phase 2: Client Interaction (Weeks 5-8)

**Week 5-6: Chatwoot Integration**
- [ ] Build webhook receiver
- [ ] Create va.customer_support entity
- [ ] Implement conversation → task escalation
- [ ] Sync SOP library to Help Center

**Week 7-8: Cal.com Integration**
- [ ] Build booking webhook handler
- [ ] Create va.calendar_config and enhanced va.meeting
- [ ] Implement meeting → task extraction
- [ ] Generate client-specific booking pages

### Phase 3: Dashboard & Portal (Weeks 9-12)

**Week 9-10: NocoBase Evaluation**
- [ ] Deploy NocoBase instance
- [ ] Build SBF data source plugin
- [ ] Create VA operations dashboard
- [ ] Design client self-service portal templates

**Week 11-12: Integration & Polish**
- [ ] Connect all tools via AEI layer
- [ ] Build unified VA analytics dashboard
- [ ] Test multi-client workflows
- [ ] Document VA playbook

---

## 🔍 Extraction Priorities

### Immediate Extraction (This Sprint)
1. **Activepieces:** Piece framework, workflow engine, AI integration
2. **n8n:** LangChain patterns, credential management, custom nodes

### Near-Term (Next Sprint)
3. **Chatwoot:** Webhook patterns, multi-channel threading
4. **Cal.com:** Booking API, workflow automation, team scheduling

### Future Consideration
5. **NocoBase:** UI framework, plugin system, data modeling
6. **Huginn:** Agent architecture (reference only)

---

## 📚 Resources

### Official Documentation
- **Activepieces:** https://www.activepieces.com/docs
- **n8n:** https://docs.n8n.io
- **Chatwoot:** https://www.chatwoot.com/help-center
- **Cal.com:** https://cal.com/docs
- **NocoBase:** https://docs.nocobase.com

### Community Support
- **Activepieces Discord:** https://discord.gg/2jUXBKDdP8
- **n8n Community:** https://community.n8n.io
- **Chatwoot Discord:** https://discord.gg/cJXdrwS
- **Cal.com Discussions:** https://github.com/calcom/cal.com/discussions

### Related SBF Documentation
- **VA Use Case:** `../VA-usecase-instructions.md`
- **VA Architecture:** `../docs/02-product/va-tool-suite-architecture.md`
- **Main Libraries:** `./README.md`

---

## ⚖️ License Compliance

| Tool | License | Can Self-Host? | Commercial Use? |
|------|---------|----------------|-----------------|
| Activepieces | MIT (Community) | ✅ | ✅ |
| n8n | Fair-code (Sustainable Use) | ✅ | ✅ (with limits) |
| Chatwoot | MIT | ✅ | ✅ |
| Cal.com | AGPLv3 | ✅ | ✅ (open source) |
| NocoBase | AGPLv3 | ✅ | ✅ (open source) |
| Zammad | AGPLv3 | ✅ | ✅ (open source) |
| EspoCRM | AGPLv3 | ✅ | ✅ (open source) |
| Huginn | MIT | ✅ | ✅ |

**Note:** n8n requires commercial license for enterprise features. Cal.com offers commercial license for private use. Always review latest license terms.

---

## 🎯 Success Criteria

A successful VA tool suite integration will:

✅ **Automate 80% of routine VA tasks**
- Email triage and task creation
- Meeting scheduling and follow-up
- Report generation and delivery
- Client communication routing

✅ **Provide multi-client isolation**
- Separate workspaces per client
- Client-specific configurations
- Secure data boundaries
- Independent automations

✅ **Enable VA team collaboration**
- Shared task queues
- Round-robin assignment
- Knowledge base access
- Team chat integration

✅ **Track VA performance metrics**
- Tasks completed per VA
- Client satisfaction scores
- Response times
- Automation success rates

---

**Last Updated:** 2025-11-20  
**Status:** ✅ All 9 tools documented  
**Next Step:** Begin Activepieces architecture extraction
