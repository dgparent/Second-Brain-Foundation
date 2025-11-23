# Extracted Libraries - Integration Reference

**Purpose:** Document patterns and architectures extracted from open-source libraries  
**Status:** Reference documentation for future integration work  
**Date:** November 2024

---

## Overview

The `libraries/` folder contains 9+ open-source projects that were analyzed for patterns, architectures, and integration strategies relevant to the Second Brain Foundation. This document summarizes key learnings from each library.

---

## Libraries Analyzed

1. **Activepieces** - Workflow automation framework
2. **Chatwoot** - Customer support platform
3. **n8n** - Workflow automation tool
4. **Cal.com** - Scheduling platform
5. **Zammad** - Helpdesk system
6. **EspoCRM** - CRM platform
7. **Huginn** - Agent-based automation
8. **Libredesk** - Support desk
9. **NocoBase** - No-code database platform

---

## 1. Activepieces

**Repository:** https://github.com/activepieces/activepieces  
**Language:** TypeScript  
**Primary Use:** Workflow automation framework

### Key Patterns Extracted

#### Piece Framework Architecture
```typescript
// Pattern: Modular action/trigger system
export const sbfPiece = createPiece({
  name: 'sbf',
  displayName: 'Second Brain Foundation',
  auth: PieceAuth.CustomAuth({
    // Custom auth implementation
  }),
  actions: [
    createTaskAction,
    createMeetingAction,
    queryEntitiesAction
  ],
  triggers: [
    newEntityTrigger
  ]
});
```

**Reused In:** `packages/@sbf/automation/activepieces-piece/`

#### Property System
```typescript
// Pattern: Type-safe property definitions
Property.ShortText({
  displayName: 'Title',
  description: 'Task title',
  required: true
})
```

**Benefits:**
- Auto-generates UI forms
- Built-in validation
- Type safety

### Integration Strategy

**Status:** ✅ Implemented  
**Location:** `packages/sbf-automation/pieces/sbf/`  
**Deployment:** Custom piece in Activepieces instance

**How It Works:**
1. SBF piece installed in Activepieces
2. Users create workflows in visual editor
3. Workflows call SBF API for entity operations
4. Triggers notify workflows of new entities

---

## 2. Chatwoot

**Repository:** https://github.com/chatwoot/chatwoot  
**Language:** Ruby + Vue.js  
**Primary Use:** Customer support conversations

### Key Patterns Extracted

#### Conversation Threading
- Messages grouped by conversation
- Automatic assignee routing
- Label-based organization
- Team inbox management

#### Webhook System
```ruby
# Pattern: Event-driven webhooks
Webhook.trigger('conversation.created', {
  id: conversation.id,
  contact: conversation.contact,
  messages: conversation.messages
})
```

**Reused In:** `packages/@sbf/integrations/chatwoot/`

#### Contact Management
- Unified customer profiles
- Custom attributes
- Conversation history
- Multi-channel support (email, chat, social)

### Integration Strategy

**Status:** 🔄 Planned (Week 7-8)  
**Approach:** Webhook-based integration

**Workflow:**
1. Chatwoot webhook triggers on new conversation
2. n8n/Activepieces receives webhook
3. Creates SBF entities:
   - Client entity (if new contact)
   - Task entity (for follow-up)
   - Message entities (for context)
4. Links entities with relationships

**Use Case:**
```
Customer message → Chatwoot → Webhook → SBF
↓
Creates: client-acme-corp + task-follow-up-quote
Links: task → client (rel: assigned-to)
```

---

## 3. n8n

**Repository:** https://github.com/n8n-io/n8n  
**Language:** TypeScript  
**Primary Use:** Workflow automation with visual editor

### Key Patterns Extracted

