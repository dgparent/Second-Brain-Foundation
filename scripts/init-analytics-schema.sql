-- Analytics Schema for Second Brain Foundation
-- Multi-tenant analytics database views and tables

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions
GRANT USAGE ON SCHEMA analytics TO sbf_user;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO sbf_user;

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

-- Tenant Activity Summary (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.tenant_activity_summary AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.tenant_type,
    COUNT(DISTINCT e.id) as total_entities,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'task' THEN e.id END) as total_tasks,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'project' THEN e.id END) as total_projects,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'person' THEN e.id END) as total_people,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'event' THEN e.id END) as total_events,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'place' THEN e.id END) as total_places,
    t.created_at as tenant_created_at,
    MAX(e.updated_at) as last_activity_at
FROM tenants t
LEFT JOIN entities e ON e.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, t.tenant_type, t.created_at;

CREATE UNIQUE INDEX idx_tenant_activity_tenant_id ON analytics.tenant_activity_summary(tenant_id);

-- User Activity Metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.user_activity_metrics AS
SELECT 
    tm.user_id,
    tm.tenant_id,
    t.name as tenant_name,
    tm.role as user_role,
    COUNT(DISTINCT e.id) as entities_created,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'task' THEN e.id END) as tasks_created,
    COUNT(DISTINCT CASE WHEN e.entity_type = 'project' THEN e.id END) as projects_created,
    DATE_TRUNC('day', e.created_at) as activity_date,
    COUNT(*) as daily_activity_count
FROM tenant_members tm
JOIN tenants t ON t.id = tm.tenant_id
LEFT JOIN entities e ON e.tenant_id = tm.tenant_id 
WHERE tm.status = 'active' AND t.deleted_at IS NULL
GROUP BY tm.user_id, tm.tenant_id, t.name, tm.role, DATE_TRUNC('day', e.created_at);

CREATE INDEX idx_user_activity_user_tenant ON analytics.user_activity_metrics(user_id, tenant_id);
CREATE INDEX idx_user_activity_date ON analytics.user_activity_metrics(activity_date);

-- Task Completion Analytics (tenant-scoped)
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.task_completion_metrics AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    DATE_TRUNC('week', e.created_at) as week_start,
    COUNT(*) FILTER (WHERE e.metadata->>'status' = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE e.metadata->>'status' = 'in_progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE e.metadata->>'status' = 'todo') as todo_tasks,
    COUNT(*) FILTER (WHERE e.metadata->>'status' = 'blocked') as blocked_tasks,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE e.metadata->>'status' = 'completed') / 
        NULLIF(COUNT(*), 0), 
        2
    ) as completion_rate
FROM tenants t
LEFT JOIN entities e ON e.tenant_id = t.id AND e.entity_type = 'task'
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, DATE_TRUNC('week', e.created_at);

CREATE INDEX idx_task_metrics_tenant_week ON analytics.task_completion_metrics(tenant_id, week_start);

-- Project Progress Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.project_progress_metrics AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    e.id as project_id,
    e.name as project_name,
    e.metadata->>'status' as project_status,
    (e.metadata->>'progress')::numeric as progress_percentage,
    COUNT(te.id) FILTER (WHERE te.entity_type = 'task') as total_tasks,
    COUNT(te.id) FILTER (WHERE te.metadata->>'status' = 'completed' AND te.entity_type = 'task') as completed_tasks,
    e.created_at as project_created_at,
    e.updated_at as project_updated_at
FROM tenants t
JOIN entities e ON e.tenant_id = t.id AND e.entity_type = 'project'
LEFT JOIN entities te ON te.tenant_id = t.id AND te.metadata->>'project_id' = e.id::text
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, e.id, e.name, e.metadata, e.created_at, e.updated_at;

CREATE INDEX idx_project_metrics_tenant ON analytics.project_progress_metrics(tenant_id);

-- Entity Relationship Graph Analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.entity_relationship_metrics AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    e.entity_type,
    COUNT(DISTINCT e.id) as entity_count,
    COUNT(DISTINCT r.id) as relationship_count,
    AVG(ARRAY_LENGTH(ARRAY(
        SELECT 1 FROM entity_relationships er WHERE er.source_entity_id = e.id OR er.target_entity_id = e.id
    ), 1)) as avg_connections_per_entity
