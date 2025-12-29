/**
 * Entity
 * 
 * Represents a knowledge entity with UID, lifecycle state, and universal parameters.
 */

import type {
  EntityData,
  SensitivityLevel,
  TruthLevel,
  BMOMData,
} from '../types';
import { LifecycleState } from '../types';

export class Entity implements EntityData {
  static tableName = 'entities';
  
  id?: string;
  tenantId!: string;
  uid!: string;
  typeSlug!: string;
  name!: string;
  content?: string;
  summary?: string;
  
  // Universal parameters (PRD)
  sensitivity: SensitivityLevel = 'personal';
  truthLevel: TruthLevel = 'U1';
  lifecycleState: LifecycleState = LifecycleState.CAPTURED;
  
  // Lifecycle timestamps
  capturedAt!: Date;
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
  
  constructor(data?: Partial<EntityData>) {
    if (data) {
      Object.assign(this, data);
    }
    // Set defaults
    this.capturedAt = this.capturedAt ?? new Date();
    this.sensitivity = this.sensitivity ?? 'personal';
    this.truthLevel = this.truthLevel ?? 'U1';
    this.lifecycleState = this.lifecycleState ?? LifecycleState.CAPTURED;
  }
  
  /**
   * Get age of entity in hours since capture
   */
  getAgeInHours(): number {
    const now = Date.now();
    const captured = this.capturedAt.getTime();
    return (now - captured) / (1000 * 60 * 60);
  }
  
  /**
   * Check if entity is ready for transition (48+ hours old)
   */
  isReadyForTransition(): boolean {
    return (
      this.lifecycleState === LifecycleState.CAPTURED &&
      this.getAgeInHours() >= 48
    );
  }
  
  /**
   * Check if entity has been filed
   */
  isFiled(): boolean {
    return this.lifecycleState === LifecycleState.PERMANENT;
  }
  
  /**
   * Check if entity is archived
   */
  isArchived(): boolean {
    return this.lifecycleState === LifecycleState.ARCHIVED;
  }
  
  /**
   * Validate entity data
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.tenantId) {
      errors.push('Tenant ID is required');
    }
    
    if (!this.uid) {
      errors.push('UID is required');
    } else if (!/^[a-z]+-[a-z0-9-]+-\d{3,}$/.test(this.uid)) {
      errors.push('UID must be in format {type}-{slug}-{counter}');
    }
    
    if (!this.typeSlug) {
      errors.push('Type slug is required');
    }
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    const validSensitivities: SensitivityLevel[] = ['public', 'personal', 'confidential', 'secret'];
    if (!validSensitivities.includes(this.sensitivity)) {
      errors.push('Invalid sensitivity level');
    }
    
    const validTruthLevels: TruthLevel[] = ['L1', 'L2', 'L3', 'U1', 'U2', 'U3'];
    if (!validTruthLevels.includes(this.truthLevel)) {
      errors.push('Invalid truth level');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Convert to plain object for serialization
   */
  toJSON(): EntityData {
    return {
      id: this.id,
      tenantId: this.tenantId,
      uid: this.uid,
      typeSlug: this.typeSlug,
      name: this.name,
      content: this.content,
      summary: this.summary,
      sensitivity: this.sensitivity,
      truthLevel: this.truthLevel,
      lifecycleState: this.lifecycleState,
      capturedAt: this.capturedAt,
      filedAt: this.filedAt,
      archivedAt: this.archivedAt,
      metadata: this.metadata,
      bmom: this.bmom,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  
  /**
   * Create from database row
   */
  static fromRow(row: Record<string, unknown>): Entity {
    return new Entity({
      id: row.id as string,
      tenantId: row.tenant_id as string,
      uid: row.uid as string,
      typeSlug: row.type_slug as string,
      name: row.name as string,
      content: row.content as string | undefined,
      summary: row.summary as string | undefined,
      sensitivity: row.sensitivity as SensitivityLevel,
      truthLevel: row.truth_level as TruthLevel,
      lifecycleState: row.lifecycle_state as LifecycleState,
      capturedAt: row.captured_at ? new Date(row.captured_at as string) : new Date(),
      filedAt: row.filed_at ? new Date(row.filed_at as string) : undefined,
      archivedAt: row.archived_at ? new Date(row.archived_at as string) : undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata as Record<string, unknown>,
      bmom: typeof row.bmom === 'string' ? JSON.parse(row.bmom) : row.bmom as BMOMData | undefined,
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
      uid: this.uid,
      type_slug: this.typeSlug,
      name: this.name,
      content: this.content,
      summary: this.summary,
      sensitivity: this.sensitivity,
      truth_level: this.truthLevel,
      lifecycle_state: this.lifecycleState,
      captured_at: this.capturedAt?.toISOString(),
      filed_at: this.filedAt?.toISOString(),
      archived_at: this.archivedAt?.toISOString(),
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      bmom: this.bmom ? JSON.stringify(this.bmom) : null,
      embedding: this.embedding,
    };
  }
}
