/**
 * Source insight model.
 * 
 * Represents generated insights stored with a source.
 */

import { InsightType } from '../types';

/**
 * Source insight entity.
 */
export interface SourceInsight {
  /** Unique identifier */
  id?: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Source ID */
  sourceId: string;
  
  /** Type of insight */
  insightType: InsightType;
  
  /** Insight content */
  content: string;
  
  /** Parsed content (for JSON insights) */
  parsedContent?: unknown;
  
  /** Transformation that generated this */
  transformationId?: string;
  
  /** Transformation result that generated this */
  transformationResultId?: string;
  
  /** Confidence score (0-1) */
  confidence?: number;
  
  /** Truth level (L3 for AI-generated) */
  truthLevel?: 'L3' | 'U1';
  
  /** Whether user has reviewed */
  reviewed?: boolean;
  
  /** User who reviewed this insight */
  reviewedBy?: string;
  
  /** User who promoted this insight to U1 */
  promotedBy?: string;
  
  /** When this insight was promoted */
  promotedAt?: string;
  
  /** When this insight was invalidated */
  invalidatedAt?: string;
  
  /** Updated timestamp */
  updatedAt?: string;
  
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Create a source insight.
 */
export function createSourceInsight(
  data: Omit<SourceInsight, 'id' | 'createdAt' | 'truthLevel'>
): SourceInsight {
  return {
    ...data,
    id: `insight-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    truthLevel: 'L3', // AI-generated default
    reviewed: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Promote insight truth level after user review.
 */
export function promoteToUserTruth(insight: SourceInsight, userId?: string): SourceInsight {
  return {
    ...insight,
    truthLevel: 'U1',
    reviewed: true,
    promotedBy: userId,
    promotedAt: new Date().toISOString(),
    reviewedBy: userId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Source insight repository interface.
 */
export interface SourceInsightRepository {
  /**
   * Get insight by ID.
   */
  get(id: string): Promise<SourceInsight | null>;
  
  /**
   * Get all insights for a source.
   */
  getBySource(sourceId: string): Promise<SourceInsight[]>;
  
  /**
   * Get all insights for a tenant.
   */
  findByTenant(tenantId: string): Promise<SourceInsight[]>;
  
  /**
   * Get insight by source and type.
   */
  getBySourceAndType(sourceId: string, type: InsightType): Promise<SourceInsight | null>;
  
  /**
   * Save an insight.
   */
  save(insight: SourceInsight): Promise<SourceInsight>;
  
  /**
   * Delete insights for a source.
   */
  deleteBySource(sourceId: string): Promise<void>;
  
  /**
   * Update insight (for review/promotion).
   */
  update(id: string, updates: Partial<SourceInsight>): Promise<SourceInsight>;
}

/**
 * In-memory insight repository for testing.
 */
export class InMemorySourceInsightRepository implements SourceInsightRepository {
  private insights: Map<string, SourceInsight> = new Map();
  private counter = 0;
  
  async get(id: string): Promise<SourceInsight | null> {
    return this.insights.get(id) ?? null;
  }
  
  async getBySource(sourceId: string): Promise<SourceInsight[]> {
    return Array.from(this.insights.values())
      .filter(i => i.sourceId === sourceId)
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  }
  
  /**
   * Find insights by source (alias for getBySource with tenant filter).
   */
  async findBySource(sourceId: string, tenantId: string): Promise<SourceInsight[]> {
    return Array.from(this.insights.values())
      .filter(i => i.sourceId === sourceId && i.tenantId === tenantId)
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  }
  
  /**
   * Find insights by tenant.
   */
  async findByTenant(tenantId: string): Promise<SourceInsight[]> {
    return Array.from(this.insights.values())
      .filter(i => i.tenantId === tenantId)
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  }
  
  /**
   * Find insights by type and tenant.
   */
  async findByInsightType(type: InsightType, tenantId: string): Promise<SourceInsight[]> {
    return Array.from(this.insights.values())
      .filter(i => i.insightType === type && i.tenantId === tenantId)
      .sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
  }
  
  async getBySourceAndType(sourceId: string, type: InsightType): Promise<SourceInsight | null> {
    for (const insight of this.insights.values()) {
      if (insight.sourceId === sourceId && insight.insightType === type) {
        return insight;
      }
    }
    return null;
  }
  
  async save(insight: SourceInsight): Promise<SourceInsight> {
    const id = insight.id ?? `insight-${++this.counter}`;
    const now = new Date().toISOString();
    
    const saved: SourceInsight = {
      ...insight,
      id,
      createdAt: insight.createdAt ?? now,
    };
    
    this.insights.set(id, saved);
    return saved;
  }
  
  /**
   * Create a new insight (alias for save).
   */
  async create(insight: SourceInsight): Promise<SourceInsight> {
    return this.save(insight);
  }
  
  async deleteBySource(sourceId: string): Promise<void> {
    for (const [id, insight] of this.insights) {
      if (insight.sourceId === sourceId) {
        this.insights.delete(id);
      }
    }
  }
  
  async update(id: string, updates: Partial<SourceInsight>): Promise<SourceInsight> {
    const existing = this.insights.get(id);
    if (!existing) {
      throw new Error(`Insight not found: ${id}`);
    }
    
    const updated: SourceInsight = {
      ...existing,
      ...updates,
      id, // Preserve ID
    };
    
    this.insights.set(id, updated);
    return updated;
  }
  
  /**
   * Clear all insights (for testing).
   */
  clear(): void {
    this.insights.clear();
    this.counter = 0;
  }
}
