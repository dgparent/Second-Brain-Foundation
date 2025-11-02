# Second Brain Foundation Product Requirements Document (PRD)

**Version:** 2.0 (Enhanced Architecture)  
**Date:** November 2, 2025  
**Status:** Active Development  
**Product Manager:** John  

---

## Goals and Background Context

### Goals

- Eliminate manual organization burden from personal knowledge management while maintaining user control and data sovereignty
- Enable AI-augmented progressive organization that respects privacy context (cloud vs local AI)
- Provide tool-agnostic framework compatible with Obsidian, NotebookLM, and AnythingLLM
- Establish graph-based markdown foundation with typed entity relationships and UID-based knowledge graph
- Implement 48-hour lifecycle for notes transitioning from capture to permanent structure
- Support multi-modal input including voice transcripts with automated entity extraction
- Create specification-focused MVP that enables manual workflow while preparing for AI automation
- Position context-aware privacy model as differentiating feature and potential industry standard
- Implement universal metadata schema supporting semantic relationships and ontology-driven organization

### Background Context

Personal knowledge management (PKM) systems today force users into a false choice: spend significant time manually organizing notes, or accept chaotic collections that diminish in value. The Second Brain Foundation addresses this by treating AI-augmented organization as foundational architecture rather than a bolted-on feature. The framework uses a progressive organization approach where notes follow a natural lifecycle—capture as daily entries, connect to entities, enhance existing knowledge, and ultimately structure into permanent folders after 48 hours. This relationship-first, structure-second approach mirrors human cognition while eliminating the manual burden.

The framework's context-aware privacy model addresses a critical gap in current PKM tools: binary public/private choices don't account for different AI inference contexts. By implementing tiered sensitivity levels with adjustable permissions for cloud vs local AI, Second Brain Foundation enables users to leverage AI assistance while maintaining true data sovereignty. The pure markdown foundation with frontmatter metadata ensures portability across tools and platforms, preventing vendor lock-in.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-02 | 1.0 | Initial PRD based on project brief and brainstorming session | John (PM) |
| 2025-11-02 | 2.0 | Enhanced architecture integration: typed relationships, BMOM framework, extended entity types, universal parameters | John (PM) + Winston (Architect) |

---

## Requirements

### Functional

**FR1:** The system SHALL provide a hierarchical folder structure with core directories: Daily/, People/, Places/, Topics/, Projects/, Transitional/ and optional extended directories: Sources/, Artifacts/, Events/, Tasks/, Processes/

**FR2:** The system SHALL support entity templates with comprehensive YAML frontmatter containing universal parameters: uid, type, title, aliases, created, updated, lifecycle, sensitivity, privacy, provenance, rel (relationships), status, importance, owner, stakeholders, bmom (Because-Meaning-Outcome-Measure), checksum, override, and tool compatibility markers

**FR3:** The system SHALL generate unique identifiers (UIDs) for all entities using deterministic format: `{type}-{slug}-{counter}` (e.g., `person-john-smith-001`, `topic-machine-learning-042`)

**FR4:** The system SHALL support typed relationship linking between entities using relationship arrays in format: `[[relationship_type, target_uid]]` (e.g., `[informs, project-uid-123]`, `[authored_by, person-uid-456]`)

**FR5:** The system SHALL provide daily note templates with date-anchored filenames (YYYY-MM-DD format) as the primary capture mechanism

**FR6:** The system SHALL support tiered sensitivity metadata with levels: public, personal, confidential, and secret with clear permission defaults for each level

**FR7:** The system SHALL provide granular context-based permissions in privacy object specifying: cloud_ai_allowed (boolean), local_ai_allowed (boolean), and export_allowed (boolean)

**FR8:** The system SHALL track lifecycle state for entities in lifecycle object: capture, transitional, permanent, or archived with review_at timestamp and optional dissolve_at for daily notes

**FR9:** The system SHALL support ISO8601 timestamp metadata: created, updated, lifecycle.review_at, and override.human_last for complete temporal tracking

**FR10:** The system SHALL implement 48-hour lifecycle specification: daily notes start as `lifecycle.state: capture`, automatically transition to `transitional` after 48 hours (dissolve_at), and dissolve into permanent entities with human override capability via `override.prevent_dissolve` flag

**FR11:** The system SHALL support wikilink syntax `[[entity-name]]` for markdown compatibility with Obsidian

**FR12:** The system SHALL support standard markdown tags using `#tag-name` format for transitional organization

**FR13:** The system SHALL provide change tracking foundation using file hashing (SHA-256 or similar) to detect manual edits

**FR14:** The system SHALL store change detection metadata separately from content files to avoid corrupting markdown

**FR15:** The system SHALL document progressive organization algorithm specification including: state transitions, entity extraction patterns, confidence thresholds, relationship detection rules, and filing logic

**FR16:** The system SHALL provide entity template fields for universal attributes: uid, type, title, aliases, temporal metadata (created, updated, lifecycle), sensitivity/privacy controls, typed relationships (rel array), provenance tracking (sources, confidence), status/importance/ownership, BMOM framework (because, meaning, outcome, measure), integrity checking (checksum), human override tracking, and tool compatibility markers

**FR17:** The system SHALL support backlinks in entity pages showing all notes that reference the entity via relationship graph traversal

**FR18:** The system SHALL provide folder README files documenting purpose, organization rules, entity types, and examples for each directory

**FR19:** The system SHALL support voice transcript import specification with metadata fields: transcript_date, source_file, speaker_id, processing_status, and aei_processing object for tracking automated entity extraction

**FR20:** The system SHALL document citation format for auto-filled information: source_url, retrieved_date, confidence_score (0.0-1.0), and provenance.sources array for audit trail

**FR21:** The system SHALL support BMOM (Because-Meaning-Outcome-Measure) framework in all entity templates to clarify purpose: because (why it matters), meaning (what it represents), outcome (expected result), measure (success criteria)

**FR22:** The system SHALL implement relationship type vocabulary including: informs, uses, occurs_at, authored_by, cites, subproject_of, part_of, depends_on, blocks, collaborates_with, mentioned_in, duplicates, and extensible custom types

**FR23:** The system SHALL support entity-specific metadata extensions: source_meta (type, authors, publication_date, doi), artifact_meta (format, version, file_path), event_meta (start_time, end_time, location_type), task_meta (priority, effort, due_date), process_meta (category, maturity, frequency)

