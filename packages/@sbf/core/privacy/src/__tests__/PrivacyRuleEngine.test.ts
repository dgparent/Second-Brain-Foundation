import { PrivacyRuleEngine } from '../PrivacyRuleEngine';
import { PrivacyLevel, AIProvider, PrivacyRule } from '../types';

describe('PrivacyRuleEngine', () => {
  let engine: PrivacyRuleEngine;

  beforeEach(() => {
    engine = new PrivacyRuleEngine();
  });

  describe('evaluateRules', () => {
    it('should deny access to confidential content', () => {
      const entity = {
        id: 'test-1',
        type: 'note',
        metadata: { privacy: { level: PrivacyLevel.Confidential } },
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.OpenAI,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(false);
      expect(result.action).toBe('deny');
      expect(result.appliedRules).toContain('confidential-block');
    });

    it('should deny private content for non-local AI', () => {
      const entity = {
        id: 'test-2',
        type: 'note',
        metadata: { privacy: { level: PrivacyLevel.Private } },
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.OpenAI,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(false);
      expect(result.action).toBe('deny');
    });

    it('should allow private content for local AI', () => {
      const entity = {
        id: 'test-3',
        type: 'note',
        metadata: { privacy: { level: PrivacyLevel.Private } },
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.LocalLLM,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(true);
      expect(result.action).not.toBe('deny');
    });

    it('should filter personal content for third-party AI', () => {
      const entity = {
        id: 'test-4',
        type: 'note',
        metadata: { privacy: { level: PrivacyLevel.Personal } },
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.Anthropic,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(true);
      expect(result.action).toBe('filter');
      expect(result.filterFn).toBeDefined();
    });

    it('should deny health data to third-party AI', () => {
      const entity = {
        id: 'test-5',
        type: 'health-metric',
        metadata: {},
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.OpenAI,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(false);
      expect(result.action).toBe('deny');
      expect(result.appliedRules).toContain('health-private');
    });

    it('should deny financial data to third-party AI', () => {
      const entity = {
        id: 'test-6',
        type: 'financial-transaction',
        metadata: {},
      };

      const result = engine.evaluateRules(entity, {
        aiProvider: AIProvider.Google,
        userId: 'user-1',
      });

      expect(result.allowed).toBe(false);
      expect(result.action).toBe('deny');
      expect(result.appliedRules).toContain('financial-private');
    });
  });

  describe('rule management', () => {
    it('should add custom rule', () => {
      const customRule: PrivacyRule = {
        id: 'custom-1',
        name: 'Test Rule',
        description: 'Test description',
        condition: () => true,
        action: 'deny',
      };

      engine.addRule(customRule);
      const retrieved = engine.getRule('custom-1');

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Rule');
    });

    it('should remove rule', () => {
      engine.removeRule('confidential-block');
      const retrieved = engine.getRule('confidential-block');

      expect(retrieved).toBeUndefined();
    });

    it('should get all rules', () => {
      const rules = engine.getAllRules();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should clear all rules', () => {
      engine.clearAllRules();
      const rules = engine.getAllRules();
      expect(rules).toHaveLength(0);
    });
  });
});
