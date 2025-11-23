/**
 * Privacy Rule Engine - Rule-based privacy decisions
 * Evaluates privacy rules and makes access control decisions
 */

import { PrivacyRule, PrivacyLevel, AIProvider } from './types';

export class PrivacyRuleEngine {
  private rules: Map<string, PrivacyRule> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Confidential content cannot be accessed by any AI
    this.addRule({
      id: 'confidential-block',
      name: 'Block Confidential Content',
      description: 'Confidential content cannot be processed by any AI',
      condition: (entity, context) => {
        return entity.metadata?.privacy?.level === PrivacyLevel.Confidential;
      },
      action: 'deny',
    });

    // Rule 2: Private content can only be accessed by local AI
    this.addRule({
      id: 'private-local-only',
      name: 'Private Content - Local Only',
      description: 'Private content can only be processed by local AI',
      condition: (entity, context) => {
        return (
          entity.metadata?.privacy?.level === PrivacyLevel.Private &&
          context.aiProvider !== AIProvider.LocalLLM
        );
      },
      action: 'deny',
    });

    // Rule 3: Personal content requires filtering for third-party AI
    this.addRule({
      id: 'personal-filter',
      name: 'Filter Personal Content',
      description: 'Personal content must be filtered for third-party AI providers',
      condition: (entity, context) => {
        return (
          entity.metadata?.privacy?.level === PrivacyLevel.Personal &&
          context.aiProvider !== AIProvider.LocalLLM
        );
      },
      action: 'filter',
      filterFn: (content: string) => {
        // Remove sensitive patterns
        return content
          .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
          .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
      },
    });

    // Rule 4: Health data is always private
    this.addRule({
      id: 'health-private',
      name: 'Health Data Privacy',
      description: 'Health-related entities are automatically private',
      condition: (entity, context) => {
        return entity.type?.includes('health') || entity.type?.includes('medical');
      },
      action: 'deny',
    });

    // Rule 5: Financial data requires high privacy
    this.addRule({
      id: 'financial-private',
      name: 'Financial Data Privacy',
      description: 'Financial entities require local AI only',
      condition: (entity, context) => {
        return (
          (entity.type?.includes('financial') || entity.type?.includes('budget')) &&
          context.aiProvider !== AIProvider.LocalLLM
        );
      },
      action: 'deny',
    });
  }

  addRule(rule: PrivacyRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  getRule(ruleId: string): PrivacyRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): PrivacyRule[] {
    return Array.from(this.rules.values());
  }

  evaluateRules(entity: any, context: { aiProvider: AIProvider; userId: string }): {
    allowed: boolean;
    action: 'allow' | 'deny' | 'filter';
    appliedRules: string[];
    filterFn?: (content: string) => string;
  } {
    const appliedRules: string[] = [];
    let action: 'allow' | 'deny' | 'filter' = 'allow';
    let filterFn: ((content: string) => string) | undefined;

    for (const rule of this.rules.values()) {
      if (rule.condition(entity, context)) {
        appliedRules.push(rule.id);

        // Deny takes precedence over filter, filter over allow
        if (rule.action === 'deny') {
          action = 'deny';
          break;
        } else if (rule.action === 'filter') {
          action = 'filter';
          if (rule.filterFn) {
            filterFn = rule.filterFn;
          }
        }
      }
    }

    return {
      allowed: action !== 'deny',
      action,
      appliedRules,
      filterFn,
    };
  }

  clearAllRules(): void {
    this.rules.clear();
  }
}
