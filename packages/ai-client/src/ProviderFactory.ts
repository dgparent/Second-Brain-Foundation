/**
 * @sbf/ai-client - Provider Factory
 * 
 * Factory for creating LLM provider instances.
 * Integrates with ModelManager for model-based provider selection.
 */

import {
  LlmProvider,
  ProviderConfig,
} from './interfaces';
import { ProviderType } from './models/Model';
import {
  OpenAIProvider,
  OllamaProvider,
  AnthropicProvider,
  GoogleProvider,
  GroqProvider,
  TogetherProvider,
  MistralProvider,
} from './providers';

/**
 * Provider factory configuration
 */
export interface ProviderFactoryConfig {
  openai?: ProviderConfig & { apiKey: string };
  anthropic?: ProviderConfig & { apiKey: string };
  google?: ProviderConfig & { apiKey: string };
  groq?: ProviderConfig & { apiKey: string };
  together?: ProviderConfig & { apiKey: string };
  mistral?: ProviderConfig & { apiKey: string };
  ollama?: ProviderConfig;
}

/**
 * Provider Factory - Creates and caches provider instances
 */
export class ProviderFactory {
  private config: ProviderFactoryConfig;
  private providers: Map<ProviderType, LlmProvider> = new Map();

  constructor(config: ProviderFactoryConfig) {
    this.config = config;
  }

  /**
   * Get a provider instance by type
   */
  getProvider(type: ProviderType): LlmProvider {
    // Check cache first
    const cached = this.providers.get(type);
    if (cached) return cached;

    // Create new provider
    const provider = this.createProvider(type);
    this.providers.set(type, provider);
    return provider;
  }

  /**
   * Create a new provider instance
   */
  private createProvider(type: ProviderType): LlmProvider {
    switch (type) {
      case 'openai': {
        const config = this.config.openai;
        if (!config?.apiKey) {
          throw new Error('OpenAI API key required');
        }
        return new OpenAIProvider(config.apiKey, config);
      }
      
      case 'anthropic': {
        const config = this.config.anthropic;
        if (!config?.apiKey) {
          throw new Error('Anthropic API key required');
        }
        return new AnthropicProvider(config.apiKey, config);
      }
      
      case 'google': {
        const config = this.config.google;
        if (!config?.apiKey) {
          throw new Error('Google API key required');
        }
        return new GoogleProvider(config.apiKey, config);
      }
      
      case 'groq': {
        const config = this.config.groq;
        if (!config?.apiKey) {
          throw new Error('Groq API key required');
        }
        return new GroqProvider(config.apiKey, config);
      }
      
      case 'together': {
        const config = this.config.together;
        if (!config?.apiKey) {
          throw new Error('Together API key required');
        }
        return new TogetherProvider(config.apiKey, config);
      }
      
      case 'mistral': {
        const config = this.config.mistral;
        if (!config?.apiKey) {
          throw new Error('Mistral API key required');
        }
        return new MistralProvider(config.apiKey, config);
      }
      
      case 'ollama': {
        const config = this.config.ollama;
        return new OllamaProvider(config?.baseUrl, config);
      }

      case 'azure': {
        // Azure uses OpenAI SDK with different base URL
        throw new Error('Azure provider not yet implemented. Use OpenAI with Azure baseUrl.');
      }
      
      default:
        throw new Error(`Unknown provider type: ${type}`);
    }
  }

  /**
   * Check if a provider is configured
   */
  isConfigured(type: ProviderType): boolean {
    switch (type) {
      case 'openai':
        return !!this.config.openai?.apiKey;
      case 'anthropic':
        return !!this.config.anthropic?.apiKey;
      case 'google':
        return !!this.config.google?.apiKey;
      case 'groq':
        return !!this.config.groq?.apiKey;
      case 'together':
        return !!this.config.together?.apiKey;
      case 'mistral':
        return !!this.config.mistral?.apiKey;
      case 'ollama':
        return true; // Ollama doesn't require API key
      default:
        return false;
    }
  }

  /**
   * Get all configured provider types
   */
  getConfiguredProviders(): ProviderType[] {
    const types: ProviderType[] = [
      'openai', 'anthropic', 'google', 'groq', 
      'together', 'mistral', 'ollama'
    ];
    return types.filter(t => this.isConfigured(t));
  }

  /**
   * Health check all configured providers
   */
  async healthCheckAll(): Promise<Map<ProviderType, boolean>> {
    const results = new Map<ProviderType, boolean>();
    const configured = this.getConfiguredProviders();

    await Promise.all(
      configured.map(async (type) => {
        try {
          const provider = this.getProvider(type);
          const healthy = provider.healthCheck 
            ? await provider.healthCheck()
            : true;
          results.set(type, healthy);
        } catch {
          results.set(type, false);
        }
      })
    );

    return results;
  }

  /**
   * Clear cached providers
   */
  clearCache(): void {
    this.providers.clear();
  }

  /**
   * Create factory from environment variables
   */
  static fromEnv(): ProviderFactory {
    const config: ProviderFactoryConfig = {};

    if (process.env.OPENAI_API_KEY) {
      config.openai = {
        apiKey: process.env.OPENAI_API_KEY,
        organizationId: process.env.OPENAI_ORG_ID,
        baseUrl: process.env.OPENAI_BASE_URL,
      };
    }

    if (process.env.ANTHROPIC_API_KEY) {
      config.anthropic = {
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseUrl: process.env.ANTHROPIC_BASE_URL,
      };
    }

    if (process.env.GOOGLE_API_KEY) {
      config.google = {
        apiKey: process.env.GOOGLE_API_KEY,
        baseUrl: process.env.GOOGLE_BASE_URL,
      };
    }

    if (process.env.GROQ_API_KEY) {
      config.groq = {
        apiKey: process.env.GROQ_API_KEY,
        baseUrl: process.env.GROQ_BASE_URL,
      };
    }

    if (process.env.TOGETHER_API_KEY) {
      config.together = {
        apiKey: process.env.TOGETHER_API_KEY,
        baseUrl: process.env.TOGETHER_BASE_URL,
      };
    }

    if (process.env.MISTRAL_API_KEY) {
      config.mistral = {
        apiKey: process.env.MISTRAL_API_KEY,
        baseUrl: process.env.MISTRAL_BASE_URL,
      };
    }

    // Ollama is always available (local)
    config.ollama = {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    };

    return new ProviderFactory(config);
  }
}