#### Node Architecture
```typescript
// Pattern: Declarative node definition
export class SbfNode implements INodeType {
  description: INodeTypeDescription = {
    name: 'sbf',
    group: ['transform'],
    version: 1,
    description: 'Interact with Second Brain Foundation',
    defaults: {
      name: 'SBF'
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'sbfApi',
        required: true
      }
    ],
    properties: [
      // Operation selection
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Create Task', value: 'createTask' },
          { name: 'Create Meeting', value: 'createMeeting' },
          { name: 'Query Entities', value: 'queryEntities' }
        ]
      }
    ]
  };
}
```

**Reused In:** `packages/@sbf/automation/n8n-node/`

#### Credential System
```typescript
// Pattern: Secure credential management
export class SbfApi implements ICredentialType {
  name = 'sbfApi';
  displayName = 'SBF API';
  properties = [
    {
      displayName: 'API URL',
      name: 'apiUrl',
      type: 'string',
      default: 'http://localhost:8000'
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true
      }
    }
  ];
}
```

**Benefits:**
- Credentials stored encrypted
- Reusable across workflows
- Environment-specific configs

### Integration Strategy

**Status:** ✅ Implemented  
**Location:** `packages/sbf-automation/nodes-sbf/`

**Deployment:**
1. Build custom node package
2. Install in n8n instance
3. Configure SBF API credentials
4. Use in workflows

---

## 4. Cal.com

**Repository:** https://github.com/calcom/cal.com  
**Language:** TypeScript + Next.js  
**Primary Use:** Calendar scheduling

### Key Patterns Extracted

#### Event-Driven Booking
```typescript
// Pattern: Webhook on booking events
{
  triggerEvent: 'BOOKING_CREATED',
  payload: {
    id: 'booking-123',
    title: 'Client Discovery Call',
    startTime: '2024-11-22T10:00:00Z',
    attendees: [...]
  }
}
```

**Reused In:** `packages/@sbf/integrations/cal-com/`

#### Availability Management
- Timezone-aware scheduling
- Buffer times between meetings
- Custom availability rules
- Team scheduling

### Integration Strategy

**Status:** 🔄 Planned (Week 7)  
**Approach:** Webhook integration

**Workflow:**
```
Cal.com booking → Webhook → n8n/Activepieces → SBF
↓
Creates: meeting-client-discovery-001
Links: meeting → client (rel: with-client)
Pre-fills: Meeting notes template with booking details
```

**Template Example:**
```markdown
---
uid: meeting-client-discovery-001
type: meeting
title: Client Discovery Call - Acme Corp
created: 2024-11-22T09:00:00Z
lifecycle:
  state: permanent
sensitivity:
  level: 4
  visibility: user
rel:
  - [with-client, client-acme-corp]
  - [scheduled-via, cal-com]
---

# Meeting: Client Discovery Call

**Date:** 2024-11-22 @ 10:00 AM EST
**Duration:** 60 minutes
**Attendees:** John Doe (Acme Corp), Me

## Agenda
- [ ] Discuss project requirements
- [ ] Review budget
- [ ] Next steps

## Notes
...
```

---

## 5. Zammad

**Repository:** https://github.com/zammad/zammad  
**Language:** Ruby + Vue.js  
**Primary Use:** Helpdesk ticketing

### Key Patterns Extracted

#### Ticket Management
- Priority levels
- SLA tracking
- Escalation rules
- Automated responses

#### Multi-Channel Support
- Email → Ticket conversion
- Chat → Ticket
- Phone → Ticket
- Social media → Ticket

### Integration Potential

**Status:** 📋 Deferred  
**Reason:** Overlaps with Chatwoot (chose Chatwoot for simpler API)

**Possible Future Use:** Enterprise helpdesk for large VA teams

---

## 6. EspoCRM

**Repository:** https://github.com/espocrm/espocrm  
**Language:** PHP + JavaScript  
**Primary Use:** Customer relationship management

### Key Patterns Extracted

