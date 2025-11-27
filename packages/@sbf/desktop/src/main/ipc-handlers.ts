/**
 * IPC Handlers for Desktop App
 * Connects UI components to backend services
 */

import { ipcMain } from 'electron';
import { EntityManager } from '@sbf/core-entity-manager';
import { LifecycleEngine } from '@sbf/core-lifecycle-engine';
import { DissolutionWorkflow } from '@sbf/core-lifecycle-engine';
import { PrivacyService, PrivacyLevel } from '@sbf/core-privacy';
import { VAService } from '@sbf/va-dashboard';
import { TaskService } from '@sbf/personal-tasks';
import { BudgetService } from '@sbf/budgeting';
import { FitnessService } from '@sbf/fitness-tracking';
import { CRMService } from '@sbf/relationship-crm';
import { PortfolioService } from '@sbf/portfolio-tracking';
import { NutritionService } from '@sbf/nutrition-tracking';
import { MedicationService } from '@sbf/medication-tracking';
import { LearningService } from '@sbf/learning-tracker';
import { LegalService } from '@sbf/legal-ops';
import { PropertyService } from '@sbf/property-mgmt';
import { HACCPService } from '@sbf/restaurant-haccp';
import { Entity, LifecycleState } from '@sbf/shared';
import { BaseAIProvider } from '@sbf/aei';
import { ConfigManager } from './ConfigManager';

export interface IPCHandlerDependencies {
  entityManager: EntityManager;
  lifecycleEngine: LifecycleEngine;
  dissolutionWorkflow: DissolutionWorkflow;
  privacyService: PrivacyService;
  vaService: VAService;
  taskService: TaskService;
  budgetService: BudgetService;
  fitnessService: FitnessService;
  crmService: CRMService;
  portfolioService: PortfolioService;
  nutritionService: NutritionService;
  medicationService: MedicationService;
  learningService: LearningService;
  legalService: LegalService;
  propertyService: PropertyService;
  haccpService: HACCPService;
  aiProvider: BaseAIProvider;
  configManager: ConfigManager;
}

