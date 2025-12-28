/**
 * @sbf/ai-client - Model Tests
 */

import { Model, ModelType, ProviderType, ModelData } from './Model';

describe('Model', () => {
  describe('constructor', () => {
    it('should create a model with required fields', () => {
      const model = new Model({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      expect(model.name).toBe('GPT-4');
      expect(model.provider).toBe('openai');
      expect(model.type).toBe('language');
      expect(model.modelId).toBe('gpt-4');
      expect(model.isLocal).toBe(false);
      expect(model.isActive).toBe(true);
      expect(model.id).toBeDefined();
      expect(model.createdAt).toBeDefined();
      expect(model.updatedAt).toBeDefined();
    });

    it('should use provided ID if given', () => {
      const model = new Model({
        id: 'custom-id',
        name: 'Test Model',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
      });

      expect(model.id).toBe('custom-id');
    });

    it('should default isLocal to false', () => {
      const model = new Model({
        name: 'Cloud Model',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      expect(model.isLocal).toBe(false);
    });

    it('should set capabilities correctly', () => {
      const model = new Model({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        capabilities: {
          maxTokens: 128000,
          supportsStreaming: true,
          supportsJson: true,
        },
      });

      expect(model.capabilities.maxTokens).toBe(128000);
      expect(model.capabilities.supportsStreaming).toBe(true);
      expect(model.capabilities.supportsJson).toBe(true);
    });
  });

  describe('fromRow', () => {
    it('should create model from database row', () => {
      const row = {
        id: 'row-id',
        name: 'Claude 3',
        provider: 'anthropic',
        type: 'language',
        model_id: 'claude-3-sonnet',
        capabilities: { maxTokens: 200000 },
        config: { defaultTemperature: 0.7 },
        cost_per_million_input: 3.0,
        cost_per_million_output: 15.0,
        is_local: false,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      const model = Model.fromRow(row);

      expect(model.id).toBe('row-id');
      expect(model.name).toBe('Claude 3');
      expect(model.provider).toBe('anthropic');
      expect(model.modelId).toBe('claude-3-sonnet');
      expect(model.cost.perMillionInput).toBe(3.0);
      expect(model.cost.perMillionOutput).toBe(15.0);
    });
  });

  describe('toRow', () => {
    it('should convert model to database row format', () => {
      const model = new Model({
        id: 'test-id',
        name: 'Test Model',
        provider: 'openai',
        type: 'embedding',
        modelId: 'text-embedding-3',
        isLocal: false,
        isActive: true,
        capabilities: { dimensions: 1536 },
        cost: { perMillionInput: 0.02, perMillionOutput: 0 },
      });

      const row = model.toRow();

      expect(row.id).toBe('test-id');
      expect(row.name).toBe('Test Model');
      expect(row.model_id).toBe('text-embedding-3');
      expect(row.is_local).toBe(false);
      expect(row.cost_per_million_input).toBe(0.02);
    });
  });

  describe('capability methods', () => {
    it('should check streaming support', () => {
      const streaming = new Model({
        name: 'Streaming Model',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        capabilities: { supportsStreaming: true },
      });
      const noStreaming = new Model({
        name: 'No Streaming',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-3',
        isLocal: false,
        isActive: true,
        capabilities: { supportsStreaming: false },
      });

      expect(streaming.supportsStreaming()).toBe(true);
      expect(noStreaming.supportsStreaming()).toBe(false);
    });

    it('should check JSON support', () => {
      const jsonModel = new Model({
        name: 'JSON Model',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        capabilities: { supportsJson: true },
      });

      expect(jsonModel.supportsJson()).toBe(true);
    });

    it('should get max tokens', () => {
      const model = new Model({
        name: 'Large Context',
        provider: 'anthropic',
        type: 'language',
        modelId: 'claude-3',
        isLocal: false,
        isActive: true,
        capabilities: { maxTokens: 200000 },
      });
      const defaultModel = new Model({
        name: 'Default',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt',
        isLocal: false,
        isActive: true,
      });

      expect(model.getMaxTokens()).toBe(200000);
      expect(defaultModel.getMaxTokens()).toBe(4096); // default
    });

    it('should get embedding dimensions', () => {
      const embeddingModel = new Model({
        name: 'Embedding',
        provider: 'openai',
        type: 'embedding',
        modelId: 'text-embedding-3',
        isLocal: false,
        isActive: true,
        capabilities: { dimensions: 1536 },
      });

      expect(embeddingModel.getDimensions()).toBe(1536);
    });
  });

  describe('isPrivacySafe', () => {
    it('should return true for local models', () => {
      const localModel = new Model({
        name: 'Llama',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
      });

      expect(localModel.isPrivacySafe()).toBe(true);
    });

    it('should return false for cloud models', () => {
      const cloudModel = new Model({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      expect(cloudModel.isPrivacySafe()).toBe(false);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly', () => {
      const model = new Model({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        cost: {
          perMillionInput: 10.0,
          perMillionOutput: 30.0,
        },
      });

      // 1000 input tokens = $0.01, 500 output tokens = $0.015
      const cost = model.calculateCost(1000, 500);
      expect(cost).toBeCloseTo(0.025);
    });

    it('should return 0 for local models', () => {
      const localModel = new Model({
        name: 'Llama',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
        cost: { perMillionInput: 0, perMillionOutput: 0 },
      });

      const cost = localModel.calculateCost(10000, 5000);
      expect(cost).toBe(0);
    });
  });

  describe('with', () => {
    it('should create updated copy', () => {
      const original = new Model({
        id: 'orig-id',
        name: 'Original',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      const updated = original.with({ name: 'Updated Name' });

      expect(updated.id).toBe('orig-id');
      expect(updated.name).toBe('Updated Name');
      expect(updated.provider).toBe('openai');
      expect(original.name).toBe('Original'); // original unchanged
    });
  });
});