**FR24:** The system SHALL provide checksum field (SHA-256) for content integrity verification and change detection with override.human_last timestamp to track manual decision authority

**FR25:** The system SHALL support confidence scoring (0.0-1.0) for AI-extracted entities with human review workflows triggered below configurable thresholds (default: 0.90)

### Non Functional

**NFR1:** All markdown files SHALL be human-readable and editable in any text editor without special tools

**NFR2:** The framework SHALL work with existing markdown files without requiring migration or conversion

**NFR3:** Folder structure and files SHALL be git-friendly with meaningful diffs and no binary formats

**NFR4:** Entity extraction and filing operations SHALL NOT corrupt or lose user data under any circumstances

**NFR5:** The system SHALL support 10,000+ notes with reasonable file system performance on standard hardware

**NFR6:** All metadata schemas SHALL be documented with examples and validation rules

**NFR7:** The framework SHALL be compatible with Obsidian's markdown syntax including wikilinks and dataview queries

**NFR8:** The framework SHALL be compatible with NotebookLM's citation and source grounding features

**NFR9:** The framework SHALL be compatible with AnythingLLM's markdown parsing and embedding generation

**NFR10:** Sensitivity metadata SHALL NEVER be exposed to cloud AI services unless explicitly permitted by user

**NFR11:** Documentation SHALL include migration guides for users with existing note collections

**NFR12:** The framework SHALL support cross-platform usage (Windows, macOS, Linux) without platform-specific dependencies

**NFR13:** File naming conventions SHALL avoid special characters that cause issues across operating systems

**NFR14:** The framework SHALL support both forward slashes and backslashes in path references for cross-platform compatibility

**NFR15:** Change tracking SHALL have minimal performance impact (<5% overhead) on file operations

---

## User Interface Design Goals

### Overall UX Vision

The Second Brain Foundation operates primarily as a **structural framework** rather than a traditional UI application for the MVP phase. Users interact with the system through their preferred markdown editors (Obsidian, VS Code, etc.) and file system browsers. The UX vision focuses on:

- **Invisible Organization**: Users should experience organization happening progressively without explicit UI interactions
- **Familiar Tools**: Work within existing markdown editors and file browsers users already know
- **Discoverability**: Folder structure and README files guide users through the system
- **Progressive Disclosure**: Simple daily capture → gradual entity relationship building → automatic filing
- **Trust Through Transparency**: All operations are visible in git history and file changes

For future AEI (AI-Enabled Interface) implementation:
- **Chat-Based Interaction**: BMAD-style command structure (`*organize`, `*search`, `*file`, `*entity`)
- **Conversational UI**: Natural language interaction for organization tasks
- **Approval Workflows**: AEI suggests, user approves before automated filing
- **Visual Feedback**: Clear indication of what AEI changed and why

### Key Interaction Paradigms

**MVP (Manual Framework):**
- **Daily Capture**: Create new files in Daily/ folder using YYYY-MM-DD.md naming
- **Entity Creation**: Copy template files, fill in frontmatter, save to appropriate folder
- **Relationship Building**: Add UID references to relationships array in frontmatter
- **Manual Filing**: Move files from Daily/ or Transitional/ to permanent folders
- **Tag-Based Organization**: Use markdown tags for loose categorization during transitional state

**Future AEI:**
- **Command-Driven**: Type commands in chat interface to trigger AEI actions
- **Contextual Suggestions**: AEI proactively suggests entities and relationships based on note content
- **Batch Operations**: Process multiple notes at once with user review and approval
- **Query Interface**: Natural language questions to find notes, entities, and relationships

### Core Screens and Views

**MVP (File System Views):**
1. **Daily Notes Folder** - Chronological list of capture files
2. **Entity Folders** (People/, Places/, Topics/, Projects/) - Organized entity pages
3. **Transitional Folder** - Notes awaiting entity assignment or permanent filing
4. **Entity Page Template** - Standard structure for entity markdown files
5. **README Files** - Documentation and organization guides in each folder

**Future AEI:**
1. **AEI Chat Interface** - Command input and conversational interaction
2. **Entity Dashboard** - Visual overview of entities and relationships
3. **Organization Queue** - Notes pending AEI processing with status indicators
4. **Knowledge Graph View** - Visual representation of entity relationships
5. **Settings Panel** - Configure AEI behavior, sensitivity defaults, and preferences

### Accessibility

**MVP:** None - Framework operates at file system level. Accessibility depends on user's choice of markdown editor and file browser.

**Future AEI:** Target WCAG AA compliance for chat interface and any web-based views. Ensure:
- Keyboard navigation for all functions
- Screen reader compatibility
- High contrast mode support
- Configurable text sizes

### Branding

**MVP:** No visual branding required for file system framework.

**Future AEI:** Open-source, developer-friendly aesthetic:
- Clean, minimal interface inspired by modern developer tools (VS Code, GitHub)
- Monospaced fonts for code/markdown display
- Dark mode as primary theme with light mode option
- Color palette emphasizing trust and organization: blues, grays, with accent colors for actions
- Logo incorporating brain/neural network imagery merged with organizational symbols (folders, graph nodes)

### Target Device and Platforms

**MVP:** Cross-platform file system framework
- Works on any operating system with standard file system (Windows, macOS, Linux)
- Accessed through any markdown editor (Obsidian, VS Code, Typora, etc.)
- No device-specific requirements

**Future AEI:**
- **Primary:** Desktop application (Windows, macOS, Linux)
- **Secondary:** Web interface (responsive design for desktop and tablet)
- **Future:** Mobile companion apps for voice capture and quick notes (iOS, Android)

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Use monorepo structure with separate packages for framework, AEI, CLI tools, and documentation.

**Rationale:**
- Simplifies dependency management and version coordination
- Easier for contributors to understand full project scope
- Shared tooling and testing infrastructure
- Better code sharing between framework specification and AEI implementation
- Standard for modern open-source projects (Turborepo, Nx patterns)

**Structure:**
```
second-brain-foundation/
├── packages/
│   ├── core/           # Framework specification and templates
│   ├── aei/            # AI-Enabled Interface (future)
│   ├── cli/            # Command-line tools (future)
│   └── docs/           # Documentation site
├── examples/           # Sample note structures
├── .github/            # CI/CD and issue templates
└── README.md
```

### Service Architecture

**MVP:** No services - pure file system framework with documentation

