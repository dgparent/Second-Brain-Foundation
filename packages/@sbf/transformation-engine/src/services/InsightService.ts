/**
 * Insight service for generating and managing source insights.
 * 
 * Generates AI insights for sources and manages their lifecycle.
 */

import { InsightType, TransformationContext } from '../types';
import { 
  SourceInsight, 
  SourceInsightRepository,
  createSourceInsight,
  promoteToUserTruth 
} from '../models/SourceInsight';
import { 
  Transformation, 
  TransformationRepository 
} from '../models/Transformation';
import { TransformationService, ExecutionResult } from './TransformationService';

/**
 * Insight generation request.
 */
export interface InsightRequest {
  /** Source ID to generate insights for */
  sourceId: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Source content */
  content: string;
  
  /** Source title/name */
  title?: string;
  
  /** Source type (e.g., document, note, article) */
  sourceType?: string;
  
  /** Source metadata */
  metadata?: Record<string, unknown>;
  
  /** Specific insight types to generate (default: all) */
  insightTypes?: InsightType[];
  
  /** Model override */
  modelOverride?: string;
}

/**
 * Insight generation result.
 */
export interface InsightGenerationResult {
  /** Generated insights */
  insights: SourceInsight[];
  
  /** Number of insights generated */
  count: number;
  
  /** Total tokens used */
  totalTokens: number;
  
  /** Total cost */
  totalCost: number;
  
  /** Errors encountered */
  errors: Array<{ type: InsightType; error: string }>;
}

/**
 * Insight service configuration.
 */
export interface InsightServiceConfig {
  /** Transformation service */
  transformationService: TransformationService;
  
  /** Insight repository */
  insightRepo: SourceInsightRepository;
  
  /** Transformation repository (for finding insight transformations) */
  transformationRepo: TransformationRepository;
  
  /** Auto-generate insights on content ingestion */
  autoGenerate?: boolean;
  
  /** Default insight types to generate */
  defaultInsightTypes?: InsightType[];
}

/**
 * Mapping of insight types to transformation names.
 */
const INSIGHT_TYPE_TO_TRANSFORMATION: Record<InsightType, string> = {
  summary: 'system:summary',
  'key-points': 'system:key-insights',
  'action-items': 'system:action-items',
  tags: 'system:auto-tags',
  category: 'system:categorize',
  sentiment: 'system:sentiment',
  entities: 'system:entities',
  topics: 'system:topics',
  questions: 'system:questions',
  custom: 'custom',
};

/**
 * Insight service.
 */
export class InsightService {
  private transformationService: TransformationService;
  private insightRepo: SourceInsightRepository;
  private transformationRepo: TransformationRepository;
  private autoGenerate: boolean;
  private defaultInsightTypes: InsightType[];
  
  constructor(config: InsightServiceConfig) {
    this.transformationService = config.transformationService;
    this.insightRepo = config.insightRepo;
    this.transformationRepo = config.transformationRepo;
    this.autoGenerate = config.autoGenerate ?? true;
    this.defaultInsightTypes = config.defaultInsightTypes ?? [
      'summary',
      'key-points',
      'tags',
    ];
  }
  
