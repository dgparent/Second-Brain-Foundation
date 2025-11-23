/**
 * Relationship CRM Plugin - CRM Contact Entity
 * 
 * Extended contact entity with CRM-specific features like lead management,
 * sales tracking, and priority levels
 */

import { createContactEntity } from '@sbf/frameworks-relationship-tracking';
import type { SimpleEntity, ContactCategory } from '@sbf/frameworks-relationship-tracking';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'customer';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type SalesStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface CRMContactMetadata {
  // Standard contact fields (from framework)
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  category: ContactCategory;
  tags: string[];
  relationship_strength?: string;
  
  // CRM-specific fields
  lead_status?: LeadStatus;
  lead_source?: string;
  lead_score?: number; // 0-100
  deal_value?: number; // Potential or actual revenue
  currency?: string;
  sales_stage?: SalesStage;
  account_manager?: string;
  priority_level?: PriorityLevel;
  
  // Business context
  industry?: string;
  company_size?: string;
  decision_maker?: boolean;
  budget_authority?: boolean;
  
  // Engagement tracking
  engagement_score?: number; // 0-100
  last_engagement_date?: string;
  next_action?: string;
  next_action_date?: string;
  
  // Custom CRM fields
  custom_crm_fields?: Record<string, any>;
}

/**
 * Create a CRM contact entity with extended metadata
 */
export function createCRMContact(data: {
  uid: string;
  full_name: string;
  category: ContactCategory;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  tags?: string[];
  
  // CRM-specific
  lead_status?: LeadStatus;
  lead_source?: string;
  lead_score?: number;
  deal_value?: number;
  currency?: string;
  sales_stage?: SalesStage;
  account_manager?: string;
  priority_level?: PriorityLevel;
  industry?: string;
  company_size?: string;
  decision_maker?: boolean;
  budget_authority?: boolean;
  engagement_score?: number;
  next_action?: string;
  next_action_date?: string;
  
  [key: string]: any;
}): SimpleEntity {
  // Use framework function to create base contact
  const baseContact = createContactEntity({
    uid: data.uid,
    full_name: data.full_name,
    category: data.category,
    email: data.email,
    phone: data.phone,
    company: data.company,
    job_title: data.job_title,
    tags: data.tags,
    ...data,
  });

  // Extend with CRM-specific metadata
  return {
    ...baseContact,
    type: 'crm.contact', // Override type for CRM plugin
    metadata: {
      ...baseContact.metadata,
      
      // CRM fields
      lead_status: data.lead_status || 'new',
      lead_source: data.lead_source,
      lead_score: data.lead_score ?? 0,
      deal_value: data.deal_value,
      currency: data.currency || 'USD',
      sales_stage: data.sales_stage,
      account_manager: data.account_manager,
      priority_level: data.priority_level || 'medium',
      
      // Business context
      industry: data.industry,
      company_size: data.company_size,
      decision_maker: data.decision_maker ?? false,
      budget_authority: data.budget_authority ?? false,
      
      // Engagement
      engagement_score: data.engagement_score ?? 0,
      last_engagement_date: data.last_engagement_date,
      next_action: data.next_action,
      next_action_date: data.next_action_date,
      
      // Custom fields
      custom_crm_fields: data.custom_crm_fields || {},
    } as CRMContactMetadata,
  };
}

/**
 * Update lead status and related fields
 */
export function updateLeadStatus(
  contact: SimpleEntity,
  newStatus: LeadStatus,
  notes?: string
): SimpleEntity {
  const now = new Date().toISOString();
  
  return {
    ...contact,
    metadata: {
      ...contact.metadata,
      lead_status: newStatus,
      last_engagement_date: now,
      status_change_history: [
        ...(contact.metadata.status_change_history || []),
        {
          from: contact.metadata.lead_status,
          to: newStatus,
          timestamp: now,
          notes,
        },
      ],
    },
    updated_at: now,
  };
}

/**
 * Update engagement score based on recent activity
 */
export function updateEngagementScore(
  contact: SimpleEntity,
  score: number
): SimpleEntity {
  return {
    ...contact,
    metadata: {
      ...contact.metadata,
      engagement_score: Math.min(100, Math.max(0, score)),
      last_engagement_date: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  };
}

/**
 * Set next action and reminder
 */
export function setNextAction(
  contact: SimpleEntity,
  action: string,
  actionDate: string
): SimpleEntity {
  return {
    ...contact,
    metadata: {
      ...contact.metadata,
      next_action: action,
      next_action_date: actionDate,
      action_history: [
        ...(contact.metadata.action_history || []),
        {
          action,
          scheduled_date: actionDate,
          created_at: new Date().toISOString(),
        },
      ],
    },
    updated_at: new Date().toISOString(),
  };
}
