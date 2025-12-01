/**
 * @sbf/memory-engine Core Types
 * Comprehensive type definitions for the memory engine
 */

// ============================================================================
// Memory Levels & Lifecycle
// ============================================================================

export type MemoryLevel = 'transitory' | 'temporary' | 'short_term' | 'long_term' | 'canonical' | 'archived';

export type LifecycleState = MemoryLevel;

export interface LifecycleTransition {
  from: LifecycleState;
  to: LifecycleState;
  timestamp: string; // ISO8601
  automatic: boolean; // true if 48-hour auto-transition, false if human override
  reason?: string;
}

// ============================================================================
// Security & Privacy
// ============================================================================

export type RestrictionMode = 'permissive' | 'cautious' | 'hardened';
export type ScopeGroup = 'public_group' | 'shareable_group' | 'internal_group' | 'secret_group' | 'compartmentalized_group';
export type Visibility = 'public' | 'internal' | 'user' | 'restricted';

export interface SensitivityPrivacy {
  cloud_ai_allowed: boolean;
  local_ai_allowed: boolean;
  export_allowed: boolean;
}

export interface Sensitivity {
  level: number; // 0-9 (0=public, 9=top secret)
  scope?: ScopeGroup;
  privacy: SensitivityPrivacy;
  visibility: Visibility;
  group_access?: string[];
}

export interface Control {
  AEI_restriction_mode?: RestrictionMode;
  requires_human_approval?: boolean;
  requires_audit_log?: boolean;
}

// ============================================================================
// Entity Types
// ============================================================================

export interface MemoryMetadata {
  memory_level: MemoryLevel;
  stability_score: number; // 0-1, measures how stable the information is
  importance_score: number; // 0-1, measures importance to user
  last_active_at: string; // ISO8601
  user_pinned: boolean; // If true, prevent automatic lifecycle transitions
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
}

export interface Entity {
  id: string; // Unique identifier (usually UID from frontmatter)
  uid?: string; // Alias for id
  vault_path: string; // Relative path in vault
  title: string;
  content: string; // Full markdown content
  tags?: string[];
  
  // Memory & Lifecycle
  memory: MemoryMetadata;
  lifecycle_history?: LifecycleTransition[];
  
  // Security
  sensitivity: Sensitivity;
  control?: Control;
  
  // Computed
  aei_code: string; // Computed security/AI code
  
  // Relationships
  relationships?: EntityRelationship[];
}

export interface EntityRelationship {
  type: 'references' | 'related_to' | 'parent_of' | 'child_of' | 'blocks' | 'blocked_by' | string;
  target_id: string;
  weight?: number; // 0-1, strength of relationship
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Graph Query Types
// ============================================================================

export interface GraphQuery {
  from: string | string[]; // Starting entity ID(s)
  depth?: number; // How many levels to traverse (default: 1)
  relationshipTypes?: string[]; // Filter by relationship types
  direction?: 'outbound' | 'inbound' | 'any'; // Traversal direction
  filters?: {
    memory_levels?: MemoryLevel[];
    sensitivity_max?: number; // Max sensitivity level to include
    tags?: string[];
  };
}

export interface GraphQueryResult {
  entities: Entity[];
  relationships: Array<{
    from: string;
    to: string;
    type: string;
    weight?: number;
  }>;
}

// ============================================================================
// Storage & Vault Types
// ============================================================================

export interface VaultOptions {
  vaultRoot: string;
  autoComputeAeiCode?: boolean;
  emitEvents?: boolean;
  graphDbUrl?: string; // e.g., 'arangodb://localhost:8529' or 'neo4j://localhost:7687'
  vector?: {
    apiKey: string;
    indexName: string;
  };
  ai?: {
    provider: 'openai' | 'ollama';
    apiKey?: string;
    baseUrl?: string;
  };
  hooks?: MemoryEngineHooks;
}

export interface VaultScanResult {
  entities: Entity[];
  errors: Array<{
    path: string;
    error: string;
  }>;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchQuery {
  query: string;
  filters?: {
    memory_levels?: MemoryLevel[];
    sensitivity_max?: number;
    tags?: string[];
    date_from?: string; // ISO8601
    date_to?: string; // ISO8601
  };
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entity: Entity;
  score: number; // Relevance score
  highlights?: Array<{
    field: string;
    snippet: string;
  }>;
}

// ============================================================================
// Lifecycle Types
// ============================================================================

export interface LifecycleRule {
  from: MemoryLevel;
  to: MemoryLevel;
  conditions: {
    hours_inactive?: number; // Default 48
    stability_threshold?: number;
    importance_threshold?: number;
  };
}

export interface LifecycleEngineOptions {
  rules?: LifecycleRule[];
  enableAutoTransitions?: boolean; // Default true
  transitionIntervalHours?: number; // How often to check (default 1)
}

// ============================================================================
// Events
// ============================================================================

export type EntityEventType = 
  | 'entity:created'
  | 'entity:updated'
  | 'entity:deleted'
  | 'lifecycle:transition'
  | 'relationship:created'
  | 'relationship:deleted';

export interface EntityEvent {
  type: EntityEventType;
  entityId: string;
  timestamp: string; // ISO8601
  data?: unknown;
}

// ============================================================================
// Embedding & Vector Types
// ============================================================================

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
  dimensions: number;
}

export interface VectorIndexEntry {
  id: string;
  vector: number[];
  aei_code: string;
  memory_level: MemoryLevel;
  sensitivity_level: number;
  vault_path: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncOptions {
  enabled: boolean;
  endpoint?: string;
  authToken?: string;
  syncInterval?: number; // Minutes
  respectExportFlag?: boolean; // Only sync entities with export_allowed=true
}

export interface SyncConflict {
  entityId: string;
  localVersion: Entity;
  remoteVersion: Entity;
  timestamp: string;
}

export type ConflictResolutionStrategy = 'local' | 'remote' | 'merge' | 'manual';

// ============================================================================
// API Response Types
// ============================================================================

export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============================================================================
// Plugin Hooks
// ============================================================================

export interface MemoryEngineHooks {
  beforeEntityCreate?: (entity: Partial<Entity>) => Promise<Partial<Entity>>;
  afterEntityCreate?: (entity: Entity) => Promise<void>;
  beforeEntityUpdate?: (id: string, updates: Partial<Entity>) => Promise<Partial<Entity>>;
  afterEntityUpdate?: (entity: Entity) => Promise<void>;
  beforeEntityDelete?: (id: string) => Promise<boolean>; // Return false to cancel
  afterEntityDelete?: (id: string) => Promise<void>;
  onLifecycleTransition?: (entity: Entity, from: LifecycleState, to: LifecycleState) => Promise<void>;
}
