/**
 * Anthropic LLM Client
 * Adapted from Letta's AnthropicClient
 * 
 * Implements Claude integration with retry logic, error handling, and streaming support.
 */

import { LLMClient, LLMMessage, LLMResponse } from './llm-client';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  backoffFactor: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  backoffFactor: 2,
  maxDelay: 10,
};

/**
 * Anthropic Client Implementation
 * 
 * Supports:
 * - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
 * - Extended thinking (reasoning)
 * - Tool calling
 * - Streaming responses
 */
export class AnthropicClient extends LLMClient {
  private client: Anthropic;
  private retryConfig: RetryConfig;
  private contextWindow: number;

  constructor(
    apiKey: string,
    model: string = 'claude-3-5-sonnet-20241022',
    temperature: number = 0.7,
    maxTokens?: number,
    contextWindow: number = 200000
  ) {
    super(model, temperature, maxTokens);
    
    this.client = new Anthropic({
      apiKey,
      maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
    });
    
    this.retryConfig = DEFAULT_RETRY_CONFIG;
    this.contextWindow = contextWindow;
  }

  /**
   * Set custom retry configuration
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Sleep for exponential backoff
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokenCount(messages: LLMMessage[]): number {
    const text = messages.map(m => m.content || '').join(' ');
    // Claude: ~1 token ≈ 3.5 characters
    return Math.ceil(text.length / 3.5);
  }

  /**
   * Check if context is near overflow
   */
  private isContextNearOverflow(messages: LLMMessage[]): boolean {
    const estimatedTokens = this.estimateTokenCount(messages);
    const threshold = this.contextWindow * 0.9;
    return estimatedTokens > threshold;
  }

  /**
   * Convert messages to Anthropic format
   */
  private convertMessages(messages: LLMMessage[]): Array<{
    role: 'user' | 'assistant';
    content: string;
  }> {
    const anthropicMessages: Array<{
      role: 'user' | 'assistant';
      content: string;
    }> = [];

    // Extract system messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    // Anthropic requires alternating user/assistant messages
    // Merge consecutive messages of same role
    for (const msg of nonSystemMessages) {
      if (msg.role === 'tool') {
        // Tool messages become user messages in Anthropic
        if (anthropicMessages.length > 0 && anthropicMessages[anthropicMessages.length - 1].role === 'user') {
          // Append to last user message
          anthropicMessages[anthropicMessages.length - 1].content += `\n\nTool result: ${msg.content}`;
        } else {
          anthropicMessages.push({
            role: 'user',
            content: `Tool result: ${msg.content}`,
          });
        }
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        if (anthropicMessages.length > 0 && 
            anthropicMessages[anthropicMessages.length - 1].role === msg.role) {
          // Merge with previous message of same role
          anthropicMessages[anthropicMessages.length - 1].content += `\n\n${msg.content}`;
        } else {
          anthropicMessages.push({
            role: msg.role,
            content: msg.content || '',
          });
        }
      }
    }

    return anthropicMessages;
  }

  /**
   * Convert tools to Anthropic format
   */
  private convertTools(tools: any[]): any[] {
    return tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: {
        type: 'object',
        properties: tool.function.parameters.properties,
        required: tool.function.parameters.required || [],
      },
    }));
  }

  /**
   * Generate a completion using Anthropic Claude
   */
  async complete(messages: LLMMessage[], tools?: any[]): Promise<LLMResponse> {
    // Check for context overflow
    if (this.isContextNearOverflow(messages)) {
      throw new Error('Context window near overflow. Consider summarizing older messages.');
    }

    // Extract system messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    // Convert messages
    const anthropicMessages = this.convertMessages(messages);

    // Ensure we start with a user message
    if (anthropicMessages.length === 0 || anthropicMessages[0].role !== 'user') {
      anthropicMessages.unshift({
        role: 'user',
        content: 'Please respond to the following.',
      });
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const requestParams: any = {
          model: this.model,
          messages: anthropicMessages,
          max_tokens: this.maxTokens || 4096,
          temperature: this.temperature,
        };

        // Add system prompt if present
        if (systemPrompt) {
          requestParams.system = systemPrompt;
        }

        // Add tools if provided
        if (tools && tools.length > 0) {
          requestParams.tools = this.convertTools(tools);
        }

        const response = await this.client.messages.create(requestParams);

        // Check for stop reason
        if (response.stop_reason === 'max_tokens') {
          throw new Error('Response truncated - max tokens reached');
        }

        // Extract content
        let content = '';
        const toolCalls: any[] = [];

        for (const block of response.content) {
          if (block.type === 'text') {
            content += block.text;
          } else if (block.type === 'tool_use') {
            toolCalls.push({
              id: block.id,
              type: 'function',
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            });
          }
        }

        return {
          content,
          role: 'assistant',
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
          finish_reason: response.stop_reason || undefined,
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens,
          },
        };

      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('invalid api key') ||
              errorMessage.includes('authentication') ||
              errorMessage.includes('rate limit')) {
            throw error;
          }
        }

        // Retry with exponential backoff
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.backoffFactor * Math.pow(2, attempt - 1) * 1000,
            this.retryConfig.maxDelay * 1000
          );
          console.warn(
            `Anthropic API error (attempt ${attempt}/${this.retryConfig.maxRetries}): ${lastError.message}. ` +
            `Retrying in ${delay}ms...`
          );
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `Anthropic completion failed after ${this.retryConfig.maxRetries} retries: ${lastError?.message}`
    );
  }

  /**
   * Stream completions
   */
  async *stream(messages: LLMMessage[], tools?: any[]): AsyncGenerator<string, void, unknown> {
    // Extract system messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const systemPrompt = systemMessages.map(m => m.content).join('\n\n');

    // Convert messages
    const anthropicMessages = this.convertMessages(messages);

    // Ensure we start with a user message
    if (anthropicMessages.length === 0 || anthropicMessages[0].role !== 'user') {
      anthropicMessages.unshift({
        role: 'user',
        content: 'Please respond to the following.',
      });
    }

    const requestParams: any = {
      model: this.model,
      messages: anthropicMessages,
      max_tokens: this.maxTokens || 4096,
      temperature: this.temperature,
      stream: true,
    };

    if (systemPrompt) {
      requestParams.system = systemPrompt;
    }

    if (tools && tools.length > 0) {
      requestParams.tools = this.convertTools(tools);
    }

    const stream = await this.client.messages.create(requestParams);

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && 
          event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
