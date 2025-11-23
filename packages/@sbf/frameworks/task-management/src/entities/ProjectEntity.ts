import { Entity } from '@sbf/shared';

// Project Status
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived' | 'cancelled';

// Project Phase
export type ProjectPhase = 'initiation' | 'planning' | 'execution' | 'monitoring' | 'closure';

export interface ProjectMetadata {
  // Status & Phase
  status: ProjectStatus;
  phase?: ProjectPhase;
  health?: 'green' | 'yellow' | 'red';  // Project health indicator
  
  // Description
  description?: string;
  goals?: string[];
  success_criteria?: string[];
  
  // Ownership
  owner_uid?: string;            // Person entity UID
  team_uids?: string[];          // Team member UIDs
  stakeholder_uids?: string[];   // Stakeholder UIDs
  
  // Relationships
  parent_project_uid?: string;   // Parent project for sub-projects
  milestone_uids?: string[];     // Associated milestones
  task_uids?: string[];          // Associated tasks
  
  // Time tracking
  start_date?: string;           // ISO8601
  target_end_date?: string;      // ISO8601
  actual_end_date?: string;      // ISO8601
  
  // Budget (optional)
  budget_hours?: number;
  spent_hours?: number;
  budget_currency?: string;      // e.g., 'USD'
  budget_amount?: number;
  spent_amount?: number;
  
  // Progress
  progress_percent?: number;     // 0-100
  
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

export interface ProjectEntity extends Entity {
  type: 'project.item';
  metadata: ProjectMetadata;
}

export function createProject(
  title: string,
  options: Partial<ProjectMetadata> = {}
): ProjectEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'project.item',
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
      status: 'planning',
      phase: 'initiation',
      health: 'green',
      tags: [],
      created_date: now,
      modified_date: now,
      ...options
    }
  };
}

export function updateProjectStatus(
  project: ProjectEntity,
  newStatus: ProjectStatus
): ProjectEntity {
  const now = new Date().toISOString();
  const updates: Partial<ProjectMetadata> = {
    status: newStatus,
    modified_date: now
  };
  
  // Auto-set completion date
  if (newStatus === 'completed' && !project.metadata.actual_end_date) {
    updates.actual_end_date = now;
    updates.progress_percent = 100;
  }
  
  return {
    ...project,
    updated: now,
    metadata: {
      ...project.metadata,
      ...updates
    }
  };
}

export function updateProjectHealth(
  project: ProjectEntity,
  health: 'green' | 'yellow' | 'red'
): ProjectEntity {
  return {
    ...project,
    updated: new Date().toISOString(),
    metadata: {
      ...project.metadata,
      health,
      modified_date: new Date().toISOString()
    }
  };
}

export function updateProjectProgress(
  project: ProjectEntity,
  progressPercent: number
): ProjectEntity {
  const clamped = Math.max(0, Math.min(100, progressPercent));
  
  return {
    ...project,
    updated: new Date().toISOString(),
    metadata: {
      ...project.metadata,
      progress_percent: clamped,
      modified_date: new Date().toISOString()
    }
  };
}

export function addProjectMilestone(
  project: ProjectEntity,
  milestoneUid: string
): ProjectEntity {
  const milestones = project.metadata.milestone_uids || [];
  
  if (!milestones.includes(milestoneUid)) {
    return {
      ...project,
      updated: new Date().toISOString(),
      metadata: {
        ...project.metadata,
        milestone_uids: [...milestones, milestoneUid],
        modified_date: new Date().toISOString()
      }
    };
  }
  
  return project;
}

export function addProjectTask(
  project: ProjectEntity,
  taskUid: string
): ProjectEntity {
  const tasks = project.metadata.task_uids || [];
  
  if (!tasks.includes(taskUid)) {
    return {
      ...project,
      updated: new Date().toISOString(),
      metadata: {
        ...project.metadata,
        task_uids: [...tasks, taskUid],
        modified_date: new Date().toISOString()
      }
    };
  }
  
  return project;
}
