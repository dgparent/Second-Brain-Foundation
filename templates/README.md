# Second Brain Foundation - Entity Templates

This directory contains enhanced entity templates based on the graph-based Markdown knowledge architecture.

## Available Templates

### Core Entities (MVP)
- **[topic.md](./topic.md)** - Conceptual knowledge or theory
- **[project.md](./project.md)** - Goal-driven coordinated work
- **[person.md](./person.md)** - Human actors and relationships
- **[place.md](./place.md)** - Geographic or operational contexts
- **[daily-note.md](./daily-note.md)** - Date-anchored capture mechanism

### Extended Entities (Phase 1.5+)
- **[source.md](./source.md)** - Research papers, articles, books, datasets
- **[artifact.md](./artifact.md)** - Produced materials (documents, designs, code)
- **[event.md](./event.md)** - Temporal activities or sessions
- **[task.md](./task.md)** - Actionable elements with ownership
- **[process.md](./process.md)** - Methods, SOPs, or workflows

## Universal Parameters

All templates include these standard fields:

### Identity
- `uid` - Stable universal identifier (type-slug-counter format)
- `type` - Entity classification
- `title` - Human-readable name
- `aliases` - Alternative names or references

### Temporal Metadata
- `created` - ISO8601 timestamp of creation
- `updated` - ISO8601 timestamp of last modification
- `lifecycle.state` - capture | transitional | permanent | archived
- `lifecycle.review_at` - Scheduled review date

### Privacy & Sensitivity
- `sensitivity.level` - public | personal | confidential | secret
- `privacy.cloud_ai_allowed` - Boolean for cloud AI processing
- `privacy.local_ai_allowed` - Boolean for local AI processing
- `privacy.export_allowed` - Boolean for export permissions

### Relationships
- `rel` - Array of typed relationships `[type, target-uid]`
  - Examples: `[informs, project-uid]`, `[uses, process-uid]`, `[authored_by, person-uid]`

### Provenance & Quality
- `provenance.sources` - Evidence and citations
- `provenance.confidence` - AI inference confidence (0.0-1.0)
- `checksum` - SHA-256 hash for integrity verification
- `override.human_last` - Timestamp of last human decision

### Status & Priority
- `status` - Entity-specific status (active, completed, etc.)
- `importance` - Priority score (1-5)
- `owner` - Primary responsible party
- `stakeholders` - Additional interested parties

### BMOM Framework
- `bmom.because` - Why this entity matters
- `bmom.meaning` - What it represents in your knowledge system
- `bmom.outcome` - Expected understanding or capability
- `bmom.measure` - Success criteria or metrics

### Tool Compatibility
- `tool.compat` - Array of compatible tools (obsidian, notebooklm, anythingllm)

## Relationship Types

### Standard Edge Types
```yaml
# Knowledge relationships
[informs]       # concept → project
[related_to]    # general association
[specializes]   # narrower concept
[generalizes]   # broader concept

# Structural relationships
[part_of]       # component → whole
[subproject_of] # project → parent project
[depends_on]    # dependency chain

# Action relationships
[uses]          # process → artifact
[produces]      # process → output
[authored_by]   # artifact → person
[cites]         # artifact → source

# Spatial/temporal relationships
[occurs_at]     # event → place
[mentioned_in]  # entity → daily note
[collaborates_with] # person → person

# Status relationships
[blocks]        # task → task
[precedes]      # sequential ordering
[duplicates]    # duplicate detection
```

## Usage Examples

### Creating a New Topic
```bash
cp templates/topic.md Topics/my-new-topic.md
# Edit and replace {{placeholders}}
```

### Linking Entities
```yaml
# In project.md
rel:
  - [informed_by, topic-machine-learning-001]
  - [uses, process-data-analysis-001]
  - [occurs_at, place-lab-north-001]
  - [owned_by, person-john-smith-001]
```

