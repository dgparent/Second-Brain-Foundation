import { Entity, createHealthPrivacy } from './HealthEventEntity';

/**
 * Health metric metadata (HRV, weight, blood pressure, etc.)
 */
export interface HealthMetricMetadata {
  metric_type: string;            // 'weight', 'hr', 'hrv', 'blood_pressure', etc.
  value: number | string;         // Numeric value or structured (e.g., "120/80")
  unit: string;                   // 'kg', 'bpm', 'ms', 'mmHg', etc.
  date: string;
  time?: string;
  source_system?: string;         // 'apple_health', 'google_fit', 'manual', etc.
  measurement_context?: Record<string, any>;
  linked_events?: string[];       // Related health events
}

/**
 * Health metric entity
 */
export interface HealthMetricEntity extends Entity {
  type: 'health.metric';
  metadata: HealthMetricMetadata;
}

/**
 * Helper function to create a health metric
 */
export function createHealthMetric(data: {
  uid: string;
  metric_type: string;
  value: number | string;
  unit: string;
  date?: string;
  time?: string;
  source_system?: string;
}): HealthMetricEntity {
  const date = data.date || new Date().toISOString().split('T')[0];
  
  return {
    uid: data.uid,
    type: 'health.metric',
    title: `${data.metric_type}: ${data.value}${data.unit}`,
    lifecycle: { state: 'permanent' },
    sensitivity: createHealthPrivacy('confidential'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      metric_type: data.metric_type,
      value: data.value,
      unit: data.unit,
      date,
      time: data.time,
      source_system: data.source_system,
    },
  };
}

/**
 * Common metric types
 */
export const MetricTypes = {
  // Body measurements
  WEIGHT: 'weight',
  HEIGHT: 'height',
  BODY_FAT: 'body_fat_percentage',
  BMI: 'bmi',
  
  // Cardiovascular
  HEART_RATE: 'heart_rate',
  HRV: 'heart_rate_variability',
  BLOOD_PRESSURE: 'blood_pressure',
  RESTING_HR: 'resting_heart_rate',
  
  // Activity
  STEPS: 'steps',
  DISTANCE: 'distance',
  CALORIES: 'calories_burned',
  ACTIVE_MINUTES: 'active_minutes',
  
  // Sleep
  SLEEP_HOURS: 'sleep_hours',
  SLEEP_QUALITY: 'sleep_quality',
  
  // Nutrition
  CALORIES_CONSUMED: 'calories_consumed',
  WATER_INTAKE: 'water_intake',
  PROTEIN: 'protein_grams',
  CARBS: 'carbohydrates_grams',
  FAT: 'fat_grams',
  
  // Other
  TEMPERATURE: 'body_temperature',
  GLUCOSE: 'blood_glucose',
  OXYGEN_SATURATION: 'oxygen_saturation',
} as const;
