# Knowledge & Learning Framework - Implementation Plan

**Date:** November 21, 2025  
**Priority:** HIGHEST IMPACT  
**Estimated Build Time:** 3-4 hours  
**Expected modules:** 5-7

---

## 🎯 Executive Summary

The **Knowledge & Learning Framework** is the **highest-priority** framework cluster as it represents the **core "Second Brain" functionality**. This framework will enable rapid development of:

- Learning & Skill Tracking
- Research & Note Management
- Highlights & Annotations
- Swipefile & Content Curation
- Study Sessions & Practice

**Impact:** Unlocks the fundamental "knowledge management" use cases that define the Second Brain concept.

---

## 📊 Cluster Analysis

### Use Cases in This Cluster

| module | Description | User Need | Priority |
|--------|-------------|-----------|----------|
| **Learning Tracker** | Track learning progress, skills, courses | "I'm learning TypeScript" | HIGH |
| **Research Manager** | Organize research, citations, sources | "I'm researching AI" | HIGH |
| **Highlights & Notes** | Capture insights from content | "I highlighted this quote" | HIGH |
| **Swipefile** | Save examples, templates, inspiration | "I need to save this design" | MEDIUM |
| **Study Sessions** | Track practice, spaced repetition | "I need to review flashcards" | MEDIUM |
| **Content Library** | Organize articles, books, videos | "I want to read this later" | MEDIUM |
| **Writing Projects** | Draft, revise, publish writing | "I'm writing a blog post" | LOW |

### Common Patterns (85%+ Shared)

All knowledge modules share:

1. **Content Structure**
   - Title, body/content
   - Tags, categories
   - Creation/modification dates
   - Source attribution

2. **Metadata Tracking**
   - Status (to-learn, in-progress, mastered)
   - Difficulty level
   - Time investment
   - Quality/importance ratings

3. **Relationships**
   - Links between concepts
   - Prerequisites & dependencies
   - Related content
   - Learning paths

4. **Progress Tracking**
   - Completion percentage
   - Review history
   - Mastery level
   - Next review date

5. **Content Processing**
   - Extraction & summarization
   - Tagging & categorization
   - Search & retrieval
   - Export & sharing

---

## 🏗️ Framework Architecture

### Base Entities

#### 1. KnowledgeNodeEntity

**Purpose:** Base for all knowledge items (notes, highlights, concepts)

```typescript
export interface KnowledgeNodeEntity extends Entity {
  type: 'knowledge.node';
  metadata: {
    // Content
    content_type: 'note' | 'highlight' | 'concept' | 'question' | 'other';
    body?: string;
    summary?: string;
    
    // Classification
    tags: string[];
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    
    // Status
    status: 'to-review' | 'active' | 'mastered' | 'archived';
    quality_rating?: number; // 1-5
    
    // Source
    source_title?: string;
    source_url?: string;
    source_author?: string;
    source_date?: string;
    
    // Relationships
    parent_node_uid?: string;
    related_node_uids?: string[];
    prerequisite_uids?: string[];
    
    // Learning
    times_reviewed: number;
    last_reviewed?: string;
    next_review?: string;
    mastery_level?: number; // 0-100
    
    // Extensions for specific modules
    [key: string]: any;
  };
}
```

#### 2. LearningResourceEntity

**Purpose:** Represent external resources (articles, books, videos, courses)

```typescript
export interface LearningResourceEntity extends Entity {
  type: 'knowledge.resource';
  metadata: {
    // Resource Details
    resource_type: 'article' | 'book' | 'video' | 'course' | 'podcast' | 'other';
    url?: string;
    author?: string;
    published_date?: string;
    
    // Progress
    status: 'to-read' | 'reading' | 'completed' | 'reference';
    progress_percent?: number;
    started_date?: string;
    completed_date?: string;
    
    // Classification
    topics: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimated_time_minutes?: number;
    actual_time_minutes?: number;
    
    // Evaluation
    rating?: number; // 1-5
    key_takeaways?: string[];
    notes?: string;
    
    // Metadata
    isbn?: string; // for books
    doi?: string; // for papers
    duration_minutes?: number; // for videos
  };
}
```

#### 3. LearningSessionEntity

**Purpose:** Track study/practice sessions

