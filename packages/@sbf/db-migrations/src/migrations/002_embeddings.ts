/**
 * Migration 002: Vector Embeddings
 * 
 * Adds vector embedding support:
 * - entity_embeddings: Vector embeddings for entities
 * - HNSW index for efficient vector search
 */

import { Migration, MigrationDatabase } from '../types';

export const migration002Embeddings: Migration = {
  version: '002',
  name: 'vector_embeddings',
  description: 'Adds vector embedding support for semantic search',
  reversible: true,
  dependencies: ['001'],

  async up(db: MigrationDatabase): Promise<void> {
    // Create entity_embeddings table
    await db.createTable('entity_embeddings', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'tenant_id', type: 'uuid', nullable: false, references: { 
        table: 'tenants', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'entity_id', type: 'uuid', nullable: false, references: { 
        table: 'entities', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'embedding_type', type: 'varchar', nullable: false, defaultValue: 'content' },
      { name: 'model', type: 'varchar', nullable: false },
      { name: 'content_hash', type: 'varchar', nullable: false },
      { name: 'created_at', type: 'timestamptz', nullable: false },
    ]);

    // Add vector column separately (pgvector specific)
    await db.execute(`
      ALTER TABLE entity_embeddings 
      ADD COLUMN embedding vector(1536)
    `);

    // Create unique index on entity + embedding type
    await db.createIndex('entity_embeddings', 'idx_embeddings_entity_type', 
      ['entity_id', 'embedding_type'], { unique: true });

    // Create HNSW index for efficient vector search
    // Using cosine distance (best for normalized embeddings like OpenAI)
    await db.createIndex('entity_embeddings', 'idx_embeddings_vector', ['embedding'], {
      using: 'hnsw',
      withOptions: {
        m: 16,           // Max connections per layer
        ef_construction: 64,  // Quality of index construction
      },
    });

    // Create tenant-scoped vector search function
    await db.execute(`
      CREATE OR REPLACE FUNCTION search_entities_by_embedding(
        p_tenant_id UUID,
        p_query_embedding vector(1536),
        p_limit INTEGER DEFAULT 10,
        p_similarity_threshold REAL DEFAULT 0.7,
        p_entity_type VARCHAR DEFAULT NULL
      )
      RETURNS TABLE (
        entity_id UUID,
        entity_type VARCHAR,
        title TEXT,
        content TEXT,
        similarity REAL
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          e.id AS entity_id,
          e.entity_type,
          e.title,
          e.content,
          (1 - (ee.embedding <=> p_query_embedding))::REAL AS similarity
        FROM entity_embeddings ee
        JOIN entities e ON e.id = ee.entity_id
        WHERE ee.tenant_id = p_tenant_id
          AND e.deleted_at IS NULL
          AND e.lifecycle_state IN ('active', 'stale')
          AND (p_entity_type IS NULL OR e.entity_type = p_entity_type)
          AND (1 - (ee.embedding <=> p_query_embedding)) >= p_similarity_threshold
        ORDER BY ee.embedding <=> p_query_embedding
        LIMIT p_limit;
      END;
      $$
    `);

    // Create jobs table for background processing
    await db.createTable('jobs', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'tenant_id', type: 'uuid', nullable: true, references: { 
        table: 'tenants', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'type', type: 'varchar', nullable: false },
      { name: 'payload', type: 'jsonb', nullable: false },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: 'pending' },
      { name: 'priority', type: 'integer', nullable: false, defaultValue: 1 },
      { name: 'attempts', type: 'integer', nullable: false, defaultValue: 0 },
      { name: 'max_attempts', type: 'integer', nullable: false, defaultValue: 3 },
      { name: 'last_error', type: 'jsonb', nullable: true },
      { name: 'result', type: 'jsonb', nullable: true },
      { name: 'scheduled_at', type: 'timestamptz', nullable: true },
      { name: 'started_at', type: 'timestamptz', nullable: true },
      { name: 'completed_at', type: 'timestamptz', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
    ]);

    // Create indexes for jobs
    await db.createIndex('jobs', 'idx_jobs_status', ['status']);
    await db.createIndex('jobs', 'idx_jobs_priority', ['priority']);
    await db.createIndex('jobs', 'idx_jobs_scheduled', ['scheduled_at'], {
      where: "status = 'pending' AND scheduled_at IS NOT NULL",
    });
    await db.createIndex('jobs', 'idx_jobs_pending', ['status', 'priority', 'created_at'], {
      where: "status = 'pending'",
    });
  },

  async down(db: MigrationDatabase): Promise<void> {
    await db.execute('DROP FUNCTION IF EXISTS search_entities_by_embedding');
    await db.dropTable('jobs');
    await db.dropTable('entity_embeddings');
  },
};
