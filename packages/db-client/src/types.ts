export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  permissions: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Entity {
  id: string;
  tenant_id: string;
  name: string;
  entity_type: string;
  status: string;
  metadata: Record<string, any>;
  properties: Record<string, any>;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  tenant_id: string;
  entity_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: Date;
  completed_at?: Date;
  assigned_to?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  tenant_id: string;
  entity_id?: string;
  title: string;
  description?: string;
  event_type: string;
  start_time: Date;
  end_time?: Date;
  location?: string;
  attendees: any[];
  metadata: Record<string, any>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IoTDevice {
  id: string;
  tenant_id: string;
  device_id: string;
  device_name: string;
  device_type: string;
  status: string;
  last_seen_at?: Date;
  auth_token_hash: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface VoiceAccount {
  id: string;
  tenant_id: string;
  user_id: string;
  provider: 'alexa' | 'google_home';
  external_id: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  linked_at: Date;
  last_used_at?: Date;
  metadata: Record<string, any>;
}
