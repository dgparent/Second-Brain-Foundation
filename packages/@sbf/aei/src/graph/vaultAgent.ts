import { StateGraph, END, START } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { AiClientFactory } from "@sbf/ai-client";
import { PineconeVectorClient } from "@sbf/vector-client";
import { config } from "@sbf/config";
import { logger } from "@sbf/logging";

// Define the state interface
interface AgentState {
  messages: BaseMessage[];
  context?: string;
  tenantId?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  func: (...args: any[]) => Promise<any>;
}

// Initialize Clients
const vectorClient = new PineconeVectorClient(
  config.vector.apiKey,
  config.vector.indexName
);

const aiClient = AiClientFactory.create({
  provider: (config.ai.provider as any) || 'ollama',
  baseUrl: config.ai.baseUrl,
  apiKey: config.ai.apiKey
});

export function createVaultAgent(tools: AgentTool[] = []) {
  // Define nodes
  const retrieveNode = async (state: AgentState) => {
    const { messages, tenantId } = state;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content as string;

    logger.info(`VaultAgent retrieving context for: ${query}`);

    try {
      // Generate embedding
      const embeddingResponse = await aiClient.embed({ input: query });
      const embedding = embeddingResponse.embeddings[0];

      // Search vector DB
      // Default to 'default' tenant if not provided
      const targetTenant = tenantId || 'default';
      const results = await vectorClient.query({
          tenantId: targetTenant,
          embedding,
          topK: 5
      });
      
      // Format context
      const context = results
        .map(r => `[Source: ${r.metadata?.path || 'Unknown'}]\n${r.metadata?.text || ''}`)
        .join('\n\n');

      return { context };
    } catch (error) {
      logger.error('Error in retrieve node', error);
      return { context: 'Error retrieving context.' };
    }
  };

  const generateNode = async (state: AgentState) => {
    const { messages, context } = state;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content as string;
    
    const toolDescriptions = tools.map(t => `- ${t.name}: ${t.description}`).join('\n');

    const systemPrompt = `You are a helpful assistant with access to a user's "Second Brain" (Vault).
Use the following context to answer the user's question.
If the answer is not in the context, say so, but try to be helpful.

Context:
${context || 'No context found.'}

Available Tools:
${toolDescriptions}

If you need to use a tool, please mention it in your response.
`;

    try {
      const response = await aiClient.generate({
        model: config.ai.chatModel || 'llama3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ]
      });

      return {
        messages: [new AIMessage({ content: response.content })]
      };
    } catch (error) {
      logger.error("Error calling AI provider:", error);
      return {
        messages: [new AIMessage({ content: "I'm sorry, I encountered an error processing your request." })]
      };
    }
  };

  // Define the graph
  const graph = new StateGraph<AgentState>({
    channels: {
      messages: {
        reducer: (a: BaseMessage[], b: BaseMessage[]) => a.concat(b),
        default: () => [],
      },
      context: {
        reducer: (a: string | undefined, b: string | undefined) => b ?? a,
        default: () => undefined,
      },
      tenantId: {
        reducer: (a: string | undefined, b: string | undefined) => b ?? a,
        default: () => 'default',
      }
    }
  });

  // Add nodes
  graph.addNode("retrieve", retrieveNode);
  graph.addNode("generate", generateNode);

  // Add edges
  graph.addEdge(START, "retrieve" as any);
  graph.addEdge("retrieve" as any, "generate" as any);
  graph.addEdge("generate" as any, END);

  return graph.compile();
}

// Default export for backward compatibility
export const vaultAgent = createVaultAgent([]);

