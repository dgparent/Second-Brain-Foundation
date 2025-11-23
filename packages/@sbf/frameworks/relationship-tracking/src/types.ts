/**
 * Relationship Tracking Framework - Types
 * 
 * Core types for managing contacts, relationships, and interactions
 */

export interface SimpleEntity {
  uid: string;
  type: string;
  title: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type RelationshipStrength = 'weak' | 'moderate' | 'strong' | 'vital';
export type InteractionType = 'meeting' | 'call' | 'email' | 'message' | 'event' | 'other';
export type ContactCategory = 'family' | 'friend' | 'colleague' | 'client' | 'acquaintance' | 'other';
export type CommunicationFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'rarely';

export interface ContactMetadata {
  // Basic Info
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  
  // Classification
  category: ContactCategory;
  tags: string[];
  groups?: string[];
  
  // Relationship
  relationship_strength?: RelationshipStrength;
  first_met_date?: string;
  last_contact_date?: string;
  communication_frequency?: CommunicationFrequency;
  
  // Context
  location?: string;
  timezone?: string;
  birthday?: string;
  anniversary?: string;
  
  // Social
  linkedin_url?: string;
  twitter_handle?: string;
  website?: string;
  
  // Notes
  notes?: string;
  interests?: string[];
  important_dates?: Array<{ date: string; description: string }>;
  
  // Metadata
  source?: string;
  referral_from?: string;
  custom_fields?: Record<string, any>;
}

export interface InteractionMetadata {
  // Basic Info
  interaction_type: InteractionType;
  date: string;
  duration_minutes?: number;
  
  // Participants
  contact_uids: string[];
  participants?: string[];
  
  // Context
  location?: string;
  platform?: string;
  purpose?: string;
  
  // Content
  summary?: string;
  notes?: string;
  topics_discussed?: string[];
  action_items?: string[];
  
  // Follow-up
  follow_up_required?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  
  // Sentiment
  mood?: 'positive' | 'neutral' | 'negative';
  quality_rating?: number;
  
  // Metadata
  attachments?: string[];
  related_entities?: string[];
}

export interface NetworkGroupMetadata {
  // Group Info
  group_name: string;
  description?: string;
  group_type: 'family' | 'team' | 'community' | 'project' | 'hobby' | 'other';
  
  // Members
  member_uids: string[];
  leader_uid?: string;
  
  // Activity
  created_date: string;
  last_activity_date?: string;
  meeting_frequency?: CommunicationFrequency;
  
  // Context
  purpose?: string;
  tags?: string[];
  notes?: string;
}

export interface RelationshipEventMetadata {
  // Event Info
  event_type: 'milestone' | 'conflict' | 'collaboration' | 'favor' | 'gift' | 'other';
  date: string;
  contact_uids: string[];
  
  // Details
  description: string;
  impact?: 'positive' | 'neutral' | 'negative';
  significance?: number;
  
  // Context
  notes?: string;
  tags?: string[];
  
  // Follow-up
  lessons_learned?: string;
  action_items?: string[];
}
