# @sbf/plugins-relationship-crm

> CRM and Contact Management Plugin for Second Brain Foundation

**Framework:** Relationship Tracking  
**Version:** 0.1.0  
**Status:** ✅ Active

---

## 📋 Overview

A comprehensive CRM (Customer Relationship Management) plugin that provides professional-grade contact management, interaction tracking, and relationship analytics. Built on top of the Relationship Tracking Framework, demonstrating 85-90% code reuse.

### Key Features

- 📇 **Contact Management** - Organize contacts with rich metadata
- 📊 **Relationship Scoring** - Automatic strength calculation based on interactions
- 🤝 **Interaction Logging** - Track meetings, calls, emails, and events
- 👥 **Network Groups** - Organize contacts into families, teams, and communities
- 🔔 **Follow-up Reminders** - Never miss an important connection
- 📈 **Analytics Dashboard** - Network statistics and insights
- 🔍 **Smart Search** - Find contacts by any attribute
- 🌐 **Network Visualization** - See your relationship graph

---

## 🚀 Quick Start

### Installation

```bash
npm install @sbf/plugins-relationship-crm
```

### Basic Usage

```typescript
import { CRMService } from '@sbf/plugins-relationship-crm';

// Initialize CRM
const crm = new CRMService(memoryEngine, aeiProvider);

// Add a contact
const contact = await crm.addContact({
  full_name: 'Jane Smith',
  email: 'jane@example.com',
  company: 'Acme Corp',
  job_title: 'Engineering Manager',
  category: 'colleague',
});

// Log an interaction
await crm.logInteraction({
  contact_uids: [contact.uid],
  interaction_type: 'meeting',
  title: 'Project Discussion',
  date: new Date().toISOString(),
  duration_minutes: 60,
  summary: 'Discussed Q4 roadmap',
  follow_up_required: true,
  follow_up_date: '2025-12-01',
});

// Get relationship strength
const strength = await crm.getRelationshipStrength(contact.uid);
console.log(`Relationship: ${strength.strength} (${strength.score}/100)`);

// Find contacts needing follow-up
const needsFollowUp = await crm.findContactsNeedingFollowUp(30);
```

---

## 📦 Entities

### Contact Entity

Extended contact entity with CRM-specific features:

```typescript
interface CRMContact extends ContactEntity {
  metadata: {
    // Standard fields from framework
    full_name: string;
    email?: string;
    phone?: string;
    company?: string;
    job_title?: string;
    category: ContactCategory;
    
    // CRM-specific fields
    lead_status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'customer';
    lead_source?: string;
    lead_score?: number;
    deal_value?: number;
    sales_stage?: string;
    account_manager?: string;
    priority_level?: 'low' | 'medium' | 'high' | 'critical';
  };
}
```

### Interaction Entity

Track all forms of communication:

```typescript
interface CRMInteraction {
  interaction_type: 'meeting' | 'call' | 'email' | 'message' | 'event';
  date: string;
  duration_minutes?: number;
  contact_uids: string[];
  summary?: string;
  action_items?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  quality_rating?: number; // 1-5
}
```

### Network Group Entity

Organize contacts into groups:

```typescript
interface NetworkGroup {
  group_name: string;
  group_type: 'family' | 'team' | 'community' | 'project' | 'hobby';
  member_uids: string[];
  leader_uid?: string;
  purpose?: string;
  meeting_frequency?: string;
}
```

---

## 🔧 Workflows

### Contact Creation Workflow

Intelligently create contacts with AI-powered enrichment:

```typescript
const workflow = new ContactCreationWorkflow(memoryEngine, aeiProvider);

// Create contact with AI enrichment
const contact = await workflow.createContact({
  full_name: 'John Doe',
  email: 'john@example.com',
  enrichment_options: {
    infer_company: true,
    infer_job_title: true,
    suggest_tags: true,
  },
});
```

### Interaction Logging Workflow

Log interactions and automatically update relationship strength:

