/**
 * @sbf/ai-client - ModelManager Tests
 */

import { ModelManager, ModelManagerDatabase, DefaultModelSelections } from './ModelManager';
import { Model } from './Model';

// Mock database adapter
function createMockDb(): ModelManagerDatabase & { 
  _models: Map<string, Record<string, unknown>>;
  _defaults: Map<string, Record<string, unknown>>;
} {
  const models = new Map<string, Record<string, unknown>>();
  const defaults = new Map<string, Record<string, unknown>>();

  return {
    _models: models,
    _defaults: defaults,

    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      // Simple mock that returns all models matching filter
      const results: Record<string, unknown>[] = [];
      
      for (const model of models.values()) {
        let matches = true;
        
        // Check provider filter
        if (sql.includes('provider =') && params) {
          const providerIdx = sql.indexOf('provider =');
          const paramNum = parseInt(sql.substring(providerIdx + 12, providerIdx + 13));
          if (model.provider !== params[paramNum - 1]) matches = false;
        }
        
        // Check type filter
        if (sql.includes('type =') && params) {
          const typeIdx = sql.indexOf('type =');
          const paramNum = parseInt(sql.substring(typeIdx + 8, typeIdx + 9));
          if (model.type !== params[paramNum - 1]) matches = false;
        }
        
        // Check is_local filter
        if (sql.includes('is_local =') && params) {
          const localIdx = sql.indexOf('is_local =');
          const paramNum = parseInt(sql.substring(localIdx + 12, localIdx + 13));
          if (model.is_local !== params[paramNum - 1]) matches = false;
        }
        
        // Check is_active filter
        if (sql.includes('is_active =') && params) {
          const activeIdx = sql.indexOf('is_active =');
          const paramNum = parseInt(sql.substring(activeIdx + 13, activeIdx + 14));
          if (model.is_active !== params[paramNum - 1]) matches = false;
        }
        
        if (matches) results.push(model);
      }
      
      return results as T[];
    },

    async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
      if (sql.includes('FROM models')) {
        if (sql.includes('id =') && params?.[0]) {
          return (models.get(params[0] as string) as T) || null;
        }
        if (sql.includes('provider =') && sql.includes('model_id =') && params) {
          const key = `${params[0]}:${params[1]}`;
          for (const model of models.values()) {
            if (model.provider === params[0] && model.model_id === params[1]) {
              return model as T;
            }
          }
        }
      }
      if (sql.includes('FROM default_models') && params?.[0]) {
        return (defaults.get(params[0] as string) as T) || null;
      }
      return null;
    },

    async execute(sql: string, params?: unknown[]): Promise<void> {
      if (sql.includes('INSERT INTO models') && params) {
        const id = params[0] as string;
        models.set(id, {
          id: params[0],
          name: params[1],
          provider: params[2],
          type: params[3],
          model_id: params[4],
          capabilities: JSON.parse(params[5] as string || '{}'),
          config: JSON.parse(params[6] as string || '{}'),
          cost_per_million_input: params[7],
          cost_per_million_output: params[8],
          is_local: params[9],
          is_active: params[10],
          created_at: params[11],
          updated_at: params[12],
        });
      }
      if (sql.includes('UPDATE models') && params) {
        const id = params[0] as string;
        const existing = models.get(id);
        if (existing) {
          existing.name = params[1];
          existing.capabilities = JSON.parse(params[2] as string || '{}');
          existing.config = JSON.parse(params[3] as string || '{}');
          existing.cost_per_million_input = params[4];
          existing.cost_per_million_output = params[5];
          existing.is_active = params[6];
          existing.updated_at = params[7];
        }
      }
      if (sql.includes('INSERT INTO default_models') && params) {
        defaults.set(params[0] as string, {
          tenant_id: params[0],
          default_chat_model: params[1],
          default_transformation_model: params[2],
          default_embedding_model: params[3],
          default_tts_model: params[4],
          default_stt_model: params[5],
          large_context_model: params[6],
          allow_cloud_for_personal: params[7],
        });
      }
      if (sql.includes('UPDATE default_models') && params) {
        const tenantId = params[0] as string;
        const existing = defaults.get(tenantId);
        if (existing) {
          if (params[1]) existing.default_chat_model = params[1];
          if (params[2]) existing.default_transformation_model = params[2];
          if (params[3]) existing.default_embedding_model = params[3];
          if (params[4]) existing.default_tts_model = params[4];
          if (params[5]) existing.default_stt_model = params[5];
          if (params[6]) existing.large_context_model = params[6];
          if (params[7] !== undefined) existing.allow_cloud_for_personal = params[7];
        }
      }
    },
  };
}