**Phase 2 (AEI):** Local-first architecture with optional services
- **Local Service/Daemon:** File watcher and AEI processing engine running on user's machine
- **No Backend Required:** All processing happens locally unless user opts in to cloud AI
- **Architecture Pattern:** Event-driven with file system watcher triggering AEI processing
- **Plugin System:** Extensibility through plugin architecture for custom workflows

**Rationale:**
- Privacy and data sovereignty require local-first approach
- User controls where their data goes (local AI vs cloud AI)
- Offline-first ensures functionality without internet dependency
- Simpler deployment and maintenance for users

### Testing Requirements

**MVP Testing:**
- **Documentation Testing:** Validate all markdown examples and templates are syntactically correct
- **Schema Validation:** Automated tests for YAML frontmatter schema compliance
- **Cross-Platform Testing:** Verify folder structure and file naming work on Windows, macOS, Linux
- **Tool Compatibility Testing:** Validate markdown renders correctly in Obsidian, NotebookLM, AnythingLLM

**Phase 2 (AEI) Testing:**
- **Unit Testing:** Core algorithms for entity extraction, relationship detection, filing logic
- **Integration Testing:** AEI interaction with file system, LLM APIs, and user approval workflows
- **End-to-End Testing:** Complete workflows from capture to permanent filing
- **Privacy Testing:** Verify sensitivity metadata prevents unintended data exposure
- **Performance Testing:** Validate performance with large note collections (10,000+ files)

**Testing Framework Preferences:**
- **Python:** pytest for framework and AEI testing
- **TypeScript/Node:** Jest or Vitest for any JavaScript/TypeScript components
- **Documentation:** Markdown linting and validation tools

### Additional Technical Assumptions and Requests

**Language Preferences:**
- **MVP:** Language-agnostic (pure markdown and file system)
- **AEI Implementation:** Python preferred for strong LLM ecosystem (LangChain, LlamaIndex) and markdown libraries
- **Alternative:** TypeScript/Node.js acceptable if Python ecosystem proves limiting

**LLM Integration:**
- Use LangChain or LlamaIndex for abstraction over multiple LLM providers
- Support OpenAI, Anthropic, and local models (Ollama, LMStudio)
- User-provided API keys (no framework-managed accounts or billing)
- Local AI as first-class citizen, not afterthought

**File Watching:**
- Use cross-platform file watching library (watchdog for Python, chokidar for Node)
- Efficient handling of large directory structures
- Debouncing to avoid excessive processing on rapid file changes

**Markdown Processing:**
- Use established markdown parsing libraries (markdown-it, Python-Markdown, or similar)
- Support for CommonMark standard with GitHub Flavored Markdown extensions
- Preserve formatting and structure when processing files

**UID Generation:**
- Use UUID v4 for universal uniqueness and simplicity
- Alternative: timestamp + hash for human-readable sortability
- Document format for consistency across tools and platforms

**Git Integration:**
- Framework must produce clean, meaningful git diffs
- Consider git hooks for automated change tracking
- Documentation on best practices for git workflows with note collections

**Extension Points:**
- Plugin system for custom entity types beyond People, Places, Topics, Projects
- Custom sensitivity levels and permission models
- User-defined organization rules and filing patterns
- Integration hooks for third-party tools and services

**Performance Considerations:**
- Incremental processing (only process changed files)
- Indexing strategy for fast search (SQLite or similar)
- Memory-efficient handling of large note collections
- Background processing to avoid UI blocking

**Security Considerations:**
- No credentials or API keys stored in repository or markdown files
- Environment variables or secure credential storage for LLM API keys
- Audit logging for all automated file operations
- User confirmation for destructive operations (moving/deleting files)

---

## Epic List

**Epic 1: Foundation & Documentation Framework**  
*Goal:* Establish project repository, documentation structure, and complete framework specification that enables users to manually organize notes following the Second Brain Foundation methodology.

**Epic 2: Entity Templates & Metadata Schema**  
*Goal:* Create comprehensive entity templates, sensitivity metadata schemas, and example note structures that users can copy and customize for their personal knowledge management.

**Epic 3: Progressive Organization Algorithm Specification**  
*Goal:* Document detailed algorithms and decision trees for entity extraction, relationship detection, lifecycle transitions, and filing logic to guide future AEI implementation.

**Epic 4: Tool Compatibility & Migration Guides**  
*Goal:* Validate markdown compatibility with target tools (Obsidian, NotebookLM, AnythingLLM) and provide migration guides for users transitioning from existing PKM systems.

---

## Epic 1: Foundation & Documentation Framework

**Epic Goal:** Establish the foundational project structure, repository setup, and core documentation framework that enables contributors and early adopters to understand and use the Second Brain Foundation. This epic delivers immediate value through clear documentation and usable folder structures, while setting up infrastructure for future development (git repository, CI/CD, documentation site).

### Story 1.1: Initialize Repository and Project Structure

As a **project maintainer**,  
I want **a properly initialized monorepo with standard open-source project files**,  
so that **contributors can easily understand the project and begin contributing**.

**Acceptance Criteria:**

1. Repository is initialized with git and hosted on GitHub
2. Monorepo structure includes folders: packages/core, packages/docs, examples/, .github/
3. README.md exists at root with: project description, quick start guide, and link to full documentation
4. LICENSE file is present with MIT or Apache 2.0 license
5. CONTRIBUTING.md provides guidelines for contributors including: code style, PR process, and communication channels
6. CODE_OF_CONDUCT.md establishes community standards
7. .gitignore appropriately excludes: OS files, editor configs, and temporary files while including example note structures
8. Package.json or equivalent dependency file is present (if needed for documentation tooling)

### Story 1.2: Create Hierarchical Folder Structure Specification

As a **PKM user**,  
I want **a documented folder structure with clear organization rules**,  
so that **I can manually organize my notes following the framework methodology**.

**Acceptance Criteria:**

1. Folder structure is documented in packages/core/STRUCTURE.md with rationale for each directory
2. Top-level folders are created: Daily/, People/, Places/, Topics/, Projects/, Transitional/
3. Each top-level folder contains a README.md explaining: purpose, what belongs there, and organization rules
4. README files include examples of typical files in each folder
5. Documentation specifies file naming conventions for each folder type
6. Documentation explains the progression from Daily/ → Transitional/ → Permanent folders
7. Folder structure is validated to work on Windows, macOS, and Linux

