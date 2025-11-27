import { BaseAction } from './BaseAction';
import { VAIntent, VAResponse } from '../types';
import { BaseAIProvider } from '@sbf/aei';
import { getVectorClient } from '@sbf/vector-client';
import { EntityManager } from '@sbf/core-entity-manager';

export class QuestionAction extends BaseAction {
  id = 'answer_question';
  name = 'Answer Question';
  description = 'Answers questions using RAG (Retrieval Augmented Generation)';

  constructor(entityManager: EntityManager, private aiProvider: BaseAIProvider) {
    super(entityManager);
  }

  canHandle(intent: VAIntent): boolean {
    return intent.type === 'answer_question';
  }

  async execute(intent: VAIntent): Promise<VAResponse> {
    try {
      const question = intent.entities.question || intent.originalQuery;
      
      // 1. Generate embedding for the question
      // Cast to any to bypass temporary type check issue if build is stale
      const embedding = await (this.aiProvider as any).generateEmbedding(question);

      // 2. Search vector database
      const vectorClient = getVectorClient();
      // Assuming a default tenant for now, or we need to pass it in context
      const tenantId = 'default-tenant'; 
      const results = await vectorClient.query({
        tenantId,
        embedding,
        topK: 5
      });

      // 3. Construct context from results
      // Assuming metadata has a 'content' field. If not, we might need to fetch the entity from EntityManager using the ID.
      // For now, let's assume the vector metadata contains the text chunk or summary.
      const context = results
        .map(r => (r.metadata as any).content || (r.metadata as any).text || '')
        .filter(Boolean)
        .join('\n\n---\n\n');

      // 4. Generate answer
      const systemPrompt = `You are a helpful assistant for a Second Brain system. 
Use the following context to answer the user's question. 
If the answer is not in the context, say you don't know but offer to create a note about it.

Context:
${context}`;

      const answer = await (this.aiProvider as any).chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]);

      return {
        success: true,
        message: answer,
        data: { sources: results.map(r => r.id) }
      };

    } catch (error) {
      console.error('Error answering question:', error);
      return {
        success: false,
        message: 'I encountered an error while trying to answer your question.'
      };
    }
  }
}