describe('ModelManager', () => {
  let db: ReturnType<typeof createMockDb>;
  let manager: ModelManager;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    db = createMockDb();
    manager = new ModelManager(db, tenantId);
  });

  describe('createModel', () => {
    it('should create a new model', async () => {
      const model = await manager.createModel({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        capabilities: { maxTokens: 128000 },
        cost: { perMillionInput: 10, perMillionOutput: 30 },
      });

      expect(model.name).toBe('GPT-4');
      expect(model.provider).toBe('openai');
      expect(db._models.size).toBe(1);
    });
  });

  describe('getModel', () => {
    it('should retrieve a model by ID', async () => {
      const created = await manager.createModel({
        name: 'Test Model',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
      });

      const retrieved = await manager.getModel(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Model');
    });

    it('should return null for non-existent model', async () => {
      const model = await manager.getModel('non-existent');
      expect(model).toBeNull();
    });

    it('should cache model after first retrieval', async () => {
      const created = await manager.createModel({
        name: 'Cached Model',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      // First retrieval
      await manager.getModel(created.id);
      
      // Delete from DB to prove cache works
      db._models.delete(created.id);
      
      // Should still get from cache
      const cached = await manager.getModel(created.id);
      expect(cached).not.toBeNull();
      expect(cached?.name).toBe('Cached Model');
    });
  });

  describe('getModelByProviderId', () => {
    it('should retrieve model by provider and model_id', async () => {
      await manager.createModel({
        name: 'Claude',
        provider: 'anthropic',
        type: 'language',
        modelId: 'claude-3-sonnet',
        isLocal: false,
        isActive: true,
      });

      const model = await manager.getModelByProviderId('anthropic', 'claude-3-sonnet');

      expect(model).not.toBeNull();
      expect(model?.name).toBe('Claude');
    });
  });

  describe('listModels', () => {
    beforeEach(async () => {
      // Seed test data
      await manager.createModel({
        name: 'GPT-4',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });
      await manager.createModel({
        name: 'Llama 3',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
      });
      await manager.createModel({
        name: 'Embedding',
        provider: 'openai',
        type: 'embedding',
        modelId: 'text-embedding-3',
        isLocal: false,
        isActive: true,
      });
    });

    it('should list all models', async () => {
      const models = await manager.listModels();
      expect(models.length).toBe(3);
    });

    it('should filter by provider', async () => {
      const models = await manager.listModels({ provider: 'openai' });
      expect(models.length).toBe(2);
    });

    it('should filter by type', async () => {
      const models = await manager.listModels({ type: 'language' });
      expect(models.length).toBe(2);
    });

    it('should filter by isLocal', async () => {
      const localModels = await manager.listModels({ isLocal: true });
      expect(localModels.length).toBe(1);
      expect(localModels[0].name).toBe('Llama 3');
    });
  });

  describe('updateModel', () => {
    it('should update model fields', async () => {
      const model = await manager.createModel({
        name: 'Original',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      const updated = await manager.updateModel(model.id, { name: 'Updated' });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe('Updated');
    });

    it('should return null for non-existent model', async () => {
      const result = await manager.updateModel('non-existent', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('default model management', () => {
    it('should set and get default selections', async () => {
      const chatModel = await manager.createModel({
        name: 'Default Chat',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      await manager.setDefaultSelections({
        defaultChatModel: chatModel.id,
      });

      const selections = await manager.getDefaultSelections();

      expect(selections).not.toBeNull();
      expect(selections?.defaultChatModel).toBe(chatModel.id);
    });

    it('should get default model by type', async () => {
      const chatModel = await manager.createModel({
        name: 'Chat Model',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      await manager.setDefaultSelections({
        defaultChatModel: chatModel.id,
      });

      const defaultChat = await manager.getDefaultModel('language');

      expect(defaultChat).not.toBeNull();
      expect(defaultChat?.name).toBe('Chat Model');
    });
  });

  describe('selectModel', () => {
    beforeEach(async () => {
      await manager.createModel({
        name: 'Cloud GPT',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
        capabilities: { supportsStreaming: true },
      });
      await manager.createModel({
        name: 'Local Llama',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
        capabilities: { supportsStreaming: true },
      });
    });

    it('should select any model for public sensitivity', async () => {
      const model = await manager.selectModel('language', { sensitivity: 'public' });
      expect(model).not.toBeNull();
    });

    it('should select only local models for confidential sensitivity', async () => {
      const model = await manager.selectModel('language', { sensitivity: 'confidential' });
      
      expect(model).not.toBeNull();
      expect(model?.isLocal).toBe(true);
      expect(model?.name).toBe('Local Llama');
    });

    it('should select only local models for secret sensitivity', async () => {
      const model = await manager.selectModel('language', { sensitivity: 'secret' });
      
      expect(model).not.toBeNull();
      expect(model?.isLocal).toBe(true);
    });

    it('should respect allowCloudForPersonal setting', async () => {
      await manager.setDefaultSelections({
        allowCloudForPersonal: false,
      });

      const model = await manager.selectModel('language', { sensitivity: 'personal' });
      
      expect(model?.isLocal).toBe(true);
    });
  });

  describe('getLocalModels', () => {
    it('should return only local models', async () => {
      await manager.createModel({
        name: 'Cloud',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });
      await manager.createModel({
        name: 'Local',
        provider: 'ollama',
        type: 'language',
        modelId: 'llama3',
        isLocal: true,
        isActive: true,
      });

      const localModels = await manager.getLocalModels();

      expect(localModels.length).toBe(1);
      expect(localModels[0].name).toBe('Local');
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      const model = await manager.createModel({
        name: 'Cached',
        provider: 'openai',
        type: 'language',
        modelId: 'gpt-4',
        isLocal: false,
        isActive: true,
      });

      // Load into cache
      await manager.getModel(model.id);
      
      // Delete from DB
      db._models.delete(model.id);
      
      // Should still be cached
      let cached = await manager.getModel(model.id);
      expect(cached).not.toBeNull();
      
      // Clear cache
      manager.clearCache();
      
      // Now should be null
      cached = await manager.getModel(model.id);
      expect(cached).toBeNull();
    });
  });
});