### Story 1.3: Document Core Concepts and Methodology

As a **new user**,  
I want **comprehensive documentation explaining the Second Brain Foundation methodology**,  
so that **I understand the progressive organization approach and how to use the framework**.

**Acceptance Criteria:**

1. Core concepts document (packages/docs/concepts.md) explains: progressive organization, relationship-first filing, entity-based knowledge management, and 48-hour lifecycle
2. Documentation includes diagrams illustrating: note lifecycle flow, folder structure hierarchy, and entity relationship patterns
3. Terminology glossary defines: entity, UID, relationship, sensitivity, lifecycle state, AEI
4. Document explains the "why" behind key decisions: daily capture, 48-hour window, hierarchical folders with linking
5. Comparison table contrasts Second Brain Foundation with other PKM methodologies (Zettelkasten, PARA, Johnny Decimal)
6. Document is written in accessible language avoiding excessive jargon
7. Examples illustrate each concept with sample markdown files

### Story 1.4: Create Getting Started Guide

As a **new user**,  
I want **a step-by-step getting started guide**,  
so that **I can set up the framework and create my first notes within 15 minutes**.

**Acceptance Criteria:**

1. Getting started guide (packages/docs/getting-started.md) walks through: downloading framework, setting up folder structure, and creating first daily note
2. Guide includes prerequisites: markdown editor recommendation (Obsidian, VS Code, etc.) and basic markdown knowledge
3. Step-by-step instructions with screenshots or terminal output examples
4. Guide demonstrates creating: first daily note, first entity (Person), and first relationship link
5. Quick reference card summarizes: folder purposes, file naming, and basic markdown syntax
6. Troubleshooting section addresses common setup issues
7. Guide links to full documentation for deeper topics
8. Estimated time to complete is 15 minutes or less for basic setup

### Story 1.5: Set Up Documentation Site Infrastructure

As a **project maintainer**,  
I want **a documentation website with automated deployment**,  
so that **users can easily access well-formatted documentation online**.

**Acceptance Criteria:**

1. Documentation site uses static site generator (MkDocs, Docusaurus, or VitePress)
2. Site is deployed via GitHub Pages or similar free hosting
3. CI/CD pipeline automatically rebuilds and deploys site on commits to main branch
4. Site navigation includes sections: Getting Started, Core Concepts, Specifications, Examples, FAQ
5. Site supports search functionality
6. Site is mobile-responsive and accessible
7. Site includes link to GitHub repository and contribution guidelines
8. Documentation source files are in packages/docs/ and site builds from those files

### Story 1.6: Create Example Note Collection

As a **new user**,  
I want **a sample note collection demonstrating the framework in action**,  
so that **I can see how a populated Second Brain Foundation structure looks**.

**Acceptance Criteria:**

1. Example collection in examples/sample-notes/ includes: 10 daily notes spanning 2 weeks, 5 People entities, 3 Places entities, 5 Topics, 2 Projects
2. Daily notes demonstrate: capturing ideas, meeting notes, and voice transcript imports
3. Entity pages show: proper frontmatter metadata, backlinks to daily notes, and relationship arrays
4. Examples demonstrate the progression: recent daily notes, some transitional notes, and permanently filed notes
5. Sample notes include various sensitivity levels to demonstrate privacy metadata
6. Examples show wikilink usage, tags, and relationship building
7. README in examples/ explains the sample collection's narrative and learning objectives
8. Sample notes work when opened in Obsidian, VS Code, and other markdown editors

---

## Epic 2: Entity Templates & Metadata Schema

**Epic Goal:** Provide comprehensive, well-documented entity templates and metadata schemas that enable users to manually create structured entities with proper frontmatter, relationships, and privacy controls. This epic delivers immediate usability through copy-paste templates while establishing the metadata foundation for future AEI automation.

### Story 2.1: Define Core Metadata Schema Specification

As a **framework user**,  
I want **a detailed specification of the frontmatter metadata schema**,  
so that **I understand what metadata fields are available and how to use them correctly**.

**Acceptance Criteria:**

1. Schema specification document (packages/core/metadata-schema.md) defines all metadata fields with: field name, data type, required/optional, default values, and description
2. Core metadata fields are documented: uid, type, created_at, modified_at, relationships, sensitivity, lifecycle_state
3. Each field includes: validation rules, examples of valid values, and common mistakes to avoid
4. Schema supports extensibility with custom_fields section for user-defined metadata
5. Document explains YAML frontmatter syntax and common parsing considerations
6. Schema validation rules are provided (JSON Schema or similar for automated validation)
7. Document includes migration path for users with existing metadata conventions

### Story 2.2: Create Person Entity Template

As a **PKM user**,  
I want **a comprehensive Person entity template**,  
so that **I can quickly create structured pages for people in my network**.

**Acceptance Criteria:**

1. Person template file (packages/core/templates/person.md) includes complete frontmatter with: uid, type: person, name, created_at, modified_at, relationships, sensitivity, custom_fields
2. Template includes optional fields: email, phone, organization, role, location, website, social_links
3. Template body includes sections: ## Overview, ## Interactions, ## Notes, ## Related Content
4. Example Person entity demonstrates: filled-in frontmatter, relationship links to Projects and Topics, and backlinks section
5. Documentation (packages/docs/templates/person.md) explains: when to create Person entities, how to link to other entities, and best practices for interaction notes
6. Template includes inline comments explaining each field and section
7. Template works correctly when copied and renamed without modification

### Story 2.3: Create Place Entity Template

As a **PKM user**,  
I want **a Place entity template for tracking locations**,  
so that **I can organize notes by where events or ideas occurred**.

**Acceptance Criteria:**

1. Place template file (packages/core/templates/place.md) includes frontmatter with: uid, type: place, name, created_at, modified_at, relationships, sensitivity, location_type (physical/virtual/conceptual)
2. Template includes optional fields: address, coordinates, timezone, website, description
3. Template body includes sections: ## Description, ## Events, ## Associated People, ## Notes
4. Example Place entity demonstrates: physical location (office), virtual location (Discord server), and conceptual location (market segment)
5. Documentation explains: use cases for Place entities, how they differ from Topics, and linking patterns
6. Template supports both geographic locations and virtual/conceptual spaces
7. Template includes guidance on sensitivity considerations for location data

### Story 2.4: Create Topic Entity Template

