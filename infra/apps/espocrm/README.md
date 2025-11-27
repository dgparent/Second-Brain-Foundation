# Zammad

**Repository:** https://github.com/zammad/zammad  
**License:** AGPLv3  
**Category:** Helpdesk / Ticketing System  
**Language:** Ruby (Rails) + CoffeeScript  
**Stars:** ~4.5k+

## Overview

Zammad is a web-based, open source user support/ticketing solution. Alternative to Zendesk with multi-channel support (email, chat, phone, social media).

## Key Features for VA Use

- **Multi-Channel Tickets:** Email, Chat, Twitter, Facebook, Telegram, phone
- **Knowledge Base:** Internal and external articles
- **Macros:** Predefined responses for common tickets
- **Tags & Custom Fields:** Organize and categorize tickets
- **SLA Management:** Track response and resolution times
- **Reporting:** Ticket analytics and agent performance
- **Multi-Client Support:** Organizations and agents

## SBF Integration

```yaml
# va.ticket entity from Zammad
uid: va-ticket-zammad-001
type: va.ticket
client_uid: va-client-acme-001
source: zammad
source_id: "#12345"
title: "Website login issue"
status: open
priority: high
assigned_va: alice
channel: email
```

## Extraction Priority

**Priority:** 🟢 LOW  
Similar to Chatwoot but less feature-rich. Use Chatwoot for VA customer support.

**Extract:** Macro system for canned responses

---

# EspoCRM

**Repository:** https://github.com/espocrm/espocrm  
**License:** AGPLv3  
**Category:** CRM (Customer Relationship Management)  
**Language:** PHP + JavaScript  
**Stars:** ~1.8k+

## Overview

Open-source CRM for managing customer relationships, sales pipeline, contacts, and opportunities. Modular and extensible.

## Key Features for VA Use

- **Contact Management:** Track client interactions
- **Sales Pipeline:** Opportunity tracking
- **Task Management:** Built-in todo lists
- **Email Integration:** Link emails to records
- **Calendar:** Meeting scheduling
- **Custom Entities:** Extend CRM for VA-specific needs
- **Workflows & BPM:** Automate processes
- **Reporting:** Custom reports and dashboards

## SBF Integration

```yaml
# Sync SBF clients to EspoCRM
client_uid: va-client-acme-001
→ EspoCRM Account (Company)
  + Contacts (client stakeholders)
  + Opportunities (ongoing projects)
  + Tasks (va.task synced)
  + Meetings (va.meeting synced)
  + Custom field: sbf_client_uid
```

## Extraction Priority

**Priority:** 🟢 LOW  
CRM features overlap with SBF client management. May be useful for sales-focused VA agencies.

---

# Huginn

**Repository:** https://github.com/huginn/huginn  
**License:** MIT  
**Category:** Automation / Agent System  
**Language:** Ruby  
**Stars:** ~43k+

## Overview

Huginn creates agents that monitor the web and perform automated actions. Think IFTTT or Zapier but self-hosted and agent-based.

## Key Features

- **Agents:** Modular units that perform specific tasks
- **Scenarios:** Collections of agents working together
- **Event-Driven:** Agents emit and receive events
- **Scheduling:** Cron-based or event-based execution
- **Credential Management:** Secure storage for API keys
- **Liquid Templating:** Flexible data transformation

## Sample VA Agents

1. **RSS Monitor:** Track client blog mentions
2. **Twitter Agent:** Monitor client brand keywords
3. **Email Digest:** Summarize daily VA activity
4. **Weather Agent:** Include in morning reports
5. **Stock Price Agent:** Track if client is public company

## SBF Integration

Huginn agents can feed data into SBF via HTTP POST agents:

```ruby
# Huginn agent: Monitor client website uptime
Website Availability Agent
→ If down: HTTP POST to SBF
→ Create va.task (client_uid, type: incident)
→ Priority: critical
→ Notify VA via Slack
```

## Extraction Priority

