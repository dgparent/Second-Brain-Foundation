/**
 * VA-specific Entity Types
 * Domain: Virtual Assistant / Client Management
 */

import { Entity } from '@sbf/shared';

/**
 * VA Client Entity
 * Represents a client in the VA's portfolio
 */
export interface VAClientEntity extends Entity {
  type: 'va-client';
  metadata: {
    email?: string;
    phone?: string;
    company?: string;
    timezone?: string;
    preferred_contact?: 'email' | 'phone' | 'slack';
    active_projects?: string[]; // Array of project UIDs
    billing_rate?: number;
    contract_start?: string; // ISO8601
    contract_end?: string; // ISO8601
    notes?: string;
  };
}

/**
 * VA Task Entity
 * Represents a task assigned to the VA
 */
export interface VATaskEntity extends Entity {
  type: 'va-task';
  metadata: {
    client_uid?: string; // Link to client
    due_date?: string; // ISO8601
    estimated_hours?: number;
    actual_hours?: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in-progress' | 'blocked' | 'done' | 'cancelled';
    tags?: string[];
    source?: 'email' | 'chat' | 'meeting' | 'manual';
    extracted_from?: string; // Original text if AI-extracted
    confidence?: number; // AI extraction confidence
    subtasks?: Array<{
      title: string;
      done: boolean;
    }>;
  };
}

/**
 * VA Meeting Entity
 * Represents a scheduled meeting
 */
export interface VAMeetingEntity extends Entity {
  type: 'va-meeting';
  metadata: {
    client_uid?: string; // Link to client
    scheduled_at: string; // ISO8601
    duration_minutes: number;
    meeting_type: 'intro' | 'check-in' | 'planning' | 'review' | 'other';
    location?: string; // URL for virtual, address for physical
    attendees?: string[]; // Array of person UIDs
    agenda?: string;
    notes?: string;
    recording_url?: string;
    transcript?: string;
    action_items?: string[]; // Array of task UIDs created from meeting
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  };
}

/**
 * Helper function to create a VA Client entity
 */
export function createVAClient(data: {
  uid: string;
  title: string;
  email?: string;
  phone?: string;
  company?: string;
}): VAClientEntity {
  return {
    uid: data.uid,
    type: 'va-client',
    title: data.title,
    lifecycle: {
      state: 'permanent',
    },
    sensitivity: {
      level: 'confidential',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: false,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      email: data.email,
      phone: data.phone,
      company: data.company,
    },
  };
}

/**
 * Helper function to create a VA Task entity
 */
export function createVATask(data: {
  uid: string;
  title: string;
  client_uid?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  source?: 'email' | 'chat' | 'meeting' | 'manual';
  extracted_from?: string;
  confidence?: number;
}): VATaskEntity {
  return {
    uid: data.uid,
    type: 'va-task',
    title: data.title,
    lifecycle: {
      state: 'capture',
      review_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48h review
    },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: true,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      client_uid: data.client_uid,
      priority: data.priority || 'medium',
      status: 'todo',
      due_date: data.due_date,
      source: data.source || 'manual',
      extracted_from: data.extracted_from,
      confidence: data.confidence,
    },
  };
}

/**
 * Helper function to create a VA Meeting entity
 */
export function createVAMeeting(data: {
  uid: string;
  title: string;
  client_uid?: string;
  scheduled_at: string;
  duration_minutes?: number;
  meeting_type?: 'intro' | 'check-in' | 'planning' | 'review' | 'other';
}): VAMeetingEntity {
  return {
    uid: data.uid,
    type: 'va-meeting',
    title: data.title,
    lifecycle: {
      state: 'transitional',
    },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: true,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    metadata: {
      client_uid: data.client_uid,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes || 30,
      meeting_type: data.meeting_type || 'check-in',
      status: 'scheduled',
    },
  };
}