```typescript
const workflow = new InteractionLoggingWorkflow(memoryEngine);

await workflow.logInteraction({
  contact_uids: [contactUid],
  interaction_type: 'meeting',
  title: 'Coffee Chat',
  date: new Date().toISOString(),
  duration_minutes: 30,
  auto_update_strength: true, // Recalculate relationship strength
});
```

### Follow-up Reminder Workflow

Generate smart follow-up reminders:

```typescript
const workflow = new FollowUpReminderWorkflow(memoryEngine);

// Get contacts needing follow-up
const reminders = await workflow.generateReminders({
  days_threshold: 30,
  prioritize_by: 'relationship_strength',
  max_results: 10,
});
```

---

## 🛠️ Utilities

### Contact Search

Advanced contact search with multiple criteria:

```typescript
import { ContactSearchUtility } from '@sbf/plugins-relationship-crm';

const search = new ContactSearchUtility(memoryEngine);

// Search by any field
const results = await search.findContacts({
  company: 'Acme Corp',
  category: 'colleague',
  tags: ['tech', 'startup'],
  relationship_strength: ['strong', 'vital'],
});
```

### Relationship Strength Calculator

Calculate relationship strength with customizable algorithms:

```typescript
import { RelationshipStrengthCalculator } from '@sbf/plugins-relationship-crm';

const calculator = new RelationshipStrengthCalculator();

const strength = calculator.calculate({
  interaction_count: 25,
  days_since_last: 7,
  avg_per_month: 4.2,
  total_days_known: 180,
});
// Returns: { score: 82, strength: 'vital' }
```

### Network Analyzer

Analyze your network and find insights:

```typescript
import { NetworkAnalyzer } from '@sbf/plugins-relationship-crm';

const analyzer = new NetworkAnalyzer(memoryEngine);

// Get network statistics
const stats = await analyzer.getNetworkStats();

// Find influential contacts (most connections)
const influencers = await analyzer.findInfluencers();

// Find isolated contacts (few interactions)
const isolated = await analyzer.findIsolatedContacts();

// Find network bridges (connect different groups)
const bridges = await analyzer.findBridges();
```

---

## 📊 Code Reuse Metrics

**Framework Reuse:** ~87% 🎯

| Component | LOC | Framework Reuse | Plugin-Specific |
|-----------|-----|----------------|-----------------|
| Entities | ~200 | 85% | 15% |
| Workflows | ~300 | 90% | 10% |
| Utilities | ~250 | 85% | 15% |
| **Total** | **~750** | **~87%** | **~13%** |

The plugin demonstrates the power of the framework-first architecture by reusing core relationship entities and workflows while adding CRM-specific features.

---

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage:** 15+ tests across entities, workflows, and utilities

---

## 🎯 Use Cases

1. **Professional Networking** - Manage career contacts and connections
2. **Sales CRM** - Track leads, opportunities, and customer relationships
3. **Personal Network** - Keep track of friends and family
4. **Community Building** - Manage community members and interactions
5. **Event Planning** - Organize attendees and follow-ups
6. **Partnership Management** - Track business partnerships and collaborations

---

## 🔗 Integration

### With Desktop App

```typescript
// In desktop app settings
import { CRMService } from '@sbf/plugins-relationship-crm';

const crm = new CRMService(window.memoryEngine, window.aeiProvider);

// Add to UI
window.crmService = crm;
```

### With CLI

```bash
# Add contact via CLI
sbf crm add-contact --name "Jane Doe" --email "jane@example.com"

# Log interaction
sbf crm log-interaction --contact "jane-doe" --type "meeting"

# Get stats
sbf crm stats
```

---

## 📚 Related

- **Framework:** [@sbf/frameworks-relationship-tracking](../../../frameworks/relationship-tracking)
- **Plugins:** Other relationship plugins
- **Docs:** [Plugin Development Guide](../../../../docs/guides/plugin-development.md)

---

## 📄 License

MIT © Second Brain Foundation
