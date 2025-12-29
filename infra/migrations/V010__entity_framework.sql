-- Migration: V010__entity_framework.sql
-- Description: Entity Framework with PRD-compliant UID system, lifecycle management, and relationships
-- Phase: 09 - Entity Framework (PRD Critical)

-- =====================================================
-- Entity Types Table
-- =====================================================

CREATE TABLE IF NOT EXISTS entity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL for system types
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL DEFAULT 'file',
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',  -- Hex color
    folder_path VARCHAR(255) NOT NULL DEFAULT '',
    schema JSONB NOT NULL DEFAULT '{"properties": {}}',
    template TEXT NOT NULL DEFAULT '',
    uid_counter INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique slug per tenant (or system-wide for system types)
    CONSTRAINT entity_types_unique_slug UNIQUE (tenant_id, slug),
    CONSTRAINT entity_types_slug_format CHECK (slug ~ '^[a-z][a-z0-9-]*$')
);

-- Index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_entity_types_tenant ON entity_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_entity_types_system ON entity_types(is_system) WHERE is_system = true;

-- Enable RLS
ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read system types and their tenant's types
CREATE POLICY entity_types_select_policy ON entity_types
    FOR SELECT
    USING (is_system = true OR tenant_id = current_setting('app.tenant_id', true)::UUID);

-- RLS Policy: Users can only modify their tenant's custom types
CREATE POLICY entity_types_modify_policy ON entity_types
    FOR ALL
    USING (is_system = false AND tenant_id = current_setting('app.tenant_id', true)::UUID);

-- =====================================================
-- Entities Table
-- =====================================================

CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    uid VARCHAR(200) NOT NULL,  -- PRD format: {type}-{slug}-{counter}
    type_slug VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    
    -- Universal parameters (PRD)
    sensitivity VARCHAR(20) NOT NULL DEFAULT 'personal' 
        CHECK (sensitivity IN ('public', 'personal', 'confidential', 'secret')),
    truth_level VARCHAR(5) NOT NULL DEFAULT 'U1'
        CHECK (truth_level IN ('L1', 'L2', 'L3', 'U1', 'U2', 'U3')),
    lifecycle_state VARCHAR(20) NOT NULL DEFAULT 'captured'
        CHECK (lifecycle_state IN ('captured', 'transitional', 'permanent', 'archived')),
    
    -- Lifecycle timestamps
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    filed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    
    -- Type-specific metadata
    metadata JSONB DEFAULT '{}',
    
    -- BMOM framework (PRD FR18-19)
    bmom JSONB,  -- { because, meaning, outcome, measure, confidence, extractedAt }
    
    -- Vector embedding for semantic search
    embedding vector(1536),
    
    -- Standard timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique UID per tenant
    CONSTRAINT entities_unique_uid UNIQUE (tenant_id, uid),
    CONSTRAINT entities_uid_format CHECK (uid ~ '^[a-z]+-[a-z0-9-]+-\d{3,}$')
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_entities_tenant ON entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_entities_uid ON entities(uid);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(tenant_id, type_slug);
CREATE INDEX IF NOT EXISTS idx_entities_lifecycle ON entities(tenant_id, lifecycle_state);
CREATE INDEX IF NOT EXISTS idx_entities_captured_at ON entities(captured_at);
CREATE INDEX IF NOT EXISTS idx_entities_sensitivity ON entities(tenant_id, sensitivity);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_entities_embedding ON entities 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_entities_name_fts ON entities 
    USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_entities_content_fts ON entities 
    USING gin(to_tsvector('english', COALESCE(content, '')));

-- Enable RLS
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their tenant's entities
CREATE POLICY entities_tenant_isolation ON entities
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::UUID);

-- =====================================================
-- Entity Relationships Table
-- =====================================================

CREATE TABLE IF NOT EXISTS entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_uid VARCHAR(200) NOT NULL,
    target_uid VARCHAR(200) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    context TEXT,  -- Optional description of relationship
    bidirectional BOOLEAN NOT NULL DEFAULT false,
    confidence DECIMAL(3,2),  -- 0.00-1.00 for AI-detected relationships
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate relationships
    CONSTRAINT entity_rel_unique UNIQUE (tenant_id, source_uid, target_uid, relationship_type),
    -- Prevent self-referential relationships
    CONSTRAINT entity_rel_no_self CHECK (source_uid != target_uid)
);

