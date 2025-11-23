/**
 * Dissolution Workflow
 * Archives daily notes after extracting their content into permanent entities
 */

import { Entity } from '@sbf/shared';
import { EntityManager } from '@sbf/core-entity-manager';
import { EventEmitter } from 'eventemitter3';
import { EntityExtractionWorkflow, ExtractionResult } from '../extraction/EntityExtractionWorkflow';

export interface DissolutionWorkflowConfig {
  entityManager: EntityManager;
  extractionWorkflow: EntityExtractionWorkflow;
  archiveEnabled?: boolean;
}

export interface DissolutionResult {
  dailyNoteUid: string;
  extractedCount: number;
  archived: boolean;
  summary: string;
  processingTime: number;
  extractedEntities: Entity[];
}

export interface DissolutionWorkflowEvents {
  'dissolution:started': (dailyNoteUid: string) => void;
  'dissolution:completed': (result: DissolutionResult) => void;
  'dissolution:failed': (dailyNoteUid: string, error: Error) => void;
  'dissolution:prevented': (dailyNoteUid: string, reason: string) => void;
}

export class DissolutionWorkflow extends EventEmitter<DissolutionWorkflowEvents> {
  private config: Required<DissolutionWorkflowConfig>;

  constructor(config: DissolutionWorkflowConfig) {
    super();
    this.config = {
      ...config,
      archiveEnabled: config.archiveEnabled ?? true,
    };
  }

  /**
   * Dissolve a daily note into permanent entities
   */
  async dissolve(dailyNoteUid: string): Promise<DissolutionResult> {
    this.emit('dissolution:started', dailyNoteUid);
    const startTime = Date.now();

    try {
      const dailyNote = await this.config.entityManager.get(dailyNoteUid);
      if (!dailyNote) {
        throw new Error(`Daily note ${dailyNoteUid} not found`);
      }

      // Check for prevent_dissolve flag
      if (dailyNote.metadata?.prevent_dissolve) {
        const reason = 'User flagged to prevent dissolution';
        this.emit('dissolution:prevented', dailyNoteUid, reason);
        throw new Error(reason);
      }

      // Step 1: Extract entities
      const extractionResult = await this.config.extractionWorkflow.extractFromDailyNote(dailyNoteUid);

      // Step 2: Create or update permanent entities
      const createdEntities = await this.createPermanentEntities(extractionResult.extractedEntities);

      // Step 3: Update relationships
      await this.updateRelationships(dailyNote, createdEntities);

      // Step 4: Archive daily note
      const archived = this.config.archiveEnabled 
        ? await this.archiveDailyNote(dailyNote)
        : false;

      // Step 5: Generate summary
      const summary = this.generateSummary(dailyNote, createdEntities);

      const result: DissolutionResult = {
        dailyNoteUid,
        extractedCount: createdEntities.length,
        archived,
        summary,
        processingTime: Date.now() - startTime,
        extractedEntities: createdEntities,
      };

      this.emit('dissolution:completed', result);
      return result;
    } catch (error) {
      this.emit('dissolution:failed', dailyNoteUid, error as Error);
      throw error;
    }
  }

  /**
   * Dissolve multiple daily notes
   */
  async dissolveMultiple(dailyNoteUids: string[]): Promise<DissolutionResult[]> {
    const results: DissolutionResult[] = [];

    for (const uid of dailyNoteUids) {
      try {
        const result = await this.dissolve(uid);
        results.push(result);
      } catch (error) {
        // Continue with other notes even if one fails
        console.error(`Failed to dissolve ${uid}:`, error);
      }
    }

    return results;
  }

  /**
   * Create permanent entities from extracted entities
   */
  private async createPermanentEntities(extractedEntities: Entity[]): Promise<Entity[]> {
    const createdEntities: Entity[] = [];

    for (const entity of extractedEntities) {
      try {
        // Check if entity already exists
        const existing = await this.config.entityManager.get(entity.uid);
        
        if (existing) {
          // Update existing entity
          const updated = await this.config.entityManager.update(entity.uid, {
            content: this.mergeContent(existing.content || '', entity.content || ''),
            updated: new Date().toISOString(),
            metadata: {
              ...existing.metadata,
              last_dissolution_update: new Date().toISOString(),
            },
          });
          
          if (updated) {
            createdEntities.push(updated);
          }
        } else {
          // Create new entity
          const created = await this.config.entityManager.create(entity);
          createdEntities.push(created);
        }
      } catch (error) {
        console.error(`Failed to create/update entity ${entity.uid}:`, error);
      }
    }

    return createdEntities;
  }

  /**
   * Merge content from multiple sources
   */
  private mergeContent(existingContent: string, newContent: string): string {
    if (!newContent || newContent.trim() === '') {
      return existingContent;
    }

    if (!existingContent || existingContent.trim() === '') {
      return newContent;
    }

    // Simple merge: append new content with separator
    return `${existingContent}\n\n---\n\n${newContent}`;
  }

  /**
   * Update relationships between entities
   */
  private async updateRelationships(dailyNote: Entity, createdEntities: Entity[]): Promise<void> {
    // Create relationships: daily note -> extracted entities
    for (const entity of createdEntities) {
      try {
        // In a full implementation, this would use the knowledge graph
        // to create proper relationship edges
        
        // For now, we'll update the entity metadata
        await this.config.entityManager.update(entity.uid, {
          metadata: {
            ...entity.metadata,
            source_daily_note: dailyNote.uid,
            source_date: dailyNote.created,
          },
        });
      } catch (error) {
        console.error(`Failed to create relationship for ${entity.uid}:`, error);
      }
    }
  }

  /**
   * Archive a daily note
   */
  private async archiveDailyNote(dailyNote: Entity): Promise<boolean> {
    try {
      const updated = await this.config.entityManager.update(dailyNote.uid, {
        lifecycle: {
          ...dailyNote.lifecycle,
          state: 'archived',
        },
        metadata: {
          ...dailyNote.metadata,
          archived_at: new Date().toISOString(),
          archived_reason: 'Automatic 48-hour dissolution',
        },
      });

      return !!updated;
    } catch (error) {
      console.error(`Failed to archive daily note ${dailyNote.uid}:`, error);
      return false;
    }
  }

  /**
   * Generate dissolution summary
   */
  private generateSummary(dailyNote: Entity, createdEntities: Entity[]): string {
    const date = new Date(dailyNote.created).toLocaleDateString();
    const entityTypes = createdEntities.reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typesSummary = Object.entries(entityTypes)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    return `Dissolved daily note from ${date}. Extracted ${createdEntities.length} entities: ${typesSummary}.`;
  }

  /**
   * Get dissolution statistics
   */
  getStats() {
    return {
      archiveEnabled: this.config.archiveEnabled,
    };
  }
}
