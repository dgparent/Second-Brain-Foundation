
import { BaseAIProvider } from '@sbf/aei';
import { VAIntent, VAIntentType } from './types';

export class IntentClassifier {
  constructor(private aiProvider: BaseAIProvider) {}

  async classify(query: string): Promise<VAIntent> {
    try {
      const systemPrompt = `You are an intent classifier for a Second Brain system.
Analyze the user's query and classify it into one of the following intents:
- create_note: User wants to write something down, save a thought, or draft content.
- create_task: User wants to add a todo, task, or reminder.
- search: User is looking for existing information.
- summarize: User wants a summary of something.
- answer_question: User is asking a question that requires knowledge retrieval.

Return a JSON object with the following structure:
{
  "type": "intent_type",
  "confidence": number (0-1),
  "entities": { ...extracted entities... }
}

For 'create_note', extract 'content'.
For 'create_task', extract 'title', 'priority', 'due_date'.
For 'search', extract 'term'.
For 'answer_question', extract 'question'.

Query: "${query}"`;

      const response = await this.aiProvider.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]);

      // Parse JSON from response (handle potential markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          type: parsed.type,
          confidence: parsed.confidence,
          entities: parsed.entities,
          originalQuery: query
        };
      }
    } catch (error) {
      console.error('Error classifying intent with LLM, falling back to regex:', error);
    }

    // Fallback to regex if LLM fails
    const lowerQuery = query.toLowerCase();
    let type: VAIntentType = 'unknown';
    let entities: Record<string, any> = {};

    if (lowerQuery.includes('note') || lowerQuery.includes('write')) {
      type = 'create_note';
      entities = { content: query };
    } else if (lowerQuery.includes('task') || lowerQuery.includes('todo')) {
      type = 'create_task';
      entities = { title: query };
    } else if (lowerQuery.includes('search') || lowerQuery.includes('find')) {
      type = 'search';
      entities = { term: query.replace(/search|find/g, '').trim() };
    } else if (lowerQuery.includes('summarize')) {
      type = 'summarize';
      entities = { target: query.replace('summarize', '').trim() };
    } else if (
      lowerQuery.startsWith('what') || 
      lowerQuery.startsWith('how') || 
      lowerQuery.startsWith('why') || 
      lowerQuery.startsWith('who') || 
      lowerQuery.startsWith('when') || 
      lowerQuery.endsWith('?')
    ) {
      type = 'answer_question';
      entities = { question: query };
    }
    
    return {
      type,
      confidence: 0.5, // Lower confidence for fallback
      entities,
      originalQuery: query
    };
  }
}
