-- Migration 003: Security, Voice & IoT Tables
-- Adds tables for voice integrations, IoT devices, and security events

-- Voice accounts (Alexa/Google Home integration)
CREATE TABLE IF NOT EXISTS voice_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'alexa' or 'google_home'
  external_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  UNIQUE(provider, external_id)
);

CREATE INDEX idx_voice_accounts_tenant ON voice_accounts(tenant_id);
CREATE INDEX idx_voice_accounts_user ON voice_accounts(user_id);
CREATE INDEX idx_voice_accounts_provider ON voice_accounts(provider);

-- Voice capabilities (what each voice account can do)
CREATE TABLE IF NOT EXISTS voice_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_account_id UUID NOT NULL REFERENCES voice_accounts(id) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_voice_capabilities_account ON voice_capabilities(voice_account_id);

-- IoT devices
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_id TEXT UNIQUE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ,
  auth_token_hash TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_iot_devices_tenant ON iot_devices(tenant_id);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);
CREATE INDEX idx_iot_devices_device_id ON iot_devices(device_id);

-- IoT telemetry (time-series data)
CREATE TABLE IF NOT EXISTS iot_telemetry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_iot_telemetry_device ON iot_telemetry(device_id);
CREATE INDEX idx_iot_telemetry_time ON iot_telemetry(recorded_at);
CREATE INDEX idx_iot_telemetry_metric ON iot_telemetry(metric_name);

-- Security events (audit log)
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'web', 'ios', 'android', 'alexa', 'google_home', 'iot'
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_security_events_tenant ON security_events(tenant_id);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_time ON security_events(created_at);

-- Notification devices (push notification tokens)
CREATE TABLE IF NOT EXISTS notification_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- 'ios', 'android'
  device_token TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  registered_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(channel, device_token)
);

CREATE INDEX idx_notification_devices_tenant ON notification_devices(tenant_id);
CREATE INDEX idx_notification_devices_user ON notification_devices(user_id);

-- Notification log
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notification_log_tenant ON notification_log(tenant_id);
CREATE INDEX idx_notification_log_user ON notification_log(user_id);
CREATE INDEX idx_notification_log_time ON notification_log(sent_at);

-- Enable RLS
ALTER TABLE voice_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_voice_accounts ON voice_accounts
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_iot_devices ON iot_devices
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_security_events ON security_events
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE) OR tenant_id IS NULL);

CREATE POLICY tenant_isolation_notification_devices ON notification_devices
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

CREATE POLICY tenant_isolation_notification_log ON notification_log
  USING (tenant_id::text = current_setting('app.current_tenant_id', TRUE));

-- Triggers
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