  /**
   * Generate insights for a source.
   */
  async generateInsights(request: InsightRequest): Promise<InsightGenerationResult> {
    const insightTypes = request.insightTypes ?? this.defaultInsightTypes;
    const insights: SourceInsight[] = [];
    const errors: Array<{ type: InsightType; error: string }> = [];
    let totalTokens = 0;
    let totalCost = 0;
    
    // Build context for transformations
    const context: TransformationContext = {
      source: {
        id: request.sourceId,
        content: request.content,
        title: request.title,
        type: request.sourceType,
        metadata: request.metadata,
      },
      tenantId: request.tenantId,
    };
    
    // Generate each insight type
    for (const insightType of insightTypes) {
      try {
        const transformationName = INSIGHT_TYPE_TO_TRANSFORMATION[insightType];
        const transformation = await this.findTransformation(
          transformationName,
          request.tenantId
        );
        
        if (!transformation) {
          errors.push({
            type: insightType,
            error: `No transformation found for insight type: ${insightType}`,
          });
          continue;
        }
        
        // Execute transformation
        const result = await this.transformationService.execute(
          transformation.id,
          context,
          { modelOverride: request.modelOverride }
        );
        
        if (!result.success) {
          errors.push({
            type: insightType,
            error: result.error ?? 'Unknown error',
          });
          continue;
        }
        
        // Create insight from result
        const insight = createSourceInsight({
          tenantId: request.tenantId,
          sourceId: request.sourceId,
          insightType,
          content: result.result.output,
          parsedContent: result.parsed as Record<string, unknown> | undefined,
          transformationId: transformation.id,
          transformationResultId: result.result.id,
          confidence: this.calculateConfidence(result),
        });
        
        // Save insight
        const savedInsight = await this.insightRepo.save(insight);
        insights.push(savedInsight);
        
        // Track totals
        totalTokens += (result.result.inputTokens ?? 0) + (result.result.outputTokens ?? 0);
        totalCost += result.result.cost ?? 0;
      } catch (error) {
        errors.push({
          type: insightType,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    return {
      insights,
      count: insights.length,
      totalTokens,
      totalCost,
      errors,
    };
  }
  
  /**
   * Get all insights for a source.
   */
  async getInsightsForSource(
    sourceId: string,
    tenantId: string
  ): Promise<SourceInsight[]> {
    const all = await this.insightRepo.getBySource(sourceId);
    return all.filter(i => i.tenantId === tenantId);
  }
  
  /**
   * Get specific insight type for a source.
   */
  async getInsight(
    sourceId: string,
    tenantId: string,
    insightType: InsightType
  ): Promise<SourceInsight | null> {
    const insights = await this.getInsightsForSource(sourceId, tenantId);
    
    // Return most recent insight of the type
    return insights
      .filter(i => i.insightType === insightType && !i.invalidatedAt)
      .sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )[0] ?? null;
  }
  
  /**
   * Promote an insight to user-reviewed truth.
   */
  async promoteInsight(
    insightId: string,
    tenantId: string,
    userId: string
  ): Promise<SourceInsight> {
    const insight = await this.insightRepo.get(insightId);
    
    if (!insight) {
      throw new Error(`Insight not found: ${insightId}`);
    }
    
    if (insight.tenantId !== tenantId) {
      throw new Error('Insight does not belong to tenant');
    }
    
    const promoted = promoteToUserTruth(insight, userId);
    return this.insightRepo.update(promoted.id!, promoted);
  }
  
  /**
   * Invalidate an insight (e.g., source was updated).
   */
  async invalidateInsight(insightId: string, tenantId: string): Promise<void> {
    const insight = await this.insightRepo.get(insightId);
    
    if (!insight || insight.tenantId !== tenantId) {
      return;
    }
    
    await this.insightRepo.update(insightId, {
      invalidatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  
  /**
   * Invalidate all insights for a source (e.g., content changed).
   */
  async invalidateSourceInsights(
    sourceId: string,
    tenantId: string
  ): Promise<number> {
    const insights = await this.insightRepo.getBySource(sourceId);
    let count = 0;
    
    for (const insight of insights) {
      if (!insight.invalidatedAt && insight.tenantId === tenantId) {
        await this.insightRepo.update(insight.id!, {
          invalidatedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Regenerate insights for a source.
   */
  async regenerateInsights(
    sourceId: string,
    tenantId: string,
    content: string,
    options?: {
      insightTypes?: InsightType[];
      invalidateOld?: boolean;
    }
  ): Promise<InsightGenerationResult> {
    // Invalidate old insights if requested
    if (options?.invalidateOld !== false) {
      await this.invalidateSourceInsights(sourceId, tenantId);
    }
    
    // Generate new insights
    return this.generateInsights({
      sourceId,
      tenantId,
      content,
      insightTypes: options?.insightTypes,
    });
  }
  
  /**
   * Get insight summary for dashboard.
   */
  async getInsightSummary(tenantId: string): Promise<{
    totalInsights: number;
    byType: Record<InsightType, number>;
    promotedCount: number;
    invalidatedCount: number;
  }> {
    const insights = await this.insightRepo.findByTenant(tenantId);
    
    const byType: Partial<Record<InsightType, number>> = {};
    let promotedCount = 0;
    let invalidatedCount = 0;
    
    for (const insight of insights) {
      byType[insight.insightType] = (byType[insight.insightType] ?? 0) + 1;
      
      if (insight.truthLevel === 'U1') {
        promotedCount++;
      }
      
      if (insight.invalidatedAt) {
        invalidatedCount++;
      }
    }
    
    return {
      totalInsights: insights.length,
      byType: byType as Record<InsightType, number>,
      promotedCount,
      invalidatedCount,
    };
  }
  
  /**
   * Check if auto-generation is enabled.
   */
  shouldAutoGenerate(): boolean {
    return this.autoGenerate;
  }
  
  /**
   * Get default insight types.
   */
  getDefaultInsightTypes(): InsightType[] {
    return [...this.defaultInsightTypes];
  }
  
  /**
   * Find transformation for insight type.
   */
  private async findTransformation(
    name: string,
    tenantId: string
  ): Promise<Transformation | null> {
    // Try tenant-specific first
    const tenantTransformations = await this.transformationRepo.getForTenant(tenantId);
    const tenantMatch = tenantTransformations.find(t => t.name === name);
    if (tenantMatch) return tenantMatch;
    
    // Fall back to system default
    const defaults = await this.transformationRepo.getDefaultsForIngestion(tenantId);
    return defaults.find(t => t.name === name) ?? null;
  }
  
  /**
   * Calculate confidence score from result.
   */
  private calculateConfidence(result: ExecutionResult): number {
    // Base confidence
    let confidence = 0.8;
    
    // Reduce if there were parsing errors
    if (!result.success) {
      confidence -= 0.3;
    }
    
    // Higher confidence for more tokens (more processing)
    const totalTokens = result.result.inputTokens + result.result.outputTokens;
    if (totalTokens > 1000) {
      confidence += 0.05;
    }
    
    // Cap at 0.95 (never 100% confident in AI output)
    return Math.min(Math.max(confidence, 0.1), 0.95);
  }
}

/**
 * Create insight service.
 */
export function createInsightService(
  config: InsightServiceConfig
): InsightService {
  return new InsightService(config);
}
