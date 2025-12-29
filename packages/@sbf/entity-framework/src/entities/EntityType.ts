/**
 * EntityType Entity
 * 
 * Represents an entity type definition with schema, template, and UID counter.
 */

import type { EntityTypeSchema, EntityTypeData } from '../types';

export class EntityType implements EntityTypeData {
  static tableName = 'entity_types';
  
  id?: string;
  tenantId?: string;
  name!: string;
  slug!: string;
  description?: string;
  icon!: string;
  color!: string;
  folderPath!: string;
  schema!: EntityTypeSchema;
  template!: string;
  uidCounter!: number;
  isSystem!: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  constructor(data?: Partial<EntityTypeData>) {
    if (data) {
      Object.assign(this, data);
    }
    // Set defaults
    this.uidCounter = this.uidCounter ?? 0;
    this.isSystem = this.isSystem ?? false;
    this.schema = this.schema ?? { properties: {} };
  }
  
  /**
   * Validate the entity type configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (!this.slug || !/^[a-z][a-z0-9-]*$/.test(this.slug)) {
      errors.push('Slug must be lowercase alphanumeric with hyphens, starting with a letter');
    }
    
    if (!this.icon) {
      errors.push('Icon is required');
    }
    
    if (!this.color || !/^#[0-9A-Fa-f]{6}$/.test(this.color)) {
      errors.push('Color must be a valid hex color (e.g., #3B82F6)');
    }
    
    if (!this.folderPath) {
      errors.push('Folder path is required');
    }
    
    if (!this.template) {
      errors.push('Template is required');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Convert to plain object for serialization
   */
  toJSON(): EntityTypeData {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      slug: this.slug,
      description: this.description,
      icon: this.icon,
      color: this.color,
      folderPath: this.folderPath,
      schema: this.schema,
      template: this.template,
      uidCounter: this.uidCounter,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  
  /**
   * Create from database row
   */
  static fromRow(row: Record<string, unknown>): EntityType {
    return new EntityType({
      id: row.id as string,
      tenantId: row.tenant_id as string | undefined,
      name: row.name as string,
      slug: row.slug as string,
      description: row.description as string | undefined,
      icon: row.icon as string,
      color: row.color as string,
      folderPath: row.folder_path as string,
      schema: typeof row.schema === 'string' ? JSON.parse(row.schema) : row.schema as EntityTypeSchema,
      template: row.template as string,
      uidCounter: row.uid_counter as number,
      isSystem: row.is_system as boolean,
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
      name: this.name,
      slug: this.slug,
      description: this.description,
      icon: this.icon,
      color: this.color,
      folder_path: this.folderPath,
      schema: JSON.stringify(this.schema),
      template: this.template,
      uid_counter: this.uidCounter,
      is_system: this.isSystem,
    };
  }
}