### Daily Note → Entity Extraction
```markdown
# In Daily/2025-11-02.md
Met with [[John Smith]] about the [[Coffee Roasting Project]] 
at [[Downtown Lab]]. Discussed applying [[Vacuum Roasting Theory]].

# After AEI processing, relationships auto-populate:
rel:
  - [mentions, person-john-smith-001]
  - [mentions, project-coffee-roasting-001]
  - [mentions, place-downtown-lab-001]
  - [mentions, topic-vacuum-roasting-001]
```

## Sensitivity Guidelines

### Public
- General knowledge, published research
- Non-personal places (public venues)
- Completed public projects
- **Permissions:** ✅ Cloud AI, ✅ Local AI, ✅ Export

### Personal
- Daily notes, private thoughts
- Personal relationships
- Ongoing projects
- **Permissions:** ❌ Cloud AI, ✅ Local AI, ✅ Export

### Confidential
- Work-related sensitive information
- Business processes and strategies
- Client/customer data
- **Permissions:** ❌ Cloud AI, ✅ Local AI, ⚠️ Limited Export

### Secret
- Financial records, passwords
- Legal/medical information
- Highly sensitive personal data
- **Permissions:** ❌ Cloud AI, ❌ Local AI, ❌ Export

## 48-Hour Lifecycle

### Daily Notes
1. **Capture (0-48h):** Lives in `Daily/` folder, `lifecycle.state: capture`
2. **Transitional (48h+):** Moves to `Transitional/` if not processed, `lifecycle.state: transitional`
3. **Dissolution:** Entities extracted and linked, original note can be archived

### Permanent Entities
- Person, Place, Topic, Project, Source, Process typically start as `permanent`
- Events, Tasks, Artifacts may transition through states
- Review cycles vary by entity type

## Tool Integration

### Obsidian
- Full wikilink support `[[entity-name]]`
- Dataview queries can filter by any metadata field
- Graph view shows relationship network
- Templater can populate placeholders

### NotebookLM
- Frontmatter preserved during ingestion
- Citation tracking via `provenance.sources`
- Sensitivity levels control what's uploaded

### AnythingLLM
- Markdown parsing compatible
- Embedding generation respects privacy flags
- Relationship graph enhances RAG context

## Advanced Features

### Entity Merging
When duplicates detected:
```yaml
rel:
  - [duplicates, person-john-doe-002]
override:
  human_last: 2025-11-02T10:30:00Z  # Human confirms merge decision
```

### Confidence Scoring
AI-extracted entities include confidence:
```yaml
provenance:
  confidence: 0.85  # 85% confidence
  sources: [daily-2025-11-02]
# Human review required below 0.90 threshold
```

### Change Tracking
```yaml
checksum: "a1b2c3d4..."  # SHA-256 of content
# If checksum changes, triggers review workflow
```

## Best Practices

1. **Start Simple:** Use only core entities (topic, project, person, place, daily-note) in MVP
2. **Let Relationships Emerge:** Don't force connections; add them as they become clear
3. **Review Regularly:** Use `lifecycle.review_at` to schedule check-ins
4. **Trust the Process:** Daily notes naturally evolve into structured knowledge
5. **Respect Privacy:** When in doubt, mark as `confidential` with local AI only
6. **Use BMOM:** The Because-Meaning-Outcome-Measure framework clarifies purpose
7. **Human Override:** Always defer to manual decisions over AI suggestions

## Migration Path

### Phase 1: Core Templates
- [ ] Use 5 core entities only
- [ ] Manual creation and linking
- [ ] No AI processing

### Phase 1.5: Extended Templates  
- [ ] Add source, artifact, event, task
- [ ] Begin relationship pattern recognition
- [ ] Light AI assistance for extraction

### Phase 2: Full Architecture
- [ ] All 10+ entity types active
- [ ] Automated entity extraction
- [ ] Full graph-based organization
- [ ] AEI session logging

---

**Version:** 2.0 (Enhanced Architecture)  
**Date:** November 2, 2025  
**Status:** Ready for Implementation
