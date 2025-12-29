/**
 * Models API client for AI model configuration
 */
import { api } from './client';

export type ModelType = 'language' | 'embedding' | 'tts' | 'stt' | 'image';
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'groq' | 'together' | 'mistral' | 'ollama';

export interface Model {
  id: string;
  name: string;
  provider: ProviderType;
  type: ModelType;
  modelId: string;
  description?: string;
  contextWindow?: number;
  maxOutput?: number;
  inputCostPer1k?: number;
  outputCostPer1k?: number;
  isLocal: boolean;
  isEnabled: boolean;
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DefaultModels {
  default_chat_model: string;
  default_transformation_model: string;
  default_embedding_model: string;
  default_tts_model: string;
  default_stt_model: string;
}

export interface ModelUsage {
  modelId: string;
  modelName: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  requestCount: number;
  period: string;
}

export interface UsageSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byModel: ModelUsage[];
  period: {
    from: string;
    to: string;
  };
}

/**
 * Models API methods
 */
export const modelsApi = {
  /**
   * List all available models
   */
  listModels: async (type?: ModelType): Promise<Model[]> => {
    return api.get<Model[]>('/models', {
      params: type ? { type } : undefined,
    });
  },

  /**
   * Get a specific model by ID
   */
  getModel: async (modelId: string): Promise<Model> => {
    return api.get<Model>(`/models/${modelId}`);
  },

  /**
   * Get user's default model settings
   */
  getDefaults: async (): Promise<DefaultModels> => {
    return api.get<DefaultModels>('/models/defaults');
  },

  /**
   * Update user's default model settings
   */
  updateDefaults: async (defaults: Partial<DefaultModels>): Promise<DefaultModels> => {
    return api.put<DefaultModels>('/models/defaults', defaults);
  },

  /**
   * Test a model with a simple prompt
   */
  testModel: async (
    modelId: string,
    prompt: string
  ): Promise<{ response: string; tokens: number; latency: number }> => {
    return api.post<{ response: string; tokens: number; latency: number }>(`/models/${modelId}/test`, { prompt });
  },

  /**
   * Get usage statistics for a period
   */
  getUsage: async (
    period?: 'day' | 'week' | 'month' | 'all'
  ): Promise<UsageSummary> => {
    return api.get<UsageSummary>('/models/usage', {
      params: period ? { period } : undefined,
    });
  },

  /**
   * Get models by provider
   */
  getModelsByProvider: async (provider: ProviderType): Promise<Model[]> => {
    return api.get<Model[]>('/models', {
      params: { provider },
    });
  },

  /**
   * Get privacy-safe models (local only)
   */
  getPrivacySafeModels: async (): Promise<Model[]> => {
    return api.get<Model[]>('/models', {
      params: { isLocal: true },
    });
  },
};

export default modelsApi;
