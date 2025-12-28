/**
 * @sbf/ai-client - ProviderFactory Tests
 */

import { ProviderFactory } from './ProviderFactory';
import { OpenAIProvider } from './providers/openai';
import { OllamaProvider } from './providers/ollama';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { GroqProvider } from './providers/groq';
import { TogetherProvider } from './providers/together';
import { MistralProvider } from './providers/mistral';

describe('ProviderFactory', () => {
  describe('getProvider', () => {
    it('should create OpenAI provider', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('openai');

      expect(provider).toBeInstanceOf(OpenAIProvider);
      expect(provider.providerInfo.name).toBe('openai');
    });

    it('should create Ollama provider without API key', () => {
      const factory = new ProviderFactory({
        ollama: { baseUrl: 'http://localhost:11434' },
      });

      const provider = factory.getProvider('ollama');

      expect(provider).toBeInstanceOf(OllamaProvider);
      expect(provider.providerInfo.name).toBe('ollama');
      expect(provider.providerInfo.isLocal).toBe(true);
    });

    it('should create Anthropic provider', () => {
      const factory = new ProviderFactory({
        anthropic: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('anthropic');

      expect(provider).toBeInstanceOf(AnthropicProvider);
      expect(provider.providerInfo.name).toBe('anthropic');
    });

    it('should create Google provider', () => {
      const factory = new ProviderFactory({
        google: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('google');

      expect(provider).toBeInstanceOf(GoogleProvider);
      expect(provider.providerInfo.name).toBe('google');
    });

    it('should create Groq provider', () => {
      const factory = new ProviderFactory({
        groq: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('groq');

      expect(provider).toBeInstanceOf(GroqProvider);
      expect(provider.providerInfo.name).toBe('groq');
    });

    it('should create Together provider', () => {
      const factory = new ProviderFactory({
        together: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('together');

      expect(provider).toBeInstanceOf(TogetherProvider);
      expect(provider.providerInfo.name).toBe('together');
    });

    it('should create Mistral provider', () => {
      const factory = new ProviderFactory({
        mistral: { apiKey: 'test-key' },
      });

      const provider = factory.getProvider('mistral');

      expect(provider).toBeInstanceOf(MistralProvider);
      expect(provider.providerInfo.name).toBe('mistral');
    });

    it('should throw error for missing API key', () => {
      const factory = new ProviderFactory({});

      expect(() => factory.getProvider('openai')).toThrow('OpenAI API key required');
      expect(() => factory.getProvider('anthropic')).toThrow('Anthropic API key required');
      expect(() => factory.getProvider('google')).toThrow('Google API key required');
    });

    it('should cache provider instances', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test-key' },
      });

      const provider1 = factory.getProvider('openai');
      const provider2 = factory.getProvider('openai');

      expect(provider1).toBe(provider2);
    });
  });

  describe('isConfigured', () => {
    it('should return true for configured providers', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test-key' },
        ollama: { baseUrl: 'http://localhost:11434' },
      });

      expect(factory.isConfigured('openai')).toBe(true);
      expect(factory.isConfigured('ollama')).toBe(true);
      expect(factory.isConfigured('anthropic')).toBe(false);
    });

    it('should always return true for Ollama', () => {
      const factory = new ProviderFactory({});

      expect(factory.isConfigured('ollama')).toBe(true);
    });
  });

  describe('getConfiguredProviders', () => {
    it('should return list of configured providers', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test-key' },
        anthropic: { apiKey: 'test-key' },
      });

      const configured = factory.getConfiguredProviders();

      expect(configured).toContain('openai');
      expect(configured).toContain('anthropic');
      expect(configured).toContain('ollama'); // Always configured
    });
  });

  describe('clearCache', () => {
    it('should clear cached providers', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test-key' },
      });

      const provider1 = factory.getProvider('openai');
      factory.clearCache();
      const provider2 = factory.getProvider('openai');

      expect(provider1).not.toBe(provider2);
    });
  });

  describe('fromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should create factory from environment variables', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

      const factory = ProviderFactory.fromEnv();

      expect(factory.isConfigured('openai')).toBe(true);
      expect(factory.isConfigured('anthropic')).toBe(true);
      expect(factory.isConfigured('ollama')).toBe(true);
    });

    it('should handle missing environment variables', () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const factory = ProviderFactory.fromEnv();

      expect(factory.isConfigured('openai')).toBe(false);
      expect(factory.isConfigured('anthropic')).toBe(false);
      expect(factory.isConfigured('ollama')).toBe(true);
    });
  });

  describe('provider info', () => {
    it('should have correct provider info for all providers', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test' },
        anthropic: { apiKey: 'test' },
        google: { apiKey: 'test' },
        groq: { apiKey: 'test' },
        together: { apiKey: 'test' },
        mistral: { apiKey: 'test' },
        ollama: {},
      });

      const providerTypes = ['openai', 'anthropic', 'google', 'groq', 'together', 'mistral', 'ollama'] as const;

      for (const type of providerTypes) {
        const provider = factory.getProvider(type);
        expect(provider.providerInfo.name).toBe(type);
        expect(typeof provider.providerInfo.displayName).toBe('string');
        expect(typeof provider.providerInfo.supportsStreaming).toBe('boolean');
        expect(typeof provider.providerInfo.supportsEmbedding).toBe('boolean');
        expect(typeof provider.providerInfo.isLocal).toBe('boolean');
      }
    });

    it('should identify local providers correctly', () => {
      const factory = new ProviderFactory({
        openai: { apiKey: 'test' },
        ollama: {},
      });

      expect(factory.getProvider('openai').providerInfo.isLocal).toBe(false);
      expect(factory.getProvider('ollama').providerInfo.isLocal).toBe(true);
    });
  });
});
