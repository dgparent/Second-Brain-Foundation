import { Entity } from '@sbf/shared';

export type ResourceType = 'article' | 'book' | 'video' | 'course' | 'podcast' | 'paper' | 'tutorial' | 'documentation' | 'other';
export type ResourceStatus = 'to-read' | 'reading' | 'completed' | 'reference' | 'paused' | 'abandoned';

export interface LearningResourceMetadata {
  // Resource Details
  resource_type: ResourceType;
  url?: string;
  author?: string;
  published_date?: string;
  
  // Progress
  status: ResourceStatus;
  progress_percent?: number;
  started_date?: string;
  completed_date?: string;
  paused_date?: string;
  
  // Classification
  topics: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_time_minutes?: number;
  actual_time_minutes?: number;
  
  // Evaluation
  rating?: number;
  key_takeaways?: string[];
  notes?: string;
  would_recommend?: boolean;
  
  // Specific Metadata
  isbn?: string;
  doi?: string;
  duration_minutes?: number;
  page_count?: number;
  current_page?: number;
  
  // Relationships
  related_resources?: string[];
  extracted_nodes?: string[];
  
  // Metadata
  created_date: string;
  modified_date: string;
  
  // Extensions
  [key: string]: any;
}

export interface LearningResourceEntity extends Entity {
  type: 'knowledge.resource';
  metadata: LearningResourceMetadata;
}

export function createLearningResource(
  title: string,
  resourceType: ResourceType,
  options: Partial<LearningResourceMetadata> = {}
): LearningResourceEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `lr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'knowledge.resource',
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
      resource_type: resourceType,
      status: 'to-read',
      topics: [],
      created_date: now,
      modified_date: now,
      ...options
    }
  };
}

export function updateResourceProgress(
  resource: LearningResourceEntity,
  progressPercent: number,
  status?: ResourceStatus
): LearningResourceEntity {
  const now = new Date().toISOString();
  const newStatus = status || (progressPercent >= 100 ? 'completed' : 'reading');
  
  return {
    ...resource,
    metadata: {
      ...resource.metadata,
      progress_percent: Math.max(0, Math.min(100, progressPercent)),
      status: newStatus,
      modified_date: now,
      ...(newStatus === 'reading' && !resource.metadata.started_date ? { started_date: now } : {}),
      ...(newStatus === 'completed' && !resource.metadata.completed_date ? { completed_date: now } : {})
    }
  };
}

export function rateResource(
  resource: LearningResourceEntity,
  rating: number,
  takeaways?: string[]
): LearningResourceEntity {
  return {
    ...resource,
    metadata: {
      ...resource.metadata,
      rating: Math.max(1, Math.min(5, rating)),
      key_takeaways: takeaways || resource.metadata.key_takeaways,
      modified_date: new Date().toISOString()
    }
  };
}
