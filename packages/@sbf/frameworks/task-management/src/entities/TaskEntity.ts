import { Entity } from '@sbf/shared';

// Task Status
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'blocked' | 'review' | 'done' | 'archived';

// Task Priority
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

// Task Complexity
export type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'epic';

export interface TaskMetadata {
  // Status & Priority
  status: TaskStatus;
  priority: TaskPriority;
  complexity?: TaskComplexity;
  
  // Description
  description?: string;
  acceptance_criteria?: string[];
  notes?: string;
  
  // Ownership & Assignment
  assignee_uid?: string;        // Person entity UID
  reporter_uid?: string;         // Person entity UID
  team_uids?: string[];          // Team UIDs
  
  // Relationships
  project_uid?: string;          // Parent project UID
  milestone_uid?: string;        // Milestone UID
  parent_task_uid?: string;      // Parent task for subtasks
  subtask_uids?: string[];       // Child tasks
  blocked_by_uids?: string[];    // Blocking task UIDs
  related_task_uids?: string[];  // Related tasks
  
  // Time tracking
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;           // ISO8601
  due_date?: string;             // ISO8601
  completed_date?: string;       // ISO8601
  
  // Categorization
  tags: string[];
  category?: string;
  labels?: string[];
  
  // Progress
  progress_percent?: number;     // 0-100
  
  // Metadata
  created_date: string;
  modified_date: string;
  
  // Extensions
  [key: string]: any;
}

export interface TaskEntity extends Entity {
  type: 'task.item';
  metadata: TaskMetadata;
}

export function createTask(
  title: string,
  priority: TaskPriority = 'medium',
  options: Partial<TaskMetadata> = {}
): TaskEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'task.item',
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
      status: 'backlog',
      priority,
      tags: [],
      created_date: now,
      modified_date: now,
      ...options
    }
  };
}

export function updateTaskStatus(
  task: TaskEntity,
  newStatus: TaskStatus
): TaskEntity {
  const now = new Date().toISOString();
  const updates: Partial<TaskMetadata> = {
    status: newStatus,
    modified_date: now
  };
  
  // Auto-set completion date
  if (newStatus === 'done' && !task.metadata.completed_date) {
    updates.completed_date = now;
    updates.progress_percent = 100;
  }
  
  return {
    ...task,
    updated: now,
    metadata: {
      ...task.metadata,
      ...updates
    }
  };
}

export function updateTaskProgress(
  task: TaskEntity,
  progressPercent: number
): TaskEntity {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  
  return {
    ...task,
    updated: new Date().toISOString(),
    metadata: {
      ...task.metadata,
      progress_percent: clamped,
      modified_date: new Date().toISOString()
    }
  };
}

export function assignTask(
  task: TaskEntity,
  assigneeUid: string
): TaskEntity {
  return {
    ...task,
    updated: new Date().toISOString(),
    metadata: {
      ...task.metadata,
      assignee_uid: assigneeUid,
      modified_date: new Date().toISOString()
    }
  };
}

export function addBlocker(
  task: TaskEntity,
  blockerTaskUid: string
): TaskEntity {
  const blockedBy = task.metadata.blocked_by_uids || [];
  
  if (!blockedBy.includes(blockerTaskUid)) {
    return {
      ...task,
      updated: new Date().toISOString(),
      metadata: {
        ...task.metadata,
        blocked_by_uids: [...blockedBy, blockerTaskUid],
        status: task.metadata.status === 'in-progress' ? 'blocked' : task.metadata.status,
        modified_date: new Date().toISOString()
      }
    };
  }
  
  return task;
}

export function removeBlocker(
  task: TaskEntity,
  blockerTaskUid: string
): TaskEntity {
  const blockedBy = task.metadata.blocked_by_uids || [];
  const updated = blockedBy.filter(uid => uid !== blockerTaskUid);
  
  return {
    ...task,
    updated: new Date().toISOString(),
    metadata: {
      ...task.metadata,
      blocked_by_uids: updated,
      status: updated.length === 0 && task.metadata.status === 'blocked' ? 'todo' : task.metadata.status,
      modified_date: new Date().toISOString()
    }
  };
}
