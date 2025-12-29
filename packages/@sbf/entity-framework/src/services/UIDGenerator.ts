/**
 * UIDGenerator Service
 * 
 * Generates PRD-compliant unique identifiers in format: {type}-{slug}-{counter}
 * Example: person-john-smith-001, project-website-redesign-042
 */

import type { DatabaseAdapter } from './EntityTypeRegistry';
import type { UIDComponents } from '../types';

export interface UIDGeneratorConfig {
  counterPadding?: number; // Default: 3 (e.g., 001)
  maxSlugLength?: number;  // Default: 50
}

export class UIDGenerator {
  private db: DatabaseAdapter;
  private config: UIDGeneratorConfig;
  
  constructor(db: DatabaseAdapter, config: UIDGeneratorConfig = {}) {
    this.db = db;
    this.config = {
      counterPadding: config.counterPadding ?? 3,
      maxSlugLength: config.maxSlugLength ?? 50,
    };
  }
  
  /**
   * Generate a PRD-compliant UID in format: {type}-{slug}-{counter}
   */
  async generateUID(
    tenantId: string,
    typeSlug: string,
    name: string
  ): Promise<string> {
    // Generate slug from name
    const nameSlug = this.slugify(name);
    
    // Increment counter atomically
    const counter = await this.incrementCounter(tenantId, typeSlug);
    
    // Format: {type}-{name-slug}-{counter}
    const paddedCounter = counter.toString().padStart(this.config.counterPadding!, '0');
    const uid = `${typeSlug}-${nameSlug}-${paddedCounter}`;
    
    return uid;
  }
  
  /**
   * Generate a UID without incrementing the counter (for preview/validation)
   */
  async previewUID(
    tenantId: string,
    typeSlug: string,
    name: string
  ): Promise<string> {
    const nameSlug = this.slugify(name);
    const nextCounter = await this.peekCounter(tenantId, typeSlug);
    const paddedCounter = nextCounter.toString().padStart(this.config.counterPadding!, '0');
    
    return `${typeSlug}-${nameSlug}-${paddedCounter}`;
  }
  
  /**
   * Parse a UID into its components
   */
  parseUID(uid: string): UIDComponents | null {
    // Match pattern: {type}-{slug}-{counter}
    // Type is lowercase letters only
    // Slug is lowercase alphanumeric with hyphens
    // Counter is digits (3+)
    const match = uid.match(/^([a-z]+)-(.+)-(\d{3,})$/);
    if (!match) return null;
    
    return {
      type: match[1],
      slug: match[2],
      counter: parseInt(match[3], 10),
    };
  }
  
  /**
   * Validate a UID format
   */
  isValidUID(uid: string): boolean {
    return /^[a-z]+-[a-z0-9-]+-\d{3,}$/.test(uid);
  }
  
  /**
   * Check if a UID exists in the database
   */
  async uidExists(tenantId: string, uid: string): Promise<boolean> {
    const result = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM entities WHERE tenant_id = $1 AND uid = $2`,
      [tenantId, uid]
    );
    
    return result.rows[0].count > 0;
  }
  
  /**
   * Generate a slug from text
   */
  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')                   // Decompose accents
      .replace(/[\u0300-\u036f]/g, '')    // Remove accents
      .replace(/[^\w\s-]/g, '')           // Remove special characters
      .replace(/\s+/g, '-')               // Replace spaces with hyphens
      .replace(/-+/g, '-')                // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')              // Remove leading/trailing hyphens
      .substring(0, this.config.maxSlugLength!);
  }
  
  /**
   * Increment the UID counter for a type atomically
   */
  private async incrementCounter(tenantId: string, typeSlug: string): Promise<number> {
    // First try tenant-specific type
    let result = await this.db.query<{ uid_counter: number }>(
      `UPDATE entity_types 
       SET uid_counter = uid_counter + 1 
       WHERE tenant_id = $1 AND slug = $2
       RETURNING uid_counter`,
      [tenantId, typeSlug]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].uid_counter;
    }
    
    // Fall back to system type
    result = await this.db.query<{ uid_counter: number }>(
      `UPDATE entity_types 
       SET uid_counter = uid_counter + 1 
       WHERE is_system = true AND slug = $1
       RETURNING uid_counter`,
      [typeSlug]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Unknown entity type: ${typeSlug}`);
    }
    
    return result.rows[0].uid_counter;
  }
  
  /**
   * Peek at the next counter value without incrementing
   */
  private async peekCounter(tenantId: string, typeSlug: string): Promise<number> {
    // First try tenant-specific type
    let result = await this.db.query<{ uid_counter: number }>(
      `SELECT uid_counter FROM entity_types 
       WHERE tenant_id = $1 AND slug = $2`,
      [tenantId, typeSlug]
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].uid_counter + 1;
    }
    
    // Fall back to system type
    result = await this.db.query<{ uid_counter: number }>(
      `SELECT uid_counter FROM entity_types 
       WHERE is_system = true AND slug = $1`,
      [typeSlug]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Unknown entity type: ${typeSlug}`);
    }
    
    return result.rows[0].uid_counter + 1;
  }
  
  /**
   * Extract type from UID
   */
  extractType(uid: string): string | null {
    const components = this.parseUID(uid);
    return components?.type ?? null;
  }
  
  /**
   * Normalize a UID (lowercase, trim)
   */
  normalizeUID(uid: string): string {
    return uid.toLowerCase().trim();
  }
}