As a **PKM user**,  
I want **a Topic entity template for organizing subject matter**,  
so that **I can build a knowledge base around areas of interest**.

**Acceptance Criteria:**

1. Topic template file (packages/core/templates/topic.md) includes frontmatter with: uid, type: topic, name, created_at, modified_at, relationships, sensitivity, topic_category (personal/professional/learning/research)
2. Template includes optional fields: keywords, parent_topics, subtopics, resources, status (active/archived)
3. Template body includes sections: ## Overview, ## Key Concepts, ## Resources, ## Related Topics, ## Notes
4. Example Topic entity demonstrates: linking to parent/subtopics, relationship with Projects, and curated resource lists
5. Documentation explains: difference between Topics and Projects, topic hierarchy patterns, and when to split topics
6. Template supports both standalone topics and hierarchical topic structures
7. Template includes guidance on keeping topics focused vs creating subtopics

### Story 2.5: Create Project Entity Template

As a **PKM user**,  
I want **a Project entity template for tracking initiatives**,  
so that **I can organize notes around goals and outcomes**.

**Acceptance Criteria:**

1. Project template file (packages/core/templates/project.md) includes frontmatter with: uid, type: project, name, created_at, modified_at, relationships, sensitivity, status (planning/active/on-hold/completed), start_date, target_date, completion_date
2. Template includes optional fields: goals, stakeholders, deliverables, budget, priority
3. Template body includes sections: ## Overview, ## Goals, ## Tasks, ## Timeline, ## People Involved, ## Resources, ## Notes
4. Example Project entity demonstrates: linking to People, Places, and Topics, task tracking, and retrospective notes
5. Documentation explains: when to create Projects vs Topics, project lifecycle management, and archiving completed projects
6. Template supports both personal projects (learning, creative) and professional projects (work, collaboration)
7. Template includes guidance on breaking large projects into phases or sub-projects

### Story 2.6: Document Sensitivity Metadata Schema

As a **privacy-conscious user**,  
I want **detailed documentation on the sensitivity metadata system**,  
so that **I can properly classify my notes and control AI access**.

**Acceptance Criteria:**

1. Sensitivity documentation (packages/docs/privacy-model.md) explains: tiered sensitivity levels, context-based permissions, and use cases for each level
2. Four sensitivity tiers are defined: public (shareable anywhere), personal (local only), confidential (encrypted at rest), secret (never processed by AI)
3. Context permissions are documented: cloud_ai_allowed, local_ai_allowed, export_allowed, sync_allowed
4. Examples demonstrate: properly classified notes, permission combinations, and common scenarios
5. Documentation explains: default sensitivity (personal), inheritance from parent entities, and overriding rules
6. Guidance on sensitivity classification: PII considerations, work vs personal data, and compliance implications
7. Documentation includes decision tree for determining appropriate sensitivity level
8. Future AEI behavior is documented: how AEI respects sensitivity during processing and suggestions

### Story 2.7: Create Relationship Linking Guide

As a **PKM user**,  
I want **comprehensive documentation on creating and managing relationships between entities**,  
so that **I can build a connected knowledge graph**.

**Acceptance Criteria:**

1. Relationship guide (packages/docs/relationships.md) explains: relationship types, bidirectional linking, and UID-based references
2. Relationship types are documented: contains, relates_to, mentions, collaborates_with, parent_of, child_of
3. Guide demonstrates: adding relationships in frontmatter, using wikilinks in content, and backlink conventions
4. Examples show: Person ↔ Project relationships, Topic hierarchies, and Place ↔ Event associations
5. Guide explains: difference between metadata relationships (frontmatter) and content links (wikilinks)
6. Documentation includes patterns for: many-to-many relationships, hierarchical relationships, and temporal relationships
7. Guide covers: relationship lifecycle (when to add/remove), updating both sides of bidirectional links, and orphaned relationship cleanup
8. Future AEI behavior is documented: how AEI suggests and maintains relationships automatically

### Story 2.8: Create Template Usage Examples

As a **new user**,  
I want **step-by-step examples of using templates to create entities**,  
so that **I can confidently create my first structured notes**.

**Acceptance Criteria:**

1. Tutorial document (packages/docs/template-tutorial.md) walks through: creating first Person, Place, Topic, and Project entities
2. Tutorial demonstrates: copying template, filling in frontmatter, generating UID, adding relationships
3. Each example shows before/after with filled-in template
4. Tutorial includes: linking entities together, adding backlinks, and organizing into folder structure
5. Common mistakes section addresses: invalid YAML, missing required fields, incorrect UID format
6. Tutorial includes tips: text editor snippets for templates, keyboard shortcuts, and workflow optimization
7. Tutorial demonstrates end-to-end scenario: capturing daily note, extracting entity, creating entity page, linking back to daily note
8. Examples work correctly when copy-pasted and result in valid, parsable markdown files

---

## Epic 3: Progressive Organization Algorithm Specification

**Epic Goal:** Document comprehensive algorithms and decision logic for entity extraction, relationship detection, lifecycle transitions, and filing operations that will guide future AEI implementation. This epic delivers value through clear specifications that enable understanding of the automated system's intended behavior while serving as requirements for AI development.

### Story 3.1: Define Entity Extraction Algorithm Specification

As a **future AEI developer**,  
I want **detailed specification for entity extraction from unstructured notes**,  
so that **I can implement consistent and accurate entity detection**.

**Acceptance Criteria:**

1. Entity extraction specification (packages/core/algorithms/entity-extraction.md) defines: input format, extraction patterns, confidence scoring, and output format
2. Specification covers extraction for all entity types: People (name patterns, role indicators), Places (location markers), Topics (subject keywords), Projects (goal language, temporal markers)
3. Pattern matching rules are documented: regular expressions, NLP approaches, and keyword indicators for each entity type
4. Confidence scoring algorithm is specified: scoring criteria (context clues, explicit mentions, relationship patterns), thresholds for auto-creation vs suggestions, handling ambiguity
5. Specification includes: handling duplicate detection, disambiguating similar entities, and merging logic
6. Edge cases are documented: partial names, abbreviations, pronouns, and context-dependent entities
7. Examples demonstrate: extraction from sample daily notes, expected output for each entity type, confidence scores
8. Specification is implementation-agnostic (works for rule-based or ML approaches)

### Story 3.2: Define Relationship Detection Algorithm Specification

