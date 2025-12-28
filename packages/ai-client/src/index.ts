/**
 * @sbf/ai-client - AI/LLM Client Library
 * 
 * Multi-provider AI client with token tracking and context management.
 * Supports 7+ providers with unified interface for SBF platform.
 */

// Core interfaces
export * from './interfaces';

// Model registry and management
export * from './models';

// Provider implementations
export * from './providers';

// Provider factory
export { ProviderFactory } from './ProviderFactory';
export type { ProviderFactoryConfig } from './ProviderFactory';

// Token tracking and context (export specific items to avoid conflicts)
export {
  TokenTracker,
  ModelPricing,
  MODEL_PRICING,
  UsageStats,
  UsageStorage,
  InMemoryUsageStorage,
  estimateTokenCount,
  calculateCost,
  getContextWindow,
} from './TokenTracker';
export * from './ContextBuilder';

// Re-export common types
import { LlmProvider, ProviderConfig } from './interfaces';
import { ProviderType } from './models/Model';
import { OpenAIProvider } from './providers/openai';
import { OllamaProvider } from './providers/ollama';
import { AnthropicProvider } from './providers/anthropic';

/**
 * Legacy AiClientFactory for backwards compatibility
 * @deprecated Use ProviderFactory instead
 */
export class AiClientFactory {
  static create(config: { 
    provider: 'ollama' | 'openai' | 'anthropic'; 
    baseUrl?: string; 
    apiKey?: string 
  }): LlmProvider {
    switch (config.provider) {
      case 'ollama':
        return new OllamaProvider(config.baseUrl);
      case 'openai':
        if (!config.apiKey) throw new Error('API key required for OpenAI');
        return new OpenAIProvider(config.apiKey, { baseUrl: config.baseUrl });
      case 'anthropic':
        if (!config.apiKey) throw new Error('API key required for Anthropic');
        return new AnthropicProvider(config.apiKey, { baseUrl: config.baseUrl });
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}

