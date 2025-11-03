# ChatGPT Prompt: Entity Schema Review for Second Brain Foundation

**Purpose:** Get a second opinion on the entity schema design from an AI expert in knowledge management, markdown-based PKM tools, and data modeling.

---

## 🎯 Prompt for ChatGPT

```
I'm designing an open-source personal knowledge management (PKM) framework called "Second Brain Foundation" that uses markdown files with YAML frontmatter for entity-based organization. The framework will support both manual workflows (MVP) and AI-augmented organization (Phase 2).

I need your expert review of my entity schema design. Please analyze it from multiple perspectives: data modeling, PKM best practices, AI/LLM compatibility, and real-world usability.

---

## CONTEXT: What We're Building

**Framework Philosophy:**
- Pure markdown + YAML frontmatter (tool-agnostic)
- Progressive organization: capture → connect → structure
- Context-aware privacy (different AI permission levels)
- Compatible with Obsidian, NotebookLM, AnythingLLM
- Local-first with optional AI enhancement

**Core Entity Types:**
1. **Person** - People you interact with
2. **Place** - Physical, virtual, or conceptual locations
3. **Topic** - Areas of knowledge, subjects, themes
4. **Project** - Goal-oriented activities with start/end
5. **Daily Note** - Date-anchored capture mechanism

**Key Features:**
- UID-based relationships (not file paths)
- Tiered sensitivity levels (public, personal, confidential, secret)
- AI permissions (cloud_ai_allowed, local_ai_allowed)
- Lifecycle states (captured, transitional, permanent, archived)
- 48-hour lifecycle: Daily → Transitional → Permanent folders

---

## PROPOSED ENTITY SCHEMA

### Base Entity Template (Common Fields)

```yaml
---
uid: string                    # Unique identifier (e.g., "person-john-smith-001")
type: enum                     # Entity type (person|place|topic|project|daily-note)
name: string                   # Display name
created_at: datetime           # ISO-8601 timestamp
modified_at: datetime          # ISO-8601 timestamp
lifecycle_state: enum          # captured|transitional|permanent|archived
relationships:                 # Array of related entities
  - uid: string                # Related entity UID
    type: string               # Relationship type (e.g., "collaborates_with")
    created_at: datetime       # When relationship established
sensitivity: enum              # public|personal|confidential|secret
context_permissions:           # AI access control
  cloud_ai_allowed: boolean    # Can cloud AI (GPT-4, Claude) process this?
  local_ai_allowed: boolean    # Can local AI (Llama, Mistral) process this?
  export_allowed: boolean      # Can export to external tools?
tags: array                    # Freeform tags for transitional organization
custom_fields: object          # Extensibility for future fields
---
```

### Person Entity

```yaml
---
uid: person-john-smith-001
type: person
name: John Smith
created_at: 2025-11-02T08:00:00Z
modified_at: 2025-11-02T08:30:00Z
lifecycle_state: permanent
relationships:
  - uid: project-ai-research-001
    type: collaborates_with
    created_at: 2025-11-02T08:00:00Z
  - uid: place-downtown-coffee-001
    type: meets_at
    created_at: 2025-11-02T08:00:00Z
sensitivity: personal
context_permissions:
  cloud_ai_allowed: false       # Don't send to cloud AI
  local_ai_allowed: true        # OK for local AI
  export_allowed: false
tags:
  - colleague
  - researcher
custom_fields:
  email: john.smith@example.com
  linkedin: linkedin.com/in/johnsmith
  first_met: 2024-06-15
---

# John Smith

## Overview
Research collaborator focusing on AI and knowledge management.

## Interactions
- 2025-11-02: Discussed progressive organization at [[Downtown Coffee]]

## Projects
- [[AI Research Project]]
```

### Place Entity

```yaml
---
uid: place-downtown-coffee-001
type: place
name: Downtown Coffee
place_type: physical           # physical|virtual|conceptual
created_at: 2025-11-02T08:00:00Z
modified_at: 2025-11-02T08:00:00Z
lifecycle_state: permanent
relationships:
  - uid: person-john-smith-001
    type: meeting_location_for
    created_at: 2025-11-02T08:00:00Z
sensitivity: public
context_permissions:
  cloud_ai_allowed: true
  local_ai_allowed: true
  export_allowed: true
tags:
  - coffee-shop
  - meeting-spot
