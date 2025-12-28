/**
 * @sbf/ai-client - Anthropic Provider
 * 
 * Provider implementation for Anthropic Claude API.
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

export class AnthropicProvider implements LlmProvider {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private apiVersion: string;

  readonly providerInfo: ProviderInfo = {
    name: 'anthropic',
    displayName: 'Anthropic',
    supportsStreaming: true,
    supportsEmbedding: false, // Anthropic doesn't have embedding API
    supportsTools: true,
    supportsJsonMode: false, // Uses different approach
    isLocal: false,
    defaultModels: {
      chat: 'claude-3-5-sonnet-20241022',
    },
  };

  constructor(apiKey: string, config?: Partial<ProviderConfig>) {
    this.apiKey = apiKey;
    this.baseUrl = config?.baseUrl || 'https://api.anthropic.com/v1';
    this.timeout = config?.timeout || 60000;
    this.maxRetries = config?.maxRetries || 3;
    this.apiVersion = '2023-06-01';
  }

  private getHeaders(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'anthropic-version': this.apiVersion,
      'Content-Type': 'application/json',
    };
  }

  async generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Extract system message
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const nonSystemMessages = request.messages.filter(m => m.role !== 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        system: systemPrompt || undefined,
        messages: this.formatMessages(nonSystemMessages),
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop ? (Array.isArray(request.stop) ? request.stop : [request.stop]) : undefined,
        tools: request.tools?.map(t => ({
          name: t.function.name,
          description: t.function.description,
          input_schema: t.function.parameters,
        })),
        tool_choice: this.formatToolChoice(request.toolChoice),
        stream: false,
      },
      {
        headers: this.getHeaders(),
        timeout: this.timeout,
      }
    );

    const content = response.data.content
      .filter((c: { type: string }) => c.type === 'text')
      .map((c: { text: string }) => c.text)
      .join('');

    const toolUseBlocks = response.data.content.filter(
      (c: { type: string }) => c.type === 'tool_use'
    );

    return {
      id: response.data.id,
      content,
      finishReason: this.mapStopReason(response.data.stop_reason),
      toolCalls: toolUseBlocks.length > 0 ? toolUseBlocks.map((t: { id: string; name: string; input: unknown }) => ({
        id: t.id,
        type: 'function' as const,
        function: {
          name: t.name,
          arguments: JSON.stringify(t.input),
        },
      })) : undefined,
      usage: {
        promptTokens: response.data.usage?.input_tokens || 0,
        completionTokens: response.data.usage?.output_tokens || 0,
        totalTokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0),
      },
    };
  }

  async generateStream(
    request: ChatCompletionRequest,
    onChunk: StreamHandler
  ): Promise<ChatCompletionResponse> {
    const systemMessages = request.messages.filter(m => m.role === 'system');
    const nonSystemMessages = request.messages.filter(m => m.role !== 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    const response = await axios.post(
      `${this.baseUrl}/messages`,
      {
        model: request.model,
        max_tokens: request.maxTokens || 4096,
        system: systemPrompt || undefined,
        messages: this.formatMessages(nonSystemMessages),
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop ? (Array.isArray(request.stop) ? request.stop : [request.stop]) : undefined,
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
            
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullContent += parsed.delta.text;
              onChunk({
                content: parsed.delta.text,
              });
            }
            
            if (parsed.type === 'message_delta') {
              finalResponse.finishReason = this.mapStopReason(parsed.delta?.stop_reason);
            }
            
            if (parsed.type === 'message_delta' && parsed.usage) {
              finalResponse.usage = {
                promptTokens: 0, // Not available in delta
                completionTokens: parsed.usage.output_tokens || 0,
                totalTokens: parsed.usage.output_tokens || 0,
              };
            }

            if (parsed.type === 'message_start' && parsed.message?.usage) {
              finalResponse.id = parsed.message.id;
              if (!finalResponse.usage) {
                finalResponse.usage = {
                  promptTokens: parsed.message.usage.input_tokens || 0,
                  completionTokens: 0,
                  totalTokens: parsed.message.usage.input_tokens || 0,
                };
              } else {
                finalResponse.usage.promptTokens = parsed.message.usage.input_tokens || 0;
                finalResponse.usage.totalTokens += parsed.message.usage.input_tokens || 0;
              }
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

  async embed(_request: EmbeddingRequest): Promise<EmbeddingResponse> {
    throw new Error('Anthropic does not support embedding. Use OpenAI or Ollama for embeddings.');
  }

  async countTokens(messages: ChatMessage[]): Promise<number> {
    // Anthropic token estimation - Claude uses similar tokenization to GPT
    let total = 0;
    for (const msg of messages) {
      total += Math.ceil(msg.content.length / 4);
      total += 4;
    }
    return total;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Anthropic doesn't have a dedicated health endpoint
      // We make a minimal request to check API key validity
      await axios.post(
        `${this.baseUrl}/messages`,
        {
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        },
        {
          headers: this.getHeaders(),
          timeout: 10000,
        }
      );
      return true;
    } catch (error) {
      // 400 errors (validation) still indicate the API is reachable
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        return true;
      }
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): object[] {
    return messages.map(m => {
      // Handle tool results
      if (m.role === 'function' || m.role === 'tool') {
        return {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: m.name || 'unknown',
            content: m.content,
          }],
        };
      }
      
      return {
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      };
    });
  }

  private formatToolChoice(
    choice?: ChatCompletionRequest['toolChoice']
  ): { type: string; name?: string } | undefined {
    if (!choice) return undefined;
    if (choice === 'none') return { type: 'none' };
    if (choice === 'auto') return { type: 'auto' };
    if (choice === 'required') return { type: 'any' };
    if (typeof choice === 'object') {
      return { type: 'tool', name: choice.function.name };
    }
    return undefined;
  }

  private mapStopReason(reason?: string): ChatCompletionResponse['finishReason'] {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      default:
        return undefined;
    }
  }
}
