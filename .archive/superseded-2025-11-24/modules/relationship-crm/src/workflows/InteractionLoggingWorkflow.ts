/**
 * Relationship CRM Plugin - Interaction Logging Workflow
 * 
 * Log interactions and automatically update relationship strength
 */

import { createInteractionEntity } from '@sbf/frameworks-relationship-tracking';
import { RelationshipAnalysisWorkflow } from '@sbf/frameworks-relationship-tracking';
import { updateEngagementScore } from '../entities/CRMContact';
import type { InteractionType } from '@sbf/frameworks-relationship-tracking';
import type { SimpleMemoryEngine, SimpleEntity } from '../types/common';

export interface InteractionLoggingOptions {
  contact_uids: string[];
  interaction_type: InteractionType;
  title: string;
  date: string;
  duration_minutes?: number;
  summary?: string;
  notes?: string;
  action_items?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  quality_rating?: number;
  auto_update_strength?: boolean; // Automatically recalculate relationship strength
}

export class InteractionLoggingWorkflow {
  private analysisWorkflow: RelationshipAnalysisWorkflow;

  constructor(private memoryEngine: SimpleMemoryEngine) {
    this.analysisWorkflow = new RelationshipAnalysisWorkflow(memoryEngine);
  }

  /**
   * Log an interaction and optionally update relationship strength
   */
  async logInteraction(options: InteractionLoggingOptions): Promise<SimpleEntity> {
    // Generate UID
    const uid = this.generateInteractionUID(options.title, options.date);

    // Create interaction entity
    const interaction = createInteractionEntity({
      uid,
      title: options.title,
      interaction_type: options.interaction_type,
      date: options.date,
      contact_uids: options.contact_uids,
      duration_minutes: options.duration_minutes,
      summary: options.summary,
      notes: options.notes,
      action_items: options.action_items,
      follow_up_required: options.follow_up_required,
      follow_up_date: options.follow_up_date,
      mood: options.sentiment,
      quality_rating: options.quality_rating,
    });

    // Store interaction
    await this.memoryEngine.store(interaction);

    // Update relationship strength if requested
    if (options.auto_update_strength !== false) {
      await this.updateContactStrengths(options.contact_uids);
    }

    // Update engagement scores
    await this.updateEngagementScores(options.contact_uids, options.sentiment, options.quality_rating);

    return interaction;
  }

  /**
   * Update relationship strength for contacts after interaction
   */
  private async updateContactStrengths(contactUids: string[]): Promise<void> {
    for (const contactUid of contactUids) {
      try {
        const strengthData = await this.analysisWorkflow.calculateRelationshipStrength(contactUid);
        
        await this.memoryEngine.update(contactUid, {
          metadata: {
            relationship_strength: strengthData.strength,
            relationship_score: strengthData.score,
            last_contact_date: strengthData.last_interaction,
          },
          updated_at: new Date().toISOString(),
        } as any);
      } catch (error) {
        console.error(`Failed to update strength for ${contactUid}:`, error);
      }
    }
  }

  /**
   * Update engagement scores based on interaction quality
   */
  private async updateEngagementScores(
    contactUids: string[],
    sentiment?: string,
    qualityRating?: number
  ): Promise<void> {
    const contacts = await this.memoryEngine.query({ type: 'crm.contact' });
    
    for (const contactUid of contactUids) {
      const contact = contacts.find(c => c.uid === contactUid);
      if (!contact) continue;

      // Calculate engagement boost
      let boost = 5; // Base boost for any interaction
      
      if (sentiment === 'positive') boost += 10;
      if (sentiment === 'negative') boost -= 5;
      if (qualityRating && qualityRating >= 4) boost += 10;
      if (qualityRating && qualityRating <= 2) boost -= 5;

      const currentScore = contact.metadata.engagement_score || 0;
      const newScore = Math.min(100, Math.max(0, currentScore + boost));

      const updatedContact = updateEngagementScore(contact, newScore);
      await this.memoryEngine.update(contactUid, updatedContact as any);
    }
  }

  /**
   * Generate unique interaction UID
   */
  private generateInteractionUID(title: string, date: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const dateStr = new Date(date).toISOString().split('T')[0];
    const timestamp = Date.now().toString(36);
    return `interaction-${slug}-${dateStr}-${timestamp}`;
  }
}
