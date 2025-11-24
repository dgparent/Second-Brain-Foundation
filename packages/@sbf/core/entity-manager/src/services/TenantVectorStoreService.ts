// Tenant Vector Store Service
// Manages per-tenant vector database collections for embeddings and semantic search

import { Injectable, BadRequestException } from '@nestjs/common';

export interface VectorDocument {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
}

export interface VectorQueryOptions {
  limit?: number;
  filter?: Record<string, any>;
  minScore?: number;
}

export interface VectorQueryResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

@Injectable()
export class TenantVectorStoreService {
  private readonly vectorDB: any;  // Replace with actual vector DB client (Qdrant, Pinecone, etc.)

  constructor() {
    // Initialize vector DB connection
    // this.vectorDB = new VectorDBClient(process.env.VECTOR_DB_URL);
  }

  /**
   * Get collection name for a tenant and type
   * Format: {type}_{tenant_id}
   */
  private getCollectionName(tenantId: string, collectionType: string): string {
    this.validateTenantId(tenantId);
    this.validateCollectionType(collectionType);
    
    return `${collectionType}_${tenantId}`;
  }

  /**
   * Initialize vector collections for a new tenant
   * Creates separate collections for different entity types
   */
  async initializeTenantCollections(
    tenantId: string,
    dimension: number = 1536  // OpenAI embedding dimension
  ): Promise<void> {
    this.validateTenantId(tenantId);

    const collectionTypes = [
      'entities',      // General entities
      'notes',         // Note content
      'daily',         // Daily notes
      'people',        // People entities
      'projects',      // Project entities
      'topics',        // Topic entities
      'embeddings'     // Generic embeddings
    ];

    for (const type of collectionTypes) {
      const collectionName = this.getCollectionName(tenantId, type);
      
      try {
        // Check if collection already exists
        const exists = await this.collectionExists(collectionName);
        
        if (!exists) {
          await this.vectorDB.createCollection({
            name: collectionName,
            dimension,
            metric: 'cosine',  // Cosine similarity for semantic search
            metadata: {
              tenant_id: tenantId,
              created_at: new Date().toISOString(),
              type
            }
          });
        }
      } catch (error) {
        throw new Error(`Failed to initialize collection ${collectionName}: ${error.message}`);
      }
    }
  }

  /**
   * Upsert vector document into tenant collection
   * SECURITY: Always validates tenant boundary
   */
  async upsert(
    tenantId: string,
    collectionType: string,
    document: VectorDocument
  ): Promise<void> {
    const collectionName = this.getCollectionName(tenantId, collectionType);

    // SECURITY: Inject tenant_id into metadata
    const secureDocument = {
      ...document,
      metadata: {
        ...document.metadata,
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      }
    };

    await this.vectorDB.upsert({
      collection: collectionName,
      points: [secureDocument]
    });
  }

