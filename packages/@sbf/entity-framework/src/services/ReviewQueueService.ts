/**
 * ReviewQueueService
 * 
 * Manages the review queue for low-confidence AI extractions.
 * Implements human-in-the-loop validation for PRD FR25.
 */

import { v4 as uuidv4 } from 'uuid';
import type { DatabaseAdapter } from './EntityTypeRegistry';
import type {
  ReviewItem,
  ReviewItemType,
  ReviewItemStatus,
} from '../types';

export interface ReviewQueueConfig {
  defaultLimit?: number;
}

export class ReviewQueueService {
  private config: ReviewQueueConfig;
  
  constructor(
    private db: DatabaseAdapter,
    config: ReviewQueueConfig = {}
  ) {
    this.config = {
      defaultLimit: config.defaultLimit ?? 50,
    };
  }
  
  /**
   * Add item to review queue
   */
  async addToQueue(
    tenantId: string,
    type: ReviewItemType,
    data: Record<string, unknown>,
    confidence: number,
    entityId?: string
  ): Promise<ReviewItem> {
    const item: ReviewItem = {
      id: uuidv4(),
      tenantId,
      type,
      entityId,
      data,
      confidence,
      status: 'pending',
      createdAt: new Date(),
    };
    
    await this.db.execute(
      `INSERT INTO review_queue (id, tenant_id, type, entity_id, data, confidence, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [item.id, tenantId, type, entityId ?? null, JSON.stringify(data), confidence, 'pending']
    );
    
    return item;
  }
  
  /**
   * Get item by ID
   */
  async getById(id: string): Promise<ReviewItem | null> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM review_queue WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) return null;
    return this.rowToItem(result.rows[0]);
  }
  
  /**
   * Get pending review items
   */
  async getPendingReviews(
    tenantId: string,
    options?: { type?: ReviewItemType; limit?: number; sortBy?: 'confidence' | 'created_at' }
  ): Promise<ReviewItem[]> {
    const conditions: string[] = ['tenant_id = $1', 'status = $2'];
    const params: unknown[] = [tenantId, 'pending'];
    let paramIndex = 3;
    
    if (options?.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(options.type);
    }
    
    const orderBy = options?.sortBy === 'confidence' ? 'confidence ASC' : 'created_at DESC';
    const limit = options?.limit ?? this.config.defaultLimit;
    
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM review_queue 
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex}`,
      [...params, limit]
    );
    
    return result.rows.map(row => this.rowToItem(row));
  }
  
  /**
   * Get review items by entity
   */
  async getByEntity(entityId: string): Promise<ReviewItem[]> {
    const result = await this.db.query<Record<string, unknown>>(
      `SELECT * FROM review_queue WHERE entity_id = $1 ORDER BY created_at DESC`,
      [entityId]
    );
    
    return result.rows.map(row => this.rowToItem(row));
  }
  
  /**
   * Count pending reviews
   */
  async countPending(tenantId: string, type?: ReviewItemType): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM review_queue WHERE tenant_id = $1 AND status = 'pending'`;
    const params: unknown[] = [tenantId];
    
    if (type) {
      sql += ` AND type = $2`;
      params.push(type);
    }
    
    const result = await this.db.query<{ count: number }>(sql, params);
    return result.rows[0].count;
  }
  
  /**
   * Approve review item
   */
  async approve(
    itemId: string,
    reviewerId: string,
    modifications?: Record<string, unknown>
  ): Promise<ReviewItem> {
    const item = await this.getById(itemId);
    if (!item) {
      throw new Error(`Review item not found: ${itemId}`);
    }
    
    if (item.status !== 'pending') {
      throw new Error(`Review item is not pending: ${item.status}`);
    }
    
    const status: ReviewItemStatus = modifications ? 'modified' : 'approved';
    const data = modifications ? { ...item.data, ...modifications } : item.data;
    
    await this.db.execute(
      `UPDATE review_queue 
       SET status = $2, data = $3, reviewed_by = $4, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [itemId, status, JSON.stringify(data), reviewerId]
    );
    
    return {
      ...item,
      status,
      data,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    };
  }
  
  /**
   * Reject review item
   */
  async reject(
    itemId: string,
    reviewerId: string,
    reason?: string
  ): Promise<ReviewItem> {
    const item = await this.getById(itemId);
    if (!item) {
      throw new Error(`Review item not found: ${itemId}`);
    }
    
    if (item.status !== 'pending') {
      throw new Error(`Review item is not pending: ${item.status}`);
    }
    
    const data = { ...item.data, rejectionReason: reason };
    
    await this.db.execute(
      `UPDATE review_queue 
       SET status = 'rejected', data = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [itemId, JSON.stringify(data), reviewerId]
    );
    
    return {
      ...item,
      status: 'rejected',
      data,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    };
  }
  
  /**
   * Bulk approve items
   */
  async bulkApprove(
    itemIds: string[],
    reviewerId: string
  ): Promise<{ approved: number; failed: number }> {
    let approved = 0;
    let failed = 0;
    
    for (const itemId of itemIds) {
      try {
        await this.approve(itemId, reviewerId);
        approved++;
      } catch {
        failed++;
      }
    }
    
    return { approved, failed };
  }
  
  /**
   * Delete old reviewed items
   */
  async cleanupOldItems(olderThanDays: number = 30): Promise<number> {
    const result = await this.db.execute(
      `DELETE FROM review_queue 
       WHERE status IN ('approved', 'rejected', 'modified')
       AND reviewed_at < NOW() - INTERVAL '${olderThanDays} days'`
    );
    
    return result.rowCount;
  }
  
  /**
   * Get review statistics
   */
  async getStatistics(tenantId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    modified: number;
    avgConfidence: number;
    byType: Record<ReviewItemType, number>;
  }> {
    const countResult = await this.db.query<{ status: ReviewItemStatus; count: number }>(
      `SELECT status, COUNT(*) as count 
       FROM review_queue 
       WHERE tenant_id = $1 
       GROUP BY status`,
      [tenantId]
    );
    
    const typeResult = await this.db.query<{ type: ReviewItemType; count: number }>(
      `SELECT type, COUNT(*) as count 
       FROM review_queue 
       WHERE tenant_id = $1 AND status = 'pending'
       GROUP BY type`,
      [tenantId]
    );
    
    const avgResult = await this.db.query<{ avg: number }>(
      `SELECT AVG(confidence) as avg 
       FROM review_queue 
       WHERE tenant_id = $1 AND status = 'pending'`,
      [tenantId]
    );
    
    const statusCounts: Record<ReviewItemStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      modified: 0,
    };
    
    for (const row of countResult.rows) {
      statusCounts[row.status] = row.count;
    }
    
    const byType: Record<ReviewItemType, number> = {
      entity_extraction: 0,
      relationship: 0,
      bmom: 0,
      sensitivity: 0,
    };
    
    for (const row of typeResult.rows) {
      byType[row.type] = row.count;
    }
    
    return {
      ...statusCounts,
      avgConfidence: avgResult.rows[0]?.avg ?? 0,
      byType,
    };
  }
  
  /**
   * Convert database row to ReviewItem
   */
  private rowToItem(row: Record<string, unknown>): ReviewItem {
    return {
      id: row.id as string,
      tenantId: row.tenant_id as string,
      type: row.type as ReviewItemType,
      entityId: row.entity_id as string | undefined,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data as Record<string, unknown>,
      confidence: row.confidence as number,
      status: row.status as ReviewItemStatus,
      createdAt: new Date(row.created_at as string),
      reviewedBy: row.reviewed_by as string | undefined,
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at as string) : undefined,
    };
  }
}