**Priority:** 🟡 MEDIUM  
Interesting agent-based architecture, but overlaps with Activepieces/n8n. Less active development.

**Extract:** Agent architecture patterns, event system

---

# LibreDesk

**Repository:** https://github.com/abhinavxd/libredesk  
**License:** Not specified (appears to be open)  
**Category:** Helpdesk / Support Ticketing  
**Language:** Not clearly specified

## Overview

LibreDesk is a simpler, lightweight alternative to Zendesk focused on basic ticketing needs.

## Extraction Priority

**Priority:** 🔴 SKIP  
Repository appears inactive (2 years old), minimal documentation. Use Chatwoot or Zammad instead.

---

# NocoBase

**Repository:** https://github.com/nocobase/nocobase  
**License:** AGPLv3  
**Category:** No-Code Database / App Builder  
**Language:** TypeScript + React  
**Stars:** ~12k+

## Overview

NocoBase is a no-code/low-code platform for building business applications. Alternative to Airtable, with plugin system and self-hosting.

## Key Features for VA Use

- **Data Modeling:** Create custom tables and relationships
- **Form Builder:** Client intake forms
- **Workflow Automation:** Built-in automation engine
- **Plugin System:** Extend functionality
- **Role-Based Access:** Multi-user permissions
- **API:** RESTful and GraphQL
- **File Management:** Attachments and uploads
- **Calendar Views:** Scheduling visualization

## SBF Integration Potential

### Use Case: VA Agency Operations Dashboard

```yaml
# NocoBase as VA Agency Operating System UI Layer
NocoBase Tables:
  - Clients (synced from SBF va.client)
  - Tasks (va.task with kanban/calendar views)
  - Meetings (va.meeting with timeline)
  - Reports (va.report with charts)
  - SOPs (va.sop as knowledge base)
  - VAs (va.account with performance metrics)

# Example workflow
Client intake form → NocoBase
→ Webhook to SBF
→ Create va.client entity
→ Auto-create onboarding tasks
→ Assign to VA team
→ Show in NocoBase dashboard
```

### Custom VA Workflows in NocoBase

```javascript
// NocoBase plugin: SBF Integration
export class SBFIntegrationPlugin extends Plugin {
  async load() {
    // Add SBF data source
    this.app.dataSourceManager.add(new SBFDataSource({
      apiKey: process.env.SBF_API_KEY,
      baseUrl: process.env.SBF_API_URL,
    }));
    
    // Add custom actions
    this.app.addAction('sbf:createTask', async (ctx) => {
      const { clientUid, title, description } = ctx.request.body;
      // Create task in SBF
    });
    
    // Add custom UI components
    this.app.addComponent('SBFClientSelector', ClientSelector);
  }
}
```

## Comparison: NocoBase vs Airtable

| Feature | NocoBase | Airtable |
|---------|----------|----------|
| Open Source | ✅ | ❌ |
| Self-Hosted | ✅ | ❌ |
| Plugins | ✅ | ⚡ Limited |
| Automations | ✅ | ✅ |
| API | ✅ RESTful + GraphQL | ✅ RESTful |
| Forms | ✅ | ✅ |
| Pricing | Free | $20/seat |
| Data Ownership | Full | Limited |

## Extraction Priority

**Priority:** 🟡 MEDIUM  
Interesting for building VA agency dashboards and client portals. Could complement SBF as UI layer.

**Extract:**
- Data modeling patterns
- Form builder architecture
- Plugin system
- Workflow automation engine
- UI component framework

## Next Steps

1. Evaluate NocoBase as potential SBF dashboard/admin UI
2. Build SBF data source plugin for NocoBase
3. Create VA-specific templates (client management, task tracking)
4. Compare with building custom React admin panel
5. Assess performance for 100+ clients, 1000+ tasks

## Resources

- **Docs:** https://docs.nocobase.com
- **Demo:** https://demo.nocobase.com
- **Plugins:** https://www.nocobase.com/plugins
