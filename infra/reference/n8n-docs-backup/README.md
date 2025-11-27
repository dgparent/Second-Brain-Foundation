# n8n

**Repository:** https://github.com/n8n-io/n8n  
**License:** Fair-code (Sustainable Use License + Enterprise)  
**Category:** Workflow Automation / Integration Platform  
**Language:** TypeScript + Node.js  
**Stars:** ~48k+

## Overview

n8n is a workflow automation platform that gives technical teams the flexibility of code with the speed of no-code. 400+ integrations, native AI capabilities, fair-code license.

## Key Features for VA Use

### Code When You Need It
- Write JavaScript/Python inline
- Add npm packages to workflows
- Full programmatic control
- Visual interface for non-technical work

### AI-Native Platform
- Build AI agent workflows based on LangChain
- Use your own AI models and data
- Memory and context management
- Multi-step AI reasoning

### 400+ Integrations
- Email (Gmail, Outlook, SendGrid)
- Calendars (Google, Outlook, iCal)
- CRM (HubSpot, Salesforce, Pipedrive, Zoho)
- Project Management (Asana, Trello, Monday, ClickUp)
- Communication (Slack, Discord, Telegram, WhatsApp)
- File Storage (Google Drive, Dropbox, OneDrive, S3)
- Databases (PostgreSQL, MySQL, MongoDB, Supabase)

## SBF Integration

### va.automation with Code Flexibility

```typescript
// n8n workflow node: Parse email and create task
const email = $input.item.json;

// Use JavaScript to extract data
const taskData = {
  title: email.subject.replace(/^Re:|^Fwd:/i, '').trim(),
  description: extractMainContent(email.body),
  priority: email.subject.includes('URGENT') ? 'high' : 'normal',
  due_date: extractDueDateFromText(email.body),
  labels: extractTags(email.body)
};

// POST to SBF API
return {
  json: {
    ...taskData,
    type: 'va.task',
    client_uid: determineClientFromEmail(email.from),
    source: 'email',
    source_id: email.messageId
  }
};
```

### AI Agent Workflows

```
Client email → 
  AI: Classify intent → 
    If "support request": Route to Chatwoot
    If "task assignment": Create va.task in SBF
    If "question": Search va.sop library + respond
    If "meeting request": Check calendar + propose times
```

## Complex VA Workflows

### Weekly Report Generation
```
Trigger: Every Friday 5pm
→ Query SBF API: Get week's va.task completed
→ Query SBF API: Get week's va.meeting
→ AI: Analyze trends and highlights
→ Generate markdown report
→ Create va.report entity
→ Email to client
→ Post to Slack
```

### Client Onboarding Automation
```
New client signed →
  Create client folder in Google Drive
  + Setup email forwarding
  + Create Chatwoot inbox
  + Setup project in Asana
  + Create va.client entity in SBF
  + Add to CRM (HubSpot)
  + Send welcome email
  + Schedule kickoff meeting
  + Assign VA team
```

## n8n vs Activepieces

| Feature | n8n | Activepieces |
|---------|-----|--------------|
| Integrations | 400+ | 280+ |
| Code Support | JS/Python | TypeScript only |
| AI Native | ✅ LangChain | ✅ AI pieces |
| License | Fair-code | MIT |
| Self-Host | ✅ | ✅ |
| MCP Support | ❌ | ✅ |
| NPM Packages | ✅ Any | ✅ In pieces |
| Visual Editor | ✅ | ✅ |
| Community | 48k stars | 8.6k stars |

## Setup with SBF

```bash
# Docker
docker run -it -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n

# Environment variables for SBF integration
N8N_SBF_API_URL=https://your-sbf-api.com
N8N_SBF_API_KEY=sbf_key_xxxxx
```

### Create SBF Integration Node

```typescript
// n8n custom node: SBF Entity Manager
export class SBFEntityManager implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SBF Entity Manager',
    name: 'sbfEntityManager',
    group: ['transform'],
    version: 1,
    description: 'Create and manage SBF entities',
    defaults: {
      name: 'SBF Entity Manager',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'sbfApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        options: [
          { name: 'Create Task', value: 'createTask' },
          { name: 'Create Meeting', value: 'createMeeting' },
          { name: 'Create Report', value: 'createReport' },
          { name: 'Query Entities', value: 'query' },
        ],
        default: 'createTask',
      },
      // ... more properties
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Implementation
  }
}
```

## AI-Powered VA Workflows

### Smart Task Routing
```
New task intake (email/form) →
  AI: Extract key information
  + Classify task type
  + Estimate complexity
  + Identify required skills
  → Query SBF: Find available VA with skills
  → Auto-assign task
  → Notify VA via Slack
```

### Intelligent Client Communication
```
Client sends message →
  AI: Understand intent and sentiment
  + Check if similar question in va.sop
  + If found: Generate contextual response
  + If not found: Create va.task for VA
  + Track response quality
```

## Resources

- **Docs:** https://docs.n8n.io
- **Workflows:** https://n8n.io/workflows (900+ templates)
- **Community:** https://community.n8n.io
- **AI Guide:** https://docs.n8n.io/advanced-ai/

## Extraction Priority

**Priority:** 🔴 HIGH  
Powerful automation platform with AI capabilities, highly relevant for complex VA workflows.

**Extract:**
- Workflow execution engine
- AI agent integration patterns (LangChain)
- Custom node development framework
- Credential management for multi-client
- Error handling and retry logic
