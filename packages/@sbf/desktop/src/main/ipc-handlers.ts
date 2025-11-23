/**
 * IPC Handlers for Desktop App
 * Connects UI components to backend services
 */

import { ipcMain } from 'electron';
import { EntityManager } from '@sbf/core-entity-manager';
import { LifecycleEngine } from '@sbf/core-lifecycle-engine';
import { DissolutionWorkflow } from '@sbf/core-lifecycle-engine';
import { PrivacyService, PrivacyLevel } from '@sbf/core-privacy';
import { Entity, LifecycleState } from '@sbf/shared';

export interface IPCHandlerDependencies {
  entityManager: EntityManager;
  lifecycleEngine: LifecycleEngine;
  dissolutionWorkflow: DissolutionWorkflow;
  privacyService: PrivacyService;
}

export function setupIPCHandlers(deps: IPCHandlerDependencies) {
  // ============================================================================
  // Lifecycle Handlers
  // ============================================================================

  /**
   * Get lifecycle statistics
   */
  ipcMain.handle('lifecycle:getStats', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      
      const stats = {
        active: 0,
        stale: 0,
        archived: 0,
        dissolved: 0,
        total: allEntities.length,
        activeEntities: 0,
        staleEntities: 0,
        archivedEntities: 0,
        dissolvedEntities: 0,
      };

      allEntities.forEach(entity => {
        const state = entity.lifecycle?.state || 'active';
        if (state in stats) {
          (stats as any)[state]++;
          (stats as any)[`${state}Entities`]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting lifecycle stats:', error);
      throw error;
    }
  });

  /**
   * Get all entities with lifecycle data
   */
  ipcMain.handle('lifecycle:getAllEntities', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      
      return allEntities.map(entity => ({
        uid: entity.uid,
        title: entity.title || 'Untitled',
        type: entity.type,
        state: entity.lifecycle?.state || 'active',
        created: entity.created,
        updated: entity.updated,
        lastActivity: entity.metadata?.lastActivity || entity.updated,
        metadata: {
          tags: entity.metadata?.tags || [],
          description: entity.metadata?.description || '',
        },
      }));
    } catch (error) {
      console.error('Error getting entities:', error);
      throw error;
    }
  });

  /**
   * Get dissolution queue
   */
  ipcMain.handle('lifecycle:getDissolutionQueue', async () => {
    try {
      const dueForTransition = await deps.lifecycleEngine.getDueForTransition();
      
      return dueForTransition.map(({ entity, rule }) => {
        const created = new Date(entity.created);
        const hoursSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60);
        const remainingHours = Math.max(0, (rule.autoTransitionHours || 48) - hoursSinceCreated);
        
        return {
          uid: entity.uid,
          title: entity.title || 'Untitled',
          type: entity.type,
          created: entity.created,
          scheduledFor: new Date(created.getTime() + (rule.autoTransitionHours || 48) * 60 * 60 * 1000).toISOString(),
          remainingHours: Math.round(remainingHours * 10) / 10,
          urgency: remainingHours < 6 ? 'urgent' : remainingHours < 24 ? 'warning' : 'normal',
          reason: `Automatic transition from ${rule.fromState} to ${rule.toState}`,
          content: entity.content || '',
          fromState: rule.fromState,
          toState: rule.toState,
        };
      });
    } catch (error) {
      console.error('Error getting dissolution queue:', error);
      throw error;
    }
  });

  /**
   * Prevent dissolution
   */
  ipcMain.handle('lifecycle:preventDissolution', async (event, { entityId, reason }) => {
    try {
      const entity = await deps.entityManager.get(entityId);
      if (!entity) {
        throw new Error(`Entity ${entityId} not found`);
      }

      await deps.entityManager.update(entityId, {
        metadata: {
          ...entity.metadata,
          prevent_dissolve: true,
          prevent_reason: reason,
          prevented_at: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error preventing dissolution:', error);
      throw error;
    }
  });

  /**
   * Postpone dissolution
   */
  ipcMain.handle('lifecycle:postponeDissolution', async (event, { entityId, days }) => {
    try {
      const entity = await deps.entityManager.get(entityId);
      if (!entity) {
        throw new Error(`Entity ${entityId} not found`);
      }

      const postponeUntil = new Date();
      postponeUntil.setDate(postponeUntil.getDate() + days);

      await deps.entityManager.update(entityId, {
        metadata: {
          ...entity.metadata,
          postpone_dissolve_until: postponeUntil.toISOString(),
          postponed_at: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error postponing dissolution:', error);
      throw error;
    }
  });

  /**
   * Approve dissolution
   */
  ipcMain.handle('lifecycle:approveDissolution', async (event, { entityId }) => {
    try {
      const result = await deps.dissolutionWorkflow.dissolve(entityId);
      return { success: true, result };
    } catch (error) {
      console.error('Error approving dissolution:', error);
      throw error;
    }
  });

  /**
   * Get state history
   */
  ipcMain.handle('lifecycle:getStateHistory', async (event, entityId) => {
    try {
      const history = deps.lifecycleEngine.getHistory(entityId);
      return history;
    } catch (error) {
      console.error('Error getting state history:', error);
      throw error;
    }
  });

  // ============================================================================
  // Notification Handlers
  // ============================================================================

  /**
   * Get all notifications
   */
  ipcMain.handle('notifications:getAll', async () => {
    try {
      // Mock notifications for now - would integrate with a real notification service
      const dueForTransition = await deps.lifecycleEngine.getDueForTransition();
      
      return dueForTransition.slice(0, 10).map(({ entity, rule }, index) => {
        const created = new Date(entity.created);
        const hoursSinceCreated = (Date.now() - created.getTime()) / (1000 * 60 * 60);
        const remainingHours = Math.max(0, (rule.autoTransitionHours || 48) - hoursSinceCreated);
        
        return {
          id: `notif-${entity.uid}`,
          type: 'dissolution_pending',
          priority: remainingHours < 6 ? 'urgent' : remainingHours < 24 ? 'high' : 'normal',
          title: `Dissolution pending: ${entity.title || 'Untitled'}`,
          message: `Will be dissolved in ${Math.round(remainingHours)} hours`,
          timestamp: new Date().toISOString(),
          entityId: entity.uid,
          actionable: true,
          read: false,
        };
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  });

  /**
   * Mark notification as read
   */
  ipcMain.handle('notifications:markAsRead', async (event, notificationId) => {
    // Mock implementation - would update notification storage
    return { success: true };
  });

  /**
   * Dismiss notification
   */
  ipcMain.handle('notifications:dismiss', async (event, notificationId) => {
    // Mock implementation - would update notification storage
    return { success: true };
  });

  // ============================================================================
  // Privacy Handlers
  // ============================================================================

  /**
   * Get privacy statistics
   */
  ipcMain.handle('privacy:getStats', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      
      const byLevel = {
        public: 0,
        internal: 0,
        confidential: 0,
        restricted: 0,
        secret: 0,
      };
      
      let encrypted = 0;
      let withAccessControls = 0;

      allEntities.forEach(entity => {
        const level = deps.privacyService.getPrivacyLevel(entity as any);
        const levelName = PrivacyLevel[level].toLowerCase();
        if (levelName in byLevel) {
          (byLevel as any)[levelName]++;
        }
        
        if (entity.metadata?.encrypted) {
          encrypted++;
        }
        
        if (entity.metadata?.access_controls) {
          withAccessControls++;
        }
      });

      return {
        totalEntities: allEntities.length,
        encryptedEntities: encrypted,
        encryptionPercentage: allEntities.length > 0 ? (encrypted / allEntities.length) * 100 : 0,
        publicEntities: byLevel.public,
        personalEntities: byLevel.internal,
        privateEntities: byLevel.confidential,
        confidentialEntities: byLevel.secret,
        byLevel,
        encrypted,
        withAccessControls,
        recentAuditEvents: 0, // TODO: Integrate with audit service
      };
    } catch (error) {
      console.error('Error getting privacy stats:', error);
      throw error;
    }
  });

  /**
   * Get encryption status
   */
  ipcMain.handle('privacy:getEncryptionStatus', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      const encryptedEntities = allEntities.filter(e => e.metadata?.encrypted).length;
      
      return {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        encryptedEntities,
        totalEntities: allEntities.length,
      };
    } catch (error) {
      console.error('Error getting encryption status:', error);
      throw error;
    }
  });

  /**
   * Get access control summary
   */
  ipcMain.handle('privacy:getAccessControlSummary', async () => {
    try {
      return {
        totalRoles: 3,
        totalPermissions: 12,
        activeUsers: 1,
        recentChanges: 0,
      };
    } catch (error) {
      console.error('Error getting access control summary:', error);
      throw error;
    }
  });

  /**
   * Get entities for classification
   */
  ipcMain.handle('privacy:getEntitiesForClassification', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      
      return allEntities.map(entity => ({
        uid: entity.uid,
        title: entity.title || 'Untitled',
        type: entity.type,
        currentLevel: deps.privacyService.getPrivacyLevel(entity as any),
        suggestedLevel: deps.privacyService.getPrivacyLevel(entity as any), // Would use ML to suggest
        confidence: 0.85,
        preview: (entity.content || '').substring(0, 200),
      }));
    } catch (error) {
      console.error('Error getting entities for classification:', error);
      throw error;
    }
  });

  /**
   * Classify entity
   */
  ipcMain.handle('privacy:classifyEntity', async (event, { entityId, level, userId = 'system' }) => {
    try {
      await deps.privacyService.setPrivacyLevel(entityId, level, userId);
      
      const entity = await deps.entityManager.get(entityId);
      if (entity) {
        await deps.entityManager.update(entityId, {
          metadata: {
            ...entity.metadata,
            privacy: {
              level,
              classifiedAt: new Date().toISOString(),
              classifiedBy: userId,
            },
          },
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error classifying entity:', error);
      throw error;
    }
  });

  /**
   * Bulk classify entities
   */
  ipcMain.handle('privacy:bulkClassify', async (event, { entityIds, level, userId = 'system' }) => {
    try {
      const results = await Promise.all(
        entityIds.map(async (entityId: string) => {
          try {
            await deps.privacyService.setPrivacyLevel(entityId, level, userId);
            
            const entity = await deps.entityManager.get(entityId);
            if (entity) {
              await deps.entityManager.update(entityId, {
                metadata: {
                  ...entity.metadata,
                  privacy: {
                    level,
                    classifiedAt: new Date().toISOString(),
                    classifiedBy: userId,
                  },
                },
              });
            }
            
            return { entityId, success: true };
          } catch (error) {
            return { entityId, success: false, error: (error as Error).message };
          }
        })
      );
      
      return { results };
    } catch (error) {
      console.error('Error bulk classifying:', error);
      throw error;
    }
  });

  // ============================================================================
  // Access Control Handlers
  // ============================================================================

  /**
   * Get roles
   */
  ipcMain.handle('access-control:getRoles', async () => {
    try {
      // Mock implementation - would query actual RBAC service
      return [
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['read', 'write', 'delete', 'admin'],
          userCount: 1,
        },
        {
          id: 'user',
          name: 'User',
          description: 'Standard user access',
          permissions: ['read', 'write'],
          userCount: 0,
        },
        {
          id: 'viewer',
          name: 'Viewer',
          description: 'Read-only access',
          permissions: ['read'],
          userCount: 0,
        },
      ];
    } catch (error) {
      console.error('Error getting roles:', error);
      throw error;
    }
  });

  /**
   * Get permissions
   */
  ipcMain.handle('access-control:getPermissions', async () => {
    try {
      // Mock implementation
      return [
        { id: 'read', name: 'Read', category: 'Data', description: 'View entities' },
        { id: 'write', name: 'Write', category: 'Data', description: 'Create and edit entities' },
        { id: 'delete', name: 'Delete', category: 'Data', description: 'Delete entities' },
        { id: 'admin', name: 'Admin', category: 'System', description: 'System administration' },
      ];
    } catch (error) {
      console.error('Error getting permissions:', error);
      throw error;
    }
  });

  /**
   * Get users
   */
  ipcMain.handle('access-control:getUsers', async () => {
    try {
      // Mock implementation
      return [
        {
          id: 'user-1',
          name: 'You',
          email: 'user@example.com',
          roles: ['admin'],
          lastAccess: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  });

  // ============================================================================
  // Encryption Handlers
  // ============================================================================

  /**
   * Get encryption keys
   */
  ipcMain.handle('encryption:getKeys', async () => {
    try {
      return [
        {
          id: 'key-1',
          algorithm: 'AES-256-GCM',
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          lastRotated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active' as const,
          usageCount: 0,
        },
      ];
    } catch (error) {
      console.error('Error getting encryption keys:', error);
      throw error;
    }
  });

  /**
   * Get encryption stats
   */
  ipcMain.handle('encryption:getStats', async () => {
    try {
      const allEntities = await deps.entityManager.getAll();
      const encrypted = allEntities.filter(e => e.metadata?.encrypted).length;
      const lastRotation = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const daysSinceRotation = (Date.now() - lastRotation.getTime()) / (1000 * 60 * 60 * 24);
      
      return {
        totalEntities: allEntities.length,
        encryptedEntities: encrypted,
        encryptionPercentage: allEntities.length > 0 ? (encrypted / allEntities.length) * 100 : 0,
        activeKeys: 1,
        lastRotation: lastRotation.toISOString(),
        recommendedRotation: daysSinceRotation > 90,
      };
    } catch (error) {
      console.error('Error getting encryption stats:', error);
      throw error;
    }
  });

  /**
   * Rotate keys
   */
  ipcMain.handle('encryption:rotateKeys', async () => {
    try {
      // Mock implementation - would trigger actual key rotation
      return {
        success: true,
        rotatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error rotating keys:', error);
      throw error;
    }
  });

  console.log('✅ IPC Handlers registered successfully');
}
