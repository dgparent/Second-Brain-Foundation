/**
 * Relationship Framework - Relationship Analysis Workflow
 * 
 * Analyze relationship patterns, connection strength, and interaction history
 */

import type { SimpleEntity, ContactMetadata, InteractionMetadata, RelationshipStrength } from '../types';

export interface SimpleMemoryEngine {
  query(filter: { type?: string; metadata?: any }): Promise<SimpleEntity[]>;
}

export class RelationshipAnalysisWorkflow {
  constructor(
    private memoryEngine: SimpleMemoryEngine
  ) {}

  /**
   * Get all interactions for a specific contact
   */
  async getContactInteractions(contactUid: string): Promise<SimpleEntity[]> {
    const allInteractions = await this.memoryEngine.query({ 
      type: 'relationship.interaction' 
    });
    
    return allInteractions.filter(interaction => {
      const metadata = interaction.metadata as InteractionMetadata;
      return metadata.contact_uids && metadata.contact_uids.includes(contactUid);
    });
  }

  /**
   * Calculate relationship strength score based on interactions
   */
  async calculateRelationshipStrength(contactUid: string): Promise<{
    score: number;
    strength: RelationshipStrength;
    last_interaction: string | null;
    interaction_count: number;
    avg_interactions_per_month: number;
  }> {
    const interactions = await this.getContactInteractions(contactUid);
    const now = new Date();
    
    if (interactions.length === 0) {
      return {
        score: 0,
        strength: 'weak',
        last_interaction: null,
        interaction_count: 0,
        avg_interactions_per_month: 0,
      };
    }

    // Sort by date (most recent first)
    const sortedInteractions = interactions.sort((a, b) => {
      const dateA = (a.metadata as InteractionMetadata).date;
      const dateB = (b.metadata as InteractionMetadata).date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const lastInteraction = (sortedInteractions[0].metadata as InteractionMetadata).date;
    const firstInteraction = (sortedInteractions[sortedInteractions.length - 1].metadata as InteractionMetadata).date;
    
    const daysSinceFirst = Math.max(
      1,
      (now.getTime() - new Date(firstInteraction).getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsSinceFirst = daysSinceFirst / 30;
    const avgInteractionsPerMonth = interactions.length / monthsSinceFirst;

    // Calculate score (0-100)
    let score = 0;
    
    // Frequency factor (0-40 points)
    score += Math.min(40, avgInteractionsPerMonth * 5);
    
    // Recency factor (0-30 points)
    const daysSinceLast = (now.getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast < 7) score += 30;
    else if (daysSinceLast < 30) score += 20;
    else if (daysSinceLast < 90) score += 10;
    else if (daysSinceLast < 180) score += 5;
    
    // Total interactions factor (0-30 points)
    score += Math.min(30, interactions.length * 2);

    // Determine strength category
    let strength: RelationshipStrength;
    if (score >= 75) strength = 'vital';
    else if (score >= 50) strength = 'strong';
    else if (score >= 25) strength = 'moderate';
    else strength = 'weak';

    return {
      score: Math.round(score),
      strength,
      last_interaction: lastInteraction,
      interaction_count: interactions.length,
      avg_interactions_per_month: parseFloat(avgInteractionsPerMonth.toFixed(2)),
    };
  }

  /**
   * Find contacts requiring follow-up
   */
  async findContactsNeedingFollowUp(daysThreshold: number = 30): Promise<Array<{
    contact: SimpleEntity;
    days_since_contact: number;
    last_interaction: SimpleEntity | null;
  }>> {
    const contacts = await this.memoryEngine.query({ type: 'relationship.contact' });
    const result: Array<{
      contact: SimpleEntity;
      days_since_contact: number;
      last_interaction: SimpleEntity | null;
    }> = [];

    for (const contact of contacts) {
      const interactions = await this.getContactInteractions(contact.uid);
      
      if (interactions.length === 0) {
        result.push({
          contact,
          days_since_contact: Infinity,
          last_interaction: null,
        });
        continue;
      }

      const sortedInteractions = interactions.sort((a, b) => {
        const dateA = (a.metadata as InteractionMetadata).date;
        const dateB = (b.metadata as InteractionMetadata).date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });

      const lastInteraction = sortedInteractions[0];
      const lastDate = (lastInteraction.metadata as InteractionMetadata).date;
      const daysSince = (new Date().getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > daysThreshold) {
        result.push({
          contact,
          days_since_contact: Math.round(daysSince),
          last_interaction: lastInteraction,
        });
      }
    }

    return result.sort((a, b) => b.days_since_contact - a.days_since_contact);
  }

  /**
   * Get network statistics
   */
  async getNetworkStatistics(): Promise<{
    total_contacts: number;
    contacts_by_category: Record<string, number>;
    contacts_by_strength: Record<string, number>;
    total_interactions: number;
    interactions_this_month: number;
    avg_interactions_per_contact: number;
  }> {
    const contacts = await this.memoryEngine.query({ type: 'relationship.contact' });
    const interactions = await this.memoryEngine.query({ type: 'relationship.interaction' });

    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const interactionsThisMonth = interactions.filter(interaction => {
      const date = (interaction.metadata as InteractionMetadata).date;
      return new Date(date) >= monthAgo;
    });

    const contactsByCategory: Record<string, number> = {};
    const contactsByStrength: Record<string, number> = {};

    for (const contact of contacts) {
      const metadata = contact.metadata as ContactMetadata;
      
      const category = metadata.category || 'other';
      contactsByCategory[category] = (contactsByCategory[category] || 0) + 1;

      const strength = metadata.relationship_strength || 'moderate';
      contactsByStrength[strength] = (contactsByStrength[strength] || 0) + 1;
    }

    return {
      total_contacts: contacts.length,
      contacts_by_category: contactsByCategory,
      contacts_by_strength: contactsByStrength,
      total_interactions: interactions.length,
      interactions_this_month: interactionsThisMonth.length,
      avg_interactions_per_contact: contacts.length > 0 
        ? parseFloat((interactions.length / contacts.length).toFixed(2))
        : 0,
    };
  }

  /**
   * Find mutual connections between two contacts
   */
  async findMutualConnections(contactUid1: string, contactUid2: string): Promise<SimpleEntity[]> {
    const interactions1 = await this.getContactInteractions(contactUid1);
    const interactions2 = await this.getContactInteractions(contactUid2);

    // Find interactions where both contacts were present
    const mutualInteractions = interactions1.filter(int1 => {
      const metadata1 = int1.metadata as InteractionMetadata;
      return interactions2.some(int2 => int2.uid === int1.uid);
    });

    // Find other contacts present in these mutual interactions
    const mutualContactUids = new Set<string>();
    
    for (const interaction of mutualInteractions) {
      const metadata = interaction.metadata as InteractionMetadata;
      for (const uid of metadata.contact_uids) {
        if (uid !== contactUid1 && uid !== contactUid2) {
          mutualContactUids.add(uid);
        }
      }
    }

    // Fetch full contact entities
    const allContacts = await this.memoryEngine.query({ type: 'relationship.contact' });
    return allContacts.filter(contact => mutualContactUids.has(contact.uid));
  }
}
