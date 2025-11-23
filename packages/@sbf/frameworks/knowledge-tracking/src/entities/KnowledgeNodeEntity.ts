import { Entity } from '@sbf/shared';

export type ContentType = 'note' | 'highlight' | 'concept' | 'question' | 'insight' | 'definition' | 'example' | 'other';
export type KnowledgeStatus = 'to-review' | 'active' | 'mastered' | 'archived';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface KnowledgeNodeMetadata {
  // Content
  content_type: ContentType;
  body?: string;
  summary?: string;
  
  // Classification
  tags: string[];
  category?: string;
  difficulty?: DifficultyLevel;
  
  // Status
  status: KnowledgeStatus;
  quality_rating?: number;
  importance?: number;
  
  // Source Attribution
  source_title?: string;
  source_url?: string;
  source_author?: string;
  source_date?: string;
  page_number?: string;
  
  // Graph Relationships
  parent_node_uid?: string;
  related_node_uids?: string[];
  prerequisite_uids?: string[];
  child_node_uids?: string[];
  
  // Learning Progress
  times_reviewed: number;
  last_reviewed?: string;
  next_review?: string;
  mastery_level?: number;
  
  // Spaced Repetition
  ease_factor?: number;
  interval_days?: number;
  consecutive_correct?: number;
  
  // Metadata
  created_date: string;
  modified_date: string;
  
  // Extensions
  [key: string]: any;
}

export interface KnowledgeNodeEntity extends Entity {
  type: 'knowledge.node';
  metadata: KnowledgeNodeMetadata;
}

export function createKnowledgeNode(
  title: string,
  contentType: ContentType,
  options: Partial<KnowledgeNodeMetadata> = {}
): KnowledgeNodeEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `kn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'knowledge.node',
    title,
    created: now,
    updated: now,
    lifecycle: {
      state: 'capture'
    },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: true,
        local_ai_allowed: true,
        export_allowed: true
      }
    },
    metadata: {
      content_type: contentType,
      tags: [],
      status: 'to-review',
      times_reviewed: 0,
      created_date: now,
      modified_date: now,
      ease_factor: 2.5,
      interval_days: 1,
      consecutive_correct: 0,
      mastery_level: 0,
      ...options
    }
  };
}

export function updateNodeMastery(
  node: KnowledgeNodeEntity,
  newMastery: number
): KnowledgeNodeEntity {
  return {
    ...node,
    metadata: {
      ...node.metadata,
      mastery_level: Math.max(0, Math.min(100, newMastery)),
      modified_date: new Date().toISOString()
    }
  };
}

export function markNodeReviewed(
  node: KnowledgeNodeEntity,
  nextReviewDate?: string
): KnowledgeNodeEntity {
  return {
    ...node,
    metadata: {
      ...node.metadata,
      times_reviewed: node.metadata.times_reviewed + 1,
      last_reviewed: new Date().toISOString(),
      next_review: nextReviewDate,
      modified_date: new Date().toISOString()
    }
  };
}