custom_fields:
  address: 123 Main St, City
  coordinates: 40.7128,-74.0060
---

# Downtown Coffee

## Description
Quiet coffee shop, good for meetings and focused work.

## Related
- [[John Smith]] - Met here on 2025-11-02
```

### Topic Entity

```yaml
---
uid: topic-progressive-organization-001
type: topic
name: Progressive Organization
created_at: 2025-11-02T09:00:00Z
modified_at: 2025-11-02T09:30:00Z
lifecycle_state: permanent
relationships:
  - uid: topic-pkm-001
    type: subtopic_of
    created_at: 2025-11-02T09:00:00Z
  - uid: project-ai-research-001
    type: related_to
    created_at: 2025-11-02T09:00:00Z
sensitivity: public
context_permissions:
  cloud_ai_allowed: true
  local_ai_allowed: true
  export_allowed: true
tags:
  - methodology
  - productivity
custom_fields:
  references:
    - "Building a Second Brain - Tiago Forte"
    - "Zettelkasten Method - Niklas Luhmann"
---

# Progressive Organization

## Core Concept
Organization emerges from use rather than being imposed upfront.

## Principles
1. Capture freely without organizational overhead
2. Connect ideas as relationships become clear
3. Structure automatically into knowledge base

## Related Topics
- [[Personal Knowledge Management]]
- [[Zettelkasten]]
```

### Project Entity

```yaml
---
uid: project-ai-research-001
type: project
name: AI Research Project
project_status: active         # active|on-hold|completed|cancelled
start_date: 2024-06-01
target_end_date: 2025-12-31
created_at: 2025-11-02T08:00:00Z
modified_at: 2025-11-02T10:00:00Z
lifecycle_state: permanent
relationships:
  - uid: person-john-smith-001
    type: collaborator
    created_at: 2025-11-02T08:00:00Z
  - uid: topic-progressive-organization-001
    type: researches
    created_at: 2025-11-02T09:00:00Z
sensitivity: confidential
context_permissions:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: false
tags:
  - research
  - active
custom_fields:
  budget: 50000
  funding_source: University Grant
  deliverables:
    - Research paper
    - Prototype tool
---

# AI Research Project

## Objective
Explore AI-augmented knowledge management with privacy focus.

## Team
- [[John Smith]] - Lead Researcher

## Progress
- 2025-11-02: Discussed progressive organization approach
```

### Daily Note Entity

```yaml
---
uid: daily-2025-11-02
type: daily-note
date: 2025-11-02
created_at: 2025-11-02T08:00:00Z
modified_at: 2025-11-02T18:00:00Z
lifecycle_state: captured      # Will transition after 48 hours
relationships:
  - uid: person-john-smith-001
    type: mentioned
    created_at: 2025-11-02T08:30:00Z
  - uid: place-downtown-coffee-001
    type: visited
    created_at: 2025-11-02T08:30:00Z
sensitivity: personal
context_permissions:
  cloud_ai_allowed: false
  local_ai_allowed: true
  export_allowed: false
tags:
  - meeting
  - research
custom_fields: {}
---

# November 2, 2025

## Morning
Met with [[John Smith]] at [[Downtown Coffee]] to discuss [[Progressive Organization]].

Key insights:
- AI should enhance, not replace, human decision-making
- Privacy context matters more than binary public/private
- Tool interoperability reduces vendor lock-in