FROM tenants t
LEFT JOIN entities e ON e.tenant_id = t.id
LEFT JOIN entity_relationships r ON r.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, e.entity_type;

CREATE INDEX idx_entity_rel_metrics_tenant ON analytics.entity_relationship_metrics(tenant_id);

-- Daily Activity Timeline
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.daily_activity_timeline AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    DATE_TRUNC('day', e.created_at) as activity_date,
    e.entity_type,
    COUNT(*) as entities_created,
    COUNT(DISTINCT CASE WHEN e.metadata->>'priority' = 'high' THEN e.id END) as high_priority_items,
    COUNT(DISTINCT CASE WHEN e.metadata->>'status' = 'completed' THEN e.id END) as completed_items
FROM tenants t
LEFT JOIN entities e ON e.tenant_id = t.id
WHERE t.deleted_at IS NULL
GROUP BY t.id, t.name, DATE_TRUNC('day', e.created_at), e.entity_type;

CREATE INDEX idx_daily_timeline_tenant_date ON analytics.daily_activity_timeline(tenant_id, activity_date);

-- ============================================================================
-- TENANT-SCOPED VIEWS FOR ROW-LEVEL SECURITY
-- ============================================================================

-- Function to get current tenant context (placeholder - to be implemented in app)
CREATE OR REPLACE FUNCTION analytics.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    -- This will be set by the application context
    RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Secure tenant activity view
CREATE OR REPLACE VIEW analytics.my_tenant_activity AS
SELECT * FROM analytics.tenant_activity_summary
WHERE tenant_id = analytics.get_current_tenant_id();

-- Secure user activity view
CREATE OR REPLACE VIEW analytics.my_user_activity AS
SELECT * FROM analytics.user_activity_metrics
WHERE tenant_id = analytics.get_current_tenant_id();

-- Secure task metrics view
CREATE OR REPLACE VIEW analytics.my_task_metrics AS
SELECT * FROM analytics.task_completion_metrics
WHERE tenant_id = analytics.get_current_tenant_id();

-- Secure project metrics view
CREATE OR REPLACE VIEW analytics.my_project_metrics AS
SELECT * FROM analytics.project_progress_metrics
WHERE tenant_id = analytics.get_current_tenant_id();

-- Secure entity relationship view
CREATE OR REPLACE VIEW analytics.my_entity_relationships AS
SELECT * FROM analytics.entity_relationship_metrics
WHERE tenant_id = analytics.get_current_tenant_id();

-- Secure daily timeline view
CREATE OR REPLACE VIEW analytics.my_daily_timeline AS
SELECT * FROM analytics.daily_activity_timeline
WHERE tenant_id = analytics.get_current_tenant_id();

-- ============================================================================
-- ANALYTICS METADATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics.dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    dashboard_name VARCHAR(255) NOT NULL,
    dashboard_type VARCHAR(50) NOT NULL, -- 'superset', 'grafana', 'custom'
    config_data JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, dashboard_name)
);

CREATE INDEX idx_dashboard_configs_tenant ON analytics.dashboard_configs(tenant_id);
CREATE INDEX idx_dashboard_configs_user ON analytics.dashboard_configs(user_id);

-- ============================================================================
-- REFRESH FUNCTIONS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION analytics.refresh_all_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.tenant_activity_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.user_activity_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.task_completion_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.project_progress_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.entity_relationship_metrics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.daily_activity_timeline;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic refresh (requires pg_cron extension - optional)
-- SELECT cron.schedule('refresh-analytics', '*/15 * * * *', 'SELECT analytics.refresh_all_views()');

COMMENT ON SCHEMA analytics IS 'Analytics and reporting schema for Second Brain Foundation';
COMMENT ON FUNCTION analytics.refresh_all_views() IS 'Refresh all materialized views for analytics';
COMMENT ON TABLE analytics.dashboard_configs IS 'User-specific dashboard configurations';
