/**
 * Tests for AEI Core Functionality
 */

import { AEI, AIProviderConfig } from '../index';

describe('AEI Core', () => {
  describe('Initialization', () => {
    it('should create AEI instance with provider config', () => {
      const config = {
        provider: {
          type: 'ollama' as const,
          baseUrl: 'http://localhost:11434',
          model: 'llama2',
        },
      };

      const aei = new AEI(config);
      expect(aei).toBeDefined();
      expect(aei).toBeInstanceOf(AEI);
    });

    it('should create AEI instance with OpenAI provider', () => {
      const config = {
        provider: {
          type: 'openai' as const,
          apiKey: 'test-key',
          model: 'gpt-4',
        },
      };

      const aei = new AEI(config);
      expect(aei).toBeDefined();
    });

    it('should create AEI instance with Anthropic provider', () => {
      const config = {
        provider: {
          type: 'anthropic' as const,
          apiKey: 'test-key',
          model: 'claude-3-opus-20240229',
        },
      };

      const aei = new AEI(config);
      expect(aei).toBeDefined();
    });
  });

  describe('Provider Access', () => {
    it('should expose provider instance', () => {
      const config = {
        provider: {
          type: 'ollama' as const,
          baseUrl: 'http://localhost:11434',
          model: 'llama2',
        },
      };

      const aei = new AEI(config);
      const provider = aei.getProvider();
      
      expect(provider).toBeDefined();
      expect(provider.testConnection).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should be an event emitter', () => {
      const config = {
        provider: {
          type: 'ollama' as const,
          baseUrl: 'http://localhost:11434',
          model: 'llama2',
        },
      };

      const aei = new AEI(config);
      
      expect(aei.on).toBeDefined();
      expect(aei.emit).toBeDefined();
      expect(aei.off).toBeDefined();
    });

    it('should handle custom events', (done) => {
      const config = {
        provider: {
          type: 'ollama' as const,
          baseUrl: 'http://localhost:11434',
          model: 'llama2',
        },
      };

      const aei = new AEI(config);
      const testEvent = 'test:event';
      const testData = { message: 'test' };

      aei.on(testEvent, (data) => {
        expect(data).toEqual(testData);
        done();
      });

      aei.emit(testEvent, testData);
    });
  });
});