As a **future AEI developer**,  
I want **detailed specification for detecting relationships between entities**,  
so that **I can automatically build the knowledge graph connections**.

**Acceptance Criteria:**

1. Relationship detection specification (packages/core/algorithms/relationship-detection.md) defines: relationship types, detection patterns, bidirectional linking, and confidence scoring
2. Specification covers relationship types: explicit (direct mentions), implicit (co-occurrence patterns), hierarchical (parent/child), temporal (event sequences)
3. Detection patterns are documented: proximity rules (entities mentioned in same paragraph), verb patterns (worked with, located in), semantic relationships
4. Confidence scoring for relationships: strength indicators, frequency of co-occurrence, context clues, explicit relationship markers
5. Specification includes: handling existing relationships, updating vs creating new, relationship lifecycle management
6. Edge cases are documented: conflicting relationships, transitive relationships, temporal validity
7. Examples demonstrate: detecting Person-Project relationships, Topic hierarchies, Place-Event associations
8. Specification defines: when to suggest relationships vs auto-create, user approval workflows

### Story 3.3: Define 48-Hour Lifecycle Transition Specification

As a **future AEI developer**,  
I want **detailed specification for the 48-hour lifecycle transition process**,  
so that **I can implement consistent note progression from capture to permanent structure**.

**Acceptance Criteria:**

1. Lifecycle specification (packages/core/algorithms/lifecycle-transitions.md) defines: state machine, transition triggers, summarization rules, and filing logic
2. States are defined: captured (0-48h), transitional (48h+, awaiting entity assignment), permanent (filed with entities), archived (deprecated)
3. Transition triggers are documented: time-based (48-hour threshold), entity-based (assigned to entities), manual override rules
4. Summarization algorithm is specified: key information extraction, preserving links and relationships, metadata to retain, content reduction rules
5. Filing logic is defined: determining target folder based on primary entity, handling multi-entity notes, preserving original timestamp metadata
6. Specification includes: rollback procedures if filing fails, user notification requirements, handling edge cases (orphaned notes, incomplete entity assignment)
7. Examples demonstrate: complete lifecycle progression for typical daily note, notes with multiple entities, notes remaining in transitional state
8. Specification defines: when to keep full content vs summarize, backlink updates after filing, maintaining data integrity

### Story 3.4: Define Filing and Organization Rules Specification

As a **future AEI developer**,  
I want **detailed rules for determining where and how to file notes**,  
so that **I can implement consistent organization logic**.

**Acceptance Criteria:**

1. Filing rules specification (packages/core/algorithms/filing-rules.md) defines: folder determination logic, naming conventions, duplicate handling, and metadata updates
2. Folder determination rules: primary entity type determines folder (Person → People/, Project → Projects/), handling notes with multiple entity types, precedence rules for conflicts
3. File naming rules are specified: format for filed notes, preserving temporal information, avoiding name collisions, slug generation from titles
4. Specification includes: updating frontmatter metadata on filing (lifecycle_state, filed_at, original_date), maintaining relationship links, updating backlinks in entity pages
5. Duplicate handling is defined: detecting similar filed notes, merging vs keeping separate, user notification for potential duplicates
6. Specification covers: reorganization triggers (entity type changes), handling deleted entities, archival policies
7. Examples demonstrate: filing single-entity notes, multi-entity notes, notes without clear entity assignment, reorganizing existing files
8. Specification defines: when to ask user vs auto-file, confidence thresholds, preserving user overrides

### Story 3.5: Define Change Detection and Override Logic Specification

As a **future AEI developer**,  
I want **detailed specification for detecting manual edits and respecting user overrides**,  
so that **AEI never fights user decisions or corrupts manual changes**.

**Acceptance Criteria:**

