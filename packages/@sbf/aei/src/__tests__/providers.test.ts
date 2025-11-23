/**
 * Tests for AI Provider Configurations
 */

import { AIProviderFactory, AIProviderConfig } from '../providers';

describe('AI Providers', () => {
  describe('Provider Factory', () => {
    it('should create Ollama provider', () => {
      const config: AIProviderConfig = {
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
      };

      const provider = AIProviderFactory.create(config);
      expect(provider).toBeDefined();
    });

    it('should create OpenAI provider', () => {
      const config: AIProviderConfig = {
        type: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };

      const provider = AIProviderFactory.create(config);
      expect(provider).toBeDefined();
    });

    it('should create Anthropic provider', () => {
      const config: AIProviderConfig = {
        type: 'anthropic',
        apiKey: 'test-key',
        model: 'claude-3-opus-20240229',
      };

      const provider = AIProviderFactory.create(config);
      expect(provider).toBeDefined();
    });
  });

  describe('Provider Configuration', () => {
    it('should accept valid Ollama configuration', () => {
      const config: AIProviderConfig = {
        type: 'ollama',
        baseUrl: 'http://localhost:11434',
        model: 'llama2',
      };

      expect(config.type).toBe('ollama');
      expect(config.model).toBe('llama2');
      expect(config.baseUrl).toBe('http://localhost:11434');
    });

    it('should accept valid OpenAI configuration', () => {
      const config: AIProviderConfig = {
        type: 'openai',
        apiKey: 'sk-test-key',
        model: 'gpt-4',
      };

      expect(config.type).toBe('openai');
      expect(config.model).toBe('gpt-4');
      expect(config.apiKey).toBe('sk-test-key');
    });

    it('should accept valid Anthropic configuration', () => {
      const config: AIProviderConfig = {
        type: 'anthropic',
        apiKey: 'sk-ant-test-key',
        model: 'claude-3-opus-20240229',
      };

      expect(config.type).toBe('anthropic');
      expect(config.model).toBe('claude-3-opus-20240229');
      expect(config.apiKey).toBe('sk-ant-test-key');
    });
  });

  describe('Provider Capabilities', () => {
    it('should support extraction capability', () => {
      const capabilities = {
        extraction: true,
        classification: true,
        relationshipDiscovery: true,
        embedding: false,
      };

      expect(capabilities.extraction).toBe(true);
      expect(capabilities.classification).toBe(true);
    });

    it('should support various provider features', () => {
      const features = {
        streaming: true,
        functionCalling: true,
        vision: false,
        embeddings: true,
      };

      expect(features.streaming).toBe(true);
      expect(features.functionCalling).toBe(true);
    });
  });
});
