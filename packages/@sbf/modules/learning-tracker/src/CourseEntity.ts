import { LearningResourceEntity, LearningResourceMetadata } from '@sbf/knowledge-tracking';

export interface CourseMetadata extends LearningResourceMetadata {
  platform?: string;
  instructor?: string;
  total_lessons?: number;
  completed_lessons?: number;
  certificate_available?: boolean;
  certificate_earned?: boolean;
  cost?: number;
  currency?: string;
}

export interface CourseEntity extends LearningResourceEntity {
  type: 'learning.course';
  metadata: CourseMetadata;
}

export function createCourse(
  title: string,
  platform: string,
  options: Partial<CourseMetadata> = {}
): CourseEntity {
  const now = new Date().toISOString();
  
  return {
    uid: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'learning.course',
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
      resource_type: 'course',
      platform,
      status: 'to-read',
      topics: [],
      created_date: now,
      modified_date: now,
      completed_lessons: 0,
      ...options
    }
  };
}

export function updateCourseProgress(
  course: CourseEntity,
  lessonsCompleted: number
): CourseEntity {
  const totalLessons = course.metadata.total_lessons || 1;
  const progress = Math.round((lessonsCompleted / totalLessons) * 100);
  const status = progress >= 100 ? 'completed' : 'reading';
  const now = new Date().toISOString();
  
  return {
    ...course,
    metadata: {
      ...course.metadata,
      completed_lessons: lessonsCompleted,
      progress_percent: progress,
      status,
      modified_date: now,
      ...(status === 'reading' && !course.metadata.started_date ? { started_date: now } : {}),
      ...(status === 'completed' && !course.metadata.completed_date ? { 
        completed_date: now,
        certificate_earned: course.metadata.certificate_available 
      } : {})
    }
  };
}