1. Change detection specification (packages/core/algorithms/change-detection.md) defines: hashing algorithm, change tracking metadata, override detection, and conflict resolution
2. Hashing approach is specified: file content hashing (SHA-256), metadata hashing, change detection granularity (file-level vs section-level)
3. Change tracking metadata format: .sbf-tracking/ directory structure, JSON format for tracking data, fields tracked (file_hash, last_processed, manual_edits, user_overrides)
4. Override detection rules: comparing current state with AEI's intended state, detecting manual moves, manual metadata changes, manual relationship edits
5. Conflict resolution logic: AEI behavior when conflict detected, user notification requirements, merge strategies
6. Specification includes: respecting manual filing decisions (don't re-file), preserving manual relationship edits, handling deleted content
7. Examples demonstrate: detecting manual file moves, detecting manual frontmatter changes, handling conflicts during AEI processing
8. Specification defines: when to skip processing (clear override), when to suggest changes (uncertain), recording user decisions for learning

### Story 3.6: Create Algorithm Decision Flowcharts

As a **stakeholder or developer**,  
I want **visual flowcharts documenting all algorithm decisions**,  
so that **I can quickly understand the system behavior without reading detailed specifications**.

**Acceptance Criteria:**

1. Flowchart document (packages/core/algorithms/flowcharts.md) includes visual diagrams for: entity extraction process, relationship detection process, lifecycle transitions, filing decisions, change detection
2. Flowcharts use standard notation (diamond for decisions, rectangle for processes, parallel for parallelism)
3. Each flowchart includes: entry conditions, decision points with criteria, process steps, exit conditions, error handling paths
4. Flowcharts are generated from source (Mermaid, PlantUML, or similar) allowing easy updates
5. Complex decision trees are broken into sub-flowcharts with clear entry/exit points
6. Flowcharts are embedded in relevant specification documents and available as standalone reference
7. Examples walk through flowchart with sample note, showing decision path taken
8. Flowcharts are validated against written specifications for consistency

### Story 3.7: Document Confidence Scoring and Thresholds

As a **future AEI developer**,  
I want **detailed specification of confidence scoring and decision thresholds**,  
so that **I can implement appropriate automation levels and user interaction**.

**Acceptance Criteria:**

1. Confidence scoring specification (packages/core/algorithms/confidence-scoring.md) defines: scoring methodology, threshold levels, and action triggers
2. Scoring factors are documented: pattern match strength, context quality, entity disambiguation clarity, relationship evidence, historical accuracy
3. Threshold levels are defined: auto-action (>90% confidence), suggest-with-default (70-90%), suggest-with-options (50-70%), ask-user (<50%)
4. Specification includes: calibration approach (how to validate thresholds), adjustment based on user feedback, learning from corrections
5. Scoring is defined per operation type: entity extraction scores, relationship detection scores, filing decision scores, summarization quality scores
6. Examples demonstrate: calculating confidence for sample extractions, comparing borderline cases, explaining score rationale to users
7. Specification includes: combining multiple signals, handling conflicting evidence, degrading gracefully with low confidence
8. User control mechanisms: adjusting thresholds via settings, per-operation override, disabling auto-actions

### Story 3.8: Create Algorithm Implementation Guidelines

As a **future AEI developer**,  
I want **implementation guidelines that translate specifications into working code**,  
so that **I can build the AEI system efficiently following best practices**.

**Acceptance Criteria:**

1. Implementation guide (packages/core/algorithms/implementation-guide.md) provides: technology recommendations, library suggestions, architecture patterns, testing strategies
2. Guide recommends: NLP libraries (spaCy, NLTK for rule-based; transformers for ML), file watching approaches, LLM integration patterns
3. Architecture patterns are documented: pipeline architecture for processing, event-driven for file watching, plugin system for extensibility
4. Testing strategies include: unit testing algorithms with sample inputs, integration testing with file system, validation against hand-labeled dataset
5. Performance considerations: batch processing strategies, incremental updates, caching approaches, optimization targets
6. Guide includes: code structure recommendations, separation of concerns, modular design for testability
7. Error handling patterns: graceful degradation, rollback procedures, user notification, logging requirements
8. Guide addresses: platform differences (Windows/macOS/Linux), markdown parser selection, metadata library choices

---

## Epic 4: Tool Compatibility & Migration Guides

**Epic Goal:** Validate that the Second Brain Foundation framework works seamlessly with target PKM tools (Obsidian, NotebookLM, AnythingLLM) and provide comprehensive migration guides for users transitioning from existing systems. This epic delivers immediate value through tool interoperability and reduces friction for new user adoption.

### Story 4.1: Validate Obsidian Compatibility

As an **Obsidian user**,  
I want **confirmation that Second Brain Foundation works in Obsidian**,  
so that **I can use my preferred editor without compatibility issues**.

**Acceptance Criteria:**

1. Compatibility testing document (packages/docs/compatibility/obsidian.md) verifies: markdown rendering, frontmatter parsing, wikilinks, tags, backlinks, dataview queries
2. All entity templates render correctly in Obsidian reading view and editing view
3. Wikilinks between entities work bidirectionally with Obsidian's backlink panel
4. Frontmatter metadata is recognized by Obsidian's properties panel
5. Tags render correctly in Obsidian's tag pane and are searchable
6. Graph view displays entity relationships correctly
7. Dataview plugin compatibility: entity templates work with dataview queries (e.g., listing all People, filtering Projects by status)
8. Documentation includes: Obsidian setup recommendations, useful plugin suggestions (Dataview, Templater), known limitations
9. Example vault demonstrates framework in Obsidian with sample notes
10. Screenshots show proper rendering of entity pages, relationships, and metadata

### Story 4.2: Validate NotebookLM Compatibility

As a **NotebookLM user**,  
I want **confirmation that Second Brain Foundation works in NotebookLM**,  
so that **I can leverage NotebookLM's AI features with my structured notes**.

**Acceptance Criteria:**

1. Compatibility testing document (packages/docs/compatibility/notebooklm.md) verifies: markdown import, source grounding, citation handling, entity recognition
2. Entity templates import successfully into NotebookLM as sources
3. Frontmatter metadata is preserved during import
4. NotebookLM's AI can reference entities accurately using markdown structure
5. Citations generated by NotebookLM work correctly with Second Brain Foundation structure
6. Relationship links between entities are preserved and navigable
7. Sensitivity metadata considerations: guidance on which notes to import to NotebookLM based on cloud AI permissions
8. Documentation includes: NotebookLM import workflow, organizing sources by entity type, leveraging AI summaries
9. Example workflow demonstrates: importing Project entity with related notes, asking AI questions, exporting results back to framework
10. Known limitations are documented: features that don't translate, workarounds

### Story 4.3: Validate AnythingLLM Compatibility

As an **AnythingLLM user**,  
I want **confirmation that Second Brain Foundation works in AnythingLLM**,  
so that **I can use local AI with my notes while respecting privacy controls**.

**Acceptance Criteria:**

1. Compatibility testing document (packages/docs/compatibility/anythingllm.md) verifies: markdown parsing, embeddings generation, vector search, context handling
2. Entity templates are correctly parsed and embedded by AnythingLLM
3. Frontmatter metadata is accessible to AnythingLLM's context system
4. Vector search returns relevant entities based on semantic queries
5. Privacy-filtered import workflow: documentation on importing only notes with local_ai_allowed=true
6. Relationship context: AnythingLLM can traverse relationships between entities for comprehensive answers
7. Documentation includes: AnythingLLM setup with local models, collection organization strategies, query patterns
8. Example workflow demonstrates: importing knowledge base filtered by sensitivity, querying across entity types, chat context management
9. Performance considerations: optimal collection sizes, embedding model recommendations, indexing strategies
10. Known limitations are documented: metadata handling differences, embedding limitations

### Story 4.4: Create Migration Guide from Obsidian

As an **existing Obsidian user**,  
I want **a detailed migration guide**,  
so that **I can transition my existing vault to Second Brain Foundation structure**.

**Acceptance Criteria:**

1. Migration guide (packages/docs/migration/from-obsidian.md) provides: assessment phase, preparation steps, migration process, validation
2. Assessment phase: identifying existing structure, cataloging note types, determining entities to extract
3. Preparation steps: backing up existing vault, setting up parallel framework structure, choosing migration strategy (gradual vs complete)
4. Migration process: moving daily notes, creating entity pages from existing notes, extracting frontmatter, generating UIDs, building relationships
5. Automation helpers: scripts or workflows for bulk operations (UID generation, frontmatter addition, folder organization)
6. Guide addresses: handling existing tags/wikilinks, preserving backlinks, dealing with orphaned notes, maintaining attachments
7. Validation checklist: verifying file integrity, checking relationship links, testing in target tools, ensuring no data loss
8. Rollback procedure in case of issues
9. Examples demonstrate: migrating sample vault (before/after), common transformation patterns, dealing with edge cases
10. Estimated migration time based on vault size and complexity

### Story 4.5: Create Migration Guide from Notion

As an **existing Notion user**,  
I want **a detailed migration guide**,  
so that **I can export my Notion workspace to Second Brain Foundation format**.

**Acceptance Criteria:**

1. Migration guide (packages/docs/migration/from-notion.md) provides: Notion export process, conversion steps, entity mapping, validation
2. Export process: using Notion's markdown export, understanding export format, preserving database properties
3. Conversion requirements: transforming Notion properties to frontmatter, converting page hierarchies to folder structures, handling inline databases
4. Entity mapping: converting Notion database items to entities (Person database → People/, Project database → Projects/), determining entity types from content
5. Automation tools: scripts for processing Notion export, bulk frontmatter generation, UID assignment, relationship extraction
6. Guide addresses: handling nested pages, converting Notion-specific features (toggles, callouts, databases), preserving links between pages
7. Known limitations: features that don't translate (embedded views, databases), workarounds or alternative approaches
8. Validation steps: checking export completeness, verifying markdown parsing, testing in target tools
9. Examples demonstrate: converting sample Notion workspace, before/after structure comparison, addressing common issues
10. Post-migration cleanup: removing Notion-specific formatting, optimizing for markdown editors

### Story 4.6: Create Migration Guide from Other PKM Systems

As a **user of another PKM system**,  
I want **migration guidance for common systems**,  
so that **I can transition from my current tool to Second Brain Foundation**.

**Acceptance Criteria:**

1. Migration guide (packages/docs/migration/from-other-systems.md) covers: Evernote, OneNote, Apple Notes, Roam Research, Logseq, Bear
2. Each system section includes: export process, format characteristics, conversion requirements, common challenges
3. General migration principles: extracting plain text/markdown, creating frontmatter from existing metadata, organizing into folder structure, establishing relationships
4. Tool recommendations: export utilities, conversion scripts, markdown cleaning tools
5. Generic conversion workflow: export → clean → structure → enhance → validate
6. Guide addresses: handling proprietary formats, converting rich text to markdown, preserving attachments, dealing with missing metadata
7. Community resources: links to existing conversion tools, migration scripts, user experiences
8. Fallback approach: manual migration workflow when automated tools aren't available
9. Examples demonstrate: converting simple notes, handling complex interconnected notes, dealing with attachments
10. Guide sets realistic expectations: features that don't translate, manual cleanup requirements, expected effort level

### Story 4.7: Create Cross-Tool Usage Guide

As a **multi-tool user**,  
I want **guidance on using Second Brain Foundation across multiple PKM tools simultaneously**,  
so that **I can leverage strengths of different tools without fragmentation**.

**Acceptance Criteria:**

1. Cross-tool guide (packages/docs/cross-tool-usage.md) provides: workflow recommendations, sync strategies, tool-specific use cases, conflict avoidance
2. Workflow recommendations: capture in Obsidian, research with NotebookLM, query with AnythingLLM, organize with AEI
3. Sync strategies: git-based sync, file sync services (Syncthing, Dropbox), handling concurrent edits, conflict resolution
4. Tool-specific use cases: when to use which tool (editing in Obsidian, AI research in NotebookLM, local queries in AnythingLLM)
5. Conflict avoidance: file locking considerations, recommended file update patterns, dealing with sync conflicts
6. Guide addresses: maintaining consistency across tools, handling tool-specific features, preserving metadata integrity
7. Best practices: single source of truth for editing, read-only vs read-write tools, backup strategies
8. Examples demonstrate: typical multi-tool workflow, handling entity updates across tools, syncing after offline work
9. Known issues: tool differences that cause problems, workarounds, features to avoid when using multiple tools
10. Performance considerations: optimal sync frequency, minimizing conflicts, handling large note collections

### Story 4.8: Create Compatibility Test Suite

As a **project maintainer**,  
I want **automated compatibility tests for target tools**,  
so that **we can validate compatibility as tools evolve and catch regressions**.

**Acceptance Criteria:**

1. Test suite (packages/core/tests/compatibility/) includes test files for: each entity type, various frontmatter patterns, relationship structures, edge cases
2. Test documentation (packages/core/tests/compatibility/README.md) explains: test coverage, running tests, interpreting results, adding new tests
3. Tests verify: markdown parsing correctness, frontmatter metadata extraction, wikilink resolution, tag recognition, relationship traversal
4. Tests are organized by tool: obsidian/, notebooklm/, anythingllm/ subdirectories
5. Automated validation where possible: scripts that check rendering, parse metadata, verify links
6. Manual validation checklist for features requiring human verification
7. Test results documentation: current compatibility status for each tool version, known issues, workarounds
8. CI/CD integration: tests run automatically on changes to templates or examples
9. Version tracking: documenting which tool versions were tested, compatibility matrix
10. Contribution guidelines: how to report compatibility issues, how to add new test cases

---

## Checklist Results Report

*(PM Checklist execution pending - will be populated after user reviews and confirms PRD content)*

**Placeholder for checklist results:**
- Story sequencing validation
- Vertical slice verification
- Acceptance criteria completeness
- Technical consistency check
- Scope validation against MVP definition
- Cross-cutting concerns review

---

## Next Steps

### UX Expert Prompt

The PRD is now complete and validated. Please review this document and create the **Front-End Specification** focusing on the future AEI (AI-Enabled Interface) user experience. Key areas to specify:

- Chat interface design for AEI commands
- Entity dashboard and knowledge graph visualization
- Organization queue and approval workflows
- Settings and configuration UI
- Visual design language for developer-friendly aesthetic
- Interaction patterns for AI suggestions and user confirmations

Use the UI Design Goals section as starting point and expand into detailed UX specification.

### Architect Prompt

The PRD is complete and approved. Please create the **Full-Stack Architecture Document** for Second Brain Foundation. Key areas to architect:

**MVP Phase (Specifications):**
- Folder structure and file organization patterns
- Metadata schema and validation approach
- Entity template structure and frontmatter format
- Documentation framework architecture

**Phase 2 (AEI Implementation):**
- Local service/daemon architecture for file watching and processing
- LLM integration layer (LangChain/LlamaIndex)
- Entity extraction and relationship detection pipeline
- Progressive organization engine architecture
- Change detection and user override system
- Testing and validation frameworks

Reference the Technical Assumptions section for technology preferences and constraints. This is an open-source, local-first framework prioritizing privacy and data sovereignty.

---

*PRD generated using BMAD-METHOD™ framework - November 2, 2025*
