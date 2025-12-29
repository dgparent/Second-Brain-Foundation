/**
 * @sbf/obsidian-plugin - Type Definitions
 * 
 * Type definitions for the SBF Companion Plugin.
 * Per PRD Epic 4 Story 4.1: Obsidian Companion Plugin
 */

// ============================================================================
// PLUGIN SETTINGS
// ============================================================================

/**
 * Plugin settings stored in Obsidian
 */
export interface SBFPluginSettings {
  /** SBF API endpoint URL */
  apiUrl: string;
  /** API key for authentication */
  apiKey: string;
  /** Auto-sync interval in minutes (0 = disabled) */
  autoSyncInterval: number;
  /** Sync direction preference */
  syncDirection: 'bidirectional' | 'up' | 'down';
  /** Default conflict resolution strategy */
  conflictResolution: 'ask' | 'local' | 'remote' | 'newest';
  /** Default sensitivity for new entities */
  defaultSensitivity: SensitivityLevel;
  /** Enable sync status in status bar */
  showStatusBar: boolean;
  /** Folders to exclude from sync */
  excludeFolders: string[];
  /** File patterns to exclude from sync */
  excludePatterns: string[];
  /** Convert wikilinks to SBF links on upload */
  convertLinks: boolean;
  /** Show sync notifications */
  showNotifications: boolean;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: SBFPluginSettings = {
  apiUrl: 'https://api.secondbrainfoundation.com',
  apiKey: '',
  autoSyncInterval: 0,
  syncDirection: 'bidirectional',
  conflictResolution: 'ask',
  defaultSensitivity: 'personal',
  showStatusBar: true,
  excludeFolders: ['.obsidian', '.git', 'templates'],
  excludePatterns: ['*.excalidraw.md', '*.canvas'],
  convertLinks: true,
  showNotifications: true,
};

// ============================================================================
// SENSITIVITY & PRIVACY (FR15-FR19)
// ============================================================================

/**
 * Entity sensitivity levels per PRD FR15-FR17
 */
export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

/**
 * Entity lifecycle states per PRD FR6
 */
export type LifecycleState = 'fleeting' | 'maturing' | 'evergreen' | 'archived';

// ============================================================================
// FRONTMATTER (YAML)
// ============================================================================

/**
 * SBF-compatible frontmatter structure
 * Per PRD FR6-FR9, FR18-FR19
 */
export interface SBFFrontmatter {
  /** Unique entity ID: {type}-{slug}-{counter} (FR10) */
  uid?: string;
  /** Entity type (person, topic, project, etc.) */
  type?: string;
  /** Display title */
  title?: string;
  /** Creation timestamp */
  created?: string;
  /** Last modified timestamp */
  modified?: string;
  /** Alternate names for linking */
  aliases?: string[];
  /** Tags for categorization */
  tags?: string[];
  /** Sensitivity level (FR15-FR17) */
  sensitivity?: SensitivityLevel;
  /** Lifecycle state (FR6) */
  lifecycle?: LifecycleState;
  /** BMOM framework fields (FR18-FR19) */
  bmom?: BMOMFields;
  /** Entity relationships (FR11-FR12) */
  relationships?: EntityRelationships;
  /** AI confidence score (FR25): 0.0-1.0 */
  confidence?: number;
  /** Content checksum (FR24) */
  checksum?: string;
  /** SBF sync metadata */
  sbf?: SBFSyncMetadata;
}

/**
 * BMOM Framework fields per PRD FR18-FR19
 * Because-Meaning-Outcome-Measure
 */
export interface BMOMFields {
  /** Why is this entity important? */
  because?: string;
  /** What meaning does this have? */
  meaning?: string;
  /** What outcome is expected? */
  outcome?: string;
  /** How will success be measured? */
  measure?: string;
}

/**
 * Entity relationships per PRD FR11-FR12
 */
export interface EntityRelationships {
  /** Direct relationships to other entities */
  related_to?: string[];
  /** Mentions within content */
  mentioned?: string[];
  /** Entities that cite this one */
  cited_by?: string[];
  /** Parent entity (for hierarchies) */
  parent?: string;
  /** Child entities */
  children?: string[];
}

/**
 * SBF sync metadata stored in frontmatter
 */
export interface SBFSyncMetadata {
  /** Last sync timestamp */
  lastSync?: string;
  /** Remote checksum at last sync */
  remoteChecksum?: string;
  /** Remote version at last sync */
  remoteVersion?: number;
  /** Sync status */
  status?: 'synced' | 'modified' | 'conflict' | 'new';
}

// ============================================================================
// VAULT STRUCTURE
// ============================================================================

/**
 * SBF folder structure per PRD FR1-FR5
 */
export const SBF_FOLDERS = [
  'Daily',
  'People',
  'Places',
  'Topics',
  'Projects',
  'Transitional',
] as const;

export type SBFFolder = (typeof SBF_FOLDERS)[number];

/**
 * Mapping from folder name to entity type
 */
export const FOLDER_TO_TYPE: Record<string, string> = {
  daily: 'note',
  people: 'person',
  places: 'place',
  topics: 'topic',
  projects: 'project',
  transitional: 'transitional',
};

/**
 * Mapping from entity type to folder name
 */
export const TYPE_TO_FOLDER: Record<string, string> = {
  note: 'Daily',
  person: 'People',
  place: 'Places',
  topic: 'Topics',
  project: 'Projects',
  transitional: 'Transitional',
};

/**
 * Vault folder structure analysis result
 */
export interface SBFFolderStructure {
  /** Whether vault has SBF folder structure */
  hasStructure: boolean;
  /** Notes organized by folder */
  folders: Record<string, VaultNote[]>;
  /** Files not in SBF folders */
  unmappedFiles: string[];
}

/**
 * Representation of a vault note
 */
export interface VaultNote {
  /** Full path within vault */
  path: string;
  /** Filename without extension */
  name: string;
  /** Full content including frontmatter */
  content: string;
  /** Last modified timestamp (ms) */
  mtime: number;
  /** Parsed frontmatter */
  frontmatter?: SBFFrontmatter;
  /** Content without frontmatter */
  body?: string;
}

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Sync operation options
 */
export interface SyncOptions {
  /** Sync direction */
  direction: 'up' | 'down' | 'bidirectional';
  /** Conflict resolution strategy */
  conflictResolution: 'local' | 'remote' | 'newest' | 'ask';
  /** Preview without making changes */
  dryRun?: boolean;
  /** Specific paths to sync (empty = all) */
  paths?: string[];
  /** Force sync even if no changes detected */
  force?: boolean;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  /** Number of files uploaded to SBF */
  uploaded: number;
  /** Number of files downloaded from SBF */
  downloaded: number;
  /** Number of files with conflicts */
  conflicts: SyncConflict[];
  /** Errors during sync */
  errors: SyncError[];
  /** Start time */
  startedAt: Date;
  /** End time */
  completedAt: Date;
}

/**
 * Sync conflict information
 */
export interface SyncConflict {
  /** Local file path */
  localPath: string;
  /** Local file content */
  localContent: string;
  /** Local modification time */
  localMtime: number;
  /** Remote entity UID */
  remoteUid: string;
  /** Remote entity content */
  remoteContent: string;
  /** Remote modification time */
  remoteMtime: number;
  /** Type of conflict */
  type: 'content' | 'deleted-local' | 'deleted-remote';
  /** Resolution chosen (if resolved) */
  resolution?: 'local' | 'remote' | 'merge';
}

/**
 * Sync error information
 */
export interface SyncError {
  /** File path that caused error */
  path: string;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Whether error is recoverable */
  recoverable: boolean;
}

/**
 * Sync plan before execution
 */
export interface SyncPlan {
  /** Files to upload to SBF */
  toUpload: VaultNote[];
  /** Entities to download from SBF */
  toDownload: RemoteEntity[];
  /** Conflicts requiring resolution */
  conflicts: SyncConflict[];
  /** Files unchanged (for stats) */
  unchanged: number;
}

// ============================================================================
// WIKILINKS
// ============================================================================

/**
 * Wikilink match from content parsing
 */
export interface WikilinkMatch {
  /** Original matched text (e.g., "[[Page|Display]]") */
  original: string;
  /** Target page name */
  target: string;
  /** Display text (or target if not specified) */
  display: string;
  /** Link type */
  type: 'wikilink' | 'sbf-link';
  /** Position in content */
  position?: { start: number; end: number };
}

/**
 * Resolved wikilink with UID
 */
export interface ResolvedLink extends WikilinkMatch {
  /** Resolved SBF UID */
  uid: string | null;
  /** Resolved file path */
  path: string | null;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Remote entity from SBF API
 */
export interface RemoteEntity {
  /** Unique identifier */
  uid: string;
  /** Entity type */
  type: string;
  /** Display title */
  title: string;
  /** Content in Markdown */
  content: string;
  /** Sensitivity level */
  sensitivity: SensitivityLevel;
  /** Lifecycle state */
  lifecycle?: LifecycleState;
  /** BMOM fields */
  bmom?: BMOMFields;
  /** Relationships */
  relationships?: EntityRelationships;
  /** Tags */
  tags?: string[];
  /** AI confidence score */
  confidence?: number;
  /** Content checksum */
  checksum?: string;
  /** Version number */
  version: number;
  /** Creation timestamp (ISO) */
  created_at: string;
  /** Last update timestamp (ISO) */
  updated_at: string;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Entity creation/update request
 */
export interface EntityUpsertRequest {
  /** Unique identifier (generated if not provided) */
  uid?: string;
  /** Entity type */
  type: string;
  /** Display title */
  title: string;
  /** Content in Markdown */
  content: string;
  /** Sensitivity level */
  sensitivity: SensitivityLevel;
  /** Lifecycle state */
  lifecycle?: LifecycleState;
  /** BMOM fields */
  bmom?: BMOMFields;
  /** Relationships */
  relationships?: EntityRelationships;
  /** Tags */
  tags?: string[];
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * API list entities request
 */
export interface ListEntitiesRequest {
  /** Filter by type */
  type?: string;
  /** Filter by sensitivity */
  sensitivity?: SensitivityLevel;
  /** Search query */
  search?: string;
  /** Pagination offset */
  offset?: number;
  /** Pagination limit */
  limit?: number;
  /** Last sync timestamp for incremental sync */
  since?: string;
}

/**
 * API list entities response
 */
export interface ListEntitiesResponse {
  /** Entities matching query */
  entities: RemoteEntity[];
  /** Total count (for pagination) */
  total: number;
  /** Offset used */
  offset: number;
  /** Limit used */
  limit: number;
}

/**
 * API error response
 */
export interface APIError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}

// ============================================================================
// STATUS & EVENTS
// ============================================================================

/**
 * Sync status for status bar display
 */
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline' | 'pending';

/**
 * Plugin events
 */
export interface PluginEvents {
  'sync:start': { options: SyncOptions };
  'sync:progress': { current: number; total: number; file: string };
  'sync:complete': { result: SyncResult };
  'sync:error': { error: Error };
  'conflict:detected': { conflict: SyncConflict };
  'conflict:resolved': { conflict: SyncConflict; resolution: string };
  'entity:created': { entity: RemoteEntity };
  'entity:updated': { entity: RemoteEntity };
  'entity:deleted': { uid: string };
  'settings:changed': { settings: Partial<SBFPluginSettings> };
}

/**
 * Event emitter interface
 */
export interface EventEmitter<T> {
  on<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, callback: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}
