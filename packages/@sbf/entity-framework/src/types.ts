/**
 * @sbf/entity-framework Types
 * 
 * Type definitions for the Entity Framework including
 * entity types, UIDs, frontmatter, and relationships.
 */

// =====================================
// Sensitivity & Truth Levels (PRD)
// =====================================

export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Truth levels for content validation:
 * - L1/L2/L3: Sourced content with increasing confidence
 * - U1/U2/U3: Unsourced content with increasing confidence
 */
export type TruthLevel = 'L1' | 'L2' | 'L3' | 'U1' | 'U2' | 'U3';

// =====================================
// Lifecycle States (PRD FR13-14)
// =====================================

export enum LifecycleState {
  CAPTURED = 'captured',       // Fresh note, 0-48h
  TRANSITIONAL = 'transitional', // Awaiting entity assignment
  PERMANENT = 'permanent',     // Filed with entities
  ARCHIVED = 'archived',       // Deprecated
}

// =====================================
// Entity Type Schema
// =====================================

export interface EntityTypeSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  enum?: string[];
  description?: string;
  required?: boolean;
  default?: unknown;
}

export interface EntityTypeSchema {
  properties: Record<string, EntityTypeSchemaProperty>;
}

export interface EntityTypeData {
  id?: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  folderPath: string;
  schema: EntityTypeSchema;
  template: string;
  uidCounter: number;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// =====================================
// Entity Data
// =====================================

export interface EntityRelationshipData {
  targetUid: string;
  type: string;
  context?: string;
  bidirectional?: boolean;
  createdAt?: Date;
}

export interface EntityData {
  id?: string;
  tenantId: string;
  uid: string;
  typeSlug: string;
  name: string;
  content?: string;
  summary?: string;
  
  // Universal parameters (PRD)
  sensitivity: SensitivityLevel;
  truthLevel: TruthLevel;
  lifecycleState: LifecycleState;
  
  // Lifecycle timestamps
  capturedAt: Date;
  filedAt?: Date;
  archivedAt?: Date;
  
  // Type-specific metadata
  metadata?: Record<string, unknown>;
  
  // BMOM (optional)
  bmom?: BMOMData;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  
  // Embedding for vector search
  embedding?: number[];
}

// =====================================
// Entity Relationship
// =====================================

export interface EntityRelationship {
  id?: string;
  tenantId: string;
  sourceUid: string;
  targetUid: string;
  relationshipType: string;
  context?: string;
  bidirectional: boolean;
  confidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RelationshipType = 
  | 'related_to'      // Generic association
  | 'part_of'         // Hierarchical containment
  | 'works_on'        // Person → Project
  | 'located_at'      // Entity → Place
  | 'attended'        // Person → Event
  | 'created_by'      // Artifact → Person
  | 'mentions'        // Content mention
  | 'references'      // Explicit reference
  | 'parent_of'       // Topic hierarchy
  | 'child_of'        // Topic hierarchy (inverse)
  | 'precedes'        // Temporal ordering
  | 'follows';        // Temporal ordering (inverse)

// =====================================
// BMOM Framework (PRD FR18-19)
// =====================================

export interface BMOMData {
  because: string;    // Why this content matters
  meaning: string;    // What it means in context
  outcome: string;    // Expected results or implications
  measure: string;    // How to measure success/validity
  confidence: number; // 0.0-1.0
  extractedAt: Date;
}

// =====================================
// Frontmatter
// =====================================

export interface Frontmatter {
  uid: string;
  type: string;
  name: string;
  created_at: string;
  modified_at: string;
  relationships: Array<{
    target_uid: string;
    type: string;
    context?: string;
  }>;
  sensitivity: SensitivityLevel;
  truth_level: TruthLevel;
  lifecycle_state?: LifecycleState;
  [key: string]: unknown; // Type-specific fields
}

// =====================================
// Wikilink
// =====================================

export interface WikiLink {
  uid: string;
  displayText?: string;
  start: number;
  end: number;
}

// =====================================
// UID Components
// =====================================

export interface UIDComponents {
  type: string;
  slug: string;
  counter: number;
}

// =====================================
// Service Options
// =====================================

export interface CreateEntityOptions {
  tenantId: string;
  typeSlug: string;
  name: string;
  content?: string;
  sensitivity?: SensitivityLevel;
  truthLevel?: TruthLevel;
  metadata?: Record<string, unknown>;
}

export interface FindEntitiesOptions {
  tenantId: string;
  typeSlug?: string;
  lifecycleState?: LifecycleState;
  sensitivity?: SensitivityLevel;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface CreateRelationshipOptions {
  tenantId: string;
  sourceUid: string;
  targetUid: string;
  relationshipType: RelationshipType | string;
  context?: string;
  bidirectional?: boolean;
  confidence?: number;
}

// =====================================
// Confidence Scoring (PRD FR25)
// =====================================

export interface ConfidenceComponent {
  name: string;
  score: number;
  reason: string;
}

export interface ConfidenceScore {
  overall: number;    // 0.0-1.0
  components: ConfidenceComponent[];
  needsReview: boolean;
  reviewThreshold: number;
}

// =====================================
// Review Queue
// =====================================

export type ReviewItemType = 'entity_extraction' | 'relationship' | 'bmom' | 'sensitivity';
export type ReviewItemStatus = 'pending' | 'approved' | 'rejected' | 'modified';

export interface ReviewItem {
  id: string;
  tenantId: string;
  type: ReviewItemType;
  entityId?: string;
  data: Record<string, unknown>;
  confidence: number;
  status: ReviewItemStatus;
  createdAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// =====================================
// Template Rendering
// =====================================

export interface TemplateData {
  uid: string;
  type: string;
  name: string;
  created_at: string;
  modified_at: string;
  [key: string]: unknown;
}
