/**
 * @sbf/ai-client - Together AI Provider
 * 
 * Provider implementation for Together AI API.
 * Together provides access to many open-source models including Llama 3.1 405B.
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

export class TogetherProvider implements LlmProvider {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  readonly providerInfo: ProviderInfo = {
    name: 'together',
    displayName: 'Together AI',
    supportsStreaming: true,
    supportsEmbedding: true,
    supportsTools: true,
    supportsJsonMode: true,
    isLocal: false,
    defaultModels: {
      chat: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      embedding: 'togethercomputer/m2-bert-80M-8k-retrieval',
    },
  };

  constructor(apiKey: string, config?: Partial<ProviderConfig>) {
    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || 'https://api.together.xyz/v1';
    this.timeout = config?.timeout || 60000;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Together uses OpenAI-compatible API
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: request.model,
        messages: this.formatMessages(request.messages),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        response_format: request.responseFormat,
        tools: request.tools,
        tool_choice: request.toolChoice,
        stream: false,
      },
      {
        headers: this.getHeaders(),
        timeout: this.timeout,
      }
    );

    const choice = response.data.choices[0];
    return {
      id: response.data.id,
      content: choice.message.content || '',
      finishReason: choice.finish_reason,
      toolCalls: choice.message.tool_calls,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        completionTokens: response.data.usage?.completion_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
    };
  }

  async generateStream(
    request: ChatCompletionRequest,
    onChunk: StreamHandler
  ): Promise<ChatCompletionResponse> {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: request.model,
        messages: this.formatMessages(request.messages),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        stop: request.stop,
        stream: true,
      },
      {
        headers: this.getHeaders(),
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
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              fullContent += delta.content;
              onChunk({
                id: parsed.id,
                content: delta.content,
              });
            }
            
            if (parsed.choices?.[0]?.finish_reason) {
              finalResponse.finishReason = parsed.choices[0].finish_reason;
            }
            
            if (parsed.usage) {
              finalResponse.usage = {
                promptTokens: parsed.usage.prompt_tokens || 0,
                completionTokens: parsed.usage.completion_tokens || 0,
                totalTokens: parsed.usage.total_tokens || 0,
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
    const response = await axios.post(
      `${this.baseUrl}/embeddings`,
      {
        model: request.model || 'togethercomputer/m2-bert-80M-8k-retrieval',
        input: request.input,
      },
      {
        headers: this.getHeaders(),
        timeout: this.timeout,
      }
    );

    return {
      embeddings: response.data.data.map((d: { embedding: number[] }) => d.embedding),
      model: response.data.model,
      usage: {
        promptTokens: response.data.usage?.prompt_tokens || 0,
        totalTokens: response.data.usage?.total_tokens || 0,
      },
    };
  }

  async countTokens(messages: ChatMessage[]): Promise<number> {
    let total = 0;
    for (const msg of messages) {
      total += Math.ceil(msg.content.length / 4);
      total += 4;
    }
    return total;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): object[] {
    return messages.map(m => ({
      role: m.role,
      content: m.content,
      name: m.name,
      tool_calls: m.toolCalls,
    }));
  }
}
