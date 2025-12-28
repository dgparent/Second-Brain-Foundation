/**
 * @sbf/ai-client - OpenAI Provider
 * 
 * Provider implementation for OpenAI API.
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

export class OpenAIProvider implements LlmProvider {
  private apiKey: string;
  private baseUrl: string;
  private organizationId?: string;
  private timeout: number;
  private maxRetries: number;

  readonly providerInfo: ProviderInfo = {
    name: 'openai',
    displayName: 'OpenAI',
    supportsStreaming: true,
    supportsEmbedding: true,
    supportsTools: true,
    supportsJsonMode: true,
    isLocal: false,
    defaultModels: {
      chat: 'gpt-4o-mini',
      embedding: 'text-embedding-3-small',
    },
  };

  constructor(apiKey: string, config?: Partial<ProviderConfig>) {
    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || 'https://api.openai.com/v1';
    this.organizationId = config?.organizationId;
    this.timeout = config?.timeout || 60000;
    this.maxRetries = config?.maxRetries || 3;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (this.organizationId) {
      headers['OpenAI-Organization'] = this.organizationId;
    }
    return headers;
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
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
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        response_format: request.responseFormat,
        tools: request.tools,
        tool_choice: request.toolChoice,
        stream: true,
        stream_options: { include_usage: true },
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
        model: request.model || 'text-embedding-3-small',
        input: request.input,
        dimensions: request.dimensions,
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
    // Simple estimation - actual implementation would use tiktoken
    let total = 0;
    for (const msg of messages) {
      // Rough estimate: ~4 chars per token
      total += Math.ceil(msg.content.length / 4);
      total += 4; // overhead per message
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
      function_call: m.functionCall ? {
        name: m.functionCall.name,
        arguments: m.functionCall.arguments,
      } : undefined,
      tool_calls: m.toolCalls,
    }));
  }
}
