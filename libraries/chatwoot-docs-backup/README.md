# Chatwoot

**Repository:** https://github.com/chatwoot/chatwoot  
**License:** MIT  
**Category:** Customer Support Platform / Omnichannel Inbox  
**Language:** Ruby (Rails) + Vue.js  
**Stars:** ~21k+

## Overview

Open-source customer support platform - alternative to Intercom, Zendesk. Omnichannel inbox for managing customer conversations across email, chat, social media, and messaging apps.

## Key Features for VA Use

### Omnichannel Support
- Live chat, Email, WhatsApp, Telegram, Facebook, Instagram, Twitter, Line, SMS
- Unified inbox for all channels
- Single conversation thread per contact

### Captain – AI Agent
- Automate tier-1 responses
- Handle common queries
- Reduce VA workload
- Escalate complex issues to VAs

### Collaboration Tools
- Private notes & @mentions
- Labels & custom views
- Canned responses for FAQs
- Auto-assignment by availability
- Team workload balancing
- Multi-lingual support

### Help Center
- Self-service knowledge base
- Reduce repetitive questions
- Publish SOPs as articles

## SBF Integration

### va.customer_support Entity
```yaml
uid: va-support-acme-001
type: va.customer_support
client_uid: va-client-acme-001
chatwoot_account_id: 12345
channels: [email, whatsapp, chat]
assigned_vas: [alice, bob]
```

### Workflows

**Support Escalation**
```
Customer message → Captain AI attempts → If complex:
  → Create va.task in SBF
  → Assign based on client_uid
  → VA responds via Chatwoot
  → Track in SBF
```

**SOP to Help Article**
```
VA creates va.sop (public)
→ AEI formats for help center
→ Publish to Chatwoot
→ Reduce manual support
```

## API Integration Example

```typescript
// Convert Chatwoot conversation to SBF task
async function conversationToTask(conversationId: number, clientUid: string) {
  const conversation = await chatwoot.getConversation(conversationId);
  
  return await sbf.createEntity({
    type: 'va.task',
    title: conversation.subject,
    client_uid: clientUid,
    source: 'chatwoot',
    priority: conversation.priority,
    metadata: {
      conversation_url: `https://chatwoot.com/app/conversations/${conversationId}`,
      contact: conversation.contact.email,
      channel: conversation.inbox.channel_type
    }
  });
}
```

## Multi-Client Setup

```yaml
# Agency managing 10 client support inboxes
Client A: account_1 (email, chat, WhatsApp)
Client B: account_2 (email, Twitter, Facebook)

# VAs assigned across clients
Alice: Client A (primary), Client C (backup)
Bob: Client B (primary), Client A (backup)

# SBF tracks:
- Support conversations per client
- VA response times
- CSAT scores
- Escalation rates
```

## Resources

- **Docs:** https://www.chatwoot.com/help-center
- **API:** https://www.chatwoot.com/developers/api
- **Discord:** https://discord.gg/cJXdrwS

## Extraction Priority

**Priority:** 🟡 MEDIUM  
Useful for client support workflows, webhook patterns, but not core to VA ops.

**Extract:**
- Webhook event handling
- Multi-channel conversation threading
- Agent assignment algorithms
- Help center article structure
