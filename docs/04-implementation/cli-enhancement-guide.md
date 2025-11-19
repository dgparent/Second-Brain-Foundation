# CLI Scaffolding Guide - Enhanced Architecture Update

## Summary of Changes

This document outlines updates to the CLI Scaffolding Guide to support the enhanced graph-based Markdown knowledge architecture.

### Key Changes

1. **Extended Entity Types:** Added support for 10 entity types (vs original 4)
2. **Universal Parameters:** Updated schema to include BMOM, provenance, checksum, etc.
3. **Typed Relationships:** Enhanced relationship model with semantic types
4. **Enhanced Templates:** Updated init command to use new template structure

### Entity Types

**Original (MVP Core):**
- person
- place  
- topic
- project
- daily-note

**New (Extended - Phase 1.5+):**
- source
- artifact
- event
- task
- process

### Updated Files

#### 1. `packages/cli/src/lib/uid-generator.js`

**Line 681** - Update validTypes array:
```javascript
const validTypes = [
  'person', 'place', 'topic', 'project', 'daily-note',  // Core
  'source', 'artifact', 'event', 'task', 'process'      // Extended
];
```

**Line 733** - Update regex pattern:
```javascript
const match = uid.match(/^(person|place|topic|project|daily-note|source|artifact|event|task|process)-(.+)-(\d{3})$/);
```

#### 2. `packages/cli/src/commands/uid.js`

**Line 367-375** - Update entity type selection:
```javascript
if (!type) {
  type = await ui.select('Select entity type:', [
    { name: 'Person', value: 'person' },
    { name: 'Place', value: 'place' },
    { name: 'Topic', value: 'topic' },
    { name: 'Project', value: 'project' },
    { name: 'Daily Note', value: 'daily-note' },
    { name: '---', disabled: true },
    { name: 'Source (research, article)', value: 'source' },
    { name: 'Artifact (document, design)', value: 'artifact' },
    { name: 'Event (meeting, session)', value: 'event' },
    { name: 'Task (actionable item)', value: 'task' },
    { name: 'Process (workflow, SOP)', value: 'process' },
  ]);
}
```

#### 3. `packages/cli/src/lib/validator.js`

**Line 804** - Update UID pattern and types:
```javascript
uid: { 
  type: 'string', 
  pattern: '^(person|place|topic|project|daily-note|source|artifact|event|task|process)-.+-\\d{3}$' 
},
type: { 
  type: 'string', 
  enum: ['person', 'place', 'topic', 'project', 'daily-note', 'source', 'artifact', 'event', 'task', 'process'] 
},
```

**Line 800-828** - Enhanced schema with universal parameters:
```javascript
const entitySchema = {
  $id: 'entity-metadata',
  type: 'object',
  required: ['uid', 'type', 'title', 'created', 'updated'],
  properties: {
    uid: { 
      type: 'string', 
      pattern: '^(person|place|topic|project|daily-note|source|artifact|event|task|process)-.+-\\d{3}$' 
    },
    type: { 
      type: 'string', 
      enum: ['person', 'place', 'topic', 'project', 'daily-note', 'source', 'artifact', 'event', 'task', 'process'] 
    },
    title: { type: 'string', minLength: 1 },
    aliases: { type: 'array', items: { type: 'string' } },
    created: { type: 'string', format: 'date-time' },
    updated: { type: 'string', format: 'date-time' },
    lifecycle: {
      type: 'object',
      required: ['state'],
      properties: {
        state: { type: 'string', enum: ['capture', 'transitional', 'permanent', 'archived'] },
        review_at: { type: 'string', format: 'date-time' },
        dissolve_at: { type: 'string', format: 'date-time' },
        auto_dissolve: { type: 'boolean' }
      }
    },
    sensitivity: {
      type: 'object',
      required: ['level'],
      properties: {
        level: { type: 'string', enum: ['public', 'personal', 'confidential', 'secret'] },
        privacy: {
          type: 'object',
          properties: {
            cloud_ai_allowed: { type: 'boolean' },
            local_ai_allowed: { type: 'boolean' },
            export_allowed: { type: 'boolean' }
          }
        }
      }
    },
    provenance: {
      type: 'object',
      properties: {
        sources: { type: 'array', items: { type: 'string' } },
        confidence: { type: 'number', minimum: 0, maximum: 1 }
      }
    },
    rel: {
      type: 'array',
      items: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: { type: 'string' }
      }
    },
    status: { type: 'string' },
    importance: { type: 'integer', minimum: 1, maximum: 5 },
    owner: { type: 'string' },
    stakeholders: { type: 'array', items: { type: 'string' } },
    bmom: {
      type: 'object',
      properties: {
        because: { type: 'string' },
        meaning: { type: 'string' },
        outcome: { type: 'string' },
        measure: { type: 'string' }
      }
    },
    checksum: { type: 'string' },
    override: {
      type: 'object',
      properties: {
        human_last: { type: 'string', format: 'date-time' },
        prevent_dissolve: { type: 'boolean' }
      }
    },
    tool: {
      type: 'object',
      properties: {
        compat: { type: 'array', items: { type: 'string' } }
      }
    },
    tags: { type: 'array', items: { type: 'string' } }
  }
};
```

