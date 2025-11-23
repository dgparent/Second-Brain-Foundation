import { Entity } from '@sbf/shared';

export type SessionType = 'study' | 'practice' | 'review' | 'research' | 'reading' | 'watching' | 'project' | 'other';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FocusQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface LearningSessionMetadata {
  // Session Info
  session_type: SessionType;
  date: string;
  start_time?: string;
  end_time?: string;
  duration_minutes: number;
  
  // Content
  topic?: string;
  focus_areas: string[];
  resources_used?: string[];
  nodes_reviewed?: string[];
  
  // Progress
  concepts_learned?: string[];
  questions_answered?: number;
  exercises_completed?: number;
  pages_read?: number;
  
  // Evaluation
  effectiveness_rating?: number;
  energy_level?: EnergyLevel;
  focus_quality?: FocusQuality;
  notes?: string;
  
  // Goals
  planned_goals?: string[];
  achieved_goals?: string[];
  
  // Metadata
  created_date: string;
  
  // Extensions
  [key: string]: any;
}

export interface LearningSessionEntity extends Entity {
  type: 'knowledge.session';
  metadata: LearningSessionMetadata;
}

export function createLearningSession(
  title: string,
  sessionType: SessionType,
  durationMinutes: number,
  options: Partial<LearningSessionMetadata> = {}
): LearningSessionEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `ls-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'knowledge.session',
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
      session_type: sessionType,
      date: now.split('T')[0],
      duration_minutes: durationMinutes,
      focus_areas: [],
      created_date: now,
      ...options
    }
  };
}

export function evaluateSession(
  session: LearningSessionEntity,
  rating: number,
  focusQuality: FocusQuality,
  energyLevel: EnergyLevel
): LearningSessionEntity {
  return {
    ...session,
    metadata: {
      ...session.metadata,
      effectiveness_rating: Math.max(1, Math.min(5, rating)),
      focus_quality: focusQuality,
      energy_level: energyLevel
    }
  };
}
