/**
 * EntityRelationship
 * 
 * Represents a relationship between two entities.
 */

import type { EntityRelationship as EntityRelationshipData, RelationshipType } from '../types';

export class EntityRelationship implements EntityRelationshipData {
  static tableName = 'entity_relationships';
  
  id?: string;
  tenantId!: string;
  sourceUid!: string;
  targetUid!: string;
  relationshipType!: string;
  context?: string;
  bidirectional: boolean = false;
  confidence?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  constructor(data?: Partial<EntityRelationshipData>) {
    if (data) {
      Object.assign(this, data);
    }
    this.bidirectional = this.bidirectional ?? false;
  }
  
  /**
   * Validate the relationship
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.tenantId) {
      errors.push('Tenant ID is required');
    }
    
    if (!this.sourceUid) {
      errors.push('Source UID is required');
    }
    
    if (!this.targetUid) {
      errors.push('Target UID is required');
    }
    
    if (this.sourceUid === this.targetUid) {
      errors.push('Cannot create self-referential relationship');
    }
    
    if (!this.relationshipType) {
      errors.push('Relationship type is required');
    }
    
    if (this.confidence !== undefined && (this.confidence < 0 || this.confidence > 1)) {
      errors.push('Confidence must be between 0 and 1');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Get the inverse relationship type (if applicable)
   */
  getInverseType(): RelationshipType | null {
    const inverseMap: Partial<Record<RelationshipType, RelationshipType>> = {
      parent_of: 'child_of',
      child_of: 'parent_of',
      precedes: 'follows',
      follows: 'precedes',
    };
    
    return inverseMap[this.relationshipType as RelationshipType] || null;
  }
  
  /**
   * Check if this relationship would create a cycle
   * (This is a simplified check - full cycle detection needs graph traversal)
   */
  wouldCreateCycle(existingRelationships: EntityRelationship[]): boolean {
    // Check for immediate reverse relationship
    return existingRelationships.some(
      rel =>
        rel.sourceUid === this.targetUid &&
        rel.targetUid === this.sourceUid &&
        rel.relationshipType === this.relationshipType
    );
  }
  
  /**
   * Convert to plain object for serialization
   */
  toJSON(): EntityRelationshipData {
    return {
      id: this.id,
      tenantId: this.tenantId,
      sourceUid: this.sourceUid,
      targetUid: this.targetUid,
      relationshipType: this.relationshipType,
      context: this.context,
      bidirectional: this.bidirectional,
      confidence: this.confidence,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  
  /**
   * Create from database row
   */
  static fromRow(row: Record<string, unknown>): EntityRelationship {
    return new EntityRelationship({
      id: row.id as string,
      tenantId: row.tenant_id as string,
      sourceUid: row.source_uid as string,
      targetUid: row.target_uid as string,
      relationshipType: row.relationship_type as string,
      context: row.context as string | undefined,
      bidirectional: row.bidirectional as boolean,
      confidence: row.confidence as number | undefined,
      createdAt: row.created_at ? new Date(row.created_at as string) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at as string) : undefined,
    });
  }
  
  /**
   * Convert to database row format
   */
  toRow(): Record<string, unknown> {
    return {
      id: this.id,
      tenant_id: this.tenantId,
      source_uid: this.sourceUid,
      target_uid: this.targetUid,
      relationship_type: this.relationshipType,
      context: this.context,
      bidirectional: this.bidirectional,
      confidence: this.confidence,
    };
  }
}

/**
 * Standard relationship types vocabulary
 */
export const RELATIONSHIP_TYPES: {
  type: RelationshipType;
  label: string;
  description: string;
  bidirectional: boolean;
}[] = [
  { type: 'related_to', label: 'Related To', description: 'Generic association', bidirectional: true },
  { type: 'part_of', label: 'Part Of', description: 'Hierarchical containment', bidirectional: false },
  { type: 'works_on', label: 'Works On', description: 'Person → Project', bidirectional: false },
  { type: 'located_at', label: 'Located At', description: 'Entity → Place', bidirectional: false },
  { type: 'attended', label: 'Attended', description: 'Person → Event', bidirectional: false },
  { type: 'created_by', label: 'Created By', description: 'Artifact → Person', bidirectional: false },
  { type: 'mentions', label: 'Mentions', description: 'Content mention', bidirectional: false },
  { type: 'references', label: 'References', description: 'Explicit reference', bidirectional: false },
  { type: 'parent_of', label: 'Parent Of', description: 'Topic hierarchy', bidirectional: false },
  { type: 'child_of', label: 'Child Of', description: 'Topic hierarchy (inverse)', bidirectional: false },
  { type: 'precedes', label: 'Precedes', description: 'Temporal ordering', bidirectional: false },
  { type: 'follows', label: 'Follows', description: 'Temporal ordering (inverse)', bidirectional: false },
];