export function setupIPCHandlers(deps: IPCHandlerDependencies) {
  // ============================================================================
  // Config & God Mode Handlers
  // ============================================================================

  ipcMain.handle('config:get', async () => {
    return deps.configManager.getConfig();
  });

  ipcMain.handle('config:set', async (event, newConfig) => {
    deps.configManager.saveConfig(newConfig);
    return { success: true };
  });

  ipcMain.handle('persona:setActive', async (event, persona) => {
    deps.vaService.setPersona(persona);
    return { success: true };
  });

  // ============================================================================
  // AI Handlers
  // ============================================================================

  ipcMain.handle('ai:extract', async (event, text: string) => {
    try {
      const entities = await deps.aiProvider.extractEntities(text);
      const classification = await deps.aiProvider.classifyContent(text);
      return { entities, classification };
    } catch (error) {
      console.error('Error extracting from text:', error);
      throw error;
    }
  });

  ipcMain.handle('ai:generate', async (event, { prompt }) => {
    try {
      const response = await deps.aiProvider.chat([
        { role: 'user', content: prompt }
      ]);
      return response;
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  });

  // ============================================================================
  // Finance Handlers
  // ============================================================================

  ipcMain.handle('finance:createAccount', async (event, { title, type, currency, institution, initialBalance }) => {
    try {
      return await deps.budgetService.createAccount(title, type, currency, institution, initialBalance);
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:logTransaction', async (event, { title, amount, currency, accountUid, date, category, merchant }) => {
    try {
      return await deps.budgetService.logTransaction(title, amount, currency, accountUid, date, category, merchant);
    } catch (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getAccounts', async () => {
    try {
      return await deps.budgetService.getAccounts();
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getTransactions', async (event, accountUid) => {
    try {
      return await deps.budgetService.getTransactions(accountUid);
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getNetWorth', async () => {
    try {
      return await deps.budgetService.getNetWorth();
    } catch (error) {
      console.error('Error getting net worth:', error);
      throw error;
    }
  });

  // Portfolio Handlers
  ipcMain.handle('finance:addAsset', async (event, { name, assetType, quantity, symbol, currentPrice, currency, accountUid }) => {
    try {
      return await deps.portfolioService.addAsset(name, assetType, quantity, symbol, currentPrice, currency, accountUid);
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getAssets', async (event, accountUid) => {
    try {
      return await deps.portfolioService.getAssets(accountUid);
    } catch (error) {
      console.error('Error getting assets:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getPortfolioValue', async (event, currency) => {
    try {
      return await deps.portfolioService.getPortfolioValue(currency);
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      throw error;
    }
  });

  ipcMain.handle('finance:getAllocation', async () => {
    try {
      return await deps.portfolioService.getAllocation();
    } catch (error) {
      console.error('Error getting allocation:', error);
      throw error;
    }
  });

  // ============================================================================
  // Fitness Handlers
  // ============================================================================

  ipcMain.handle('fitness:logMetric', async (event, { metricType, value, unit, date, time, source }) => {
    try {
      return await deps.fitnessService.logMetric(metricType, value, unit, date, time, source);
    } catch (error) {
      console.error('Error logging metric:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:logWorkout', async (event, { title, activityType, durationMinutes, date, caloriesBurned, notes }) => {
    try {
      return await deps.fitnessService.logWorkout(title, activityType, durationMinutes, date, caloriesBurned, notes);
    } catch (error) {
      console.error('Error logging workout:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getMetrics', async (event, metricType) => {
    try {
      return await deps.fitnessService.getMetrics(metricType);
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getWorkouts', async () => {
    try {
      return await deps.fitnessService.getWorkouts();
    } catch (error) {
      console.error('Error getting workouts:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getLatestMetric', async (event, metricType) => {
    try {
      return await deps.fitnessService.getLatestMetric(metricType);
    } catch (error) {
      console.error('Error getting latest metric:', error);
      throw error;
    }
  });

  // Nutrition Handlers
  ipcMain.handle('fitness:logMeal', async (event, { title, mealType, foods, date, time, notes }) => {
    try {
      return await deps.nutritionService.logMeal(title, mealType, foods, date, time, notes);
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getMeals', async (event, { startDate, endDate }) => {
    try {
      return await deps.nutritionService.getMeals(startDate, endDate);
    } catch (error) {
      console.error('Error getting meals:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getDailyNutrition', async (event, date) => {
    try {
      return await deps.nutritionService.getDailySummary(date);
    } catch (error) {
      console.error('Error getting daily nutrition:', error);
      throw error;
    }
  });

  // Medication Handlers
  ipcMain.handle('fitness:addMedication', async (event, { name, dosage, frequency, startDate, instructions, endDate }) => {
    try {
      return await deps.medicationService.addMedication(name, dosage, frequency, startDate, instructions, endDate);
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:getActiveMedications', async () => {
    try {
      return await deps.medicationService.getActiveMedications();
    } catch (error) {
      console.error('Error getting active medications:', error);
      throw error;
    }
  });

  ipcMain.handle('fitness:logDose', async (event, { medicationId, timestamp }) => {
    try {
      return await deps.medicationService.logDose(medicationId, timestamp);
    } catch (error) {
      console.error('Error logging dose:', error);
      throw error;
    }
  });

  // Learning Handlers
  ipcMain.handle('learning:addResource', async (event, { title, type, url, topics }) => {
    try {
      return await deps.learningService.addResource(title, type, url, topics);
    } catch (error) {
      console.error('Error adding learning resource:', error);
      throw error;
    }
  });

  ipcMain.handle('learning:getResources', async (event, status) => {
    try {
      return await deps.learningService.getResources(status);
    } catch (error) {
      console.error('Error getting learning resources:', error);
      throw error;
    }
  });

  ipcMain.handle('learning:updateProgress', async (event, { uid, percent, status }) => {
    try {
      return await deps.learningService.updateProgress(uid, percent, status);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      throw error;
    }
  });

  // Legal Handlers
  ipcMain.handle('legal:createCase', async (event, { title, caseNumber, caseType, client, description }) => {
    try {
      return await deps.legalService.createCase(title, caseNumber, caseType, client, description);
    } catch (error) {
      console.error('Error creating legal case:', error);
      throw error;
    }
  });

  ipcMain.handle('legal:getCases', async (event, status) => {
    try {
      return await deps.legalService.getCases(status);
    } catch (error) {
      console.error('Error getting legal cases:', error);
      throw error;
    }
  });

  // Property Handlers
  ipcMain.handle('property:addProperty', async (event, { title, address, propertyType, purchasePrice, purchaseDate }) => {
    try {
      return await deps.propertyService.addProperty(title, address, propertyType, purchasePrice, purchaseDate);
    } catch (error) {
      console.error('Error adding property:', error);
      throw error;
    }
  });

  ipcMain.handle('property:getProperties', async (event, status) => {
    try {
      return await deps.propertyService.getProperties(status);
    } catch (error) {
      console.error('Error getting properties:', error);
      throw error;
    }
  });

  // HACCP Handlers
  ipcMain.handle('haccp:logEntry', async (event, { item, logType, value, performedBy, isCCP, correctiveAction }) => {
    try {
      return await deps.haccpService.logEntry(item, logType, value, performedBy, isCCP, correctiveAction);
    } catch (error) {
      console.error('Error logging HACCP entry:', error);
      throw error;
    }
  });

  ipcMain.handle('haccp:getLogs', async (event, { startDate, endDate }) => {
    try {
      return await deps.haccpService.getLogs(startDate, endDate);
    } catch (error) {
      console.error('Error getting HACCP logs:', error);
      throw error;
    }
  });

  // ============================================================================
  // CRM Handlers
  // ============================================================================

  ipcMain.handle('crm:createContact', async (event, { fullName, category, email, phone, company, jobTitle, notes }) => {
    try {
      return await deps.crmService.createContact(fullName, category, email, phone, company, jobTitle, notes);
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  });

  ipcMain.handle('crm:logInteraction', async (event, { title, type, date, contactUids, summary, notes }) => {
    try {
      return await deps.crmService.logInteraction(title, type, date, contactUids, summary, notes);
    } catch (error) {
      console.error('Error logging interaction:', error);
      throw error;
    }
  });

  ipcMain.handle('crm:getContacts', async () => {
    try {
      return await deps.crmService.getContacts();
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  });

  ipcMain.handle('crm:getInteractions', async (event, contactUid) => {
    try {
      return await deps.crmService.getInteractions(contactUid);
    } catch (error) {
      console.error('Error getting interactions:', error);
      throw error;
    }
  });

  // ============================================================================
  // Task Handlers
  // ============================================================================

  ipcMain.handle('tasks:create', async (event, { title, priority, options }) => {
    try {
      return await deps.taskService.createTask(title, priority, options);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  });

  ipcMain.handle('tasks:getAll', async () => {
    try {
      return await deps.taskService.getAllTasks();
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  });

  ipcMain.handle('tasks:updateStatus', async (event, { uid, status }) => {
    try {
      return await deps.taskService.updateStatus(uid, status);
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  });

  // ============================================================================
  // VA Handlers
  // ============================================================================

  /**
   * Process a VA query
   */
  ipcMain.handle('va:query', async (event, query: string) => {
    try {
      const result = await deps.vaService.processQuery(query);
      return result;
    } catch (error) {
      console.error('Error processing VA query:', error);
      throw error;
    }
  });

  /**
   * Get Constitution Rules
   */
  ipcMain.handle('va:getConstitution', async () => {
    try {
      return await deps.vaService.getConstitution();
    } catch (error) {
      console.error('Error getting constitution:', error);
      return [];
    }
  });

  /**
   * Update Constitution Rule
   */
  ipcMain.handle('va:updateConstitution', async (event, rules: any[]) => {
    try {
      await deps.vaService.updateConstitution(rules);
      return { success: true };
    } catch (error) {
      console.error('Error updating constitution:', error);
      throw error;
    }
  });

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
