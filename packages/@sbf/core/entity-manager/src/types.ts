export interface Entity {
  id: string;
  tenant_id: string;
  name: string;
  entity_type: string;
  status: 'active' | 'archived' | 'deleted';
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
  embedding?: number[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateEntityInput {
  name: string;
  entity_type: string;
  status?: 'active' | 'archived';
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface UpdateEntityInput {
  name?: string;
  status?: 'active' | 'archived';
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
}

export interface EntityFilters {
  entity_type?: string;
  status?: 'active' | 'archived' | 'deleted';
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Task {
  id: string;
  tenant_id: string;
  entity_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  completed_at?: Date;
  assigned_to?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskInput {
  entity_id?: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  assigned_to?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  assigned_to?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_before?: Date;
  due_after?: Date;
  limit?: number;
  offset?: number;
}

export interface SyncItem {
  id: string;
  tenantId: string;
  entityType: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  truthMetadata: any;
  version: number;
  timestamp: Date;
}
