-- Multi-Tenant Database Schema Migration
-- Second Brain Foundation
-- Phase 1: Foundation

-- ============================================================================
-- TENANT CORE TABLES
-- ============================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('personal', 'pseudo_personal', 'professional')),
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_delete', 'suspended')),
  
  -- Type-specific fields
  subject_person_uid VARCHAR(100),  -- For pseudo_personal
  org_metadata JSONB,  -- For professional
  
  -- Configuration
  features JSONB NOT NULL DEFAULT '{}',
  policies JSONB NOT NULL DEFAULT '{}',
  
  -- Indexes
  CONSTRAINT tenant_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Create tenant_memberships table
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,  -- References users table
  role VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'invited' CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by UUID,  -- References users table
  joined_at TIMESTAMP,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  
  -- Unique constraint: one role per user per tenant
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_memberships_tenant ON tenant_memberships(tenant_id);
CREATE INDEX idx_memberships_user ON tenant_memberships(user_id);
CREATE INDEX idx_memberships_status ON tenant_memberships(status);

-- Create tenant_audit_logs table
CREATE TABLE IF NOT EXISTS tenant_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_uid VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_tenant ON tenant_audit_logs(tenant_id, timestamp DESC);
CREATE INDEX idx_audit_user ON tenant_audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action ON tenant_audit_logs(action);

-- ============================================================================
-- ADD TENANT_ID TO EXISTING TABLES
-- ============================================================================

-- Note: Adjust column names based on actual schema

-- Entities table
ALTER TABLE entities 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_entities_tenant ON entities(tenant_id);

-- Notes table
ALTER TABLE notes 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_notes_tenant ON notes(tenant_id);

-- People table
ALTER TABLE people 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_people_tenant ON people(tenant_id);

-- Projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id);

-- Tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON tasks(tenant_id);

-- Events table
ALTER TABLE events 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_events_tenant ON events(tenant_id);

-- Places table
ALTER TABLE places 
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
  
CREATE INDEX IF NOT EXISTS idx_places_tenant ON places(tenant_id);

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on all entity tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for entities table
CREATE POLICY tenant_isolation_entities ON entities
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for notes table
CREATE POLICY tenant_isolation_notes ON notes
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for people table
CREATE POLICY tenant_isolation_people ON people
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for projects table
CREATE POLICY tenant_isolation_projects ON projects
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for tasks table
CREATE POLICY tenant_isolation_tasks ON tasks
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for events table
CREATE POLICY tenant_isolation_events ON events
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- Create RLS policies for places table
CREATE POLICY tenant_isolation_places ON places
  FOR ALL
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));

-- RLS policy for tenant_memberships (user can see their own memberships)
CREATE POLICY tenant_membership_access ON tenant_memberships
  FOR ALL
  USING (
    user_id::text = current_setting('app.current_user_id', true)
    OR tenant_id IN (
      SELECT tenant_id 
      FROM tenant_memberships 
      WHERE user_id::text = current_setting('app.current_user_id', true)
      AND status = 'active'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(p_tenant_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
  PERFORM set_config('app.current_user_id', p_user_id::text, true);
END;
$$ LANGUAGE plpgsql;

-- Function to get current tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to verify user has access to tenant
CREATE OR REPLACE FUNCTION user_has_tenant_access(p_user_id UUID, p_tenant_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM tenant_memberships 
    WHERE user_id = p_user_id 
    AND tenant_id = p_tenant_id 
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on tenants
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_timestamp
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- To apply this migration:
-- 1. Backup your database
-- 2. Run: psql -U your_user -d sbf_db -f 001-multi-tenant-foundation.sql
-- 3. Verify: SELECT * FROM tenants;
-- 4. Test RLS: 
--    - SELECT set_tenant_context('tenant-uuid', 'user-uuid');
--    - SELECT * FROM entities;  -- Should only show entities for that tenant

-- To rollback:
-- DROP POLICY IF EXISTS tenant_isolation_entities ON entities;
-- DROP POLICY IF EXISTS tenant_isolation_notes ON notes;
-- -- ... (drop all policies)
-- ALTER TABLE entities DROP COLUMN IF EXISTS tenant_id;
-- ALTER TABLE notes DROP COLUMN IF EXISTS tenant_id;
-- -- ... (drop all tenant_id columns)
-- DROP TABLE IF EXISTS tenant_audit_logs;
-- DROP TABLE IF EXISTS tenant_memberships;
-- DROP TABLE IF EXISTS tenants;
