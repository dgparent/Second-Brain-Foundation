import { Entity } from '@sbf/shared';

export interface LearningGoalMetadata {
  goal_type: 'skill' | 'course' | 'project' | 'certification' | 'other';
  target_skill_uid?: string;
  target_course_uid?: string;
  
  status: 'planned' | 'in-progress' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  target_date?: string;
  started_date?: string;
  completed_date?: string;
  
  success_criteria?: string[];
  progress_percent?: number;
  
  notes?: string;
  obstacles?: string[];
  
  created_date: string;
  modified_date: string;
}

export interface LearningGoalEntity extends Entity {
  type: 'learning.goal';
  metadata: LearningGoalMetadata;
}

export function createLearningGoal(
  title: string,
  goalType: 'skill' | 'course' | 'project' | 'certification' | 'other',
  options: Partial<LearningGoalMetadata> = {}
): LearningGoalEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'learning.goal',
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
      goal_type: goalType,
      status: 'planned',
      priority: 'medium',
      created_date: now,
      modified_date: now,
      progress_percent: 0,
      ...options
    }
  };
}

export function updateGoalProgress(
  goal: LearningGoalEntity,
  progressPercent: number
): LearningGoalEntity {
  const now = new Date().toISOString();
  const newStatus = progressPercent >= 100 ? 'completed' : 'in-progress';
  
  return {
    ...goal,
    metadata: {
      ...goal.metadata,
      progress_percent: Math.max(0, Math.min(100, progressPercent)),
      status: newStatus,
      modified_date: now,
      ...(newStatus === 'in-progress' && !goal.metadata.started_date ? { started_date: now } : {}),
      ...(newStatus === 'completed' && !goal.metadata.completed_date ? { completed_date: now } : {})
    }
  };
}
