# Activepieces

**Repository:** https://github.com/activepieces/activepieces  
**License:** MIT (Community Edition), Commercial (Enterprise)  
**Category:** Workflow Automation / Integration Platform  
**Language:** TypeScript  
**Stars:** ~8.6k+

## Overview

Activepieces is an open-source alternative to Zapier - an all-in-one AI automation platform designed to be extensible through a type-safe pieces framework written in TypeScript.

## Key Features for VA Use Cases

### 1. **280+ Integration Pieces**
- All pieces are open source and available on npmjs.com
- 60% contributed by community
- **VA-Relevant Integrations:**
  - Email (Gmail, Outlook, SendGrid)
  - Calendar (Google Calendar, Outlook Calendar)
  - Communication (Slack, Discord, Telegram, WhatsApp)
  - CRM (HubSpot, Salesforce, Pipedrive)
  - Project Management (Asana, Trello, ClickUp)
  - File Storage (Google Drive, Dropbox, OneDrive)
  - Social Media (Facebook, Twitter, LinkedIn)

### 2. **Automation Capabilities**
- **Loops** - Iterate over data collections
- **Branches** - Conditional logic
- **Auto Retries** - Built-in error handling
- **HTTP Requests** - Connect to any API
- **Code with NPM** - Write custom JavaScript with package support
- **AI Integration** - ASK AI in Code Piece for non-technical users

### 3. **MCP Server Support**
All Activepieces pieces are automatically available as Model Context Protocol (MCP) servers that you can use with LLMs through Claude Desktop, Cursor, or Windsurf!

## SBF Integration Opportunities

### Direct Integration Points

1. **va.automation Entity**
   ```yaml
   uid: va-automation-email-task-001
   type: va.automation
   title: "Email to Task Automation"
   automation_platform: activepieces
   flow_id: "ap-flow-xyz123"
   trigger:
     type: email_received
     filter: "subject contains 'Action Required'"
   actions:
     - create_task_from_email
     - assign_to_va
     - notify_client
   ```

2. **Email → Task Workflow**
   - Connect Gmail/Outlook trigger
   - Parse email content with AI
   - Create `va.task` or `va.task_intake`
   - Route based on client_uid

3. **Meeting → Report Synthesis**
   - Google Calendar trigger on event end
   - Extract meeting notes
   - Generate `va.meeting` entity
   - Auto-populate weekly report

### Architecture Integration

```
┌─────────────────────────────────────┐
│     Activepieces (External)         │
│  - Email monitoring                 │
│  - Calendar webhooks                │
│  - CRM sync                         │
└──────────────┬──────────────────────┘
               │ HTTP API / Webhooks
┌──────────────▼──────────────────────┐
│   SBF AEI Ingestion Layer           │
│  - Receive automation triggers      │
│  - Parse structured data            │
│  - Create VA entities               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Memory Engine                     │
│  - Store va.automation config       │
│  - Log automation runs              │
│  - Track client associations        │
└─────────────────────────────────────┘
```

## VA Workflow Examples

### 1. **Client Email Triage**
```
Trigger: Gmail (client inbox)
→ Filter: Urgent keywords
→ AI: Extract task details
→ HTTP: POST to SBF API (create va.task_intake)
→ Slack: Notify VA team
```

### 2. **Calendar-Based Reporting**
```
Trigger: Google Calendar (meeting ends)
→ Get meeting notes (Google Docs)
→ AI: Summarize key points
→ HTTP: POST to SBF API (create va.meeting)
→ Weekly: Aggregate to va.report
```

### 3. **Social Media Content Publishing**
```
SBF: va.content_item (approved)
→ Activepieces webhook
→ Format for platform (Twitter/LinkedIn)
→ Schedule publication
→ HTTP: Update status in SBF
```

## Setup & Installation

### Self-Hosted (Docker)
```bash
docker run -it -p 8080:80 activepieces/activepieces
```

### With SBF Integration
```bash
# Add to SBF docker-compose.yml
services:
  activepieces:
    image: activepieces/activepieces
    environment:
      - AP_ENCRYPTION_KEY=${ACTIVEPIECES_KEY}
      - AP_JWT_SECRET=${ACTIVEPIECES_JWT}
    ports:
      - "8080:80"
```

## Custom Piece Development

VAs can create custom pieces for specific client workflows:

```typescript
// packages/pieces/client-acme-automation/src/index.ts
export const acmeClientAutomation = createPiece({
  displayName: 'Acme Client Automation',
  auth: PieceAuth.SecretText({
    displayName: 'SBF API Key',
    required: true,
  }),
  actions: [
    createTaskFromEmail,
    generateWeeklyReport,
    syncClientCRM,
  ],
  triggers: [
    newClientEmail,
    meetingCompleted,
  ],
});
```

## Security Considerations for VA Use

- **Multi-Client Isolation:** Run separate Activepieces instances or workspaces per client
- **API Key Management:** Store SBF API keys encrypted
- **Audit Logging:** Track all automation runs by client_uid
- **Rate Limiting:** Configure per-client rate limits

## Alternative Comparison

| Feature | Activepieces | n8n | Zapier |
|---------|-------------|-----|--------|
| Open Source | ✅ (MIT) | ✅ (Fair-code) | ❌ |
| Self-Hosted | ✅ | ✅ | ❌ |
| Type-Safe Pieces | ✅ | ❌ | ❌ |
| MCP Support | ✅ | ❌ | ❌ |
| AI-Native | ✅ | Partial | Partial |
| Free Tier Workflows | Unlimited | Unlimited | 100/mo |

## Resources

- **Documentation:** https://www.activepieces.com/docs
- **Pieces Catalog:** https://www.activepieces.com/pieces
- **Discord Community:** https://discord.gg/2jUXBKDdP8
- **NPM Packages:** https://www.npmjs.com/search?q=%40activepieces

## Related SBF Components

- **va.automation** - Automation configuration entities
- **AEI_INGEST** - Process incoming automation data
- **va.sop** - Standard operating procedures that can be automated
- **va.task** - Tasks created from automation triggers

## Extraction Priority

**Priority:** 🔴 HIGH  
**Reason:** Direct automation hub for VA workflows, TypeScript-native, MCP support for AI agents

**Extraction Candidates:**
1. ✅ Piece framework architecture (TypeScript patterns)
2. ✅ Workflow engine (loop/branch logic)
3. ✅ AI integration layer (ASK AI features)
4. ❌ Full pieces catalog (too large, use as reference)
5. ✅ Authentication/security patterns for multi-tenant

**Next Steps:**
1. Extract `packages/pieces` framework architecture
2. Document piece creation patterns for SBF-specific integrations
3. Build SBF webhook piece for receiving automation triggers
4. Create va.automation entity type based on Activepieces flow structure
