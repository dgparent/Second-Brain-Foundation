import { LlmProvider } from './interfaces';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';

export * from './interfaces';
export * from './providers/ollama';
export * from './providers/openai';

export class AiClientFactory {
  static create(config: { provider: 'ollama' | 'openai' | 'anthropic'; baseUrl?: string; apiKey?: string }): LlmProvider {
    switch (config.provider) {
      case 'ollama':
        return new OllamaProvider(config.baseUrl);
      case 'openai':
        if (!config.apiKey) throw new Error('API key required for OpenAI');
        return new OpenAIProvider(config.apiKey, config.baseUrl);
      case 'anthropic':
        throw new Error('Anthropic provider not yet implemented');
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}

// Legacy support (optional, can be removed if unused)
// import axios from 'axios';
// import { config } from '@sbf/config';
// ... existing code ...

