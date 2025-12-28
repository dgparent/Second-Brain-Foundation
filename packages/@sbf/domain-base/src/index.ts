/**
 * @sbf/domain-base
 * 
 * Base entity patterns with auto-timestamps, auto-embedding, and CRUD operations.
 * 
 * @example
 * ```typescript
 * import { BaseEntity, EmbeddableEntity, SingletonEntity } from '@sbf/domain-base';
 * 
 * // Regular entity with auto-timestamps
 * class User extends BaseEntity {
 *   static tableName = 'users';
 *   name: string;
 *   email: string;
 * }
 * 
 * // Entity with auto-embedding
 * class Note extends EmbeddableEntity {
 *   static tableName = 'notes';
 *   static autoEmbedding = true;
 *   content: string;
 *   
 *   getEmbeddingContent() { return this.content; }
 * }
 * 
 * // Singleton/config entity
 * class AppConfig extends SingletonEntity {
 *   static tableName = 'app_config';
 *   key: string;
 *   
 *   getRecordId() { return this.key; }
 * }
 * ```
 */

// Types
export * from './types';

// Utilities
export * from './utils';

// Entity classes
export { BaseEntity, type BaseEntityConfig, type EntityStatic } from './BaseEntity';
export { EmbeddableEntity, type EmbeddableConfig } from './EmbeddableEntity';
export { SingletonEntity } from './SingletonEntity';
