/**
 * @sbf/cli - Type Definitions
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * CLI configuration stored in .sbf/config.json
 */
export interface CLIConfig {
  /** SBF API endpoint URL */
  apiUrl: string;
  /** API key for authentication */
  apiKey?: string;
  /** Path to vault/workspace */
  vaultPath: string;
  /** Default sensitivity for new entities */
  defaultSensitivity: SensitivityLevel;
  /** Default entity type */
  defaultType?: string;
}

/**
 * Default CLI configuration
 */
export const DEFAULT_CONFIG: CLIConfig = {
  apiUrl: 'https://api.secondbrainfoundation.com',
  vaultPath: process.cwd(),
  defaultSensitivity: 'personal',
};

/**
 * SBF folder structure
 */
export const SBF_FOLDERS = [
  'Daily',
  'People',
  'Places',
  'Topics',
  'Projects',
  'Transitional',
] as const;

// ============================================================================
// ENTITIES
// ============================================================================

/**
 * Entity sensitivity levels
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Entity lifecycle states
 */
export type LifecycleState = 'fleeting' | 'maturing' | 'evergreen' | 'archived';

/**
 * Entity types
 */
export type EntityType = 'note' | 'person' | 'place' | 'topic' | 'project' | 'transitional';

/**
 * BMOM framework fields
 */
export interface BMOMFields {
  because?: string;
  meaning?: string;
  outcome?: string;
  measure?: string;
}

/**
 * Entity relationships
 */
export interface EntityRelationships {
  related_to?: string[];
  mentioned?: string[];
  cited_by?: string[];
  parent?: string;
  children?: string[];
}

/**
 * Remote entity from API
 */
export interface RemoteEntity {
  uid: string;
  type: string;
  title: string;
  content: string;
  sensitivity: SensitivityLevel;
  lifecycle?: LifecycleState;
  bmom?: BMOMFields;
  relationships?: EntityRelationships;
  tags?: string[];
  confidence?: number;
  checksum?: string;
  version: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Entity creation request
 */
export interface CreateEntityRequest {
  uid?: string;
  type: string;
  title: string;
  content: string;
  sensitivity: SensitivityLevel;
  lifecycle?: LifecycleState;
  bmom?: BMOMFields;
  relationships?: EntityRelationships;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Entity list request
 */
export interface ListEntitiesRequest {
  type?: string;
  sensitivity?: SensitivityLevel;
  search?: string;
  offset?: number;
  limit?: number;
}

/**
 * Entity list response
 */
export interface ListEntitiesResponse {
  entities: RemoteEntity[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search request
 */
export interface SearchRequest {
  query: string;
  type?: string;
  limit?: number;
  hybrid?: boolean;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  entity: RemoteEntity;
  score: number;
  highlights?: string[];
}

/**
 * Search response
 */
export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  query: string;
}

// ============================================================================
// CHAT
// ============================================================================

/**
 * Chat request
 */
export interface ChatRequest {
  message: string;
  sourceUids?: string[];
  includeContext?: boolean;
  modelOverride?: string;
}

/**
 * Chat citation
 */
export interface ChatCitation {
  uid: string;
  title: string;
  excerpt?: string;
}

/**
 * Chat response
 */
export interface ChatResponse {
  answer: string;
  citations?: ChatCitation[];
  modelUsed?: string;
  tokensUsed?: number;
}

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

/**
 * Import analysis result
 */
export interface ImportAnalysis {
  noteCount: number;
  folderCount: number;
  linkCount: number;
  uniqueTags: string[];
  estimatedEntities: number;
  warnings?: string[];
}

/**
 * Import options
 */
export interface ImportOptions {
  dryRun?: boolean;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Import result
 */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Export options
 */
export interface ExportOptions {
  outputPath: string;
  sourceUids?: string[];
  format?: 'notebooklm' | 'markdown' | 'json';
}

/**
 * Export result
 */
export interface ExportResult {
  fileCount: number;
  totalSize: number;
}

// ============================================================================
// API
// ============================================================================

/**
 * API error
 */
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API client options
 */
export interface APIClientOptions {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}
