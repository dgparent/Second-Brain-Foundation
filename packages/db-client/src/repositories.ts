import { DatabaseClient } from './client';
import { Tenant, User, Entity, Task, TenantMembership } from './types';

export class TenantsRepository {
  constructor(private db: DatabaseClient) {}

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const result = await this.db.query(
      `INSERT INTO tenants (slug, name, plan, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.slug, data.name, data.plan || 'free', data.metadata || {}]
    );
    return result.rows[0];
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE slug = $1',
      [slug]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

export class UsersRepository {
  constructor(private db: DatabaseClient) {}

  async create(data: Partial<User>): Promise<User> {
    const result = await this.db.query(
      `INSERT INTO users (email, name, metadata)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.name, data.metadata || {}]
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

export class EntitiesRepository {
  constructor(private db: DatabaseClient) {}

  async create(tenantId: string, data: Partial<Entity>): Promise<Entity> {
    const result = await this.db.query(
      `INSERT INTO entities (tenant_id, name, entity_type, status, metadata, properties, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        tenantId,
        data.name,
        data.entity_type,
        data.status || 'active',
        data.metadata || {},
        data.properties || {},
        data.created_by
      ]
    );
    return result.rows[0];
  }

  async findByTenant(tenantId: string, filters?: any): Promise<Entity[]> {
    const result = await this.db.query(
      'SELECT * FROM entities WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows;
  }

  async findById(tenantId: string, id: string): Promise<Entity | null> {
    const result = await this.db.query(
      'SELECT * FROM entities WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  async update(tenantId: string, id: string, data: Partial<Entity>): Promise<Entity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(data.metadata);
    }
    if (data.properties !== undefined) {
      updates.push(`properties = $${paramIndex++}`);
      values.push(data.properties);
    }

    if (updates.length === 0) {
      return this.findById(tenantId, id);
    }

    updates.push(`updated_at = now()`);
    values.push(id, tenantId);

    const result = await this.db.query(
      `UPDATE entities SET ${updates.join(', ')} 
       WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.query(
      'UPDATE entities SET deleted_at = now(), status = $1 WHERE id = $2 AND tenant_id = $3',
      ['deleted', id, tenantId]
    );
  }
}

export class TasksRepository {
  constructor(private db: DatabaseClient) {}

  async create(tenantId: string, data: Partial<Task>): Promise<Task> {
    const result = await this.db.query(
      `INSERT INTO tasks (tenant_id, entity_id, title, description, status, priority, due_date, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        tenantId,
        data.entity_id,
        data.title,
        data.description,
        data.status || 'todo',
        data.priority || 'medium',
        data.due_date,
        data.assigned_to,
        data.created_by
      ]
    );
    return result.rows[0];
  }

  async findByTenant(tenantId: string, filters?: any): Promise<Task[]> {
    const result = await this.db.query(
      'SELECT * FROM tasks WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows;
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: string
  ): Promise<Task | null> {
    const completedAt = status === 'done' ? new Date() : null;
    const result = await this.db.query(
      `UPDATE tasks 
       SET status = $1, completed_at = $2, updated_at = now()
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [status, completedAt, id, tenantId]
    );
    return result.rows[0] || null;
  }

  async findById(tenantId: string, id: string): Promise<Task | null> {
    const result = await this.db.query(
      'SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  async update(tenantId: string, id: string, data: Partial<Task>): Promise<Task | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
      if (data.status === 'done') {
        updates.push(`completed_at = now()`);
      }
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }
    if (data.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      values.push(data.due_date);
    }
    if (data.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex++}`);
      values.push(data.assigned_to);
    }

    if (updates.length === 0) {
      return this.findById(tenantId, id);
    }

    updates.push(`updated_at = now()`);
    values.push(id, tenantId);

    const result = await this.db.query(
      `UPDATE tasks SET ${updates.join(', ')} 
       WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
       RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
  }
}