-- Indexes for relationship lookups
CREATE INDEX IF NOT EXISTS idx_entity_rel_source ON entity_relationships(tenant_id, source_uid);
CREATE INDEX IF NOT EXISTS idx_entity_rel_target ON entity_relationships(tenant_id, target_uid);
CREATE INDEX IF NOT EXISTS idx_entity_rel_type ON entity_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_entity_rel_bidirectional ON entity_relationships(bidirectional) WHERE bidirectional = true;

-- Enable RLS
ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their tenant's relationships
CREATE POLICY entity_rel_tenant_isolation ON entity_relationships
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::UUID);

-- =====================================================
-- Relationship Types Vocabulary
-- =====================================================

CREATE TABLE IF NOT EXISTS relationship_types (
    type VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    bidirectional BOOLEAN NOT NULL DEFAULT false,
    inverse_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard relationship types
INSERT INTO relationship_types (type, label, description, bidirectional, inverse_type) VALUES
    ('related_to', 'Related To', 'Generic association between entities', true, NULL),
    ('part_of', 'Part Of', 'Hierarchical containment relationship', false, 'contains'),
    ('contains', 'Contains', 'Inverse of part_of', false, 'part_of'),
    ('works_on', 'Works On', 'Person working on a project', false, 'worked_on_by'),
    ('worked_on_by', 'Worked On By', 'Project worked on by person', false, 'works_on'),
    ('located_at', 'Located At', 'Entity located at a place', false, 'location_of'),
    ('location_of', 'Location Of', 'Place where entity is located', false, 'located_at'),
    ('attended', 'Attended', 'Person attended an event', false, 'attended_by'),
    ('attended_by', 'Attended By', 'Event attended by person', false, 'attended'),
    ('created_by', 'Created By', 'Artifact created by person', false, 'created'),
    ('created', 'Created', 'Person created an artifact', false, 'created_by'),
    ('mentions', 'Mentions', 'Content mentions another entity', false, 'mentioned_in'),
    ('mentioned_in', 'Mentioned In', 'Entity mentioned in content', false, 'mentions'),
    ('references', 'References', 'Explicit reference to entity', false, 'referenced_by'),
    ('referenced_by', 'Referenced By', 'Entity referenced by content', false, 'references'),
    ('parent_of', 'Parent Of', 'Topic hierarchy parent', false, 'child_of'),
    ('child_of', 'Child Of', 'Topic hierarchy child', false, 'parent_of'),
    ('precedes', 'Precedes', 'Temporal ordering - comes before', false, 'follows'),
    ('follows', 'Follows', 'Temporal ordering - comes after', false, 'precedes')
ON CONFLICT (type) DO NOTHING;

-- =====================================================
-- Review Queue Table (for low-confidence extractions)
-- =====================================================

CREATE TABLE IF NOT EXISTS review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('entity_extraction', 'relationship', 'bmom', 'sensitivity')),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,  -- 0.00-1.00
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'modified')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for review queue
CREATE INDEX IF NOT EXISTS idx_review_queue_tenant ON review_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_review_queue_type ON review_queue(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_review_queue_confidence ON review_queue(confidence);

-- Enable RLS
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY review_queue_tenant_isolation ON review_queue
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id', true)::UUID);

-- =====================================================
-- Seed Default Entity Types
-- =====================================================

INSERT INTO entity_types (tenant_id, name, slug, description, icon, color, folder_path, schema, template, uid_counter, is_system) VALUES
(NULL, 'Person', 'person', 'A human being with identity', 'user', '#3B82F6', 'People/',
  '{"properties": {"role": {"type": "string"}, "organization": {"type": "string"}, "email": {"type": "string"}}}',
  E'---\nuid: {{uid}}\ntype: person\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\n---\n\n# {{name}}\n\n## Bio\n\n## Contact\n\n## Notes\n',
  0, true),

(NULL, 'Place', 'place', 'A physical or virtual location', 'map-pin', '#10B981', 'Places/',
  '{"properties": {"address": {"type": "string"}, "coordinates": {"type": "object"}, "type": {"type": "string", "enum": ["physical", "virtual"]}}}',
  E'---\nuid: {{uid}}\ntype: place\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\n---\n\n# {{name}}\n\n## Location\n\n## Description\n\n## Notes\n',
  0, true),

(NULL, 'Topic', 'topic', 'A subject or area of knowledge', 'book-open', '#8B5CF6', 'Topics/',
  '{"properties": {"category": {"type": "string"}, "parent_topic": {"type": "string"}}}',
  E'---\nuid: {{uid}}\ntype: topic\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\n---\n\n# {{name}}\n\n## Overview\n\n## Key Concepts\n\n## Resources\n\n## Notes\n',
  0, true),

(NULL, 'Project', 'project', 'An initiative with goals and outcomes', 'folder', '#F59E0B', 'Projects/',
  '{"properties": {"status": {"type": "string", "enum": ["planning", "active", "on-hold", "completed"]}, "start_date": {"type": "string"}, "target_date": {"type": "string"}}}',
  E'---\nuid: {{uid}}\ntype: project\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\nstatus: planning\n---\n\n# {{name}}\n\n## Overview\n\n## Goals\n\n## Tasks\n\n## Timeline\n\n## Notes\n',
  0, true),

(NULL, 'Event', 'event', 'A specific occurrence in time', 'calendar', '#EF4444', 'Events/',
  '{"properties": {"start_time": {"type": "string"}, "end_time": {"type": "string"}, "location_uid": {"type": "string"}}}',
  E'---\nuid: {{uid}}\ntype: event\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\n---\n\n# {{name}}\n\n## Details\n\n## Participants\n\n## Notes\n',
  0, true),

(NULL, 'Artifact', 'artifact', 'A document, file, or created object', 'file-text', '#6366F1', 'Artifacts/',
  '{"properties": {"format": {"type": "string"}, "version": {"type": "string"}, "file_path": {"type": "string"}}}',
  E'---\nuid: {{uid}}\ntype: artifact\nname: {{name}}\ncreated_at: {{created_at}}\nmodified_at: {{modified_at}}\nrelationships: []\nsensitivity: personal\ntruth_level: U1\n---\n\n# {{name}}\n\n## Description\n\n## Contents\n\n## Notes\n',
  0, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Updated At Triggers
-- =====================================================

CREATE OR REPLACE FUNCTION update_entity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_entity_types_updated_at
    BEFORE UPDATE ON entity_types
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_updated_at();

CREATE TRIGGER trigger_entities_updated_at
    BEFORE UPDATE ON entities
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_updated_at();

CREATE TRIGGER trigger_entity_relationships_updated_at
    BEFORE UPDATE ON entity_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_updated_at();

CREATE TRIGGER trigger_review_queue_updated_at
    BEFORE UPDATE ON review_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_entity_updated_at();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE entity_types IS 'Entity type definitions including system defaults and tenant customizations';
COMMENT ON TABLE entities IS 'Knowledge entities with PRD-compliant UIDs and lifecycle management';
COMMENT ON TABLE entity_relationships IS 'Relationships between entities';
COMMENT ON TABLE relationship_types IS 'Vocabulary of relationship types';
COMMENT ON TABLE review_queue IS 'Queue for low-confidence AI extractions requiring human review';

COMMENT ON COLUMN entities.uid IS 'PRD-compliant UID in format: {type}-{slug}-{counter}';
COMMENT ON COLUMN entities.sensitivity IS 'PRD sensitivity levels: public, personal, confidential, secret';
COMMENT ON COLUMN entities.truth_level IS 'PRD truth levels: L1-L3 (sourced), U1-U3 (unsourced)';
COMMENT ON COLUMN entities.lifecycle_state IS 'PRD lifecycle: captured → transitional → permanent → archived';
COMMENT ON COLUMN entities.bmom IS 'BMOM framework: Because, Meaning, Outcome, Measure';
