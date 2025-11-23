import { Entity } from '@sbf/shared';

// Milestone Status
export type MilestoneStatus = 'planned' | 'in-progress' | 'at-risk' | 'achieved' | 'missed' | 'cancelled';

export interface MilestoneMetadata {
  // Status
  status: MilestoneStatus;
  
  // Description
  description?: string;
  success_criteria?: string[];
  deliverables?: string[];
  
  // Relationships
  project_uid?: string;          // Parent project UID
  task_uids?: string[];          // Associated tasks
  dependencies?: string[];       // Other milestone UIDs this depends on
  
  // Time tracking
  target_date: string;           // ISO8601 - when milestone should be achieved
  achieved_date?: string;        // ISO8601 - when actually achieved
  
  // Progress
  progress_percent?: number;     // 0-100
  completion_count?: number;     // Number of completed tasks/items
  total_count?: number;          // Total tasks/items
  
  // Owner
  owner_uid?: string;            // Person entity UID responsible
  
  // Categorization
  tags: string[];
  category?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  
  // Metadata
  created_date: string;
  modified_date: string;
  
  // Extensions
  [key: string]: any;
}

export interface MilestoneEntity extends Entity {
  type: 'milestone.item';
  metadata: MilestoneMetadata;
}

export function createMilestone(
  title: string,
  targetDate: string,
  options: Partial<MilestoneMetadata> = {}
): MilestoneEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'milestone.item',
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
      status: 'planned',
      target_date: targetDate,
      tags: [],
      created_date: now,
      modified_date: now,
      ...options
    }
  };
}

export function updateMilestoneStatus(
  milestone: MilestoneEntity,
  newStatus: MilestoneStatus
): MilestoneEntity {
  const now = new Date().toISOString();
  const updates: Partial<MilestoneMetadata> = {
    status: newStatus,
    modified_date: now
  };
  
  // Auto-set achievement date
  if (newStatus === 'achieved' && !milestone.metadata.achieved_date) {
    updates.achieved_date = now;
    updates.progress_percent = 100;
  }
  
  return {
    ...milestone,
    updated: now,
    metadata: {
      ...milestone.metadata,
      ...updates
    }
  };
}

export function updateMilestoneProgress(
  milestone: MilestoneEntity,
  completedCount: number,
  totalCount: number
): MilestoneEntity {
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  return {
    ...milestone,
    updated: new Date().toISOString(),
    metadata: {
      ...milestone.metadata,
      completion_count: completedCount,
      total_count: totalCount,
      progress_percent: progressPercent,
      modified_date: new Date().toISOString()
    }
  };
}

export function checkMilestoneAtRisk(
  milestone: MilestoneEntity
): boolean {
  if (milestone.metadata.status === 'achieved' || milestone.metadata.status === 'missed') {
    return false;
  }
  
  const targetDate = new Date(milestone.metadata.target_date);
  const now = new Date();
  const daysUntilDue = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Consider at-risk if:
  // 1. Due in less than 7 days and less than 50% complete
  // 2. Overdue
  const progress = milestone.metadata.progress_percent || 0;
  
  if (daysUntilDue < 0) {
    return true; // Overdue
  }
  
  if (daysUntilDue <= 7 && progress < 50) {
    return true; // Due soon but not enough progress
  }
  
  return false;
}

export function addMilestoneTask(
  milestone: MilestoneEntity,
  taskUid: string
): MilestoneEntity {
  const tasks = milestone.metadata.task_uids || [];
  
  if (!tasks.includes(taskUid)) {
    return {
      ...milestone,
      updated: new Date().toISOString(),
      metadata: {
        ...milestone.metadata,
        task_uids: [...tasks, taskUid],
        modified_date: new Date().toISOString()
      }
    };
  }
  
  return milestone;
}
