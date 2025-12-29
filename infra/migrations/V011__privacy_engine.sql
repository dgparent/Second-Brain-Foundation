-- V011: Privacy Engine
-- Adds sensitivity and privacy audit tables for PRD FR15-FR19
-- Created: 2025-12-30
-- Phase: 10 - Sensitivity & Privacy Engine

-- ============================================================================
-- SENSITIVITY LEVELS ENUM
-- ============================================================================

-- Create sensitivity level enum if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sensitivity_level') THEN
        CREATE TYPE sensitivity_level AS ENUM (
            'public',       -- Can be shared anywhere, any AI
            'personal',     -- Local AI only, can export, no sharing (default)
            'confidential', -- Local AI only, no export or sync
            'secret'        -- Never processed by ANY AI, not searchable
        );
    END IF;
END$$;

-- ============================================================================
-- ALTER ENTITIES TABLE
-- ============================================================================

-- Add sensitivity columns to entities table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'sensitivity'
    ) THEN
        ALTER TABLE entities 
        ADD COLUMN sensitivity sensitivity_level NOT NULL DEFAULT 'personal';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'entities' AND column_name = 'sensitivity_config'
    ) THEN
        ALTER TABLE entities 
        ADD COLUMN sensitivity_config JSONB DEFAULT '{
            "inherit_from_parent": true
        }'::jsonb;
    END IF;
END$$;

-- Create index for sensitivity queries
CREATE INDEX IF NOT EXISTS idx_entities_sensitivity 
ON entities(tenant_id, sensitivity);

-- Create index for inherited entities
CREATE INDEX IF NOT EXISTS idx_entities_sensitivity_config 
ON entities USING gin(sensitivity_config);

-- ============================================================================
-- PRIVACY AUDIT LOG TABLE
-- ============================================================================

-- Privacy action types
CREATE TYPE privacy_action AS ENUM (
    'sensitivity_changed',
    'ai_access_allowed',
    'ai_access_blocked',
    'export_allowed',
    'export_blocked',
    'share_attempted',
    'share_blocked',
    'sync_allowed',
    'sync_blocked',
    'inheritance_applied',
    'override_applied',
    'permission_check'
);

-- Actor types
CREATE TYPE actor_type AS ENUM (
    'user',
    'system',
    'ai',
    'api'
);

-- Privacy audit log table
CREATE TABLE IF NOT EXISTS privacy_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_uid VARCHAR(255) NOT NULL,
    action privacy_action NOT NULL,
    actor_id VARCHAR(255) NOT NULL,
    actor_type actor_type NOT NULL,
    from_level sensitivity_level,
    to_level sensitivity_level,
    permissions_requested JSONB,
    permissions_granted JSONB,
    blocked_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Index for efficient queries
    CONSTRAINT fk_privacy_audit_entity
        FOREIGN KEY (tenant_id, entity_uid) 
        REFERENCES entities(tenant_id, uid) 
        ON DELETE CASCADE
);

