import { AIProviderFactory, AIProviderConfig, BaseAIProvider } from './providers';
import EventEmitter from 'eventemitter3';

// Re-export specific items to avoid duplicates
export { AIProviderFactory, BaseAIProvider, OpenAIProvider, AnthropicProvider, OllamaProvider } from './providers';
export type { AIProviderConfig } from './providers';
export type { 
  ExtractedEntity, 
  ExtractionOptions, 
  ExtractionResult,
  Classification,
  ClassificationOptions,
  DiscoveredRelationship,
  RelationshipType,
  RelationshipDiscoveryOptions,
  AIProvenance,
  PromptTemplate,
  EntityType,
  ProviderCapabilities
} from './types';
export { AEIError, ProviderError, ExtractionError, ClassificationError } from './types';

// Privacy-aware provider integration
export { PrivacyAwareProvider, PrivacyAwareProviderFactory } from './PrivacyAwareProvider';
export type { PrivacyAwareProviderConfig } from './PrivacyAwareProvider';

export interface AEIConfig {
  provider: AIProviderConfig;
}

export class AEI extends EventEmitter {
  private provider: BaseAIProvider;

  constructor(config: AEIConfig) {
    super();
    this.provider = AIProviderFactory.create(config.provider);
  }

  getProvider(): BaseAIProvider {
    return this.provider;
  }

  async testConnection(): Promise<boolean> {
    return this.provider.testConnection();
  }
}
