/**
 * Relationship Framework - Contact Entity
 * 
 * Factory functions for creating contact entities
 */

import type { SimpleEntity, ContactMetadata } from '../types';

export function createContactEntity(data: {
  uid: string;
  full_name: string;
  category: ContactMetadata['category'];
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  tags?: string[];
  relationship_strength?: ContactMetadata['relationship_strength'];
  notes?: string;
  [key: string]: any;
}): SimpleEntity {
  const now = new Date().toISOString();
  
  return {
    uid: data.uid,
    type: 'relationship.contact',
    title: data.full_name,
    metadata: {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      job_title: data.job_title,
      category: data.category,
      tags: data.tags || [],
      relationship_strength: data.relationship_strength || 'moderate',
      first_met_date: data.first_met_date || now,
      last_contact_date: data.last_contact_date,
      communication_frequency: data.communication_frequency,
      location: data.location,
      timezone: data.timezone,
      birthday: data.birthday,
      linkedin_url: data.linkedin_url,
      twitter_handle: data.twitter_handle,
      website: data.website,
      notes: data.notes,
      interests: data.interests || [],
      important_dates: data.important_dates || [],
      source: data.source,
      referral_from: data.referral_from,
      custom_fields: data.custom_fields || {},
    } as ContactMetadata,
    lifecycle: { state: 'permanent' as const },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: now,
    updated: now,
  };
}

export function createInteractionEntity(data: {
  uid: string;
  title: string;
  interaction_type: 'meeting' | 'call' | 'email' | 'message' | 'event' | 'other';
  date: string;
  contact_uids: string[];
  duration_minutes?: number;
  summary?: string;
  notes?: string;
  action_items?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  [key: string]: any;
}): SimpleEntity {
  const now = new Date().toISOString();
  
  return {
    uid: data.uid,
    type: 'relationship.interaction',
    title: data.title,
    metadata: {
      interaction_type: data.interaction_type,
      date: data.date,
      duration_minutes: data.duration_minutes,
      contact_uids: data.contact_uids,
      participants: data.participants || [],
      location: data.location,
      platform: data.platform,
      purpose: data.purpose,
      summary: data.summary,
      notes: data.notes,
      topics_discussed: data.topics_discussed || [],
      action_items: data.action_items || [],
      follow_up_required: data.follow_up_required || false,
      follow_up_date: data.follow_up_date,
      follow_up_notes: data.follow_up_notes,
      mood: data.mood || 'neutral',
      quality_rating: data.quality_rating,
      attachments: data.attachments || [],
      related_entities: data.related_entities || [],
    },
    lifecycle: { state: 'permanent' as const },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: now,
    updated: now,
  };
}

export function createNetworkGroupEntity(data: {
  uid: string;
  group_name: string;
  group_type: 'family' | 'team' | 'community' | 'project' | 'hobby' | 'other';
  member_uids: string[];
  description?: string;
  purpose?: string;
  [key: string]: any;
}): SimpleEntity {
  const now = new Date().toISOString();
  
  return {
    uid: data.uid,
    type: 'relationship.network_group',
    title: data.group_name,
    metadata: {
      group_name: data.group_name,
      description: data.description,
      group_type: data.group_type,
      member_uids: data.member_uids,
      leader_uid: data.leader_uid,
      created_date: now,
      last_activity_date: data.last_activity_date,
      meeting_frequency: data.meeting_frequency,
      purpose: data.purpose,
      tags: data.tags || [],
      notes: data.notes,
    },
    lifecycle: { state: 'permanent' as const },
    sensitivity: {
      level: 'personal',
      privacy: {
        cloud_ai_allowed: false,
        local_ai_allowed: true,
        export_allowed: true,
      },
    },
    created: now,
    updated: now,
  };
}
