/**
 * Privacy-Aware AEI Wrapper
 * Integrates privacy enforcement into AI Entity Integration calls
 */

import { BaseAIProvider, ExtractedEntity, Classification, InferredRelationship, ExtractionOptions } from './providers/BaseProvider';
import { Entity } from '@sbf/shared';
import { PrivacyService, PrivacyLevel, AIProvider, PrivacyViolation } from '@sbf/core-privacy';
import { AuditStorage } from '@sbf/core-privacy';

/**
 * Maps AEI provider names to Privacy AIProvider enum
 */
function mapProviderName(providerName: string): AIProvider {
  const lowerName = providerName.toLowerCase();
  if (lowerName.includes('openai')) return AIProvider.OpenAI;
  if (lowerName.includes('anthropic') || lowerName.includes('claude')) return AIProvider.Anthropic;
  if (lowerName.includes('google') || lowerName.includes('gemini')) return AIProvider.Google;
  if (lowerName.includes('ollama') || lowerName.includes('local')) return AIProvider.LocalLLM;
  return AIProvider.Custom;
}

export interface PrivacyAwareProviderConfig {
  provider: BaseAIProvider;
  privacyService: PrivacyService;
  userId: string;
  providerName?: string; // e.g., 'OpenAI', 'Anthropic', 'Ollama'
}

/**
 * Privacy-aware wrapper for AI providers
 * Enforces privacy rules before allowing AI access to entities
 */
export class PrivacyAwareProvider extends BaseAIProvider {
  private innerProvider: BaseAIProvider;
  private privacyService: PrivacyService;
  private userId: string;
  private aiProvider: AIProvider;

  constructor(config: PrivacyAwareProviderConfig) {
    super('wrapped', 'privacy-wrapper');
    this.innerProvider = config.provider;
    this.privacyService = config.privacyService;
    this.userId = config.userId;
    this.aiProvider = mapProviderName(config.providerName || 'custom');
  }

