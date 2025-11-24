import { KnowledgeNodeEntity, KnowledgeNodeMetadata } from '@sbf/frameworks-knowledge-tracking';

export interface SkillMetadata extends KnowledgeNodeMetadata {
  skill_type: 'technical' | 'soft' | 'language' | 'creative' | 'physical' | 'other';
  proficiency_level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  hours_practiced?: number;
  certificates?: string[];
  projects_completed?: number;
  target_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  target_date?: string;
}

export interface SkillEntity extends KnowledgeNodeEntity {
  type: 'learning.skill';
  metadata: SkillMetadata;
}

export function createSkill(
  name: string,
  skillType: 'technical' | 'soft' | 'language' | 'creative' | 'physical' | 'other',
  options: Partial<SkillMetadata> = {}
): SkillEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'learning.skill',
    title: name,
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
      content_type: 'concept',
      skill_type: skillType,
      proficiency_level: 'novice',
      tags: [],
      status: 'to-review',
      times_reviewed: 0,
      created_date: now,
      modified_date: now,
      ease_factor: 2.5,
      interval_days: 1,
      consecutive_correct: 0,
      mastery_level: 0,
      hours_practiced: 0,
      projects_completed: 0,
      ...options
    }
  };
}

export function updateSkillProficiency(
  skill: SkillEntity,
  newLevel: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert'
): SkillEntity {
  const levelToMastery = {
    novice: 10,
    beginner: 30,
    intermediate: 50,
    advanced: 70,
    expert: 90
  };
  
  return {
    ...skill,
    metadata: {
      ...skill.metadata,
      proficiency_level: newLevel,
      mastery_level: levelToMastery[newLevel],
      modified_date: new Date().toISOString()
    }
  };
}

export function logPracticeTime(
  skill: SkillEntity,
  hours: number
): SkillEntity {
  const currentHours = skill.metadata.hours_practiced || 0;
  const newHours = currentHours + hours;
  
  // Update mastery based on practice (10,000 hour rule approximation)
  const masteryBonus = Math.min(Math.floor(newHours / 100) * 5, 30);
  
  return {
    ...skill,
    metadata: {
      ...skill.metadata,
      hours_practiced: newHours,
      mastery_level: Math.min(100, (skill.metadata.mastery_level || 0) + masteryBonus),
      modified_date: new Date().toISOString()
    }
  };
}
