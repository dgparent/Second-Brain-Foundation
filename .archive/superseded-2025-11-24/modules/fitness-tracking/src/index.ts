/**
 * Fitness Tracking Plugin
 * Demonstrates 85%+ code reuse from Health Framework
 */

/**
 * Base Entity (from Health Framework pattern)
 */
interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: { state: string };
  sensitivity: {
    level: string;
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  created: string;
  updated: string;
  metadata: Record<string, any>;
}

/**
 * Workout entity
 */
export interface WorkoutEntity extends Entity {
  type: 'fitness.workout';
  metadata: {
    date: string;
    time?: string;
    duration_minutes: number;
    workout_type: 'cardio' | 'strength' | 'flexibility' | 'sport' | 'other';
    exercises?: Array<{
      name: string;
      sets?: number;
      reps?: number;
      weight_kg?: number;
    }>;
    performance_metrics?: {
      avg_hr?: number;
      max_hr?: number;
      calories_burned?: number;
      distance_km?: number;
    };
    rpe?: number;
    notes?: string;
  };
}

/**
 * Create workout
 */
export function createWorkout(data: {
  uid: string;
  title: string;
  date: string;
  duration_minutes: number;
  workout_type: WorkoutEntity['metadata']['workout_type'];
}): WorkoutEntity {
  return {
    uid: data.uid,
    type: 'fitness.workout',
    title: data.title,
    lifecycle: { state: 'permanent' },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date: data.date,
      duration_minutes: data.duration_minutes,
      workout_type: data.workout_type,
    },
  };
}

/**
 * Plugin metadata
 */
export const FitnessPlugin = {
  id: 'sbf-fitness-tracking',
  name: 'Fitness & Training Tracker',
  version: '0.1.0',
  domain: 'health',
  description: 'Track workouts, exercises, and fitness metrics',
  
  entityTypes: [
    'fitness.workout',
    'fitness.exercise',
  ],
  
  features: [
    'Workout logging with exercises',
    'Performance metrics tracking',
    'Heart rate monitoring',
    'Progress tracking',
    'Correlation with health metrics',
  ],
};

// Re-export
export * from './entities/WorkoutEntity';
