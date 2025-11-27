import type { LegacyEntity as Entity, EntityFilters, EntityRepository, TenantContext } from '@sbf/shared';
import { db } from '../client';
import { v4 as uuidv4 } from 'uuid';

export class PostgresEntityRepository implements EntityRepository {
  async create(
    context: TenantContext,
    entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>
  ): Promise<Entity> {
    const id = uuidv4();
    const now = new Date();

    const result = await db.query<Entity>(
      context,
      `INSERT INTO entities (
        id, tenant_id, type, title, content, metadata, embedding, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id,
        context.tenant_id,
        entity.type,
        entity.title,
        entity.content || null,
        JSON.stringify(entity.metadata || {}),
        entity.embedding ? `[${entity.embedding.join(',')}]` : null,
        entity.tags || [],
        context.user_id
      ]
    );

    return result.rows[0];
  }

  async findById(context: TenantContext, id: string): Promise<Entity | null> {
    const result = await db.query<Entity>(
      context,
      'SELECT * FROM entities WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    return result.rows[0] || null;
  }

  async findMany(context: TenantContext, filters: EntityFilters): Promise<Entity[]> {
    let query = 'SELECT * FROM entities WHERE deleted_at IS NULL';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        query += ` AND type = ANY($${paramCount})`;
        params.push(filters.type);
      } else {
        query += ` AND type = $${paramCount}`;
        params.push(filters.type);
      }
      paramCount++;
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ` AND tags && $${paramCount}`;
      params.push(filters.tags);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.createdAfter) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(filters.createdAfter);
      paramCount++;
    }

    if (filters.createdBefore) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(filters.createdBefore);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
      paramCount++;
    }

    const result = await db.query<Entity>(context, query, params);
    return result.rows;
  }

  async update(
    context: TenantContext,
    id: string,
    updates: Partial<Entity>
  ): Promise<Entity> {
    const setClauses: string[] = [];
    const params: any[] = [id];
    let paramCount = 2;

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramCount}`);
      params.push(updates.title);
      paramCount++;
    }

    if (updates.content !== undefined) {
      setClauses.push(`content = $${paramCount}`);
      params.push(updates.content);
      paramCount++;
    }

    if (updates.metadata !== undefined) {
      setClauses.push(`metadata = $${paramCount}`);
      params.push(JSON.stringify(updates.metadata));
      paramCount++;
    }

    if (updates.tags !== undefined) {
      setClauses.push(`tags = $${paramCount}`);
      params.push(updates.tags);
      paramCount++;
    }

    if (updates.embedding !== undefined) {
      setClauses.push(`embedding = $${paramCount}`);
      params.push(updates.embedding ? `[${updates.embedding.join(',')}]` : null);
      paramCount++;
    }

    setClauses.push('updated_at = NOW()');

    const query = `
      UPDATE entities
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await db.query<Entity>(context, query, params);
    
    if (result.rows.length === 0) {
      throw new Error(`Entity ${id} not found or already deleted`);
    }

    return result.rows[0];
  }

  async delete(context: TenantContext, id: string): Promise<void> {
    await db.query(
      context,
      'UPDATE entities SET deleted_at = NOW() WHERE id = $1',
      [id]
    );
  }

  async createRelationship(
    context: TenantContext,
    fromId: string,
    toId: string,
    type: string
  ): Promise<void> {
    const id = uuidv4();
    
    await db.query(
      context,
      `INSERT INTO entity_relationships (id, tenant_id, from_entity_id, to_entity_id, relationship_type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id, from_entity_id, to_entity_id, relationship_type) DO NOTHING`,
      [id, context.tenant_id, fromId, toId, type]
    );
  }

  async getRelatedEntities(context: TenantContext, entityId: string): Promise<Entity[]> {
    const result = await db.query<Entity>(
      context,
      `SELECT e.* FROM entities e
       INNER JOIN entity_relationships r ON (e.id = r.to_entity_id OR e.id = r.from_entity_id)
       WHERE (r.from_entity_id = $1 OR r.to_entity_id = $1)
         AND e.id != $1
         AND e.deleted_at IS NULL
       ORDER BY r.created_at DESC`,
      [entityId]
    );

    return result.rows;
  }

  async searchByText(
    context: TenantContext,
    query: string,
    filters?: EntityFilters
  ): Promise<Entity[]> {
    return this.findMany(context, { ...filters, search: query });
  }

  async searchByEmbedding(
    context: TenantContext,
    embedding: number[],
    filters?: EntityFilters
  ): Promise<Entity[]> {
    let query = `
      SELECT *, 
             1 - (embedding <=> $1::vector) as similarity
      FROM entities
      WHERE deleted_at IS NULL
        AND embedding IS NOT NULL
    `;
    
    const params: any[] = [`[${embedding.join(',')}]`];
    let paramCount = 2;

    if (filters?.type) {
      if (Array.isArray(filters.type)) {
        query += ` AND type = ANY($${paramCount})`;
        params.push(filters.type);
      } else {
        query += ` AND type = $${paramCount}`;
        params.push(filters.type);
      }
      paramCount++;
    }

    query += ' ORDER BY similarity DESC';

    if (filters?.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    const result = await db.query<Entity>(context, query, params);
    return result.rows;
  }
}

export const entityRepository = new PostgresEntityRepository();

