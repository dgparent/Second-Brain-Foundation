/**
 * Base Entity interface for health framework
 */
export interface Entity {
  uid: string;
  type: string;
  title: string;
  lifecycle: {
    state: 'capture' | 'transitional' | 'permanent' | 'archived';
  };
  sensitivity: {
    level: 'public' | 'personal' | 'confidential' | 'secret';
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
 * Base metadata for all health events (workouts, meals, symptoms, etc.)
 */
export interface HealthEventMetadata {
  date: string;                    // ISO date (YYYY-MM-DD)
  time?: string;                   // HH:MM format
  duration_minutes?: number;
  severity?: number;               // 0-10 scale for symptoms
  body_region?: string;            // Affected body part
  context?: Record<string, any>;
  linked_metrics?: string[];       // UIDs of related metrics
  source_system?: string;          // e.g., 'apple_health', 'manual'
  notes?: string;
}

/**
 * Base entity for all health events
 * Extend this for specific event types (workouts, meals, symptoms, medications)
 */
export interface HealthEventEntity extends Entity {
  type: string;                    // Subclasses define specific type
  metadata: HealthEventMetadata & Record<string, any>;
}

/**
 * Helper function to create privacy settings for health data
 */
export function createHealthPrivacy(level: 'personal' | 'confidential' = 'confidential') {
  return {
    level,
    privacy: {
      cloud_ai_allowed: false,      // Health data stays local
      local_ai_allowed: true,        // Can use local AI
      export_allowed: true,          // Can export for healthcare providers
    },
  };
}

/**
 * Helper function to create a base health event
 */
export function createHealthEvent(data: {
  uid: string;
  type: string;
  title: string;
  date: string;
  time?: string;
  duration_minutes?: number;
  severity?: number;
  body_region?: string;
  notes?: string;
}): HealthEventEntity {
  return {
    uid: data.uid,
    type: data.type,
    title: data.title,
    lifecycle: { state: 'permanent' as const },
    sensitivity: createHealthPrivacy('confidential'),
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      date: data.date,
      time: data.time,
      duration_minutes: data.duration_minutes,
      severity: data.severity,
      body_region: data.body_region,
      notes: data.notes,
    },
  };
}