#### Entity Relationship Model
```javascript
// Pattern: Flexible entity relationships
{
  "Account": {
    "fields": {
      "name": { "type": "varchar" },
      "type": { "type": "enum" },
      "industry": { "type": "enum" }
    },
    "links": {
      "contacts": { "type": "hasMany", "entity": "Contact" },
      "opportunities": { "type": "hasMany", "entity": "Opportunity" }
    }
  }
}
```

**Inspiration For:** SBF entity type module system

#### Custom Fields
- User-defined field types
- Dynamic forms
- Field validation rules

### Integration Potential

**Status:** 📋 Reference Only  
**Use:** Inspired module-based entity type definitions in `@sbf/core/module-system`

---

## 7. Huginn

**Repository:** https://github.com/huginn/huginn  
**Language:** Ruby  
**Primary Use:** Agent-based task automation

### Key Patterns Extracted

#### Agent Architecture
```ruby
# Pattern: Self-contained agent units
class EmailDigestAgent < Agent
  cannot_be_scheduled!
  
  def check
    # Periodic check for new emails
  end
  
  def receive(events)
    # Process incoming events
  end
end
```

**Inspiration For:** Event-driven lifecycle engine

#### Event Propagation
- Agents emit events
- Other agents subscribe to events
- Forms event chains (workflows)

### Integration Potential

**Status:** 📋 Concept Only  
**Use:** Influenced SBF lifecycle automation design

---

## 8. Libredesk

**Repository:** https://github.com/abhinavxd/libredesk  
**Language:** JavaScript  
**Primary Use:** Lightweight support desk

### Key Patterns Extracted

#### Minimalist Ticket System
- Simple ticket creation
- Basic categorization
- Email notifications

### Integration Potential

**Status:** 📋 Not Needed  
**Reason:** Chatwoot provides richer feature set

---

## 9. NocoBase

**Repository:** https://github.com/nocobase/nocobase  
**Language:** TypeScript + React  
**Primary Use:** No-code database & dashboard builder

### Key Patterns Extracted

#### module Architecture
```typescript
// Pattern: module registration system
export class DashboardPlugin extends module {
  async load() {
    this.app.resourceManager.define({
      name: 'dashboard',
      actions: {
        list: async (ctx) => { },
        get: async (ctx) => { },
        create: async (ctx) => { }
      }
    });
  }
}
```

**Reused In:** `packages/@sbf/core/module-system/`

#### Dynamic Schema
- User-defined collections (tables)
- Custom fields
- Relationship definitions
- Auto-generated CRUD

#### UI Composition
- Drag-and-drop dashboard builder
- Widget system
- Custom blocks
- Responsive layouts

### Integration Strategy

**Status:** 🔄 Planned (Week 9-10)  
**Use Case:** Build VA dashboard and domain-specific dashboards

**Approach:**
1. NocoBase as dashboard framework
2. SBF API as data source
3. Custom SBF module for NocoBase
4. Pre-built dashboard templates:
   - VA dashboard (tasks, clients, calendar)
   - Healthcare dashboard (patients, appointments)
   - Legal dashboard (cases, documents, clients)

**Example Dashboard Widget:**
```typescript
// Widget: Recent Tasks
{
  type: 'table',
  dataSource: 'sbf',
  collection: 'entities',
  filter: {
    type: 'task',
    lifecycle_state: ['capture', 'transitional']
  },
  columns: ['title', 'created', 'lifecycle_state', 'importance'],
  actions: ['view', 'edit', 'complete']
}
```

---

## Cross-Library Patterns

### 1. Webhook-First Integration

**Pattern:** Most modern tools support webhooks for real-time events

**SBF Strategy:**
- Central webhook receiver in `@sbf/api`
- Route webhooks to workflow engines (n8n/Activepieces)
- Create entities based on webhook payloads
- Maintain source provenance

### 2. API-First Design

**Pattern:** RESTful APIs with clear documentation

**SBF Implementation:**
- `@sbf/api` provides REST endpoints
- Swagger/OpenAPI documentation
- Consistent error handling
- Versioned API (`/v1/entities`)

