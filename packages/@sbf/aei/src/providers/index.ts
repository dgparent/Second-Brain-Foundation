export * from './BaseProvider';
export * from './OpenAIProvider';
export * from './AnthropicProvider';
export * from './OllamaProvider';

import { BaseAIProvider } from './BaseProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { OllamaProvider, OllamaConfig } from './OllamaProvider';

export type AIProviderType = 'openai' | 'anthropic' | 'ollama';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export class AIProviderFactory {
  static create(config: AIProviderConfig): BaseAIProvider {
    switch (config.type) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return new OpenAIProvider(config.apiKey, config.model);

      case 'anthropic':
        if (!config.apiKey) {
          throw new Error('Anthropic API key is required');
        }
        return new AnthropicProvider(config.apiKey, config.model);

      case 'ollama':
        return new OllamaProvider({
          baseUrl: config.baseUrl,
          model: config.model,
        });

      default:
        throw new Error(`Unsupported AI provider type: ${config.type}`);
    }
  }
}
