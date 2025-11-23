/**
 * Entity Type Definitions
 * Core types for Second Brain Foundation entities
 */

export type EntityType = 
  | 'person'
  | 'place'
  | 'topic'
  | 'project'
  | 'source'
  | 'artifact'
  | 'event'
  | 'task'
  | 'process'
  | 'daily-note';

export type LifecycleState = 'capture' | 'transitional' | 'permanent' | 'archived';

export type SensitivityLevel = 'public' | 'personal' | 'confidential' | 'secret';

export type RelationType =
  | 'informs'
  | 'uses'
  | 'occurs_at'
  | 'authored_by'
  | 'cites'
  | 'subproject_of'
  | 'part_of'
  | 'depends_on'
  | 'blocks'
  | 'collaborates_with'
  | 'mentioned_in'
  | 'duplicates'
  | 'related_to';

export interface Relationship {
  type: RelationType;
  target: string; // UID
}

export interface Privacy {
  cloud_ai_allowed: boolean;
  local_ai_allowed: boolean;
  export_allowed: boolean;
}

export interface Sensitivity {
  level: SensitivityLevel;
  privacy: Privacy;
}

export interface Lifecycle {
  state: LifecycleState;
  review_at?: string; // ISO8601
  dissolve_at?: string; // ISO8601
}

export interface Override {
  human_last?: string; // ISO8601
  prevent_dissolve?: boolean;
}

export interface BMOM {
  because: string;
  meaning: string;
  outcome: string;
  measure: string;
}

export interface Provenance {
  sources: string[];
  confidence: number; // 0.0-1.0
}

/**
 * Universal Entity Interface
 * All entities in SBF conform to this structure
 */
export interface Entity {
  uid: string;
  type: EntityType;
  title: string;
  aliases?: string[];
  created: string; // ISO8601
  updated: string; // ISO8601
  lifecycle: Lifecycle;
  sensitivity: Sensitivity;
  rel?: Relationship[];
  provenance?: Provenance;
  status?: string;
  importance?: number; // 1-5
  owner?: string;
  stakeholders?: string[];
  bmom?: BMOM;
  checksum?: string;
  override?: Override;
  tool?: {
    compat: string[];
  };
  tags?: string[];
  content?: string; // Markdown content
}

/**
 * Vault Configuration
 */
export interface VaultConfig {
  path: string;
  name: string;
  created: string;
  version: string;
}

/**
 * UID Generation
 */
export interface UIDPattern {
  type: EntityType;
  slug: string;
  counter: number;
}
