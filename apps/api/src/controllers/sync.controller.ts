import { Request, Response } from 'express';
import { getDbClient } from '@sbf/db-client';
import {
  SyncItem,
  SyncConflictResolver
} from '@sbf/core-entity-manager';
import {
  TenantContext,
  LegacyEntity as Entity,
  TruthLevel
} from '@sbf/shared';

export class SyncController {
  private conflictResolver: SyncConflictResolver;

  constructor() {
    this.conflictResolver = new SyncConflictResolver();
  }

  /**
   * POST /api/sync/push
   * Accept sync items from local client and apply to cloud database
   */
  push = async (req: Request, res: Response) => {
    try {
      const { items } = req.body as { items: SyncItem[] };
      
      if (!Array.isArray(items)) {
        return res.status(400).json({
          error: 'Invalid request: items must be an array'
        });
      }

      const tenantContext = (req as any).tenantContext as TenantContext;
      const db = getDbClient();

      const results = {
        accepted: [] as string[],
        rejected: [] as Array<{ id: string; reason: string }>,
        conflicts: [] as Array<{ id: string; resolution: string }>
      };

      // Process each sync item
      for (const item of items) {
        try {
          await db.withTenant(tenantContext, async (client) => {
            // Check if entity exists
            const existing = await client.query(
              `SELECT * FROM entities WHERE id = $1 AND tenant_id = $2`,
              [item.id, tenantContext.tenant_id]
            );

            if (existing.rows.length === 0) {
              // New entity - insert
              await this.insertEntity(client, item, tenantContext);
              results.accepted.push(item.id);
            } else {
              // Existing entity - check for conflicts
              const existingEntity = existing.rows[0];
              const conflict = this.conflictResolver.resolve(
                this.mapDbRowToEntity(existingEntity),
                this.syncItemToEntity(item, tenantContext)
              );

              if (conflict.shouldAccept) {
                await this.updateEntity(client, item, tenantContext);
                results.accepted.push(item.id);
                
                if (conflict.hadConflict) {
                  results.conflicts.push({
                    id: item.id,
                    resolution: conflict.resolution || 'auto-resolved'
                  });

                  // Log conflict event
                  await this.logSyncEvent(client, {
                    tenantId: tenantContext.tenant_id,
                    entityId: item.id,
                    eventType: 'conflict',
                    truthLevel: item.truthMetadata.truthLevel,
                    resolution: conflict.resolution
                  });
                }
              } else {
                results.rejected.push({
                  id: item.id,
                  reason: conflict.reason || 'Truth level conflict'
                });

                // Log rejection event
                await this.logSyncEvent(client, {
                  tenantId: tenantContext.tenant_id,
                  entityId: item.id,
                  eventType: 'rejected',
                  truthLevel: item.truthMetadata.truthLevel,
                  reason: conflict.reason
                });
              }
            }
          });
        } catch (error) {
          console.error(`Error processing sync item ${item.id}:`, error);
          results.rejected.push({
            id: item.id,
            reason: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: true,
        results,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sync push error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/sync/pull
   * Return changes from cloud since given timestamp/version
   */
  pull = async (req: Request, res: Response) => {
    try {
      const { since, limit = 100 } = req.query;
      const tenantContext = (req as any).tenantContext as TenantContext;
      const db = getDbClient();

      const changes: SyncItem[] = [];

      await db.withTenant(tenantContext, async (client) => {
        let query = `
          SELECT * FROM entities 
          WHERE tenant_id = $1
        `;
        const params: any[] = [tenantContext.tenant_id];

        if (since) {
          query += ` AND updated_at > $2`;
          params.push(new Date(since as string));
        }

        query += ` ORDER BY updated_at ASC LIMIT $${params.length + 1}`;
        params.push(Number(limit));

        const result = await client.query(query, params);

        for (const row of result.rows) {
          changes.push(this.dbRowToSyncItem(row));
        }
      });

      res.json({
        success: true,
        changes,
        timestamp: new Date().toISOString(),
        hasMore: changes.length === Number(limit)
      });
    } catch (error) {
      console.error('Sync pull error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/sync/status
   * Get sync status for tenant
   */
  getStatus = async (req: Request, res: Response) => {
    try {
      const tenantContext = (req as any).tenantContext as TenantContext;
      const db = getDbClient();

      let status: any = {};

      await db.withTenant(tenantContext, async (client) => {
        // Get last sync time
        const lastSync = await client.query(
          `SELECT MAX(created_at) as last_sync 
           FROM sync_events 
           WHERE tenant_id = $1`,
          [tenantContext.tenant_id]
        );

        // Get entity counts by truth level
        const truthLevelCounts = await client.query(
          `SELECT truth_level, COUNT(*) as count
           FROM entities
           WHERE tenant_id = $1
           GROUP BY truth_level`,
          [tenantContext.tenant_id]
        );

        status = {
          lastSync: lastSync.rows[0]?.last_sync,
          entityCounts: truthLevelCounts.rows.reduce((acc: any, row: any) => {
            acc[row.truth_level] = parseInt(row.count);
            return acc;
          }, {})
        };
      });

      res.json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sync status error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Helper methods

  private async insertEntity(client: any, item: SyncItem, context: TenantContext) {
    const entity = this.syncItemToEntity(item, context);
    
    await client.query(
      `INSERT INTO entities (
        id, tenant_id, type, title, content, metadata,
        tags, created_by, created_at, updated_at,
        truth_level, origin_source, origin_chain, accepted_by_user
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        entity.id,
        context.tenant_id,
        entity.type,
        entity.title,
        entity.content,
        JSON.stringify(entity.metadata),
        entity.tags,
        context.user_id,
        entity.createdAt,
        entity.updatedAt,
        entity.truthLevel,
        entity.originSource,
        JSON.stringify(entity.originChain),
        entity.acceptedByUser
      ]
    );
  }

  private async updateEntity(client: any, item: SyncItem, context: TenantContext) {
    const entity = this.syncItemToEntity(item, context);
    
    await client.query(
      `UPDATE entities SET
        title = $1,
        content = $2,
        metadata = $3,
        tags = $4,
        updated_at = $5,
        truth_level = $6,
        origin_source = $7,
        origin_chain = $8,
        accepted_by_user = $9
      WHERE id = $10 AND tenant_id = $11`,
      [
        entity.title,
        entity.content,
        JSON.stringify(entity.metadata),
        entity.tags,
        entity.updatedAt,
        entity.truthLevel,
        entity.originSource,
        JSON.stringify(entity.originChain),
        entity.acceptedByUser,
        entity.id,
        context.tenant_id
      ]
    );
  }

  private async logSyncEvent(client: any, event: {
    tenantId: string;
    entityId: string;
    eventType: string;
    truthLevel?: TruthLevel;
    resolution?: string;
    reason?: string;
  }) {
    await client.query(
      `INSERT INTO sync_events (
        tenant_id, entity_id, event_type, truth_level,
        resolution, reason, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        event.tenantId,
        event.entityId,
        event.eventType,
        event.truthLevel,
        event.resolution,
        event.reason,
        new Date()
      ]
    );
  }

  private syncItemToEntity(item: SyncItem, context: TenantContext): Entity {
    return {
      id: item.id,
      tenantId: context.tenant_id,
      type: item.data.type || 'note',
      title: item.data.title || '',
      content: item.data.content,
      metadata: item.data.metadata || {},
      tags: item.data.tags || [],
      createdBy: context.user_id,
      createdAt: new Date(item.timestamp),
      updatedAt: new Date(item.timestamp),
      truthLevel: item.truthMetadata.truthLevel,
      originSource: item.truthMetadata.originSource,
      originChain: item.truthMetadata.originChain,
      acceptedByUser: item.truthMetadata.acceptedByUser
    };
  }

  private mapDbRowToEntity(row: any): Entity {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      title: row.title,
      content: row.content,
      metadata: row.metadata,
      tags: row.tags,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      truthLevel: row.truth_level,
      originSource: row.origin_source,
      originChain: row.origin_chain,
      acceptedByUser: row.accepted_by_user
    };
  }

  private dbRowToSyncItem(row: any): SyncItem {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      entityType: row.type,
      operation: 'update',
      data: {
        type: row.type,
        title: row.title,
        content: row.content,
        metadata: row.metadata,
        tags: row.tags
      },
      truthMetadata: {
        truthLevel: row.truth_level,
        originSource: row.origin_source,
        originChain: row.origin_chain,
        acceptedByUser: row.accepted_by_user,
        lastModifiedByLevel: row.truth_level
      },
      version: row.updated_at.getTime(),
      timestamp: row.updated_at
    };
  }
}
