import axios from 'axios';
import { LlmProvider, ChatCompletionRequest, ChatCompletionResponse, EmbeddingRequest, EmbeddingResponse } from '../interfaces';

export class OllamaProvider implements LlmProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await axios.post(`${this.baseUrl}/api/chat`, {
      model: request.model,
      messages: request.messages,
      stream: false,
      options: {
        temperature: request.temperature,
        num_predict: request.maxTokens
      }
    });

    return {
      content: response.data.message.content,
      usage: {
        promptTokens: response.data.prompt_eval_count,
        completionTokens: response.data.eval_count,
        totalTokens: response.data.prompt_eval_count + response.data.eval_count
      }
    };
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    const embeddings: number[][] = [];
    let promptTokens = 0;

    for (const input of inputs) {
      const response = await axios.post(`${this.baseUrl}/api/embeddings`, {
        model: request.model,
        prompt: input
      });
      embeddings.push(response.data.embedding);
      // Ollama doesn't always return token usage for embeddings in all versions, but we can try
    }

    return {
      embeddings
    };
  }
}
