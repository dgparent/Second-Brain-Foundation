# Relationship Tracking Framework

## Overview

The **Relationship Tracking Framework** provides a reusable foundation for managing contacts, relationships, and interactions. This framework enables plugins for CRM, networking, team management, and personal relationship tracking.

## Features

- **Contact Management**: Store and organize contact information
- **Interaction Tracking**: Log meetings, calls, emails, and other interactions
- **Relationship Analysis**: Calculate relationship strength and patterns
- **Network Insights**: Analyze connections and mutual relationships
- **Follow-up Management**: Track pending follow-ups and important dates
- **Flexible Metadata**: Extensible for domain-specific needs

## Installation

```bash
npm install @sbf/frameworks-relationship-tracking
```

## Quick Start

```typescript
import {
  createContactEntity,
  createInteractionEntity,
  RelationshipAnalysisWorkflow,
} from '@sbf/frameworks-relationship-tracking';

// Create a contact
const contact = createContactEntity({
  uid: 'contact-001',
  full_name: 'Jane Doe',
  category: 'colleague',
  email: 'jane.doe@example.com',
  company: 'Acme Corp',
  job_title: 'Product Manager',
  tags: ['product', 'collaboration'],
  relationship_strength: 'strong',
});

// Log an interaction
const interaction = createInteractionEntity({
  uid: 'interaction-001',
  title: 'Product Planning Meeting',
  interaction_type: 'meeting',
  date: '2025-11-21',
  contact_uids: ['contact-001'],
  duration_minutes: 60,
  summary: 'Discussed Q1 2026 product roadmap',
  action_items: ['Review proposal', 'Schedule follow-up'],
  follow_up_required: true,
  follow_up_date: '2025-12-01',
});

// Analyze relationships
const workflow = new RelationshipAnalysisWorkflow(memoryEngine);

const strength = await workflow.calculateRelationshipStrength('contact-001');
console.log(`Relationship strength: ${strength.strength} (${strength.score}/100)`);

const needsFollowUp = await workflow.findContactsNeedingFollowUp(30);
console.log(`${needsFollowUp.length} contacts need follow-up`);

const stats = await workflow.getNetworkStatistics();
console.log(`Total contacts: ${stats.total_contacts}`);
console.log(`Interactions this month: ${stats.interactions_this_month}`);
```

## Entity Types

### Contact Entity

Represents a person in your network.

```typescript
type ContactEntity = {
  uid: string;
  type: 'relationship.contact';
  title: string; // Full name
  metadata: {
    full_name: string;
    email?: string;
    phone?: string;
    company?: string;
    job_title?: string;
    category: 'family' | 'friend' | 'colleague' | 'client' | 'acquaintance' | 'other';
    tags: string[];
    relationship_strength?: 'weak' | 'moderate' | 'strong' | 'vital';
    // ... more fields
  };
};
```

### Interaction Entity

Represents a communication or meeting.

```typescript
type InteractionEntity = {
  uid: string;
  type: 'relationship.interaction';
  title: string;
  metadata: {
    interaction_type: 'meeting' | 'call' | 'email' | 'message' | 'event' | 'other';
    date: string;
    duration_minutes?: number;
    contact_uids: string[];
    summary?: string;
    action_items?: string[];
    follow_up_required?: boolean;
    // ... more fields
  };
};
```

### Network Group Entity

Represents a group of contacts.

```typescript
type NetworkGroupEntity = {
  uid: string;
  type: 'relationship.network_group';
  title: string; // Group name
  metadata: {
    group_type: 'family' | 'team' | 'community' | 'project' | 'hobby' | 'other';
    member_uids: string[];
    description?: string;
    // ... more fields
  };
};
```

## Workflows

### Relationship Analysis Workflow

Analyze relationship patterns and connection strength.

```typescript
const workflow = new RelationshipAnalysisWorkflow(memoryEngine);

// Calculate relationship strength
const strength = await workflow.calculateRelationshipStrength('contact-uid');

// Find contacts needing follow-up
const contacts = await workflow.findContactsNeedingFollowUp(30);

// Get network statistics
const stats = await workflow.getNetworkStatistics();

// Find mutual connections
const mutual = await workflow.findMutualConnections('uid-1', 'uid-2');
```

## Utility Functions

```typescript
import {
  filterContactsByCategory,
  filterContactsByStrength,
  groupContactsByCompany,
  findUpcomingBirthdays,
  exportToVCard,
} from '@sbf/frameworks-relationship-tracking';

// Filter contacts
const colleagues = filterContactsByCategory(contacts, 'colleague');
const strongConnections = filterContactsByStrength(contacts, 'strong');

// Group by company
const byCompany = groupContactsByCompany(contacts);

// Find upcoming birthdays
const birthdays = findUpcomingBirthdays(contacts, 30);

// Export to vCard
const vcard = exportToVCard(contact);
```

## Plugin Examples

This framework enables plugins for:

1. **CRM Plugin**: Sales pipeline, customer management
2. **Team Management Plugin**: Team directory, collaboration tracking
3. **Networking Plugin**: Professional network, event connections
4. **Personal Relationships Plugin**: Family, friends, life events

## Code Reuse

Plugins built on this framework typically reuse **85%+ of the code** by:

- Extending base entity types with domain-specific fields
- Using built-in workflows for common operations
- Customizing only domain logic and UI components

## License

MIT
