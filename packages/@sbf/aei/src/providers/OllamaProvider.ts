import { Entity } from '@sbf/shared';
import {
  BaseAIProvider,
  ExtractionOptions,
  ExtractedEntity,
  Classification,
  InferredRelationship,
} from './BaseProvider';

export interface OllamaConfig {
  baseUrl?: string;
  model?: string;
}

export class OllamaProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config: OllamaConfig = {}) {
    const model = config.model || 'llama3.2:latest';
    super('', model);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  private async generateCompletion(
    prompt: string,
    systemPrompt: string,
    options?: ExtractionOptions
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        prompt: `${systemPrompt}\n\nUser Input:\n${prompt}`,
        stream: false,
        options: {
          temperature: options?.temperature || 0.3,
          num_predict: options?.maxTokens || 2000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as { response?: string };
    return data.response || '';
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

    try {
      const response = await this.generateCompletion(text, systemPrompt, options);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Ollama response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.entities || [];
    } catch (error) {
      console.error('Failed to extract entities with Ollama:', error);
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

    try {
      const response = await this.generateCompletion(text, systemPrompt, options);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Ollama response');
        return { category: 'unknown', tags: [], confidence: 0 };
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to classify content with Ollama:', error);
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

    try {
      const response = await this.generateCompletion(
        JSON.stringify(entitiesContext, null, 2),
        systemPrompt,
        options
      );
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in Ollama response');
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.relationships || [];
    } catch (error) {
      console.error('Failed to infer relationships with Ollama:', error);
      return [];
    }
  }

  async generateEmbedding(
    text: string,
    options?: ExtractionOptions
  ): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as { embedding: number[] };
    return data.embedding || [];
  }

  async chat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: ExtractionOptions
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages: messages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as { message: { content: string } };
    return data.message?.content || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama connection test failed:', error);
      return false;
    }
  }
}
