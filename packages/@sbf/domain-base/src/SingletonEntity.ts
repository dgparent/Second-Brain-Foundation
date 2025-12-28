/**
 * @sbf/domain-base - SingletonEntity
 * 
 * Entity class for singleton/config-type entities where only one
 * instance exists per record_id within a tenant.
 */

import { DatabaseError } from '@sbf/errors';
import { BaseEntity } from './BaseEntity';
import { EntityId, TenantId, DatabaseAdapter, GetOptions } from './types';
import { rowToEntity, deepClone, toCamelCase } from './utils/serialization';

/**
 * Singleton entity class for configuration-type entities.
 * 
 * @example
 * ```typescript
 * class NotebookSettings extends SingletonEntity {
 *   static tableName = 'notebook_settings';
 *   
 *   notebookId: string;
 *   theme: string;
 *   
 *   getRecordId(): string {
 *     return this.notebookId;
 *   }
 * }
 * 
 * // Get or create singleton for a notebook
 * const settings = await NotebookSettings.getInstance('nb-123');
 * settings.theme = 'dark';
 * await settings.save();
 * 
 * // Same instance returned on subsequent calls
 * const same = await NotebookSettings.getInstance('nb-123');
 * console.log(same.theme); // 'dark'
 * ```
 */
export abstract class SingletonEntity extends BaseEntity {
  /**
   * The field name used as the record identifier
   */
  static recordIdField: string = 'record_id';
  
  /**
   * Cache of loaded instances by tenant + record_id
   */
  private static _instanceCache: Map<string, SingletonEntity> = new Map();
  
  /**
   * Get the record ID for this singleton (must be implemented by subclass)
   */
  abstract getRecordId(): string;
  
  /**
   * Get the cache key for this instance
   */
  protected getCacheKey(): string {
    return `${this.tenantId}:${this.getRecordId()}`;
  }
  
  /**
   * Clear the instance cache (for testing)
   */
  static clearCache(): void {
    this._instanceCache.clear();
  }
  
  /**
   * Get cached instance
   */
  static getCached<T extends SingletonEntity>(
    tenantId: TenantId,
    recordId: string
  ): T | null {
    const key = `${tenantId}:${recordId}`;
    return this._instanceCache.get(key) as T | undefined || null;
  }
  
  /**
   * Cache an instance
   */
  static setCached<T extends SingletonEntity>(instance: T): void {
    const key = instance.getCacheKey();
    this._instanceCache.set(key, instance);
  }
  
  /**
   * Remove instance from cache
   */
  static removeCached(tenantId: TenantId, recordId: string): void {
    const key = `${tenantId}:${recordId}`;
    this._instanceCache.delete(key);
  }
  
  /**
   * Save the entity and update cache
   */
  async save(): Promise<this> {
    await super.save();
    
    // Update cache
    const ctor = this.constructor as typeof SingletonEntity;
    ctor.setCached(this);
    
    return this;
  }
  
  /**
   * Delete and remove from cache
   */
  async delete(): Promise<boolean> {
    const ctor = this.constructor as typeof SingletonEntity;
    ctor.removeCached(this.tenantId, this.getRecordId());
    
    return super.delete();
  }
  
  /**
   * Get or create singleton instance for a record ID
   */
  static async getInstance<T extends SingletonEntity>(
    this: {
      new (data: Partial<T>): T;
      tableName: string;
      recordIdField: string;
      getDb(): DatabaseAdapter;
      getTenantId(): TenantId;
    },
    recordId: string,
    options: GetOptions & { defaults?: Partial<T> } = {}
  ): Promise<T> {
    const db = (this as unknown as typeof SingletonEntity).getDb();
    const tenantId = options.tenantId || (this as unknown as typeof SingletonEntity).getTenantId();
    
    // Check cache first (always use base class cache)
    const cached = SingletonEntity.getCached<T>(tenantId, recordId);
    if (cached) {
      return cached;
    }
    
    await db.setTenantContext(tenantId);
    
    // Try to find existing
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE ${this.recordIdField} = $1`,
      [recordId]
    );
    
    if (row) {
      const entity = new this(rowToEntity<Partial<T>>(row));
      (entity as SingletonEntity)._isNew = false;
      (entity as SingletonEntity)._original = deepClone(row);
      (entity as SingletonEntity).tenantId = tenantId;
      
      // Cache and return
      SingletonEntity.setCached(entity);
      return entity;
    }
    
    // Create new instance with defaults
    // Convert recordIdField from snake_case to camelCase for entity constructor
    const recordIdFieldCamel = toCamelCase(this.recordIdField);
    const entity = new this({
      ...options.defaults,
      tenantId,
      [recordIdFieldCamel]: recordId,
    } as Partial<T>);
    
    return entity;
  }
  
  /**
   * Get singleton if it exists, null otherwise
   */
  static async getInstanceIfExists<T extends SingletonEntity>(
    this: {
      new (data: Partial<T>): T;
      tableName: string;
      recordIdField: string;
      getDb(): DatabaseAdapter;
      getTenantId(): TenantId;
    },
    recordId: string,
    options: GetOptions = {}
  ): Promise<T | null> {
    const db = (this as unknown as typeof SingletonEntity).getDb();
    const tenantId = options.tenantId || (this as unknown as typeof SingletonEntity).getTenantId();
    
    // Check cache first (always use base class cache)
    const cached = SingletonEntity.getCached<T>(tenantId, recordId);
    if (cached) {
      return cached;
    }
    
    await db.setTenantContext(tenantId);
    
    const row = await db.queryOne<Record<string, unknown>>(
      `SELECT * FROM ${this.tableName} WHERE ${this.recordIdField} = $1`,
      [recordId]
    );
    
    if (!row) {
      return null;
    }
    
    const entity = new this(rowToEntity<Partial<T>>(row));
    (entity as SingletonEntity)._isNew = false;
    (entity as SingletonEntity)._original = deepClone(row);
    (entity as SingletonEntity).tenantId = tenantId;
    
    // Cache and return
    SingletonEntity.setCached(entity);
    return entity;
  }
  
  /**
   * Delete singleton by record ID
   */
  static async deleteInstance<T extends SingletonEntity>(
    this: {
      tableName: string;
      recordIdField: string;
      getDb(): DatabaseAdapter;
      getTenantId(): TenantId;
    },
    recordId: string,
    options: GetOptions = {}
  ): Promise<boolean> {
    const db = (this as unknown as typeof SingletonEntity).getDb();
    const tenantId = options.tenantId || (this as unknown as typeof SingletonEntity).getTenantId();
    
    // Remove from cache
    (this as unknown as typeof SingletonEntity).removeCached(tenantId, recordId);
    
    await db.setTenantContext(tenantId);
    
    const result = await db.query<{ id: string }>(
      `DELETE FROM ${(this as unknown as typeof SingletonEntity).tableName} 
       WHERE ${(this as unknown as typeof SingletonEntity).recordIdField} = $1 
       RETURNING id`,
      [recordId]
    );
    
    return result.length > 0;
  }
}
