/**
 * Relationship CRM Plugin - Follow-up Reminder Workflow
 * 
 * Generate smart follow-up reminders based on relationship data
 */

import { RelationshipAnalysisWorkflow } from '@sbf/frameworks-relationship-tracking';
import type { SimpleEntity } from '@sbf/frameworks-relationship-tracking';
import type { SimpleMemoryEngine } from '../types/common';

export interface ReminderOptions {
  days_threshold?: number; // Days since last contact (default: 30)
  prioritize_by?: 'relationship_strength' | 'deal_value' | 'priority_level' | 'engagement_score';
  max_results?: number;
  include_categories?: string[];
  exclude_categories?: string[];
}

export interface FollowUpReminder {
  contact: SimpleEntity;
  days_since_contact: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggested_action: string;
  last_interaction: SimpleEntity | null;
}

export class FollowUpReminderWorkflow {
  private analysisWorkflow: RelationshipAnalysisWorkflow;

  constructor(private memoryEngine: SimpleMemoryEngine) {
    this.analysisWorkflow = new RelationshipAnalysisWorkflow(memoryEngine);
  }

  /**
   * Generate follow-up reminders for contacts
   */
  async generateReminders(options: ReminderOptions = {}): Promise<FollowUpReminder[]> {
    const {
      days_threshold = 30,
      prioritize_by = 'relationship_strength',
      max_results = 20,
      include_categories,
      exclude_categories,
    } = options;

    // Get contacts needing follow-up from framework
    const needsFollowUp = await this.analysisWorkflow.findContactsNeedingFollowUp(days_threshold);

    // Filter by category if specified
    let filtered = needsFollowUp;
    if (include_categories || exclude_categories) {
      filtered = needsFollowUp.filter(item => {
        const category = item.contact.metadata.category;
        if (include_categories && !include_categories.includes(category)) return false;
        if (exclude_categories && exclude_categories.includes(category)) return false;
        return true;
      });
    }

    // Generate reminders with CRM-specific context
    const reminders: FollowUpReminder[] = await Promise.all(
      filtered.map(item => this.createReminder(item))
    );

    // Sort by priority criteria
    const sorted = this.sortReminders(reminders, prioritize_by);

    // Limit results
    return sorted.slice(0, max_results);
  }

  /**
   * Create a follow-up reminder with context
   */
  private async createReminder(data: {
    contact: SimpleEntity;
    days_since_contact: number;
    last_interaction: SimpleEntity | null;
  }): Promise<FollowUpReminder> {
    const { contact, days_since_contact, last_interaction } = data;
    const metadata = contact.metadata;

    // Determine priority
    const priority = this.calculatePriority(contact, days_since_contact);

    // Generate reason
    const reason = this.generateReason(contact, days_since_contact, last_interaction);

    // Suggest action
    const suggested_action = this.suggestAction(contact, last_interaction);

    return {
      contact,
      days_since_contact,
      reason,
      priority,
      suggested_action,
      last_interaction,
    };
  }

  /**
   * Calculate reminder priority
   */
  private calculatePriority(contact: SimpleEntity, daysSince: number): 'low' | 'medium' | 'high' | 'urgent' {
    const metadata = contact.metadata;
    const strength = metadata.relationship_strength || 'moderate';
    const priorityLevel = metadata.priority_level || 'medium';
    const dealValue = metadata.deal_value || 0;

    // Urgent: high-value contacts not contacted in 14+ days
    if (dealValue > 10000 && daysSince > 14) return 'urgent';
    if (strength === 'vital' && daysSince > 14) return 'urgent';
    if (priorityLevel === 'critical' && daysSince > 7) return 'urgent';

    // High: important contacts not contacted in 30+ days
    if (strength === 'strong' && daysSince > 30) return 'high';
    if (priorityLevel === 'high' && daysSince > 21) return 'high';
    if (dealValue > 5000 && daysSince > 21) return 'high';

    // Medium: moderate contacts not contacted in 60+ days
    if (strength === 'moderate' && daysSince > 60) return 'medium';
    if (priorityLevel === 'medium' && daysSince > 45) return 'medium';

    // Low: weak contacts
    return 'low';
  }

  /**
   * Generate human-readable reason for reminder
   */
  private generateReason(contact: SimpleEntity, daysSince: number, lastInteraction: SimpleEntity | null): string {
    const metadata = contact.metadata;
    const name = metadata.full_name;
    const strength = metadata.relationship_strength || 'moderate';
    const company = metadata.company;

    if (!lastInteraction) {
      return `No recorded interactions with ${name}${company ? ` (${company})` : ''}`;
    }

    if (daysSince > 90) {
      return `${daysSince} days since last contact with ${name} - ${strength} relationship at risk`;
    }

    if (daysSince > 60) {
      return `${daysSince} days since last contact with ${name}`;
    }

    return `Follow up with ${name} recommended`;
  }

  /**
   * Suggest appropriate follow-up action
   */
  private suggestAction(contact: SimpleEntity, lastInteraction: SimpleEntity | null): string {
    const metadata = contact.metadata;
    const nextAction = metadata.next_action;

    // If there's a scheduled next action, use that
    if (nextAction) {
      return nextAction;
    }

    // Otherwise, suggest based on last interaction type
    if (lastInteraction) {
      const lastType = lastInteraction.metadata.interaction_type;
      
      if (lastType === 'meeting') return 'Schedule a follow-up meeting';
      if (lastType === 'call') return 'Send an email check-in';
      if (lastType === 'email') return 'Make a phone call';
    }

    // Default suggestions based on relationship
    const strength = metadata.relationship_strength;
    if (strength === 'vital' || strength === 'strong') {
      return 'Schedule a coffee or lunch meeting';
    }

    return 'Send a quick check-in message';
  }

  /**
   * Sort reminders by priority criteria
   */
  private sortReminders(
    reminders: FollowUpReminder[],
    prioritizeBy: string
  ): FollowUpReminder[] {
    return reminders.sort((a, b) => {
      // First, sort by reminder priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by specified criteria
      if (prioritizeBy === 'relationship_strength') {
        const strengthOrder = { vital: 0, strong: 1, moderate: 2, weak: 3 };
        const aStrength = a.contact.metadata.relationship_strength || 'moderate';
        const bStrength = b.contact.metadata.relationship_strength || 'moderate';
        return strengthOrder[aStrength as keyof typeof strengthOrder] - strengthOrder[bStrength as keyof typeof strengthOrder];
      }

      if (prioritizeBy === 'deal_value') {
        return (b.contact.metadata.deal_value || 0) - (a.contact.metadata.deal_value || 0);
      }

      if (prioritizeBy === 'engagement_score') {
        return (b.contact.metadata.engagement_score || 0) - (a.contact.metadata.engagement_score || 0);
      }

      // Default: days since contact (descending)
      return b.days_since_contact - a.days_since_contact;
    });
  }
}
