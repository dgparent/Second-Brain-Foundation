/**
 * Privacy Service - Main privacy enforcement service
 * Orchestrates privacy filtering, rule evaluation, and audit logging
 */

import { EventEmitter } from 'events';
import { Entity } from '@sbf/shared';
import { PrivacyFilter } from './PrivacyFilter';
import { PrivacyRuleEngine } from './PrivacyRuleEngine';
import { PrivacyAuditLogger, AuditStorage } from './PrivacyAuditLogger';
import {
  PrivacyLevel,
  PrivacyMetadata,
  AIProvider,
  PrivacyFilterResult,
  DEFAULT_AI_POLICIES,
  AIProviderPolicy,
} from './types';

export class PrivacyService extends EventEmitter {
  private filter: PrivacyFilter;
  private ruleEngine: PrivacyRuleEngine;
  private auditLogger: PrivacyAuditLogger;
  private aiPolicies: Map<AIProvider, AIProviderPolicy>;
  private entityPrivacyCache: Map<string, PrivacyLevel> = new Map();

  constructor(auditStorage: AuditStorage) {
    super();
    this.filter = new PrivacyFilter();
    this.ruleEngine = new PrivacyRuleEngine();
    this.auditLogger = new PrivacyAuditLogger(auditStorage);
    this.aiPolicies = new Map(Object.entries(DEFAULT_AI_POLICIES) as any);
  }

  /**
   * Set privacy level for an entity
   */
  async setPrivacyLevel(
    entityId: string,
    level: PrivacyLevel,
    userId: string = 'system'
  ): Promise<void> {
    this.entityPrivacyCache.set(entityId, level);
    this.emit('privacy:updated', { entityId, level, userId });
  }

  /**
   * Get privacy level for an entity
   */
  getPrivacyLevel(entity: Entity): PrivacyLevel {
    // Check cache first
    if (this.entityPrivacyCache.has(entity.uid)) {
      return this.entityPrivacyCache.get(entity.uid)!;
    }

    // Check entity metadata
    if (entity.metadata?.privacy?.level !== undefined) {
      return entity.metadata.privacy.level;
    }

    // Default to Personal for safety
    return PrivacyLevel.Personal;
  }

  /**
   * Check if AI can access entity content
   */
  canAIAccess(
    entity: Entity,
    aiProvider: AIProvider,
    userId: string = 'system'
  ): boolean {
    const privacyLevel = this.getPrivacyLevel(entity);
    const policy = this.aiPolicies.get(aiProvider);

    if (!policy) {
      return false;
    }

    // Check if privacy level is allowed by policy
    if (!policy.allowedPrivacyLevels.includes(privacyLevel)) {
      return false;
    }

    // Evaluate rules
    const evaluation = this.ruleEngine.evaluateRules(entity, { aiProvider, userId });
    
    return evaluation.allowed;
  }

  /**
   * Process content for AI access (filter if needed)
   */
  async processForAI(
    entity: Entity,
    aiProvider: AIProvider,
    userId: string = 'system'
  ): Promise<{
    allowed: boolean;
    content: string;
    filtered: boolean;
    violations: string[];
  }> {
    const privacyLevel = this.getPrivacyLevel(entity);
    const violations: string[] = [];

    // Evaluate rules first
    const evaluation = this.ruleEngine.evaluateRules(entity, { aiProvider, userId });

    if (!evaluation.allowed) {
      await this.auditLogger.logAccess({
        entityId: entity.uid,
        entityType: entity.type,
        action: 'deny',
        aiProvider,
        privacyLevel,
        wasFiltered: false,
        violations: ['Access denied by privacy rules'],
        userId,
      });

      await this.auditLogger.logViolation({
        entityId: entity.uid,
        rule: evaluation.appliedRules.join(', '),
        severity: privacyLevel >= PrivacyLevel.Private ? 'high' : 'medium',
        description: `AI provider ${aiProvider} attempted to access ${privacyLevel} content`,
        aiProvider,
      });

      return {
        allowed: false,
        content: '',
        filtered: false,
        violations: ['Access denied by privacy rules'],
      };
    }

    // Apply filtering if needed
    let processedContent = entity.content;
    let wasFiltered = false;

    if (evaluation.action === 'filter') {
      const filterResult = this.filter.filterContent(entity.content, privacyLevel);
      processedContent = filterResult.filteredContent;
      wasFiltered = filterResult.filtered;

      if (evaluation.filterFn) {
        processedContent = evaluation.filterFn(processedContent);
        wasFiltered = true;
      }
    }

    // Log access
    await this.auditLogger.logAccess({
      entityId: entity.uid,
      entityType: entity.type,
      action: wasFiltered ? 'filter' : 'access',
      aiProvider,
      privacyLevel,
      wasFiltered,
      violations,
      userId,
    });

    this.emit('privacy:access', {
      entityId: entity.uid,
      aiProvider,
      filtered: wasFiltered,
    });

    return {
      allowed: true,
      content: processedContent,
      filtered: wasFiltered,
      violations,
    };
  }

  /**
   * Filter content manually
   */
  filterContent(content: string, privacyLevel: PrivacyLevel): PrivacyFilterResult {
    return this.filter.filterContent(content, privacyLevel);
  }

  /**
   * Get audit trail for an entity
   */
  async getAuditTrail(entityId: string) {
    return this.auditLogger.getAuditTrail(entityId);
  }

  /**
   * Get privacy violations
   */
  async getViolations(entityId?: string) {
    return this.auditLogger.getViolations(entityId);
  }

  /**
   * Get privacy statistics
   */
  async getStatistics() {
    return this.auditLogger.getStatistics();
  }

  /**
   * Update AI provider policy
   */
  setAIProviderPolicy(provider: AIProvider, policy: AIProviderPolicy): void {
    this.aiPolicies.set(provider, policy);
    this.emit('privacy:policy-updated', { provider, policy });
  }

  /**
   * Get AI provider policy
   */
  getAIProviderPolicy(provider: AIProvider): AIProviderPolicy | undefined {
    return this.aiPolicies.get(provider);
  }

  /**
   * Shutdown service and flush audit logs
   */
  async shutdown(): Promise<void> {
    await this.auditLogger.shutdown();
  }

  /**
   * Get privacy filter instance for custom operations
   */
  getFilter(): PrivacyFilter {
    return this.filter;
  }

  /**
   * Get rule engine for custom rules
   */
  getRuleEngine(): PrivacyRuleEngine {
    return this.ruleEngine;
  }

  /**
   * Get audit logger for monitoring
   */
  getAuditLogger(): PrivacyAuditLogger {
    return this.auditLogger;
  }
}
