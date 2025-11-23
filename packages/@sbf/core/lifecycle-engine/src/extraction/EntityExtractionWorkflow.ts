/**
 * Entity Extraction Workflow
 * Automatically extracts entities from daily notes using AEI
 */

import { BaseAIProvider } from '@sbf/aei';
import { Entity } from '@sbf/shared';
import { EntityManager } from '@sbf/core-entity-manager';
import { EventEmitter } from 'eventemitter3';

export interface ExtractionWorkflowConfig {
  provider: BaseAIProvider;
  entityManager: EntityManager;
  confidenceThreshold?: number;
  batchSize?: number;
}

export interface ExtractionResult {
  entityUid: string;
  extractedEntities: Entity[];
  confidence: number;
  processingTime: number;
  errors?: string[];
}

export interface ExtractionWorkflowEvents {
  'extraction:started': (entityUid: string) => void;
  'extraction:completed': (result: ExtractionResult) => void;
  'extraction:failed': (entityUid: string, error: Error) => void;
}

export class EntityExtractionWorkflow extends EventEmitter<ExtractionWorkflowEvents> {
  private config: Required<ExtractionWorkflowConfig>;

  constructor(config: ExtractionWorkflowConfig) {
    super();
    this.config = {
      ...config,
      confidenceThreshold: config.confidenceThreshold ?? 0.75,
      batchSize: config.batchSize ?? 10,
    };
  }

  /**
   * Extract entities from a single daily note
   */
  async extractFromDailyNote(entityUid: string): Promise<ExtractionResult> {
    this.emit('extraction:started', entityUid);
    const startTime = Date.now();

    try {
      const entity = await this.config.entityManager.get(entityUid);
      if (!entity) {
        throw new Error(`Entity ${entityUid} not found`);
      }

      if (entity.type !== 'daily-note') {
        throw new Error(`Entity ${entityUid} is not a daily note`);
      }

      const extractedEntities = await this.performExtraction(entity);
      const processingTime = Date.now() - startTime;

      const result: ExtractionResult = {
        entityUid,
        extractedEntities,
        confidence: this.calculateAverageConfidence(extractedEntities),
        processingTime,
      };

      this.emit('extraction:completed', result);
      return result;
    } catch (error) {
      this.emit('extraction:failed', entityUid, error as Error);
      throw error;
    }
  }

  /**
   * Extract entities from multiple daily notes
   */
  async extractFromMultiple(entityUids: string[]): Promise<ExtractionResult[]> {
    const results: ExtractionResult[] = [];

    for (let i = 0; i < entityUids.length; i += this.config.batchSize) {
      const batch = entityUids.slice(i, i + this.config.batchSize);
      const batchResults = await Promise.all(
        batch.map(uid => this.extractFromDailyNote(uid))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Perform the actual extraction using AI provider
   */
  private async performExtraction(dailyNote: Entity): Promise<Entity[]> {
    const content = dailyNote.content || '';
    
    // Use AI provider to extract entities
    // This is a simplified version - actual implementation would use AEI extraction methods
    const extractedEntities: Entity[] = [];

    // Parse the content and identify potential entities
    const lines = content.split('\n');
    const personPattern = /\[\[([^\]]+)\]\]/g; // Wikilinks
    const projectPattern = /#project\/([^\s]+)/g; // Project tags

    const entities = new Set<string>();

    for (const line of lines) {
      let match;
      
      // Extract people from wikilinks
      while ((match = personPattern.exec(line)) !== null) {
        entities.add(match[1]);
      }
      
      // Extract projects from tags
      while ((match = projectPattern.exec(line)) !== null) {
        entities.add(match[1]);
      }
    }

    // Create entity objects
    for (const entityName of entities) {
      const entity: Entity = {
        uid: this.generateUid(entityName),
        type: this.inferEntityType(entityName),
        title: entityName,
        content: '',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        metadata: {
          extracted_from: dailyNote.uid,
          confidence: 0.85,
          automated_extraction: true,
        },
        lifecycle: {
          state: 'permanent',
        },
        sensitivity: {
          level: 'personal',
          privacy: {
            cloud_ai_allowed: true,
            local_ai_allowed: true,
            export_allowed: true,
          },
        },
      };

      extractedEntities.push(entity);
    }

    return extractedEntities;
  }

  /**
   * Generate UID for extracted entity
   */
  private generateUid(name: string): string {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}`;
  }

  /**
   * Infer entity type from name
   */
  private inferEntityType(name: string): Entity['type'] {
    // Simple heuristic - can be improved with AI
    if (name.includes('project')) return 'project';
    if (name.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/)) return 'person'; // First Last name pattern
    return 'topic';
  }

  /**
   * Calculate average confidence across extracted entities
   */
  private calculateAverageConfidence(entities: Entity[]): number {
    if (entities.length === 0) return 0;
    
    const totalConfidence = entities.reduce((sum, entity) => {
      return sum + (entity.metadata?.confidence as number || 0);
    }, 0);

    return totalConfidence / entities.length;
  }

  /**
   * Get extraction statistics
   */
  getStats() {
    return {
      confidenceThreshold: this.config.confidenceThreshold,
      batchSize: this.config.batchSize,
    };
  }
}
