/**
 * Transformation entity model.
 * 
 * Represents a transformation template that converts content into insights.
 */

import { OutputFormat } from '../types';

/**
 * Transformation entity.
 */
export interface Transformation {
  /** Unique identifier */
  id?: string;
  
  /** Tenant ID (null for system defaults) */
  tenantId?: string | null;
  
  /** Unique name identifier */
  name: string;
  
  /** Display title */
  title?: string;
  
  /** Description */
  description?: string;
  
  /** Jinja2/Nunjucks prompt template */
  promptTemplate: string;
  
  /** Output format */
  outputFormat: OutputFormat;
  
  /** JSON schema for structured outputs */
  outputSchema?: Record<string, unknown>;
  
  /** Auto-apply on source ingestion */
  applyDefault?: boolean;
  
  /** Model ID to use */
  modelId?: string;
  
  /** Model override ID (alias for modelId) */
  modelOverride?: string;
  
  /** Temperature setting */
  temperature?: number;
  
  /** Maximum input tokens */
  maxInputTokens?: number;
  
  /** Maximum output tokens */
  maxOutputTokens?: number;
  
  /** Max tokens (alias for maxOutputTokens) */
  maxTokens?: number;
  
  /** Applicable ingestion types for auto-apply */
  applicableIngestionTypes?: string[];
  
  /** Is this transformation enabled */
  isEnabled?: boolean;
  
  /** Template version */
  version?: number;
  
  /** Created timestamp */
  createdAt?: string;
  
  /** Updated timestamp */
  updatedAt?: string;
}

/**
 * Transformation with resolved tenant scope.
 */
export interface TransformationWithScope extends Transformation {
  /** Whether this is a system default */
  isSystemDefault: boolean;
}

/**
 * Create a new transformation instance.
 */
export function createTransformation(
  data: Omit<Transformation, 'id' | 'createdAt' | 'updatedAt'>
): Transformation {
  return {
    ...data,
    id: `trans-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    applyDefault: data.applyDefault ?? false,
    outputFormat: data.outputFormat ?? 'markdown',
    version: data.version ?? 1,
    isEnabled: data.isEnabled ?? true,
    applicableIngestionTypes: data.applicableIngestionTypes ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Transformation repository interface.
 */
export interface TransformationRepository {
  /**
   * Get transformation by ID.
   */
  get(id: string): Promise<Transformation | null>;
  
  /**
   * Get transformation by name.
   */
  getByName(name: string, tenantId?: string): Promise<Transformation | null>;
  
  /**
   * Get all system default transformations.
   */
  getSystemDefaults(): Promise<Transformation[]>;
  
  /**
   * Get all transformations for a tenant (includes system defaults).
   */
  getForTenant(tenantId: string): Promise<TransformationWithScope[]>;
  
  /**
   * Get transformations that should auto-apply on ingestion.
   */
  getDefaultsForIngestion(tenantId: string): Promise<Transformation[]>;
  
  /**
   * Save a transformation.
   */
  save(transformation: Transformation): Promise<Transformation>;
  
  /**
   * Delete a transformation.
   */
  delete(id: string): Promise<void>;
}

/**
 * In-memory transformation repository for testing.
 */
export class InMemoryTransformationRepository implements TransformationRepository {
  private transformations: Map<string, Transformation> = new Map();
  private counter = 0;
  
  async get(id: string): Promise<Transformation | null> {
    return this.transformations.get(id) ?? null;
  }
  
  async getByName(name: string, tenantId?: string): Promise<Transformation | null> {
    for (const t of this.transformations.values()) {
      if (t.name === name && (t.tenantId === tenantId || t.tenantId === null)) {
        return t;
      }
    }
    return null;
  }
  
  async getSystemDefaults(): Promise<Transformation[]> {
    return Array.from(this.transformations.values())
      .filter(t => t.tenantId === null);
  }
  
  async getForTenant(tenantId: string): Promise<TransformationWithScope[]> {
    return Array.from(this.transformations.values())
      .filter(t => t.tenantId === null || t.tenantId === tenantId)
      .map(t => ({
        ...t,
        isSystemDefault: t.tenantId === null,
      }));
  }
  
  async getDefaultsForIngestion(tenantId: string): Promise<Transformation[]> {
    return Array.from(this.transformations.values())
      .filter(t => 
        t.applyDefault && 
        (t.tenantId === null || t.tenantId === tenantId)
      );
  }
  
  async save(transformation: Transformation): Promise<Transformation> {
    const id = transformation.id ?? `trans-${++this.counter}`;
    const now = new Date().toISOString();
    
    const saved: Transformation = {
      ...transformation,
      id,
      createdAt: transformation.createdAt ?? now,
      updatedAt: now,
    };
    
    this.transformations.set(id, saved);
    return saved;
  }
  
  /**
   * Create a new transformation (alias for save).
   */
  async create(transformation: Transformation): Promise<Transformation> {
    return this.save(transformation);
  }
  
  async delete(id: string): Promise<void> {
    this.transformations.delete(id);
  }
  
  /**
   * Clear all transformations (for testing).
   */
  clear(): void {
    this.transformations.clear();
    this.counter = 0;
  }
  
  /**
   * Seed with default transformations.
   */
  async seedDefaults(transformations: Transformation[]): Promise<void> {
    for (const t of transformations) {
      await this.save({ ...t, tenantId: null });
    }
  }
}
