-- Migration 004: Analytics Views
-- Creates tenant-scoped analytical views for dashboards

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- LLM usage tracking table
CREATE TABLE IF NOT EXISTS llm_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  use_case TEXT NOT NULL,
  model_id TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10,6),
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_llm_usage_tenant ON llm_usage(tenant_id);
CREATE INDEX idx_llm_usage_time ON llm_usage(created_at);
CREATE INDEX idx_llm_usage_model ON llm_usage(model_id);

ALTER TABLE llm_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_llm_usage ON llm_usage
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- Entity activity summary view
CREATE OR REPLACE VIEW analytics.entity_activity AS
SELECT 
  tenant_id,
  entity_type,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as count,
  COUNT(DISTINCT created_by) as unique_users
FROM entities
GROUP BY tenant_id, entity_type, DATE_TRUNC('day', created_at);

-- Task completion metrics view
CREATE OR REPLACE VIEW analytics.task_metrics AS
SELECT
  tenant_id,
  status,
  priority,
  DATE_TRUNC('day', completed_at) as completion_date,
  COUNT(*) as completed_count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600) as avg_hours_to_complete
FROM tasks
WHERE completed_at IS NOT NULL
GROUP BY tenant_id, status, priority, DATE_TRUNC('day', completed_at);

-- LLM usage by tenant view
CREATE OR REPLACE VIEW analytics.llm_usage_summary AS
SELECT
  tenant_id,
  use_case,
  model_id,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as request_count,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(input_tokens + output_tokens) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(latency_ms) as avg_latency_ms,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_requests,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_requests
FROM llm_usage
GROUP BY tenant_id, use_case, model_id, DATE_TRUNC('day', created_at);

-- User activity view
CREATE OR REPLACE VIEW analytics.user_activity AS
SELECT
  tm.tenant_id,
  u.id as user_id,
  u.email,
  u.name,
  COUNT(DISTINCT e.id) as total_entities_created,
  COUNT(DISTINCT t.id) as total_tasks_created,
  COUNT(DISTINCT ev.id) as total_events_created,
  MAX(e.created_at) as last_entity_created,
  MAX(t.created_at) as last_task_created
FROM tenant_memberships tm
JOIN users u ON tm.user_id = u.id
LEFT JOIN entities e ON e.created_by = u.id AND e.tenant_id = tm.tenant_id
LEFT JOIN tasks t ON t.created_by = u.id AND t.tenant_id = tm.tenant_id
LEFT JOIN events ev ON ev.created_by = u.id AND ev.tenant_id = tm.tenant_id
GROUP BY tm.tenant_id, u.id, u.email, u.name;

-- IoT device health view
CREATE OR REPLACE VIEW analytics.iot_device_health AS
SELECT
  d.tenant_id,
  d.device_type,
  COUNT(*) as total_devices,
  SUM(CASE WHEN d.status = 'online' THEN 1 ELSE 0 END) as online_devices,
  SUM(CASE WHEN d.status = 'offline' THEN 1 ELSE 0 END) as offline_devices,
  AVG(EXTRACT(EPOCH FROM (now() - d.last_seen_at)) / 60) as avg_minutes_since_seen
FROM iot_devices d
GROUP BY d.tenant_id, d.device_type;

-- Voice usage view
CREATE OR REPLACE VIEW analytics.voice_usage AS
SELECT
  va.tenant_id,
  va.provider,
  COUNT(DISTINCT va.id) as total_accounts,
  COUNT(DISTINCT va.user_id) as unique_users,
  MAX(va.last_used_at) as last_used,
  COUNT(se.id) as total_voice_events
FROM voice_accounts va
LEFT JOIN security_events se ON se.user_id = va.user_id 
  AND se.channel IN ('alexa', 'google_home')
  AND se.created_at >= now() - INTERVAL '30 days'
GROUP BY va.tenant_id, va.provider;

-- Notification delivery metrics
CREATE OR REPLACE VIEW analytics.notification_metrics AS
SELECT
  tenant_id,
  notification_type,
  channel,
  DATE_TRUNC('day', sent_at) as date,
  COUNT(*) as total_sent,
  SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) as total_delivered,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as total_opened,
  AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at))) as avg_delivery_time_sec,
  AVG(EXTRACT(EPOCH FROM (opened_at - sent_at))) as avg_open_time_sec
FROM notification_log
WHERE sent_at >= now() - INTERVAL '90 days'
GROUP BY tenant_id, notification_type, channel, DATE_TRUNC('day', sent_at);

-- Security events summary
CREATE OR REPLACE VIEW analytics.security_summary AS
SELECT
  tenant_id,
  event_type,
  channel,
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_events,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_events,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_events,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM security_events
WHERE created_at >= now() - INTERVAL '7 days'
GROUP BY tenant_id, event_type, channel, DATE_TRUNC('hour', created_at);

-- Tenant overview (summary dashboard)
CREATE OR REPLACE VIEW analytics.tenant_overview AS
SELECT
  t.id as tenant_id,
  t.slug,
  t.name,
  t.plan,
  (SELECT COUNT(*) FROM tenant_memberships WHERE tenant_id = t.id) as total_members,
  (SELECT COUNT(*) FROM entities WHERE tenant_id = t.id) as total_entities,
  (SELECT COUNT(*) FROM tasks WHERE tenant_id = t.id) as total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE tenant_id = t.id AND status = 'done') as completed_tasks,
  (SELECT COUNT(*) FROM events WHERE tenant_id = t.id) as total_events,
  (SELECT COUNT(*) FROM iot_devices WHERE tenant_id = t.id) as total_devices,
  (SELECT SUM(total_tokens) FROM analytics.llm_usage_summary WHERE tenant_id = t.id) as total_llm_tokens,
  (SELECT SUM(total_cost) FROM analytics.llm_usage_summary WHERE tenant_id = t.id) as total_llm_cost,
  t.created_at
FROM tenants t;

-- RLS for analytics views
ALTER VIEW analytics.entity_activity SET (security_invoker = on);
ALTER VIEW analytics.task_metrics SET (security_invoker = on);
ALTER VIEW analytics.llm_usage_summary SET (security_invoker = on);
ALTER VIEW analytics.user_activity SET (security_invoker = on);
ALTER VIEW analytics.iot_device_health SET (security_invoker = on);
ALTER VIEW analytics.voice_usage SET (security_invoker = on);
ALTER VIEW analytics.notification_metrics SET (security_invoker = on);
ALTER VIEW analytics.security_summary SET (security_invoker = on);
ALTER VIEW analytics.tenant_overview SET (security_invoker = on);
