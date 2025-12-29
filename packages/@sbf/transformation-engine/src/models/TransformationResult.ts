/**
 * Transformation result model.
 * 
 * Represents the output of executing a transformation on content.
 */

import { OutputFormat, TransformationUsage } from '../types';

/**
 * Transformation result entity.
 */
export interface TransformationResult {
  /** Unique identifier */
  id?: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Transformation that was executed */
  transformationId: string;
  
  /** Source that was transformed */
  sourceId?: string;
  
  /** Source version at time of transformation */
  sourceVersion?: number;
  
  /** Resulting output content */
  output: string;
  
  /** Resulting content (alias for output) */
  content?: string;
  
  /** Parsed content (for JSON/structured) */
  parsedContent?: unknown;
  
  /** Output format */
  outputFormat: OutputFormat;
  
  /** Model used for generation */
  modelUsed?: string;
  
  /** Transformation version used */
  transformationVersion?: number;
  
  /** Input tokens used */
  inputTokens?: number;
  
  /** Output tokens generated */
  outputTokens?: number;
  
  /** Cost estimate */
  cost?: number;
  
  /** Token usage (deprecated, use inputTokens/outputTokens) */
  usage?: TransformationUsage;
  
  /** Processing duration in ms */
  durationMs?: number;
  
  /** Error if transformation failed */
  error?: string;
  
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Create a transformation result.
 */
export function createTransformationResult(
  data: Omit<TransformationResult, 'id' | 'createdAt'>
): TransformationResult {
  return {
    ...data,
    id: `result-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Check if result was successful.
 */
export function isSuccessfulResult(result: TransformationResult): boolean {
  return !result.error && (result.output?.length ?? 0) > 0;
}

/**
 * Transformation result repository interface.
 */
export interface TransformationResultRepository {
  /**
   * Get result by ID.
   */
  get(id: string): Promise<TransformationResult | null>;
  
  /**
   * Get results for a source.
   */
  getBySource(sourceId: string): Promise<TransformationResult[]>;
  
  /**
   * Get results by transformation.
   */
  getByTransformation(transformationId: string): Promise<TransformationResult[]>;
  
  /**
   * Get latest result for source + transformation combo.
   */
  getLatest(sourceId: string, transformationId: string): Promise<TransformationResult | null>;
  
  /**
   * Save a result.
   */
  save(result: TransformationResult): Promise<TransformationResult>;
  
  /**
   * Create a new result.
   */
  create(result: TransformationResult): Promise<TransformationResult>;
  
  /**
   * Delete results for a source.
   */
  deleteBySource(sourceId: string): Promise<void>;
}

/**
 * In-memory result repository for testing.
 */
export class InMemoryTransformationResultRepository implements TransformationResultRepository {
  private results: Map<string, TransformationResult> = new Map();
  private counter = 0;
  
  async get(id: string): Promise<TransformationResult | null> {
    return this.results.get(id) ?? null;
  }
  
  async getBySource(sourceId: string): Promise<TransformationResult[]> {
    return Array.from(this.results.values())
      .filter(r => r.sourceId === sourceId)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
  
  async getByTransformation(transformationId: string): Promise<TransformationResult[]> {
    return Array.from(this.results.values())
      .filter(r => r.transformationId === transformationId)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  }
  
  async getLatest(sourceId: string, transformationId: string): Promise<TransformationResult | null> {
    const matches = Array.from(this.results.values())
      .filter(r => r.sourceId === sourceId && r.transformationId === transformationId)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    
    return matches[0] ?? null;
  }
  
  async save(result: TransformationResult): Promise<TransformationResult> {
    const id = result.id ?? `result-${++this.counter}`;
    const now = new Date().toISOString();
    
    const saved: TransformationResult = {
      ...result,
      id,
      createdAt: result.createdAt ?? now,
    };
    
    this.results.set(id, saved);
    return saved;
  }
  
  /**
   * Create a new result (alias for save).
   */
  async create(result: TransformationResult): Promise<TransformationResult> {
    return this.save(result);
  }
  
  async deleteBySource(sourceId: string): Promise<void> {
    for (const [id, result] of this.results) {
      if (result.sourceId === sourceId) {
        this.results.delete(id);
      }
    }
  }
  
  /**
   * Clear all results (for testing).
   */
  clear(): void {
    this.results.clear();
    this.counter = 0;
  }
}