## Action Items
- [ ] Research existing PKM frameworks
- [ ] Draft entity schema proposal
- [ ] Test with 100-note sample vault
```

---

## YOUR TASK: Critical Review

Please analyze this schema from the following perspectives:

### 1. **Data Modeling Quality**
- Is the schema normalized? Any redundancy?
- Are field names intuitive and consistent?
- Are data types appropriate (string, enum, datetime, array)?
- Any missing fields that would be commonly needed?
- Is the custom_fields approach sufficient for extensibility?

### 2. **PKM Best Practices**
- Does this align with established PKM methodologies (Zettelkasten, PARA, etc.)?
- Are entity types well-chosen? Missing any obvious types?
- Is the relationship model flexible enough?
- Does the 48-hour lifecycle make sense?
- Are there better ways to handle daily captures?

### 3. **AI/LLM Compatibility**
- Will LLMs easily extract entities from this frontmatter?
- Is the relationship array format LLM-friendly?
- Are sensitivity levels granular enough for AI decision-making?
- Should we add confidence scores for AI-extracted data?
- Any fields that would help AI understand context?

### 4. **Real-World Usability**
- Is this too complex for users to create manually?
- Are there too many required fields?
- Is the YAML readable and maintainable?
- Will this scale to 10,000+ notes?
- Any UX friction points you foresee?

### 5. **Potential Issues**
- What edge cases might break this schema?
- How do you handle entity disambiguation (multiple "John"s)?
- What happens when a relationship is deleted?
- How do you version the schema for future changes?
- Any privacy/security concerns?

### 6. **Improvement Suggestions**
- What fields should be added?
- What fields should be removed or optional?
- Should any enums be expanded or constrained?
- Alternative approaches to relationship modeling?
- Better names for existing fields?

---

## SPECIFIC QUESTIONS

1. **UID Format:** Is `"person-john-smith-001"` a good approach? Or should we use UUIDs? Timestamps?

2. **Relationship Array:** Is this structure optimal?
   ```yaml
   relationships:
     - uid: entity-uid
       type: relationship-type
       created_at: timestamp
   ```
   Or would you suggest an alternative?

3. **Sensitivity Levels:** Are 4 levels (public, personal, confidential, secret) right? Too many? Too few?

4. **AI Permissions:** Should `context_permissions` be more granular? (e.g., per-model permissions?)

5. **Lifecycle States:** Are 4 states sufficient? Should we add more (e.g., "reviewing", "linking")?

6. **Custom Fields:** Is free-form `custom_fields: object` good enough? Or should we have a registry?

7. **Place Types:** Is `physical|virtual|conceptual` a good breakdown for places?

8. **Project Status:** Are 4 statuses enough for projects? Missing anything?

---

## ADDITIONAL CONTEXT

**What's working well in similar tools:**
- Obsidian uses wikilinks and frontmatter but no standard schema
- Notion has databases but proprietary format
- Logseq uses outliner format, different paradigm
- Capacities has objects but not markdown-based

**Our differentiators:**
- Context-aware privacy (unique)
- Pure markdown (portable)
- UID-based relationships (Obsidian uses file paths)
- AI permissions in metadata (no one does this)

**Future considerations:**
- Might add: Event, Note (freeform), Resource (article/book)
- Might need: Version history, merge conflict resolution
- Might want: Bi-directional relationship sync

---

## OUTPUT FORMAT

Please provide:

1. **Overall Assessment** (Good/Needs Work/Major Issues)
2. **Strengths** (What's working well)
3. **Weaknesses** (What needs improvement)
4. **Specific Recommendations** (Actionable changes)
5. **Edge Cases** (Scenarios that might break)
6. **Alternative Approaches** (If you'd design differently)
7. **Priority Fixes** (What to change before MVP)

Be brutally honest. I'd rather find issues now than after users adopt the schema.

Thank you!
```

---

## 📋 How to Use This Prompt

### Option 1: Copy-Paste to ChatGPT
1. Open ChatGPT (GPT-4 or GPT-4-turbo recommended)
2. Copy the entire prompt above (between the code fences)
3. Paste and send
4. Wait for comprehensive review

### Option 2: Save as Conversation Starter
1. Save this prompt to your Second Brain vault
2. Reference when discussing schema with other developers
3. Use as template for future schema reviews

### Option 3: Iterate Based on Feedback
1. Get ChatGPT's review
2. Update schema based on recommendations
3. Ask follow-up questions for specific concerns
4. Test changes with example entities

---

## 🎯 Expected Output Quality

ChatGPT should provide:
- **Detailed analysis** (2000-3000 words)
- **Specific examples** of good/bad patterns
- **Code samples** for recommended changes
- **Edge case scenarios** you haven't considered
- **Industry comparisons** to similar tools
- **Prioritized recommendations** (critical vs nice-to-have)

---

## 📊 Post-Review Checklist

After getting ChatGPT's feedback:

- [ ] Review all "Priority Fixes" recommendations
- [ ] Update schema with critical changes
- [ ] Document rationale for rejecting any suggestions
- [ ] Create test entities with updated schema
- [ ] Validate YAML parsing with updated fields
- [ ] Update CLI validator schemas
- [ ] Regenerate example vaults
- [ ] Update documentation (README, PRD, architecture)

---

*Prompt prepared by Mary (Business Analyst) for Second Brain Foundation schema validation*  
*Date: November 2, 2025*
