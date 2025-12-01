import { AiClientFactory, LlmProvider, ChatMessage } from '@sbf/ai-client';
import { ENTITY_TYPES, RELATION_TYPES } from '@sbf/types';
import { logger } from '@sbf/logging';

export interface ExtractedEntity {
  name: string;
  type: string;
  description?: string;
}

export interface ExtractedRelation {
  source: string;
  target: string;
  type: string;
  description?: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
}

export class EntityExtractionService {
  private aiClient: LlmProvider;

  constructor() {
    this.aiClient = AiClientFactory.create({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
    });
  }

  async extract(content: string): Promise<ExtractionResult> {
    const prompt = this.buildPrompt(content);
    
    try {
      const response = await this.aiClient.generate({
        model: 'gpt-4-turbo-preview', // Use a capable model for extraction
        messages: [{ role: 'user', content: prompt }],
        temperature: 0, // Deterministic output
      });

      const jsonStr = this.cleanJson(response.content);
      return JSON.parse(jsonStr) as ExtractionResult;
    } catch (error) {
      logger.error('Failed to extract entities', error);
      return { entities: [], relations: [] };
    }
  }

  private buildPrompt(content: string): string {
    return `
You are an expert Knowledge Graph Engineer. Your task is to extract structured entities and relationships from the following text.

Target Ontology:
Entity Types: ${ENTITY_TYPES.join(', ')}
Relation Types: ${RELATION_TYPES.join(', ')}

Instructions:
1. Identify key entities mentioned in the text that match the allowed Entity Types.
2. Identify relationships between these entities that match the allowed Relation Types.
3. Output strictly valid JSON in the following format:
{
  "entities": [
    { "name": "Entity Name", "type": "entity_type", "description": "Brief context" }
  ],
  "relations": [
    { "source": "Entity Name A", "target": "Entity Name B", "type": "relation_type", "description": "Why this relation exists" }
  ]
}

Text to Analyze:
---
${content}
---
`;
  }

  private cleanJson(text: string): string {
    // Remove markdown code blocks if present
    return text.replace(/```json\n?|\n?```/g, '').trim();
  }
}

export const entityExtractionService = new EntityExtractionService();
