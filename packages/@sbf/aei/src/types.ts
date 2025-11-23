/**
 * AEI Core Types
 */

import { Entity, Relationship } from '@sbf/shared';

// ============================================================================
// Provider Types
// ============================================================================

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsEmbeddings: boolean;
  supportsVision: boolean;
  maxContextTokens: number;
}

// ============================================================================
// Entity Extraction Types
// ============================================================================

export interface ExtractedEntity {
  type: EntityType;
  title: string;
  content?: string;
  attributes?: Record<string, unknown>;
  confidence: number; // 0-1
  sourceText: string; // Original text this was extracted from
  startOffset?: number;
  endOffset?: number;
}

export type EntityType = 
  | 'person'
  | 'place'
  | 'topic'
  | 'project'
  | 'event'
  | 'task'
  | 'source'
  | 'artifact'
  | 'process'
  | 'daily-note'
  | 'custom';

export interface ExtractionOptions {
  entityTypes?: EntityType[]; // Limit extraction to specific types
  includeConfidence?: boolean; // Include confidence scores
  minConfidence?: number; // Filter out low-confidence extractions
  contextWindow?: number; // Number of characters around entity for context
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  processingTime: number; // milliseconds
  provider: string;
  model: string;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

// ============================================================================
// Classification Types
// ============================================================================

export interface Classification {
  category: string;
  subcategory?: string;
  tags: string[];
  confidence: number; // 0-1
  reasoning?: string; // Why this classification was chosen
}

export interface ClassificationOptions {
  categories?: string[]; // Limit to specific categories
  maxTags?: number; // Maximum number of tags to generate
  includeReasoning?: boolean;
}

// ============================================================================
// Relationship Discovery Types
// ============================================================================

export interface DiscoveredRelationship {
  from: string; // Entity ID
  to: string; // Entity ID
  type: RelationshipType;
  confidence: number; // 0-1
  evidence?: string; // Text that supports this relationship
  bidirectional?: boolean;
}

export type RelationshipType =
  | 'references'
  | 'related_to'
  | 'parent_of'
  | 'child_of'
  | 'mentions'
  | 'authored_by'
  | 'located_in'
  | 'part_of'
  | 'depends_on'
  | 'blocks'
  | 'blocked_by'
  | 'similar_to'
  | 'expert_in'
  | string; // Allow custom relationship types

export interface RelationshipDiscoveryOptions {
  relationshipTypes?: RelationshipType[];
  minConfidence?: number;
  maxDistance?: number; // Max "hops" between entities
  includeEvidence?: boolean;
}

// ============================================================================
// Provenance Types
// ============================================================================

export interface AIProvenance {
  provider: string;
  model: string;
  timestamp: string; // ISO8601
  confidence: number;
  processingTime: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Prompt Templates
// ============================================================================

export interface PromptTemplate {
  system: string;
  user: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}

// ============================================================================
// Error Types
// ============================================================================

export class AEIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AEIError';
  }
}

export class ProviderError extends AEIError {
  constructor(message: string, details?: unknown) {
    super(message, 'PROVIDER_ERROR', details);
    this.name = 'ProviderError';
  }
}

export class ExtractionError extends AEIError {
  constructor(message: string, details?: unknown) {
    super(message, 'EXTRACTION_ERROR', details);
    this.name = 'ExtractionError';
  }
}

export class ClassificationError extends AEIError {
  constructor(message: string, details?: unknown) {
    super(message, 'CLASSIFICATION_ERROR', details);
    this.name = 'ClassificationError';
  }
}
