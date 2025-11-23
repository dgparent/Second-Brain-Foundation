import { OpenAIProvider } from '../../src/providers/OpenAIProvider';
import { AnthropicProvider } from '../../src/providers/AnthropicProvider';
import { OllamaProvider } from '../../src/providers/OllamaProvider';
import { AIProviderFactory } from '../../src/providers';

describe('AI Providers', () => {
  describe('AIProviderFactory', () => {
    it('should create OpenAI provider', () => {
      const provider = AIProviderFactory.create({
        type: 'openai',
        apiKey: 'test-key',
      });
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should create Anthropic provider', () => {
      const provider = AIProviderFactory.create({
        type: 'anthropic',
        apiKey: 'test-key',
      });
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should create Ollama provider', () => {
      const provider = AIProviderFactory.create({
        type: 'ollama',
      });
      expect(provider).toBeInstanceOf(OllamaProvider);
    });

    it('should throw error for missing API key', () => {
      expect(() => {
        AIProviderFactory.create({
          type: 'openai',
        } as any);
      }).toThrow('OpenAI API key is required');
    });
  });

  describe('OpenAIProvider', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider(
        process.env.OPENAI_API_KEY || 'test-key',
        'gpt-4o-mini'
      );
    });

    it('should initialize with correct model', () => {
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('should have extractEntities method', () => {
      expect(typeof provider.extractEntities).toBe('function');
    });

    it('should have classifyContent method', () => {
      expect(typeof provider.classifyContent).toBe('function');
    });

    it('should have inferRelationships method', () => {
      expect(typeof provider.inferRelationships).toBe('function');
    });

    it('should have testConnection method', () => {
      expect(typeof provider.testConnection).toBe('function');
    });
  });

  describe('AnthropicProvider', () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider(
        process.env.ANTHROPIC_API_KEY || 'test-key',
        'claude-3-5-sonnet-20241022'
      );
    });

    it('should initialize with correct model', () => {
      expect(provider).toBeInstanceOf(AnthropicProvider);
    });

    it('should have extractEntities method', () => {
      expect(typeof provider.extractEntities).toBe('function');
    });

    it('should have classifyContent method', () => {
      expect(typeof provider.classifyContent).toBe('function');
    });

    it('should have inferRelationships method', () => {
      expect(typeof provider.inferRelationships).toBe('function');
    });

    it('should have testConnection method', () => {
      expect(typeof provider.testConnection).toBe('function');
    });
  });

  describe('OllamaProvider', () => {
    let provider: OllamaProvider;

    beforeEach(() => {
      provider = new OllamaProvider({
        baseUrl: 'http://localhost:11434',
        model: 'llama3.2:latest',
      });
    });

    it('should initialize with correct config', () => {
      expect(provider).toBeInstanceOf(OllamaProvider);
    });

    it('should have extractEntities method', () => {
      expect(typeof provider.extractEntities).toBe('function');
    });

    it('should have classifyContent method', () => {
      expect(typeof provider.classifyContent).toBe('function');
    });

    it('should have inferRelationships method', () => {
      expect(typeof provider.inferRelationships).toBe('function');
    });

    it('should have testConnection method', () => {
      expect(typeof provider.testConnection).toBe('function');
    });
  });
});
