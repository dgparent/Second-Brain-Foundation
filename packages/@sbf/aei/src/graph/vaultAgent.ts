import { StateGraph, END, START } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { AiClientFactory } from "@sbf/ai-client";
import { config } from "@sbf/config";

// Define the state interface
interface AgentState {
  messages: BaseMessage[];
  context?: string;
}

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
    }
  }
});

// Define nodes
const agentNode = async (state: AgentState) => {
  const { messages } = state;
  const lastMessage = messages[messages.length - 1];
  
  // Initialize AI Client
  const aiClient = AiClientFactory.create({
    provider: (config.ai.provider as any) || 'ollama',
    baseUrl: config.ai.baseUrl,
    apiKey: config.ai.apiKey
  });

  try {
    const response = await aiClient.generate({
      model: config.ai.chatModel || 'llama3',
      messages: messages.map(m => ({
        role: m._getType() === 'human' ? 'user' : m._getType() === 'ai' ? 'assistant' : 'system',
        content: m.content as string
      }))
    });

    return {
      messages: [new AIMessage({ content: response.content })]
    };
  } catch (error) {
    console.error("Error calling AI provider:", error);
    return {
      messages: [new AIMessage({ content: "I'm sorry, I encountered an error processing your request." })]
    };
  }
};

// Add nodes
graph.addNode("agent", agentNode);

// Add edges
graph.addEdge(START, "agent" as any);
graph.addEdge("agent" as any, END);

// Compile the graph
export const vaultAgent = graph.compile();