### 3. module Extensibility

**Pattern:** Core + modules architecture

**Adopted in SBF:**
```
@sbf/core          (minimal core)
@sbf/modules/va    (VA-specific features)
@sbf/modules/*     (domain-specific)
```

### 4. TypeScript Preference

**Pattern:** Modern tools prefer TypeScript for type safety

**SBF Decision:** TypeScript-first monorepo

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SBF Core System                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────────┐ │
│  │  Memory  │  │   AEI    │  │ Lifecycle │  │   module   │ │
│  │  Engine  │  │  Engine  │  │  Engine   │  │   System   │ │
│  └──────────┘  └──────────┘  └───────────┘  └────────────┘ │
│                            ↕                                 │
│                     ┌──────────────┐                         │
│                     │   SBF API    │                         │
│                     └──────────────┘                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐
    │Activepieces│    │    n8n     │   │  NocoBase  │
    └────┬─────┘    └─────┬──────┘   └─────┬──────┘
         │                 │                 │
    ┌────▼──────────┬──────▼────┬───────────▼──────┐
    │               │           │                   │
┌───▼───┐   ┌──────▼────┐  ┌──▼────┐     ┌────────▼────┐
│Cal.com│   │  Chatwoot │  │ Gmail │     │ VA Dashboard│
└───────┘   └───────────┘  └───────┘     └─────────────┘
```

---

## Recommended Integration Priority

### Phase 1: Core Automation (Weeks 5-6)
1. ✅ Activepieces piece
2. ✅ n8n node
3. ✅ SBF API backend

### Phase 2: VA Tools (Weeks 7-8)
1. 🔄 Cal.com webhook integration
2. 🔄 Chatwoot webhook integration
3. 🔄 Gmail integration (via n8n Gmail node)

### Phase 3: Dashboards (Weeks 9-10)
1. 📋 NocoBase SBF module
2. 📋 VA dashboard template
3. 📋 Domain dashboards (Healthcare, Legal, etc.)

### Phase 4: Optional Enhancements
1. 📋 Zammad (if enterprise helpdesk needed)
2. 📋 EspoCRM patterns (for advanced CRM features)

---

## Developer Guidelines

### When to Reference Libraries

**DO:**
- Extract architectural patterns
- Understand API design choices
- Learn from UX decisions
- Identify integration points

**DON'T:**
- Copy code directly (license issues)
- Try to integrate entire codebases
- Create tight coupling
- Ignore security implications

### How to Document New Libraries

1. **Create analysis document**
   - Key patterns identified
   - Integration potential
   - License compatibility
   - Maintenance status

2. **Extract learnings**
   - Architecture diagrams
   - Code snippets (small, educational)
   - API patterns
   - Best practices

3. **Plan integration**
   - Webhook vs API vs module
   - Priority level
   - Resource requirements
   - Testing strategy

---

## Maintenance Notes

### Library Version Tracking

**Current Versions (as of analysis):**
- Activepieces: 0.36.x
- Chatwoot: 3.x
- n8n: 1.x
- Cal.com: 3.x
- NocoBase: 0.21.x

**Update Strategy:**
- Monitor breaking changes
- Re-evaluate integration points
- Update documentation accordingly

### Security Considerations

- All integrations use API keys (never passwords)
- Webhook signatures validated
- Rate limiting implemented
- Sensitive data filtered

---

## Conclusion

These 9 libraries provided valuable insights into:
- ✅ module architectures
- ✅ Workflow automation patterns
- ✅ Webhook-based integrations
- ✅ Dashboard composition
- ✅ Type-safe API design

The SBF implementation cherry-picks the best patterns while maintaining:
- Clean TypeScript codebase
- Minimal dependencies
- Clear integration boundaries
- Extensible module system

---

**Next Steps:** See implementation guides in `docs/04-implementation/`
