import OpenAI from 'openai';
import { Entity } from '@sbf/shared';
import {
  BaseAIProvider,
  ExtractionOptions,
  ExtractedEntity,
  Classification,
  InferredRelationship,
} from './BaseProvider';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string, defaultModel: string = 'gpt-4o-mini') {
    super(apiKey, defaultModel);
    this.client = new OpenAI({ apiKey });
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

    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature || 0.3,
      max_tokens: options?.maxTokens || 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.entities || [];
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
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

    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature || 0.2,
      max_tokens: options?.maxTokens || 500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { category: 'unknown', tags: [], confidence: 0 };
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
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

    const response = await this.client.chat.completions.create({
      model: options?.model || this.defaultModel,
      temperature: options?.temperature || 0.3,
      max_tokens: options?.maxTokens || 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(entitiesContext, null, 2) },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return [];
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.relationships || [];
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}
