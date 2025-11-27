/**
 * Relationship CRM Plugin - Main Service
 * 
 * Convenience wrapper that combines all workflows and utilities
 */

import { ContactCreationWorkflow } from './workflows/ContactCreationWorkflow';
import { InteractionLoggingWorkflow } from './workflows/InteractionLoggingWorkflow';
import { FollowUpReminderWorkflow } from './workflows/FollowUpReminderWorkflow';
import { ContactSearchUtility } from './utils/ContactSearchUtility';
import { RelationshipStrengthCalculator } from './utils/RelationshipStrengthCalculator';
import { RelationshipAnalysisWorkflow } from '@sbf/frameworks-relationship-tracking';
import type { SimpleEntity } from '@sbf/frameworks-relationship-tracking';

export interface SimpleMemoryEngine {
  query(filter: { type?: string; metadata?: any }): Promise<SimpleEntity[]>;
  store(entity: SimpleEntity): Promise<void>;
  update(uid: string, updates: Partial<SimpleEntity>): Promise<void>;
}

export interface SimpleAEIProvider {
  analyze(prompt: string, content: string): Promise<{ result: string; confidence: number }>;
}

/**
 * Main CRM Service - unified interface for all CRM functionality
 */
export class CRMService {
  public contactCreation: ContactCreationWorkflow;
  public interactionLogging: InteractionLoggingWorkflow;
  public followUpReminders: FollowUpReminderWorkflow;
  public contactSearch: ContactSearchUtility;
  public strengthCalculator: RelationshipStrengthCalculator;
  public relationshipAnalysis: RelationshipAnalysisWorkflow;

  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private aeiProvider?: SimpleAEIProvider
  ) {
    this.contactCreation = new ContactCreationWorkflow(memoryEngine, aeiProvider);
    this.interactionLogging = new InteractionLoggingWorkflow(memoryEngine);
    this.followUpReminders = new FollowUpReminderWorkflow(memoryEngine);
    this.contactSearch = new ContactSearchUtility(memoryEngine);
    this.strengthCalculator = new RelationshipStrengthCalculator();
    this.relationshipAnalysis = new RelationshipAnalysisWorkflow(memoryEngine);
  }

  /**
   * Quick method to add a contact
   */
  async addContact(options: Parameters<ContactCreationWorkflow['createContact']>[0]) {
    return this.contactCreation.createContact(options);
  }

  /**
   * Quick method to log an interaction
   */
  async logInteraction(options: Parameters<InteractionLoggingWorkflow['logInteraction']>[0]) {
    return this.interactionLogging.logInteraction(options);
  }

  /**
   * Quick method to search contacts
   */
  async searchContacts(criteria: Parameters<ContactSearchUtility['findContacts']>[0]) {
    return this.contactSearch.findContacts(criteria);
  }

  /**
   * Quick method to get relationship strength
   */
  async getRelationshipStrength(contactUid: string) {
    return this.relationshipAnalysis.calculateRelationshipStrength(contactUid);
  }

  /**
   * Quick method to find contacts needing follow-up
   */
  async findContactsNeedingFollowUp(daysThreshold: number = 30) {
    return this.followUpReminders.generateReminders({ days_threshold: daysThreshold });
  }

  /**
   * Get CRM statistics
   */
  async getStatistics() {
    const networkStats = await this.relationshipAnalysis.getNetworkStatistics();
    const contacts = await this.memoryEngine.query({ type: 'crm.contact' });
    
    const byLeadStatus = contacts.reduce((acc, c) => {
      const status = c.metadata.lead_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = contacts.reduce((acc, c) => {
      const priority = c.metadata.priority_level || 'unknown';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDealValue = contacts.reduce((sum, c) => sum + (c.metadata.deal_value || 0), 0);

    return {
      ...networkStats,
      by_lead_status: byLeadStatus,
      by_priority: byPriority,
      total_deal_value: totalDealValue,
    };
  }
}
