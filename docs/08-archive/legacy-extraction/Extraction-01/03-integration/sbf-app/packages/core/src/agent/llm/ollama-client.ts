/**
 * Ollama LLM Client
 * Adapted from AnythingLLM's Ollama provider
 * 
 * Supports local LLM models through Ollama:
 * - Llama 3, Mistral, Mixtral, Phi, etc.
 * - Privacy-first (all local)
 * - Tool calling support
 */

import { LLMClient, LLMMessage, LLMResponse } from './llm-client';

/**
 * Ollama response structure
 */
interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
    tool_calls?: Array<{
      function: {
        name: string;
        arguments: Record<string, any>;
      };
    }>;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Ollama Client Implementation
 * 
 * Supports local LLM models via Ollama server.
 */
export class OllamaClient extends LLMClient {
  private baseUrl: string;
  private keepAlive: number;
  private contextWindow: number;

  constructor(
    model: string = 'llama3.2',
    temperature: number = 0.7,
    maxTokens?: number,
    baseUrl: string = 'http://localhost:11434',
    keepAlive: number = 300 // 5 minutes
  ) {
    super(model, temperature, maxTokens);
    
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.keepAlive = keepAlive;
    this.contextWindow = 8192; // Default, will be updated per model
  }

  /**
   * Convert messages to Ollama format
   */
  private convertMessages(messages: LLMMessage[]): Array<{
    role: string;
    content: string;
  }> {
    return messages.map(msg => {
      // Ollama supports: system, user, assistant
      let role = msg.role;
      if (role === 'tool') {
        // Tool results become user messages
        role = 'user';
      }

      return {
        role,
        content: msg.content || '',
      };
    });
  }

  /**
   * Convert tools to Ollama format
   */
  private convertTools(tools: any[]): any[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      },
    }));
  }

  /**
   * Make HTTP request to Ollama
   */
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const url = `${this.baseUrl}/api/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${error}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
          throw new Error(
            `Cannot connect to Ollama server at ${this.baseUrl}. ` +
            `Make sure Ollama is running: https://ollama.ai/download`
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get model info to determine context window
   */
  async getModelInfo(): Promise<{ contextWindow: number }> {
    try {
      const response = await this.makeRequest('show', {
        model: this.model,
      });

      // Extract context window from model info
      const contextKey = Object.keys(response.model_info || {}).find(
        key => key.endsWith('.context_length')
      );

      if (contextKey) {
        this.contextWindow = response.model_info[contextKey];
      }

      return { contextWindow: this.contextWindow };
    } catch (error) {
      console.warn(`Could not get model info, using default context window: ${error}`);
      return { contextWindow: this.contextWindow };
    }
  }

  /**
   * Generate a completion using Ollama
   */
  async complete(messages: LLMMessage[], tools?: any[]): Promise<LLMResponse> {
    // Convert messages
    const ollamaMessages = this.convertMessages(messages);

    const requestData: any = {
      model: this.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: this.temperature,
      },
      keep_alive: this.keepAlive,
    };

    // Add num_predict (max tokens) if specified
    if (this.maxTokens) {
      requestData.options.num_predict = this.maxTokens;
    }

    // Add tools if provided
    if (tools && tools.length > 0) {
      requestData.tools = this.convertTools(tools);
    }

    try {
      const response: OllamaResponse = await this.makeRequest('chat', requestData);

      // Extract tool calls if present
      const toolCalls = response.message.tool_calls?.map(tc => ({
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'function' as const,
        function: {
          name: tc.function.name,
          arguments: JSON.stringify(tc.function.arguments),
        },
      }));

      // Estimate token counts (Ollama provides eval counts)
      const promptTokens = response.prompt_eval_count || 0;
      const completionTokens = response.eval_count || 0;

      return {
        content: response.message.content,
        role: 'assistant',
        tool_calls: toolCalls,
        finish_reason: response.done ? 'stop' : undefined,
        usage: {
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: promptTokens + completionTokens,
        },
      };

    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama completion failed: ${(error as Error).message}`);
    }
  }

  /**
   * Stream completions
   */
  async *stream(messages: LLMMessage[], tools?: any[]): AsyncGenerator<string, void, unknown> {
    const ollamaMessages = this.convertMessages(messages);

    const requestData: any = {
      model: this.model,
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: this.temperature,
      },
      keep_alive: this.keepAlive,
    };

    if (this.maxTokens) {
      requestData.options.num_predict = this.maxTokens;
    }

    if (tools && tools.length > 0) {
      requestData.tools = this.convertTools(tools);
    }

    const url = `${this.baseUrl}/api/chat`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const chunk: OllamaResponse = JSON.parse(line);
            if (chunk.message?.content) {
              yield chunk.message.content;
            }
          } catch (e) {
            console.warn('Failed to parse Ollama stream chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Ollama streaming error:', error);
      throw new Error(`Ollama streaming failed: ${(error as Error).message}`);
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      
      return (data.models || [])
        .filter((m: any) => !m.name.includes('embedding')) // Filter out embedding models
        .map((m: any) => m.name);
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Pull a model (download if not available)
   */
  async pullModel(modelName: string): Promise<void> {
    console.log(`Pulling Ollama model: ${modelName}...`);
    
    const url = `${this.baseUrl}/api/pull`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: modelName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    // Stream pull progress
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const progress = JSON.parse(line);
          if (progress.status) {
            console.log(`  ${progress.status}`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    console.log(`Model ${modelName} pulled successfully`);
  }
}
