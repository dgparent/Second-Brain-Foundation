import { Entity, Relationship } from '@sbf/shared';

export interface ExtractionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ExtractedEntity {
  type: string;
  name: string;
  attributes: Record<string, any>;
  confidence: number;
}

export interface Classification {
  category: string;
  subcategory?: string;
  tags: string[];
  confidence: number;
}

export interface InferredRelationship {
  from: string;
  to: string;
  type: string;
  confidence: number;
  metadata?: Record<string, any>;
}

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected defaultModel: string;
  
  constructor(apiKey: string, defaultModel: string) {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  abstract extractEntities(
    text: string,
    options?: ExtractionOptions
  ): Promise<ExtractedEntity[]>;

  abstract classifyContent(
    text: string,
    options?: ExtractionOptions
  ): Promise<Classification>;

  abstract inferRelationships(
    entities: Entity[],
    options?: ExtractionOptions
  ): Promise<InferredRelationship[]>;

  abstract generateEmbedding(
    text: string,
    options?: ExtractionOptions
  ): Promise<number[]>;

  abstract chat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: ExtractionOptions
  ): Promise<string>;

  abstract testConnection(): Promise<boolean>;
}