```typescript
export interface LearningSessionEntity extends Entity {
  type: 'knowledge.session';
  metadata: {
    // Session Info
    session_type: 'study' | 'practice' | 'review' | 'research' | 'other';
    date: string;
    start_time?: string;
    duration_minutes: number;
    
    // Content
    topic?: string;
    focus_areas: string[];
    resources_used?: string[]; // UIDs of resources
    nodes_reviewed?: string[]; // UIDs of nodes
    
    // Progress
    concepts_learned?: string[];
    questions_answered?: number;
    exercises_completed?: number;
    
    // Evaluation
    effectiveness_rating?: number; // 1-5
    energy_level?: 'low' | 'medium' | 'high';
    focus_quality?: 'poor' | 'fair' | 'good' | 'excellent';
    notes?: string;
  };
}
```

### Core Workflows

#### 1. KnowledgeGraphWorkflow

**Purpose:** Build and query knowledge relationships

```typescript
export class KnowledgeGraphWorkflow {
  /**
   * Find related nodes by topic
   */
  async findRelatedNodes(
    nodeUid: string,
    maxDepth: number = 2
  ): Promise<KnowledgeNodeEntity[]>;

  /**
   * Build learning path from prerequisites
   */
  async buildLearningPath(
    targetNodeUid: string
  ): Promise<KnowledgeNodeEntity[]>;

  /**
   * Identify knowledge gaps
   */
  async findKnowledgeGaps(
    topicTag: string
  ): Promise<{ missing: string[]; weak: KnowledgeNodeEntity[] }>;
}
```

#### 2. SpacedRepetitionWorkflow

**Purpose:** Implement spaced repetition scheduling

```typescript
export class SpacedRepetitionWorkflow {
  /**
   * Calculate next review date based on performance
   */
  calculateNextReview(
    node: KnowledgeNodeEntity,
    performance: 'forgot' | 'hard' | 'good' | 'easy'
  ): string;

  /**
   * Get nodes due for review
   */
  async getDueForReview(
    date: string = new Date().toISOString()
  ): Promise<KnowledgeNodeEntity[]>;

  /**
   * Update mastery level after review
   */
  updateMasteryLevel(
    node: KnowledgeNodeEntity,
    performance: 'forgot' | 'hard' | 'good' | 'easy'
  ): number;
}
```

#### 3. ProgressTrackingWorkflow

**Purpose:** Track learning progress over time

```typescript
export class ProgressTrackingWorkflow {
  /**
   * Calculate learning velocity
   */
  async calculateLearningVelocity(
    topicTag: string,
    periodDays: number = 30
  ): Promise<{
    nodes_mastered: number;
    time_invested_hours: number;
    average_quality: number;
  }>;

  /**
   * Get learning statistics
   */
  async getLearningStats(
    startDate: string,
    endDate: string
  ): Promise<{
    sessions: number;
    total_time_minutes: number;
    topics_covered: string[];
    mastery_distribution: Record<string, number>;
  }>;
}
```

### Utility Functions

```typescript
/**
 * Extract highlights from text
 */
export function extractHighlights(
  text: string,
  pattern: 'markdown' | 'brackets' | 'custom'
): string[];

/**
 * Calculate reading time
 */
export function estimateReadingTime(
  wordCount: number,
  wpm: number = 200
): number;

/**
 * Generate learning path
 */
export function generateLearningPath(
  nodes: KnowledgeNodeEntity[]
): KnowledgeNodeEntity[];

/**
 * Categorize by topic
 */
export function categorizByTopic(
  nodes: KnowledgeNodeEntity[]
): Record<string, KnowledgeNodeEntity[]>;

/**
 * Calculate mastery score
 */
export function calculateMasteryScore(
  timesReviewed: number,
  lastPerformance: string,
  daysSinceCreated: number
): number;
```

---

## 🎨 module Templates

### 1. Learning Tracker module

**Purpose:** Track skills, courses, and learning progress

**Entities:**
- `SkillEntity` (extends KnowledgeNodeEntity)
- `CourseEntity` (extends LearningResourceEntity)
- `LearningGoalEntity`

**Features:**
- Skill taxonomy (programming → TypeScript → generics)
- Progress tracking (0-100%)
- Learning goals with deadlines
- Time investment tracking

**Build Time:** 45 minutes

### 2. Research Manager module

**Purpose:** Organize research projects, citations, sources

**Entities:**
- `ResearchProjectEntity`
- `SourceEntity` (extends LearningResourceEntity)
- `CitationEntity`

**Features:**
- Research project management
- Citation formatting (APA, MLA, Chicago)
- Source organization
- Literature review synthesis

**Build Time:** 1 hour

### 3. Highlights & Notes module

**Purpose:** Capture insights from reading

**Entities:**
- `HighlightEntity` (extends KnowledgeNodeEntity)
- `AnnotationEntity`
- `InsightEntity`

