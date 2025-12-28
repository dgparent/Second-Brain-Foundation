/**
 * @sbf/domain-base - EmbeddableEntity
 * 
 * Entity class that supports automatic embedding generation on save.
 */

import { EmbeddingError } from '@sbf/errors';
import { BaseEntity } from './BaseEntity';
import { EmbeddingProvider, ISO8601, SaveOptions } from './types';
import { now } from './utils/timestamps';

/**
 * Configuration for embeddable entities
 */
export interface EmbeddableConfig {
  /**
   * Enable automatic embedding generation on save
   */
  autoEmbedding?: boolean;
  
  /**
   * Embedding provider instance
   */
  embeddingProvider?: EmbeddingProvider;
}

/**
 * Entity class with automatic embedding generation support.
 * 
 * @example
 * ```typescript
 * class Note extends EmbeddableEntity {
 *   static tableName = 'notes';
 *   static autoEmbedding = true;
 *   
 *   content: string;
 *   
 *   getEmbeddingContent(): string {
 *     return this.content;
 *   }
 * }
 * 
 * // Embedding is generated automatically on save
 * const note = new Note({ content: 'Important information...' });
 * await note.save();
 * console.log(note.embedding); // [0.1, 0.2, ...]
 * ```
 */
export abstract class EmbeddableEntity extends BaseEntity {
  /**
   * Whether to automatically generate embeddings on save
   */
  static autoEmbedding: boolean = false;
  
  /**
   * Embedding provider - set via configure()
   */
  protected static _embeddingProvider: EmbeddingProvider | null = null;
  
  /**
   * The embedding vector (stored in database or vector store)
   */
  embedding?: number[];
  
  /**
   * Timestamp when embedding was last generated
   */
  embeddingGeneratedAt?: ISO8601;
  
  /**
   * Content hash to detect when re-embedding is needed
   */
  embeddingContentHash?: string;
  
  // Instance-level embedding provider
  protected _embeddingProvider: EmbeddingProvider | null = null;
  
  /**
   * Configure the entity class with embedding provider
   */
  static configureEmbedding(provider: EmbeddingProvider): void {
    this._embeddingProvider = provider;
  }
  
  /**
   * Set instance-level embedding provider
   */
  setEmbeddingProvider(provider: EmbeddingProvider): this {
    this._embeddingProvider = provider;
    return this;
  }
  
  /**
   * Get the embedding provider for this instance
   */
  protected getEmbeddingProvider(): EmbeddingProvider | null {
    if (this._embeddingProvider) return this._embeddingProvider;
    const ctor = this.constructor as typeof EmbeddableEntity;
    return ctor._embeddingProvider;
  }
  
  /**
   * Get the content to be embedded - must be implemented by subclass
   */
  abstract getEmbeddingContent(): string;
  
  /**
   * Generate a simple hash of the content (for change detection)
   */
  protected hashContent(content: string): string {
    // Simple hash function (FNV-1a)
    let hash = 2166136261;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash = (hash * 16777619) >>> 0;
    }
    return hash.toString(16);
  }
  
  /**
   * Check if embedding needs to be regenerated
   */
  needsReembedding(): boolean {
    const content = this.getEmbeddingContent();
    const currentHash = this.hashContent(content);
    
    // No embedding yet
    if (!this.embedding || this.embedding.length === 0) {
      return true;
    }
    
    // Content changed since last embedding
    if (this.embeddingContentHash !== currentHash) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate embedding for this entity
   */
  async generateEmbedding(): Promise<number[]> {
    const provider = this.getEmbeddingProvider();
    
    if (!provider) {
      throw new EmbeddingError({
        message: 'Embedding provider not configured. Call Entity.configureEmbedding(provider) first.',
      });
    }
    
    const content = this.getEmbeddingContent();
    
    if (!content || content.trim().length === 0) {
      throw new EmbeddingError({
        message: 'Cannot generate embedding for empty content',
      });
    }
    
    try {
      this.embedding = await provider.embed(content);
      this.embeddingGeneratedAt = now();
      this.embeddingContentHash = this.hashContent(content);
      
      return this.embedding;
    } catch (error) {
      throw new EmbeddingError({
        message: 'Failed to generate embedding',
        cause: error instanceof Error ? error : undefined,
        details: {
          contentLength: content.length,
        },
      });
    }
  }
  
  /**
   * Save the entity, optionally generating embedding
   */
  async save(options: SaveOptions = {}): Promise<this> {
    const ctor = this.constructor as typeof EmbeddableEntity;
    
    // Generate embedding if auto-embedding is enabled and not skipped
    if (ctor.autoEmbedding && !options.skipEmbedding && this.needsReembedding()) {
      const provider = this.getEmbeddingProvider();
      if (provider) {
        await this.generateEmbedding();
      }
    }
    
    return super.save(options);
  }
  
  /**
   * Force re-generation of embedding
   */
  async reembed(): Promise<this> {
    await this.generateEmbedding();
    return this.save({ skipEmbedding: true }); // Already embedded
  }
}
