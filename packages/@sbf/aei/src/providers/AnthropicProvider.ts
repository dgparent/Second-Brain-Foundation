import Anthropic from '@anthropic-ai/sdk';
import { Entity } from '@sbf/shared';
import {
  BaseAIProvider,
  ExtractionOptions,
  ExtractedEntity,
  Classification,
  InferredRelationship,
} from './BaseProvider';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(apiKey: string, defaultModel: string = 'claude-3-5-sonnet-20241022') {
    super(apiKey, defaultModel);
    this.client = new Anthropic({ apiKey });
  }

  async extractEntities(
    text: string,
    options?: ExtractionOptions
  ): Promise<ExtractedEntity[]> {
    const systemPrompt = options?.systemPrompt || `
You are an entity extraction system. Extract structured entities from the provided text.
Return a JSON array of entities with the following structure:
{
  "entities": [
    {
      "type": "person" | "organization" | "location" | "event" | "task" | "concept",
      "name": "entity name",
      "attributes": { "key": "value" },
      "confidence": 0.0-1.0
    }
  ]
}
Only return valid JSON, no additional text.
`.trim();

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.3,
      system: systemPrompt,
      messages: [
        { role: 'user', content: text },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return [];
    }

    try {
      const parsed = JSON.parse(content.text);
      return parsed.entities || [];
    } catch (error) {
      console.error('Failed to parse Anthropic response:', error);
      return [];
    }
  }

  async classifyContent(
    text: string,
    options?: ExtractionOptions
  ): Promise<Classification> {
    const systemPrompt = options?.systemPrompt || `
You are a content classification system. Classify the provided text into categories.
Return JSON with this structure:
{
  "category": "main category (va, healthcare, legal, agriculture, personal, etc.)",
  "subcategory": "optional subcategory",
  "tags": ["tag1", "tag2"],
  "confidence": 0.0-1.0
}
Only return valid JSON, no additional text.
`.trim();

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 500,
      temperature: options?.temperature || 0.2,
      system: systemPrompt,
      messages: [
        { role: 'user', content: text },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return { category: 'unknown', tags: [], confidence: 0 };
    }

    try {
      return JSON.parse(content.text);
    } catch (error) {
      console.error('Failed to parse Anthropic response:', error);
      return { category: 'unknown', tags: [], confidence: 0 };
    }
  }

  async inferRelationships(
    entities: Entity[],
    options?: ExtractionOptions
  ): Promise<InferredRelationship[]> {
    const systemPrompt = options?.systemPrompt || `
You are a relationship inference system. Analyze the provided entities and infer relationships between them.
Return JSON with this structure:
{
  "relationships": [
    {
      "from": "entity_uid",
      "to": "entity_uid",
      "type": "relationship_type (reports_to, works_with, related_to, etc.)",
      "confidence": 0.0-1.0,
      "metadata": { "optional": "metadata" }
    }
  ]
}
Only return valid JSON, no additional text.
`.trim();

    const entitiesContext = entities.map(e => ({
      uid: e.uid,
      title: e.title,
      type: e.type,
      metadata: e.metadata,
    }));

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature || 0.3,
      system: systemPrompt,
      messages: [
        { role: 'user', content: JSON.stringify(entitiesContext, null, 2) },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return [];
    }

    try {
      const parsed = JSON.parse(content.text);
      return parsed.relationships || [];
    } catch (error) {
      console.error('Failed to parse Anthropic response:', error);
      return [];
    }
  }

  async generateEmbedding(
    text: string,
    options?: ExtractionOptions
  ): Promise<number[]> {
    // Anthropic does not support embeddings natively yet
    // We could use a local model or throw an error
    throw new Error('Anthropic provider does not support embeddings');
  }

  async chat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: ExtractionOptions
  ): Promise<string> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.client.messages.create({
      model: options?.model || this.defaultModel,
      max_tokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return '';
    }
    return content.text;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }
}