  /**
   * Batch upsert multiple vectors
   */
  async batchUpsert(
    tenantId: string,
    collectionType: string,
    documents: VectorDocument[]
  ): Promise<void> {
    const collectionName = this.getCollectionName(tenantId, collectionType);

    // SECURITY: Inject tenant_id into all documents
    const secureDocuments = documents.map(doc => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        tenant_id: tenantId,
        updated_at: new Date().toISOString()
      }
    }));

    await this.vectorDB.upsert({
      collection: collectionName,
      points: secureDocuments
    });
  }

  /**
   * Query vectors within tenant boundary
   * SECURITY: Results are double-filtered by tenant_id
   */
  async query(
    tenantId: string,
    collectionType: string,
    queryVector: number[],
    options: VectorQueryOptions = {}
  ): Promise<VectorQueryResult[]> {
    const collectionName = this.getCollectionName(tenantId, collectionType);
    const { limit = 10, filter = {}, minScore = 0 } = options;

    // SECURITY: Add tenant_id filter
    const secureFilter = {
      ...filter,
      tenant_id: tenantId
    };

    const results = await this.vectorDB.query({
      collection: collectionName,
      vector: queryVector,
      limit,
      filter: secureFilter
    });

    // SECURITY: Defense in depth - verify tenant_id in results
    const validatedResults = results
      .filter(r => r.metadata.tenant_id === tenantId)
      .filter(r => r.score >= minScore)
      .map(r => ({
        id: r.id,
        score: r.score,
        metadata: r.metadata
      }));

    return validatedResults;
  }

  /**
   * Search by text (assuming embedding generation happens elsewhere)
   */
  async searchByEmbedding(
    tenantId: string,
    collectionType: string,
    embedding: number[],
    options: VectorQueryOptions = {}
  ): Promise<VectorQueryResult[]> {
    return this.query(tenantId, collectionType, embedding, options);
  }

  /**
   * Get vector by ID within tenant
   */
  async getById(
    tenantId: string,
    collectionType: string,
    documentId: string
  ): Promise<VectorDocument | null> {
    const collectionName = this.getCollectionName(tenantId, collectionType);

    const results = await this.vectorDB.retrieve({
      collection: collectionName,
      ids: [documentId]
    });

    if (results.length === 0) {
      return null;
    }

    // SECURITY: Verify tenant_id
    const doc = results[0];
    if (doc.metadata.tenant_id !== tenantId) {
      throw new Error(`Security violation: Document ${documentId} does not belong to tenant ${tenantId}`);
    }

    return doc;
  }

  /**
   * Delete vector document
   */
  async delete(
    tenantId: string,
    collectionType: string,
    documentId: string
  ): Promise<void> {
    const collectionName = this.getCollectionName(tenantId, collectionType);

    // Verify ownership before deletion
    const doc = await this.getById(tenantId, collectionType, documentId);
    if (!doc) {
      return;  // Already deleted or doesn't exist
    }

    await this.vectorDB.delete({
      collection: collectionName,
      ids: [documentId]
    });
  }

  /**
   * Delete all collections for a tenant (tenant offboarding)
   * DANGER: This is destructive!
   */
  async deleteTenantCollections(tenantId: string): Promise<void> {
    this.validateTenantId(tenantId);

    const collections = await this.vectorDB.listCollections();

    for (const collection of collections) {
      // Match collections ending with the tenant ID
      if (collection.name.endsWith(`_${tenantId}`)) {
        await this.vectorDB.deleteCollection(collection.name);
      }
    }
  }

  /**
   * Get statistics for tenant's vector collections
   */
  async getTenantStats(tenantId: string): Promise<{
    collections: Array<{
      name: string;
      type: string;
      vectorCount: number;
      dimension: number;
    }>;
    totalVectors: number;
  }> {
    this.validateTenantId(tenantId);

    const collections = await this.vectorDB.listCollections();
    const tenantCollections = collections.filter(c => c.name.endsWith(`_${tenantId}`));

    const collectionStats = await Promise.all(
      tenantCollections.map(async (collection) => {
        const info = await this.vectorDB.getCollectionInfo(collection.name);
        const type = collection.name.replace(`_${tenantId}`, '');
        
        return {
          name: collection.name,
          type,
          vectorCount: info.vectors_count || 0,
          dimension: info.config?.params?.vectors?.size || 0
        };
      })
    );

    const totalVectors = collectionStats.reduce((sum, c) => sum + c.vectorCount, 0);

    return {
      collections: collectionStats,
      totalVectors
    };
  }

  /**
   * Check if collection exists
   */
  private async collectionExists(collectionName: string): Promise<boolean> {
    try {
      await this.vectorDB.getCollectionInfo(collectionName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate tenant ID format
   */
  private validateTenantId(tenantId: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException(`Invalid tenant_id format: ${tenantId}`);
    }
  }

  /**
   * Validate collection type
   */
  private validateCollectionType(type: string): void {
    const validTypes = ['entities', 'notes', 'daily', 'people', 'projects', 'topics', 'embeddings'];
    
    if (!validTypes.includes(type)) {
      throw new BadRequestException(`Invalid collection type: ${type}`);
    }
  }

  /**
   * Export tenant vectors for backup/migration
   */
  async exportTenantVectors(tenantId: string): Promise<{
    tenant_id: string;
    exported_at: string;
    collections: Array<{
      type: string;
      vectors: VectorDocument[];
    }>;
  }> {
    this.validateTenantId(tenantId);

    const stats = await this.getTenantStats(tenantId);
    
    const collections = await Promise.all(
      stats.collections.map(async (collectionInfo) => {
        const collectionName = collectionInfo.name;
        
        // Scroll through all vectors in collection
        const vectors = await this.vectorDB.scroll({
          collection: collectionName,
          limit: 10000  // Adjust based on collection size
        });

        return {
          type: collectionInfo.type,
          vectors: vectors.points || []
        };
      })
    );

    return {
      tenant_id: tenantId,
      exported_at: new Date().toISOString(),
      collections
    };
  }

  /**
   * Import tenant vectors (for migration/restore)
   */
  async importTenantVectors(
    tenantId: string,
    exportData: any
  ): Promise<void> {
    this.validateTenantId(tenantId);

    // Verify export data is for this tenant
    if (exportData.tenant_id !== tenantId) {
      throw new BadRequestException(
        `Export data tenant_id ${exportData.tenant_id} does not match target tenant ${tenantId}`
      );
    }

    for (const collection of exportData.collections) {
      await this.batchUpsert(tenantId, collection.type, collection.vectors);
    }
  }
}
