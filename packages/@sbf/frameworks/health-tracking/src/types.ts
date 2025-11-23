/**
 * Shared types for health tracking framework
 */

export type HealthPrivacyLevel = 'personal' | 'confidential';

export type MetricType = 'weight' | 'heart_rate' | 'hrv' | 'blood_pressure' | 'steps' | 'sleep_hours' | string;

export type BodyRegion = 'head' | 'neck' | 'chest' | 'back' | 'abdomen' | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'full_body' | string;

export type SeverityLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