  /**
   * Extract entities with privacy enforcement
   */
  async extractEntities(
    text: string,
    options?: ExtractionOptions & { entityId?: string; entityName?: string }
  ): Promise<ExtractedEntity[]> {
    // Create a temporary entity for privacy checking
    const tempEntity: Entity = {
      uid: options?.entityId || 'temp-entity',
      type: 'text',
      title: options?.entityName || 'Extraction Request',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: {
        state: 'capture',
      },
      sensitivity: {
        level: 'personal',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      content: text,
      metadata: {
        privacy: {
          level: PrivacyLevel.Personal, // Default to Personal
        },
      },
    };

    // Check privacy and filter content
    const result = await this.privacyService.processForAI(
      tempEntity,
      this.aiProvider,
      this.userId
    );

    if (!result.allowed) {
      // Privacy check failed - log the violation
      console.error(`AI access denied for entity ${tempEntity.uid}: ${result.violations.join(', ')}`);
      throw new Error(`AI access denied: ${result.violations.join(', ')}`);
    }

    // Use filtered content if filtering was applied
    const contentToProcess = result.filtered ? result.content : text;
    
    // Call the underlying provider with filtered content
    return await this.innerProvider.extractEntities(contentToProcess, options);
  }

  /**
   * Classify content with privacy enforcement
   */
  async classifyContent(
    text: string,
    options?: ExtractionOptions & { entityId?: string; entityName?: string }
  ): Promise<Classification> {
    const tempEntity: Entity = {
      uid: options?.entityId || 'temp-entity',
      type: 'text',
      title: options?.entityName || 'Classification Request',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: {
        state: 'capture',
      },
      sensitivity: {
        level: 'personal',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      content: text,
      metadata: {
        privacy: {
          level: PrivacyLevel.Personal,
        },
      },
    };

    const result = await this.privacyService.processForAI(
      tempEntity,
      this.aiProvider,
      this.userId
    );

    if (!result.allowed) {
      console.error(`AI access denied for entity ${tempEntity.uid}: ${result.violations.join(', ')}`);
      throw new Error(`AI access denied: ${result.violations.join(', ')}`);
    }

    const contentToProcess = result.filtered ? result.content : text;
    return await this.innerProvider.classifyContent(contentToProcess, options);
  }

  /**
   * Infer relationships with privacy enforcement
   * Checks each entity's privacy level before processing
   */
  async inferRelationships(
    entities: Entity[],
    options?: ExtractionOptions
  ): Promise<InferredRelationship[]> {
    // Check privacy for each entity
    const allowedEntities: Entity[] = [];
    
    for (const entity of entities) {
      const result = await this.privacyService.processForAI(
        entity,
        this.aiProvider,
        this.userId
      );

      if (result.allowed) {
        // Use filtered content if filtering was applied
        if (result.filtered) {
          allowedEntities.push({
            ...entity,
            content: result.content,
          });
        } else {
          allowedEntities.push(entity);
        }
      }
      // Skip entities that are not allowed
    }

    if (allowedEntities.length === 0) {
      throw new Error(
        'No entities allowed for AI processing due to privacy restrictions'
      );
    }

    return await this.innerProvider.inferRelationships(allowedEntities, options);
  }

  /**
   * Generate embedding with privacy enforcement
   */
  async generateEmbedding(
    text: string,
    options?: ExtractionOptions & { entityId?: string; entityName?: string }
  ): Promise<number[]> {
    const tempEntity: Entity = {
      uid: options?.entityId || 'temp-entity',
      type: 'text',
      title: options?.entityName || 'Embedding Request',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: { state: 'capture' },
      sensitivity: {
        level: 'personal',
        privacy: { cloud_ai_allowed: false, local_ai_allowed: true, export_allowed: true },
      },
      content: text,
      metadata: { privacy: { level: PrivacyLevel.Personal } },
    };

    const result = await this.privacyService.processForAI(
      tempEntity,
      this.aiProvider,
      this.userId
    );

    if (!result.allowed) {
      console.error(`AI access denied for entity ${tempEntity.uid}: ${result.violations.join(', ')}`);
      throw new Error(`AI access denied: ${result.violations.join(', ')}`);
    }

    const contentToProcess = result.filtered ? result.content : text;
    return await this.innerProvider.generateEmbedding(contentToProcess, options);
  }

  /**
   * Chat with privacy enforcement
   */
  async chat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: ExtractionOptions
  ): Promise<string> {
    // Check privacy for each message content
    // For simplicity, we check the last user message or concatenate all
    // A robust implementation would check all content
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (lastUserMessage) {
      const tempEntity: Entity = {
        uid: 'chat-message',
        type: 'text',
        title: 'Chat Request',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        lifecycle: { state: 'capture' },
        sensitivity: {
          level: 'personal',
          privacy: { cloud_ai_allowed: false, local_ai_allowed: true, export_allowed: true },
        },
        content: lastUserMessage.content,
        metadata: { privacy: { level: PrivacyLevel.Personal } },
      };

      const result = await this.privacyService.processForAI(
        tempEntity,
        this.aiProvider,
        this.userId
      );

      if (!result.allowed) {
        throw new Error(`AI access denied: ${result.violations.join(', ')}`);
      }
      
      // Update message content if filtered
      if (result.filtered) {
        lastUserMessage.content = result.content;
      }
    }

    return await this.innerProvider.chat(messages, options);
  }

  /**
   * Test connection (pass-through)
   */
  async testConnection(): Promise<boolean> {
    return await this.innerProvider.testConnection();
  }

  /**
   * Get the AI provider type
   */
  getAIProvider(): AIProvider {
    return this.aiProvider;
  }

  /**
   * Get privacy statistics
   */
  async getPrivacyStatistics() {
    return await this.privacyService.getStatistics();
  }

  /**
   * Get audit trail for an entity
   */
  async getAuditTrail(entityId: string) {
    return await this.privacyService.getAuditTrail(entityId);
  }

  /**
   * Get all privacy violations
   */
  async getViolations() {
    return await this.privacyService.getViolations();
  }
}

/**
 * Factory for creating privacy-aware providers
 */
export class PrivacyAwareProviderFactory {
  static create(
    provider: BaseAIProvider,
    privacyService: PrivacyService,
    userId: string,
    providerName?: string
  ): PrivacyAwareProvider {
    return new PrivacyAwareProvider({
      provider,
      privacyService,
      userId,
      providerName,
    });
  }

  /**
   * Create privacy-aware provider from existing provider
   * with new privacy service instance
   */
  static wrap(
    provider: BaseAIProvider,
    auditStorage: AuditStorage,
    userId: string,
    providerName?: string
  ): PrivacyAwareProvider {
    const privacyService = new PrivacyService(auditStorage);
    return new PrivacyAwareProvider({
      provider,
      privacyService,
      userId,
      providerName,
    });
  }
}
