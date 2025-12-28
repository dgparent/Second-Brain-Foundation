/**
 * @sbf/ai-client - Ollama Provider
 * 
 * Provider implementation for local Ollama server.
 * Critical for privacy-sensitive content (confidential/secret sensitivity).
 */

import axios from 'axios';
import {
  LlmProvider,
  ProviderInfo,
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionChunk,
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamHandler,
} from '../interfaces';

export class OllamaProvider implements LlmProvider {
  private baseUrl: string;
  private timeout: number;

  readonly providerInfo: ProviderInfo = {
    name: 'ollama',
    displayName: 'Ollama (Local)',
    supportsStreaming: true,
    supportsEmbedding: true,
    supportsTools: true,
    supportsJsonMode: true,
    isLocal: true,
    defaultModels: {
      chat: 'llama3.1:8b',
      embedding: 'nomic-embed-text',
    },
  };

  constructor(baseUrl?: string, config?: Partial<ProviderConfig>) {
    this.baseUrl = baseUrl || config?.baseUrl || 'http://localhost:11434';
    this.timeout = config?.timeout || 120000; // Longer timeout for local models
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: request.model,
        messages: this.formatMessages(request.messages),
        stream: false,
        format: request.responseFormat?.type === 'json_object' ? 'json' : undefined,
        options: {
          temperature: request.temperature,
          num_predict: request.maxTokens,
          top_p: request.topP,
          stop: request.stop,
          frequency_penalty: request.frequencyPenalty,
          presence_penalty: request.presencePenalty,
        },
        tools: request.tools?.map(t => ({
          type: t.type,
          function: {
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters,
          },
        })),
      },
      { timeout: this.timeout }
    );

    return {
      content: response.data.message?.content || '',
      finishReason: response.data.done ? 'stop' : undefined,
      toolCalls: response.data.message?.tool_calls?.map((tc: unknown) => {
        const toolCall = tc as { function?: { name?: string; arguments?: string } };
        return {
          id: crypto.randomUUID?.() || `tool-${Date.now()}`,
          type: 'function' as const,
          function: {
            name: toolCall.function?.name || '',
            arguments: JSON.stringify(toolCall.function?.arguments || {}),
          },
        };
      }),
      usage: {
        promptTokens: response.data.prompt_eval_count || 0,
        completionTokens: response.data.eval_count || 0,
        totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0),
      },
    };
  }

  async generateStream(
    request: ChatCompletionRequest,
    onChunk: StreamHandler
  ): Promise<ChatCompletionResponse> {
    const response = await axios.post(
      `${this.baseUrl}/api/chat`,
      {
        model: request.model,
        messages: this.formatMessages(request.messages),
        stream: true,
        format: request.responseFormat?.type === 'json_object' ? 'json' : undefined,
        options: {
          temperature: request.temperature,
          num_predict: request.maxTokens,
          top_p: request.topP,
          stop: request.stop,
        },
      },
      {
        timeout: this.timeout,
        responseType: 'stream',
      }
    );

    let fullContent = '';
    let finalResponse: ChatCompletionResponse = {
      content: '',
    };

    return new Promise((resolve, reject) => {
      let buffer = '';

      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            
            if (parsed.message?.content) {
              fullContent += parsed.message.content;
              onChunk({
                content: parsed.message.content,
              });
            }
            
            if (parsed.done) {
              finalResponse = {
                content: fullContent,
                finishReason: 'stop',
                usage: {
                  promptTokens: parsed.prompt_eval_count || 0,
                  completionTokens: parsed.eval_count || 0,
                  totalTokens: (parsed.prompt_eval_count || 0) + (parsed.eval_count || 0),
                },
              };
            }
          } catch {
            // Skip malformed JSON
          }
        }
      });

      response.data.on('end', () => {
        finalResponse.content = fullContent;
        resolve(finalResponse);
      });

      response.data.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    const embeddings: number[][] = [];

    for (const input of inputs) {
      const response = await axios.post(
        `${this.baseUrl}/api/embeddings`,
        {
          model: request.model || 'nomic-embed-text',
          prompt: input,
        },
        { timeout: this.timeout }
      );
      embeddings.push(response.data.embedding);
    }

    return {
      embeddings,
      model: request.model || 'nomic-embed-text',
    };
  }

  async countTokens(messages: ChatMessage[]): Promise<number> {
    // Simple estimation for Ollama models
    let total = 0;
    for (const msg of messages) {
      total += Math.ceil(msg.content.length / 4);
      total += 4;
    }
    return total;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List available models from Ollama
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 10000 });
      return response.data.models?.map((m: { name: string }) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Pull a model from Ollama registry
   */
  async pullModel(model: string, onProgress?: (progress: number) => void): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/pull`,
        { name: model, stream: true },
        { responseType: 'stream', timeout: 0 } // No timeout for pull
      );

      return new Promise((resolve) => {
        response.data.on('data', (chunk: Buffer) => {
          try {
            const data = JSON.parse(chunk.toString());
            if (data.total && data.completed && onProgress) {
              onProgress(Math.round((data.completed / data.total) * 100));
            }
          } catch {
            // Skip malformed JSON
          }
        });

        response.data.on('end', () => resolve(true));
        response.data.on('error', () => resolve(false));
      });
    } catch {
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): object[] {
    return messages.map(m => ({
      role: m.role === 'function' ? 'assistant' : m.role,
      content: m.content,
    }));
  }
}