**Features:**
- Import from Kindle, Readwise, web highlighters
- Automatic tagging and categorization
- Insight extraction
- Connection suggestions

**Build Time:** 45 minutes

---

## 📋 Implementation Checklist

### Phase 1: Framework Foundation (2 hours)

- [ ] Define base entities (KnowledgeNode, LearningResource, LearningSession)
- [ ] Implement KnowledgeGraphWorkflow
- [ ] Implement SpacedRepetitionWorkflow
- [ ] Implement ProgressTrackingWorkflow
- [ ] Create utility functions
- [ ] Set up TypeScript types
- [ ] Build and test framework

### Phase 2: First module (1 hour)

- [ ] Build Learning Tracker module
- [ ] Define Skill and Course entities
- [ ] Add learning progress tracking
- [ ] Create test script
- [ ] Validate 85%+ code reuse

### Phase 3: Documentation (30 mins)

- [ ] Document framework API
- [ ] Create module examples
- [ ] Add to main documentation
- [ ] Update roadmap

---

## 🎯 Success Metrics

### Code Reuse Target
- **85%+ framework code reuse** across 3+ modules

### Development Speed
- Framework: 2-3 hours
- First module: 45-60 minutes
- Additional modules: 30-45 minutes each

### Quality
- 100% TypeScript coverage
- All builds passing
- Test coverage for core workflows

---

## 🚀 Future modules (Enabled by This Framework)

Once the Knowledge Framework is built, these modules become **30-45 minute builds**:

1. **Learning Tracker** (skill progression)
2. **Research Manager** (academic research)
3. **Highlights & Notes** (reading insights)
4. **Swipefile** (inspiration collection)
5. **Study Sessions** (spaced repetition)
6. **Content Library** (read-later queue)
7. **Writing Projects** (drafts & publishing)

**Total Value:** 7 modules × 4 hours standalone = **28 hours saved**

---

## 💡 Key Design Decisions

### 1. Graph-Based Knowledge Structure
- **Decision:** Use graph relationships (parent, related, prerequisite)
- **Rationale:** Mirrors how knowledge actually connects
- **Impact:** Enables powerful queries and learning paths

### 2. Flexible Content Types
- **Decision:** Support multiple content types (note, highlight, concept, question)
- **Rationale:** Different modules need different content formats
- **Impact:** Framework serves wider variety of use cases

### 3. Built-in Spaced Repetition
- **Decision:** Include SR scheduling at framework level
- **Rationale:** Core to effective learning
- **Impact:** Every module gets free SR capability

### 4. Progress & Mastery Tracking
- **Decision:** Track review history and mastery levels
- **Rationale:** Essential for learning analytics
- **Impact:** modules can show learning progress out-of-box

### 5. Source Attribution
- **Decision:** Always track content source
- **Rationale:** Academic integrity and reference tracking
- **Impact:** Research modules get citation support free

---

## 🎓 Next Steps

### Immediate (Today)
1. Review this plan
2. Refine entity definitions if needed
3. Begin framework implementation

### This Week
1. Complete Knowledge Framework (2-3 hours)
2. Build Learning Tracker module (45 mins)
3. Build Highlights module (45 mins)
4. Document and test

### Next Week
1. Build 2-3 more knowledge modules
2. Gather community feedback
3. Iterate on framework design

---

## 📊 ROI Projection

### Time Investment
- Framework: 3 hours
- First 2 modules: 2 hours
- **Total: 5 hours**

### Value Created
- Framework enables: 7+ modules
- Standalone cost: 7 × 4 hours = 28 hours
- **Net savings: 23 hours (82% reduction)**

### Code Investment
- Framework: ~600 lines
- modules: ~150 lines each (7 modules) = ~1,050 lines
- **Total: ~1,650 lines**

vs Standalone: ~7,000 lines
**Savings: ~5,350 lines (76% reduction)**

---

## 🎉 Impact Statement

The **Knowledge & Learning Framework** is the **heart of the Second Brain concept**. Once built, it will:

✅ Enable the core "knowledge management" use cases  
✅ Validate the cluster architecture for abstract domains  
✅ Unlock 7+ high-value modules  
✅ Save 23+ hours of development time  
✅ Reduce 5,350+ lines of duplicate code  
✅ Provide foundation for community contributions  

**This is the highest-impact framework we can build next!**

---

**Status:** ✅ **READY TO BUILD**  
**Estimated Completion:** 3-4 hours  
**Next Action:** Begin implementation

---

*Built with ❤️ by the Party Mode Team*  
*Second Brain Foundation - Knowledge is power!*
