# Knowledge Tracking Framework

**Framework for building knowledge management and learning plugins**

## Overview

The Knowledge Tracking Framework provides reusable entities, workflows, and utilities for building plugins that help users manage their knowledge and learning.

## Base Entities

### KnowledgeNodeEntity
Represents individual knowledge items (notes, highlights, concepts, questions).

**Features:**
- Content types: note, highlight, concept, question, insight, definition, example
- Graph relationships (parent, children, related, prerequisites)
- Spaced repetition tracking
- Mastery level progression
- Source attribution

### LearningResourceEntity
Represents external learning materials (articles, books, videos, courses).

**Features:**
- Resource types: article, book, video, course, podcast, paper
- Progress tracking (to-read → reading → completed)
- Time estimation and actual time
- Ratings and key takeaways

### LearningSessionEntity
Tracks learning sessions (study, practice, review, research).

**Features:**
- Session types: study, practice, review, research, reading
- Time tracking
- Effectiveness ratings
- Energy and focus quality

## Core Workflows

### KnowledgeGraphWorkflow
Build and query knowledge relationships.

- Find related nodes
- Build learning paths from prerequisites
- Identify knowledge gaps
- Get node statistics

### SpacedRepetitionWorkflow
Implement spaced repetition using SM-2 algorithm.

- Calculate next review dates
- Get nodes due for review
- Update mastery levels based on performance
- Track review statistics

### ProgressTrackingWorkflow
Track learning progress over time.

- Calculate learning velocity
- Get learning statistics by date range
- Resource completion stats
- Mastery distribution

## Helper Functions

- `extractHighlights()` - Extract highlights from text
- `estimateReadingTime()` - Calculate reading time
- `generateLearningPath()` - Topological sort for learning paths
- `categorizeByTopic()` - Group nodes by tags/topics
- `calculateMasteryScore()` - Compute mastery score
- `searchNodes()` - Full-text search
- `formatNodeSummary()` - Pretty print nodes

## Usage Example

```typescript
import {
  createKnowledgeNode,
  KnowledgeGraphWorkflow,
  SpacedRepetitionWorkflow
} from '@sbf/frameworks-knowledge-tracking';

// Create a knowledge node
const node = createKnowledgeNode(
  'TypeScript Generics',
  'concept',
  {
    tags: ['typescript', 'programming'],
    difficulty: 'intermediate',
    body: 'Generics provide a way to make components work with any data type...'
  }
);

// Use workflows
const graphWorkflow = new KnowledgeGraphWorkflow();
const srWorkflow = new SpacedRepetitionWorkflow();

// Build learning path
const path = await graphWorkflow.buildLearningPath(nodes, node.uid);

// Get due for review
const dueNodes = srWorkflow.getDueForReview(nodes);
```

## Plugins Built on This Framework

- **Learning Tracker** - Track skills and courses
- **Highlights & Notes** - Capture reading insights
- **Research Manager** - Organize research projects
- **Swipefile** - Collect inspiration and examples
- **Study Sessions** - Spaced repetition practice

## Installation

```bash
npm install @sbf/frameworks-knowledge-tracking
```

## License

MIT