#### 4. `packages/cli/src/lib/vault.js`

**Line 1017-1021** - Update folder structure check:
```javascript
async exists(directory) {
  const requiredFolders = [
    'Daily', 'People', 'Places', 'Topics', 'Projects', 'Transitional'
  ];
  const optionalFolders = [
    'Sources', 'Artifacts', 'Events', 'Tasks', 'Processes'
  ];
  
  // Check core folders exist
  return requiredFolders.every((folder) =>
    existsSync(join(directory, folder))
  );
}
```

**Line 1029-1036** - Update init folders:
```javascript
async init(directory, template = 'standard') {
  const coreFolders = [
    'Daily',
    'People',
    'Places',
    'Topics',
    'Projects',
    'Transitional',
  ];
  
  const extendedFolders = [
    'Sources',
    'Artifacts',
    'Events',
    'Tasks',
    'Processes',
  ];

  // Always create core folders
  for (const folder of coreFolders) {
    const folderPath = join(directory, folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
    this.createFolderReadme(folderPath, folder);
  }

  // Create extended folders for standard/full templates
  if (template === 'standard' || template === 'full') {
    for (const folder of extendedFolders) {
      const folderPath = join(directory, folder);
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }
      this.createFolderReadme(folderPath, folder);
    }
  }
  
  // ... rest of init logic
}
```

#### 5. `packages/cli/src/commands/init.js`

**Update template selection and descriptions:**
```javascript
const template = await ui.select('Select vault template:', [
  {
    name: 'Minimal (Core folders only)',
    value: 'minimal',
    description: 'Daily, People, Places, Topics, Projects, Transitional'
  },
  {
    name: 'Standard (Core + Extended)',
    value: 'standard',
    description: 'Core + Sources, Artifacts, Events, Tasks, Processes'
  },
  {
    name: 'Full (All folders + sample entities)',
    value: 'full',
    description: 'Standard + example entities for each type'
  },
]);
```

### Template Location

Templates are now located in `/templates/` directory at project root:
- `templates/person.md`
- `templates/place.md`
- `templates/topic.md`
- `templates/project.md`
- `templates/daily-note.md`
- `templates/source.md`
- `templates/artifact.md`
- `templates/event.md`
- `templates/task.md`
- `templates/process.md`
- `templates/README.md`

### Relationship Types

Update documentation for typed relationships:

**Standard Edge Types:**
```javascript
const relationshipTypes = [
  // Knowledge relationships
  'informs', 'related_to', 'specializes', 'generalizes',
  
  // Structural relationships
  'part_of', 'subproject_of', 'depends_on',
  
  // Action relationships
  'uses', 'produces', 'authored_by', 'cites',
  
  // Spatial/temporal relationships
  'occurs_at', 'mentioned_in', 'collaborates_with',
  
  // Status relationships
  'blocks', 'precedes', 'duplicates'
];
```

### Migration Notes

**For Existing Implementations:**
1. Existing 4-entity-type vaults remain compatible
2. Extended entities are opt-in via template selection
3. Schema validator supports both old and new field sets
4. UIDs maintain backward compatibility

**Breaking Changes:**
- None - all changes are additive
- Old `created_at` → `created` (both accepted)
- Old `modified_at` → `updated` (both accepted)
- Old `lifecycle_state` → `lifecycle.state` (nested)

**Recommended Migration Path:**
1. Update CLI to support extended types
2. Keep existing vaults on core types only
3. New vaults can opt into extended templates
4. Gradual adoption as users need new entity types

---

**Version:** 2.0  
**Date:** November 2, 2025  
**Status:** Ready for Implementation
