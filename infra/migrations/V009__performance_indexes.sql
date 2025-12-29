-- V009: Performance indexes for production workloads
-- Phase 08.2: Database Performance Optimization

-- ============================================
-- Notebook Indexes
-- ============================================

-- Index for listing notebooks by tenant
CREATE INDEX IF NOT EXISTS idx_notebooks_tenant_id 
ON notebooks(tenant_id);

-- Index for notebook lookups by tenant and ID
CREATE INDEX IF NOT EXISTS idx_notebooks_tenant_lookup 
ON notebooks(tenant_id, id);

-- Index for notebook search by name
CREATE INDEX IF NOT EXISTS idx_notebooks_name_search 
ON notebooks USING gin(to_tsvector('english', name));

-- Index for active notebooks (soft delete filter)
CREATE INDEX IF NOT EXISTS idx_notebooks_active 
ON notebooks(tenant_id, deleted_at) 
WHERE deleted_at IS NULL;

-- ============================================
-- Source Indexes
-- ============================================

-- Index for sources by notebook
CREATE INDEX IF NOT EXISTS idx_sources_notebook_id 
ON sources(notebook_id);

-- Index for sources by tenant and notebook
CREATE INDEX IF NOT EXISTS idx_sources_tenant_notebook 
ON sources(tenant_id, notebook_id);

-- Index for source type filtering
CREATE INDEX IF NOT EXISTS idx_sources_type 
ON sources(tenant_id, source_type);

-- Index for source URL lookups (deduplication)
CREATE INDEX IF NOT EXISTS idx_sources_url 
ON sources(tenant_id, url) 
WHERE url IS NOT NULL;

-- Index for full-text search on source content
CREATE INDEX IF NOT EXISTS idx_sources_content_search 
ON sources USING gin(to_tsvector('english', content));

-- Index for full-text search on source title
CREATE INDEX IF NOT EXISTS idx_sources_title_search 
ON sources USING gin(to_tsvector('english', title));

-- Composite index for source listing with sorting
CREATE INDEX IF NOT EXISTS idx_sources_created_at 
ON sources(notebook_id, created_at DESC);

-- ============================================
-- Chat Session Indexes
-- ============================================

-- Index for chat sessions by tenant
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tenant 
ON chat_sessions(tenant_id);

-- Index for chat sessions by user
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user 
ON chat_sessions(tenant_id, user_id);

-- Index for recent chat sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_recent 
ON chat_sessions(tenant_id, created_at DESC);

-- Index for chat sessions by notebook
CREATE INDEX IF NOT EXISTS idx_chat_sessions_notebook 
ON chat_sessions(notebook_id) 
WHERE notebook_id IS NOT NULL;

-- ============================================
-- Chat Message Indexes
-- ============================================

-- Index for messages by session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
ON chat_messages(session_id, created_at);

-- Index for message content search
CREATE INDEX IF NOT EXISTS idx_chat_messages_content 
ON chat_messages USING gin(to_tsvector('english', content));

-- ============================================
-- Embedding Indexes (pgvector)
-- ============================================

-- IVFFlat index for vector similarity search
-- Lists parameter tuned for ~1M vectors
CREATE INDEX IF NOT EXISTS idx_embeddings_vector_ivfflat 
ON embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Index for embeddings by source
CREATE INDEX IF NOT EXISTS idx_embeddings_source 
ON embeddings(source_id);

-- Index for embeddings by chunk
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk 
ON embeddings(chunk_id);

-- Partial index for active embeddings only
CREATE INDEX IF NOT EXISTS idx_embeddings_active 
ON embeddings(tenant_id) 
WHERE deleted_at IS NULL;

-- ============================================
-- Entity Indexes
-- ============================================

-- Index for entities by type
CREATE INDEX IF NOT EXISTS idx_entities_type 
ON entities(tenant_id, entity_type);

-- Index for entity name search
CREATE INDEX IF NOT EXISTS idx_entities_name_search 
ON entities USING gin(to_tsvector('english', name));

-- Index for entity lookups
CREATE INDEX IF NOT EXISTS idx_entities_tenant_type_name 
ON entities(tenant_id, entity_type, name);

-- ============================================
-- Entity Relationship Indexes
-- ============================================

-- Index for relationships by source entity
CREATE INDEX IF NOT EXISTS idx_entity_relationships_source 
ON entity_relationships(source_entity_id);

-- Index for relationships by target entity
CREATE INDEX IF NOT EXISTS idx_entity_relationships_target 
ON entity_relationships(target_entity_id);

-- Index for relationship type queries
CREATE INDEX IF NOT EXISTS idx_entity_relationships_type 
ON entity_relationships(relationship_type);

-- ============================================
-- Transformation Indexes
-- ============================================

-- Index for transformations by source
CREATE INDEX IF NOT EXISTS idx_transformations_source 
ON transformations(source_id);

-- Index for transformations by status
CREATE INDEX IF NOT EXISTS idx_transformations_status 
ON transformations(tenant_id, status);

-- Index for transformation type filtering
CREATE INDEX IF NOT EXISTS idx_transformations_type 
ON transformations(tenant_id, transformation_type);

-- ============================================
-- Job Queue Indexes
-- ============================================

-- Index for pending jobs (for worker pickup)
CREATE INDEX IF NOT EXISTS idx_jobs_pending 
ON jobs(status, priority DESC, created_at) 
WHERE status = 'pending';

-- Index for jobs by type
CREATE INDEX IF NOT EXISTS idx_jobs_type 
ON jobs(job_type, status);

-- Index for tenant's jobs
CREATE INDEX IF NOT EXISTS idx_jobs_tenant 
ON jobs(tenant_id, created_at DESC);

-- Index for job retries
CREATE INDEX IF NOT EXISTS idx_jobs_retry 
ON jobs(status, retry_count, next_retry_at) 
WHERE status = 'failed' AND retry_count < max_retries;

-- ============================================
-- Search Optimization
-- ============================================

-- Combined text search index for sources
CREATE INDEX IF NOT EXISTS idx_sources_combined_search 
ON sources USING gin(
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- GiST index for pg_trgm similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_sources_title_trgm 
ON sources USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_entities_name_trgm 
ON entities USING gin(name gin_trgm_ops);

-- ============================================
-- Audit Log Indexes
-- ============================================

-- Index for audit logs by tenant and action
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_action 
ON audit_logs(tenant_id, action, created_at DESC);

-- Index for audit logs by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity 
ON audit_logs(entity_type, entity_id);

-- Index for user audit trail
CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
ON audit_logs(user_id, created_at DESC);

-- ============================================
-- Statistics and Maintenance
-- ============================================

-- Analyze tables for query planner
ANALYZE notebooks;
ANALYZE sources;
ANALYZE chat_sessions;
ANALYZE chat_messages;
ANALYZE embeddings;
ANALYZE entities;
ANALYZE entity_relationships;
ANALYZE transformations;
ANALYZE jobs;

-- Add comments for documentation
COMMENT ON INDEX idx_embeddings_vector_ivfflat IS 
'IVFFlat index for fast approximate nearest neighbor search on embeddings';

COMMENT ON INDEX idx_sources_combined_search IS 
'Combined full-text search index on source title and content';

COMMENT ON INDEX idx_jobs_pending IS 
'Partial index for efficient pending job queries by workers';
