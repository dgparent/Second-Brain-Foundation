/**
 * Typed Relationship System
 * Implements semantic graph relationships
 */

export type RelationshipType =
  // Content relationships
  | 'informs'
  | 'uses'
  | 'cites'
  | 'references'
  | 'contradicts'
  | 'extends'
  
  // Structural relationships
  | 'part_of'
  | 'subproject_of'
  | 'depends_on'
  | 'blocks'
  | 'relates_to'
  
  // Authorship & ownership
  | 'authored_by'
  | 'owned_by'
  | 'assigned_to'
  | 'reviewed_by'
  
  // Temporal relationships
  | 'occurs_at'
  | 'follows'
  | 'precedes'
  
  // Collaboration
  | 'collaborates_with'
  | 'mentioned_in'
  
  // Metadata
  | 'duplicates'
  | 'supersedes'
  | 'archived_from'
  
  // Extensible (plugin-defined)
  | string;

export interface Relationship {
  type: RelationshipType;
  source_uid: string;
  target_uid: string;
  created: string;         // ISO8601 timestamp
  metadata?: {
    confidence?: number;   // 0.0-1.0 for AI-inferred relationships
    bidirectional?: boolean;
    strength?: number;     // 1-5 for relationship importance
    notes?: string;
  };
}

export interface RelationshipQuery {
  source_uid?: string;
  target_uid?: string;
  type?: RelationshipType | RelationshipType[];
  bidirectional?: boolean;
  depth?: number;          // For graph traversal
}

export interface RelationshipPath {
  nodes: string[];         // Array of entity UIDs
  edges: Relationship[];
  total_strength: number;
}

export const RELATIONSHIP_DEFINITIONS: Record<RelationshipType, {
  description: string;
  bidirectional: boolean;
  inverse?: RelationshipType;
}> = {
  informs: {
    description: 'This entity provides information for the target entity',
    bidirectional: false,
  },
  uses: {
    description: 'This entity uses the target entity',
    bidirectional: false,
  },
  cites: {
    description: 'This entity cites the target as a source',
    bidirectional: false,
  },
  part_of: {
    description: 'This entity is a component of the target',
    bidirectional: false,
    inverse: 'contains',
  },
  authored_by: {
    description: 'This entity was created by the target person',
    bidirectional: false,
    inverse: 'authored',
  },
  collaborates_with: {
    description: 'This entity collaborates with the target',
    bidirectional: true,
  },
  // Add more as needed
};
