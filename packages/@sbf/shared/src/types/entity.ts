/**
 * Core Entity Types for Second Brain Foundation
 * Based on PRD v2.0 and Architecture v2.0
 */

export type EntityType = 
  // Core types (MVP)
  | 'topic'
  | 'project'
  | 'person'
  | 'place'
  | 'daily-note'
  // Extended types
  | 'source'
  | 'artifact'
  | 'event'
  | 'task'
  | 'process'
  // VA-specific types
  | 'va-client'
  | 'va-task'
  | 'va-meeting'
  // Plugin-defined types (extensible)
  | string;

export type TruthLevel = 'U1' | 'A2' | 'L3' | 'LN4' | 'C5';

export interface BMOM {
  because: string;  // Why it matters
  meaning: string;  // What it represents
  outcome: string;  // Expected result
  measure: string;  // Success criteria
}

export interface Provenance {
  sources: string[];           // UIDs of source entities
  confidence: number;          // 0.0-1.0 (1.0 = human-created)
  retrieved_date?: string;     // ISO8601 timestamp
  source_url?: string;         // Original URL if applicable
}

export interface Override {
  human_last: string;          // ISO8601 timestamp of last human decision
  prevent_dissolve?: boolean;  // Override 48h lifecycle
  notes?: string;              // Human override reasoning
}

export interface TruthMetadata {
  truthLevel: TruthLevel;
  originSource: string;
  originChain: string[];
  acceptedByUser: boolean;
  lastModifiedByLevel: TruthLevel;
}

export interface Entity {
  // Identity
  uid: string;                 // Format: {type}-{slug}-{counter}
  type: EntityType;
  title: string;
  aliases?: string[];
  
  // Temporal metadata
  created: string;             // ISO8601 timestamp
  updated: string;             // ISO8601 timestamp
  
  // Lifecycle
  lifecycle: {
    state: 'capture' | 'transitional' | 'permanent' | 'archived';
    review_at?: string;        // ISO8601 timestamp
    dissolve_at?: string;      // ISO8601 timestamp (for daily notes)
  };
  
  // Privacy & sensitivity
  sensitivity: {
    level: 'public' | 'personal' | 'confidential' | 'secret';
    privacy: {
      cloud_ai_allowed: boolean;
      local_ai_allowed: boolean;
      export_allowed: boolean;
    };
  };
  
  // Relationships (typed semantic graph)
  rel?: Array<[string, string]>;  // [relationship_type, target_uid]
  
  // Provenance & quality
  provenance?: Provenance;
  checksum?: string;           // SHA-256 for integrity
  override?: Override;
  
  // Status & priority
  status?: string;             // Entity-specific
  importance?: number;         // 1-5 priority score
  owner?: string;
  stakeholders?: string[];     // Array of person UIDs
  
  // BMOM framework
  bmom?: BMOM;
  
  // Tool compatibility
  obsidian_compatible?: boolean;
  notebooklm_compatible?: boolean;
  anythingllm_compatible?: boolean;
  
  // Content (markdown body)
  content?: string;
  
  // Extensible metadata (plugin-specific)
  metadata?: Record<string, any>;
}

export interface EntityTemplate {
  type: EntityType;
  requiredFields: (keyof Entity)[];
  optionalFields: (keyof Entity)[];
  defaultValues?: Partial<Entity>;
  validation?: (entity: Partial<Entity>) => boolean;
}

export interface EntityCreationOptions {
  skipLifecycle?: boolean;
  skipValidation?: boolean;
  emitEvents?: boolean;
}

export interface EntityQuery {
  type?: EntityType | EntityType[];
  uids?: string[];
  search?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort?: {
    field: keyof Entity;
    order: 'asc' | 'desc';
  };
}

export interface EntityUpdatePayload {
  uid: string;
  updates: Partial<Entity>;
  options?: {
    skipValidation?: boolean;
    updateTimestamp?: boolean;
    emitEvents?: boolean;
  };
}

/**
 * Legacy Entity interface for compatibility with v1.0 API and DB schema.
 * This should be used during the migration phase.
 */
export interface LegacyEntity {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  truthLevel: TruthLevel;
  originSource: string;
  originChain: string[];
  acceptedByUser: boolean;
  // Optional fields for DB compatibility
  embedding?: number[];
  deletedAt?: Date;
}

export interface EntityFilters {
  type?: string | string[];
  tags?: string[];
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

export interface EntityRepository {
  create(context: any, entity: any): Promise<LegacyEntity>;
  findById(context: any, id: string): Promise<LegacyEntity | null>;
  findMany(context: any, filters: EntityFilters): Promise<LegacyEntity[]>;
  update(context: any, id: string, updates: Partial<LegacyEntity>): Promise<LegacyEntity>;
  delete(context: any, id: string): Promise<void>;
}