-- Indexes for privacy audit log
CREATE INDEX IF NOT EXISTS idx_privacy_audit_tenant 
ON privacy_audit_log(tenant_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_audit_entity 
ON privacy_audit_log(tenant_id, entity_uid, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_audit_action 
ON privacy_audit_log(tenant_id, action, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_audit_actor 
ON privacy_audit_log(tenant_id, actor_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_privacy_audit_blocked 
ON privacy_audit_log(tenant_id, timestamp DESC) 
WHERE action IN ('ai_access_blocked', 'export_blocked', 'share_blocked', 'sync_blocked');

-- ============================================================================
-- PRIVACY PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS privacy_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_sensitivity sensitivity_level NOT NULL DEFAULT 'personal',
    inherit_from_parent BOOLEAN NOT NULL DEFAULT true,
    require_confirm_for_public BOOLEAN NOT NULL DEFAULT true,
    audit_log_retention_days INTEGER NOT NULL DEFAULT 90,
    show_privacy_warnings BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id)
);

-- Index for privacy preferences
CREATE INDEX IF NOT EXISTS idx_privacy_preferences_user 
ON privacy_preferences(tenant_id, user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE privacy_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for privacy_audit_log
CREATE POLICY privacy_audit_log_tenant_isolation ON privacy_audit_log
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY privacy_audit_log_select ON privacy_audit_log
    FOR SELECT
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY privacy_audit_log_insert ON privacy_audit_log
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid);

-- RLS policies for privacy_preferences
CREATE POLICY privacy_preferences_tenant_isolation ON privacy_preferences
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY privacy_preferences_select ON privacy_preferences
    FOR SELECT
    USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY privacy_preferences_update ON privacy_preferences
    FOR UPDATE
    USING (tenant_id = current_setting('app.tenant_id')::uuid AND 
           user_id = current_setting('app.user_id')::uuid);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if AI access is allowed for an entity
CREATE OR REPLACE FUNCTION check_ai_access(
    p_tenant_id UUID,
    p_entity_uid VARCHAR(255),
    p_ai_type VARCHAR(10)
) RETURNS BOOLEAN AS $$
DECLARE
    v_sensitivity sensitivity_level;
BEGIN
    SELECT sensitivity INTO v_sensitivity
    FROM entities
    WHERE tenant_id = p_tenant_id AND uid = p_entity_uid;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Secret content NEVER allowed for ANY AI
    IF v_sensitivity = 'secret' THEN
        RETURN false;
    END IF;
    
    -- Cloud AI only allowed for public
    IF p_ai_type = 'cloud' AND v_sensitivity != 'public' THEN
        RETURN false;
    END IF;
    
    -- Local AI allowed for public, personal, confidential (not secret)
    IF p_ai_type = 'local' THEN
        RETURN v_sensitivity != 'secret';
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get effective sensitivity (with inheritance)
CREATE OR REPLACE FUNCTION get_effective_sensitivity(
    p_tenant_id UUID,
    p_entity_uid VARCHAR(255)
) RETURNS sensitivity_level AS $$
DECLARE
    v_entity RECORD;
    v_parent_uid VARCHAR(255);
    v_parent_sensitivity sensitivity_level;
    v_inherit_from_parent BOOLEAN;
BEGIN
    -- Get entity
    SELECT uid, sensitivity, sensitivity_config
    INTO v_entity
    FROM entities
    WHERE tenant_id = p_tenant_id AND uid = p_entity_uid;
    
    IF NOT FOUND THEN
        RETURN 'personal'; -- Default
    END IF;
    
    -- Check if inheritance is enabled
    v_inherit_from_parent := COALESCE(
        (v_entity.sensitivity_config->>'inherit_from_parent')::boolean,
        true
    );
    
    IF NOT v_inherit_from_parent THEN
        RETURN v_entity.sensitivity;
    END IF;
    
    -- Find parent entity
    SELECT source_uid INTO v_parent_uid
    FROM entity_relationships
    WHERE tenant_id = p_tenant_id 
      AND target_uid = p_entity_uid
      AND relationship_type IN ('contains', 'has_child', 'parent_of', 'includes', 'owns')
    LIMIT 1;
    
    IF v_parent_uid IS NULL THEN
        RETURN v_entity.sensitivity;
    END IF;
    
    -- Get parent sensitivity
    SELECT sensitivity INTO v_parent_sensitivity
    FROM entities
    WHERE tenant_id = p_tenant_id AND uid = v_parent_uid;
    
    IF v_parent_sensitivity IS NULL THEN
        RETURN v_entity.sensitivity;
    END IF;
    
    -- Return the more restrictive of parent and entity
    -- Order: public < personal < confidential < secret
    CASE 
        WHEN v_parent_sensitivity = 'secret' THEN RETURN 'secret';
        WHEN v_entity.sensitivity = 'secret' THEN RETURN 'secret';
        WHEN v_parent_sensitivity = 'confidential' THEN RETURN 'confidential';
        WHEN v_entity.sensitivity = 'confidential' THEN RETURN 'confidential';
        WHEN v_parent_sensitivity = 'personal' THEN RETURN 'personal';
        WHEN v_entity.sensitivity = 'personal' THEN RETURN 'personal';
        ELSE RETURN 'public';
    END CASE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_privacy_audit_logs(
    p_tenant_id UUID,
    p_retention_days INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM privacy_audit_log
    WHERE tenant_id = p_tenant_id
      AND timestamp < NOW() - (p_retention_days || ' days')::interval;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATE EXISTING DATA
-- ============================================================================

-- Set default sensitivity for existing entities that don't have one
UPDATE entities 
SET sensitivity = 'personal'
WHERE sensitivity IS NULL;

-- Create default privacy preferences for existing users
INSERT INTO privacy_preferences (tenant_id, user_id)
SELECT DISTINCT t.id, u.id
FROM tenants t
CROSS JOIN users u
WHERE u.tenant_id = t.id
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on privacy_preferences
CREATE OR REPLACE FUNCTION update_privacy_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS privacy_preferences_updated_at ON privacy_preferences;
CREATE TRIGGER privacy_preferences_updated_at
    BEFORE UPDATE ON privacy_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_privacy_preferences_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE privacy_audit_log IS 'Audit log for all privacy-related actions per PRD NFR10';
COMMENT ON TABLE privacy_preferences IS 'User privacy preferences per PRD FR16';
COMMENT ON COLUMN entities.sensitivity IS 'Sensitivity level per PRD FR15';
COMMENT ON COLUMN entities.sensitivity_config IS 'Sensitivity configuration including inheritance settings';
COMMENT ON FUNCTION check_ai_access IS 'Check if AI access is allowed for an entity per PRD FR19';
COMMENT ON FUNCTION get_effective_sensitivity IS 'Get effective sensitivity with inheritance per PRD FR17';
