/**
 * Content Pipeline Integration
 * 
 * Integrates transformation engine with content ingestion pipeline.
 * Triggers insight generation when new content is ingested.
 */

import {
  InsightService,
  InsightRequest,
  InsightGenerationResult,
} from '../services/InsightService';
import { TransformationConfig } from '../models/TransformationConfig';

/**
 * Source ingestion event payload.
 */
export interface SourceIngestedEvent {
  /** Source ID */
  sourceId: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Source content */
  content: string;
  
  /** Source title */
  title?: string;
  
  /** Source type (document, article, note, etc.) */
  sourceType?: string;
  
  /** Source metadata */
  metadata?: Record<string, unknown>;
  
  /** Source version */
  version?: number;
  
  /** Whether this is an update (vs new) */
  isUpdate?: boolean;
}

/**
 * Content pipeline configuration.
 */
export interface ContentPipelineConfig {
  /** Insight service instance */
  insightService: InsightService;
  
  /** Whether to auto-generate insights */
  autoGenerate?: boolean;
  
  /** Callback for insight generation results */
  onInsightsGenerated?: (
    sourceId: string,
    result: InsightGenerationResult
  ) => void | Promise<void>;
  
  /** Callback for errors */
  onError?: (
    sourceId: string,
    error: Error
  ) => void | Promise<void>;
}

/**
 * Content pipeline integration service.
 * 
 * Listens for source ingestion events and triggers insight generation.
 */
export class ContentPipelineIntegration {
  private insightService: InsightService;
  private autoGenerate: boolean;
  private onInsightsGenerated?: ContentPipelineConfig['onInsightsGenerated'];
  private onError?: ContentPipelineConfig['onError'];
  
  constructor(config: ContentPipelineConfig) {
    this.insightService = config.insightService;
    this.autoGenerate = config.autoGenerate ?? true;
    this.onInsightsGenerated = config.onInsightsGenerated;
    this.onError = config.onError;
  }
  
  /**
   * Handle source ingested event.
   */
  async onSourceIngested(event: SourceIngestedEvent): Promise<void> {
    if (!this.autoGenerate || !this.insightService.shouldAutoGenerate()) {
      return;
    }
    
    try {
      // If this is an update, invalidate old insights first
      if (event.isUpdate) {
        await this.insightService.invalidateSourceInsights(
          event.sourceId,
          event.tenantId
        );
      }
      
      // Generate insights
      const result = await this.insightService.generateInsights({
        sourceId: event.sourceId,
        tenantId: event.tenantId,
        content: event.content,
        title: event.title,
        sourceType: event.sourceType,
        metadata: event.metadata,
      });
      
      // Notify callback
      if (this.onInsightsGenerated) {
        await this.onInsightsGenerated(event.sourceId, result);
      }
      
      // Log any errors
      if (result.errors.length > 0) {
        console.warn(
          `Insight generation partial failure for source ${event.sourceId}:`,
          result.errors
        );
      }
    } catch (error) {
      if (this.onError && error instanceof Error) {
        await this.onError(event.sourceId, error);
      } else {
        console.error(
          `Insight generation failed for source ${event.sourceId}:`,
          error
        );
      }
    }
  }
  
  /**
   * Handle source deleted event.
   * (Insights are cascade deleted via FK, but this can be used for cleanup)
   */
  async onSourceDeleted(sourceId: string, tenantId: string): Promise<void> {
    // Insights should be cascade deleted, but we can do additional cleanup
    console.log(`Source ${sourceId} deleted, insights will be cascade deleted`);
  }
  
  /**
   * Handle source updated event.
   */
  async onSourceUpdated(event: SourceIngestedEvent): Promise<void> {
    await this.onSourceIngested({ ...event, isUpdate: true });
  }
  
  /**
   * Manually trigger insight regeneration for a source.
   */
  async regenerateInsights(
    sourceId: string,
    tenantId: string,
    content: string,
    options?: { insightTypes?: string[] }
  ): Promise<InsightGenerationResult> {
    return this.insightService.regenerateInsights(
      sourceId,
      tenantId,
      content,
      {
        insightTypes: options?.insightTypes as any,
        invalidateOld: true,
      }
    );
  }
  
  /**
   * Check if auto-generation is enabled.
   */
  isAutoGenerateEnabled(): boolean {
    return this.autoGenerate && this.insightService.shouldAutoGenerate();
  }
  
  /**
   * Enable/disable auto-generation.
   */
  setAutoGenerate(enabled: boolean): void {
    this.autoGenerate = enabled;
  }
}

/**
 * Create content pipeline integration.
 */
export function createContentPipelineIntegration(
  config: ContentPipelineConfig
): ContentPipelineIntegration {
  return new ContentPipelineIntegration(config);
}

/**
 * Event handler factory for job queue integration.
 */
export function createInsightGenerationHandler(
  insightService: InsightService
) {
  return async (payload: SourceIngestedEvent): Promise<InsightGenerationResult> => {
    const pipeline = new ContentPipelineIntegration({ insightService });
    
    // Build request
    const request: InsightRequest = {
      sourceId: payload.sourceId,
      tenantId: payload.tenantId,
      content: payload.content,
      title: payload.title,
      sourceType: payload.sourceType,
      metadata: payload.metadata,
    };
    
    // If update, invalidate first
    if (payload.isUpdate) {
      await insightService.invalidateSourceInsights(
        payload.sourceId,
        payload.tenantId
      );
    }
    
    return insightService.generateInsights(request);
  };
}
