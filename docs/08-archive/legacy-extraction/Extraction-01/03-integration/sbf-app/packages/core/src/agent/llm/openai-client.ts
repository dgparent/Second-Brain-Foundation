/**
 * OpenAI LLM Client
 * Implementation of LLMClient for OpenAI API with retry logic and error handling
 */

import { LLMClient, LLMMessage, LLMResponse } from './llm-client';
import OpenAI from 'openai';

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
 * OpenAI Client Implementation with retry logic and context overflow handling
 */
export class OpenAIClient extends LLMClient {
  private client: OpenAI;
  private retryConfig: RetryConfig;
  private contextWindow: number;

  constructor(
    apiKey: string,
    model: string = 'gpt-4-turbo-preview',
    temperature: number = 0.7,
    maxTokens?: number,
    baseURL?: string,
    contextWindow: number = 128000
  ) {
    super(model, temperature, maxTokens);
    
    this.client = new OpenAI({
      apiKey,
      baseURL,
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
   * For precise counting, use tiktoken library
   */
  private estimateTokenCount(messages: LLMMessage[]): number {
    const text = messages.map(m => m.content || '').join(' ');
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if context is near overflow
   */
  private isContextNearOverflow(messages: LLMMessage[]): boolean {
    const estimatedTokens = this.estimateTokenCount(messages);
    const threshold = this.contextWindow * 0.9; // 90% threshold
    return estimatedTokens > threshold;
  }

  /**
   * Generate a completion using OpenAI with retry logic
   */
  async complete(messages: LLMMessage[], tools?: any[]): Promise<LLMResponse> {
    // Check for context overflow
    if (this.isContextNearOverflow(messages)) {
      throw new Error('Context window near overflow. Consider summarizing older messages.');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: messages as any,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          tools: tools,
        });

        const choice = completion.choices[0];
        if (!choice) {
          throw new Error('No completion choices returned');
        }

        // Check finish reason
        if (choice.finish_reason === 'length') {
          throw new Error('Context length exceeded - response truncated');
        }

        if (choice.finish_reason && !['stop', 'tool_calls'].includes(choice.finish_reason)) {
          throw new Error(`Unexpected finish reason: ${choice.finish_reason}`);
        }

        // Check for context overflow in response
        if (completion.usage && completion.usage.total_tokens > this.contextWindow) {
          console.warn(`Context window exceeded: ${completion.usage.total_tokens} > ${this.contextWindow}`);
        }

        return {
          content: choice.message.content || '',
          role: 'assistant',
          tool_calls: choice.message.tool_calls as any,
          finish_reason: choice.finish_reason || undefined,
          usage: completion.usage ? {
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
          } : undefined,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('context length exceeded') || 
              errorMessage.includes('invalid api key') ||
              errorMessage.includes('rate limit')) {
            // These are not transient errors
            throw error;
          }
        }

        // Retry with exponential backoff
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.backoffFactor * Math.pow(2, attempt - 1) * 1000,
            this.retryConfig.maxDelay * 1000
          );
          console.warn(`OpenAI API error (attempt ${attempt}/${this.retryConfig.maxRetries}): ${lastError.message}. Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new Error(`OpenAI completion failed after ${this.retryConfig.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Stream completions (for future implementation)
   */
  async *stream(messages: LLMMessage[], tools?: any[]): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      tools: tools,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
