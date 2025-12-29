# @sbf/entity-framework

Entity framework for Second Brain Foundation with PRD-compliant UID generation, frontmatter parsing, and wikilink support.

## Features

- **Entity Type Registry**: Manage and customize entity types (Person, Place, Topic, Project, Event, Artifact)
- **UID Generator**: PRD-compliant UIDs in format `{type}-{slug}-{counter}` (e.g., `person-john-smith-001`)
- **Frontmatter Parser**: YAML frontmatter extraction and generation for markdown files
- **Wikilink Parser**: Extract and resolve `[[UID]]` style links
- **Entity Service**: Full CRUD operations with relationship management

## Installation

```bash
pnpm add @sbf/entity-framework
```

## Usage

### Entity Types

```typescript
import { EntityTypeRegistry, EntityType } from '@sbf/entity-framework';

const registry = new EntityTypeRegistry();

// Get all types for a tenant
const types = await registry.getTypes('tenant-123');

// Get specific type
const personType = await registry.getType('tenant-123', 'person');

// Register custom type
await registry.registerType({
  tenantId: 'tenant-123',
  name: 'Book',
  slug: 'book',
  description: 'A published work',
  icon: 'book',
  color: '#3B82F6',
  folderPath: 'Books/',
});
```

### UID Generation

```typescript
import { UIDGenerator } from '@sbf/entity-framework';

const generator = new UIDGenerator();

// Generate a new UID
const uid = await generator.generateUID('tenant-123', 'person', 'John Smith');
// Returns: 'person-john-smith-001'

// Parse existing UID
const parsed = generator.parseUID('person-john-smith-001');
// Returns: { type: 'person', slug: 'john-smith', counter: 1 }
```

### Frontmatter

```typescript
import { FrontmatterParser } from '@sbf/entity-framework';

const parser = new FrontmatterParser();

// Parse markdown content
const { frontmatter, body } = parser.parse(`---
uid: person-john-smith-001
type: person
name: John Smith
---

# John Smith

Some content about John...
`);

// Generate frontmatter
const yaml = parser.generate({
  uid: 'person-jane-doe-002',
  type: 'person',
  name: 'Jane Doe',
  sensitivity: 'personal',
  truth_level: 'U1',
});

// Update frontmatter in content
const updated = parser.update(content, { name: 'Updated Name' });
```

### Wikilinks

```typescript
import { WikilinkParser } from '@sbf/entity-framework';

const parser = new WikilinkParser();

// Extract links from content
const content = 'See [[person-john-smith-001]] for details and [[topic-ai-042|AI]]';
const links = parser.extract(content);
// Returns: [
//   { uid: 'person-john-smith-001', displayText: undefined, start: 4, end: 29 },
//   { uid: 'topic-ai-042', displayText: 'AI', start: 46, end: 64 }
// ]

// Create wikilink
const link = parser.create('person-john-smith-001', 'John');
// Returns: '[[person-john-smith-001|John]]'

// Validate UID
const isValid = parser.isValidUID('person-john-smith-001');
// Returns: true
```

### Entities

```typescript
import { EntityService } from '@sbf/entity-framework';

const entityService = new EntityService();

// Create entity
const entity = await entityService.create({
  tenantId: 'tenant-123',
  typeSlug: 'person',
  name: 'John Smith',
  content: '# John Smith\n\nBiography...',
});

// Find entities
const people = await entityService.findByType('tenant-123', 'person');

// Get with relationships
const withRels = await entityService.getWithRelationships(entity.id!);

// Create relationship
await entityService.createRelationship({
  sourceEntityId: entity.id!,
  targetUid: 'project-website-001',
  relationshipType: 'works_on',
});
```

## Entity Types

The framework comes with 6 default system entity types:

| Type | Slug | Description |
|------|------|-------------|
| Person | `person` | A human being with identity |
| Place | `place` | A physical or virtual location |
| Topic | `topic` | A subject or area of knowledge |
| Project | `project` | An initiative with goals |
| Event | `event` | A specific occurrence in time |
| Artifact | `artifact` | A document, file, or created object |

## Universal Entity Properties

All entities have these standard frontmatter properties:

- `uid`: Unique identifier in PRD format
- `type`: Entity type slug
- `name`: Display name
- `created_at`: Creation timestamp (ISO 8601)
- `modified_at`: Last modification timestamp (ISO 8601)
- `relationships`: Array of linked entities
- `sensitivity`: `public` | `personal` | `confidential` | `secret`
- `truth_level`: `L1`-`L3` (sourced) or `U1`-`U3` (unsourced)

## API

See the full API documentation in the source code or generated TypeDoc.

## License

MIT
