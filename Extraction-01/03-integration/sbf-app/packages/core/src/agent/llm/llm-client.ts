/**
 * LLM Client Abstraction
 * Provider-agnostic interface for LLM interactions
 * 
 * Inspired by Letta's LLM client architecture
 */

import { z } from 'zod';

/**
 * LLM Message Schema
 */
export const LLMMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool']),
  content: z.string(),
  name: z.string().optional(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export type LLMMessage = z.infer<typeof LLMMessageSchema>;

/**
 * LLM Response Schema
 */
export const LLMResponseSchema = z.object({
  content: z.string(),
  role: z.enum(['assistant']),
  tool_calls: z.array(z.any()).optional(),
  finish_reason: z.string().optional(),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }).optional(),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

/**
 * Tool Call Schema
 */
export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.literal('function'),
  function: z.object({
    name: z.string(),
    arguments: z.string(), // JSON string
  }),
});

export type ToolCall = z.infer<typeof ToolCallSchema>;

/**
 * Abstract LLM Client
 * 
 * All LLM providers must implement this interface.
 */
export abstract class LLMClient {
  protected model: string;
  protected temperature: number;
  protected maxTokens?: number;

  constructor(model: string, temperature: number = 0.7, maxTokens?: number) {
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  /**
   * Generate a completion from messages
   */
  abstract complete(
    messages: LLMMessage[],
    tools?: any[]
  ): Promise<LLMResponse>;

  /**
   * Stream a completion (optional, for future use)
   */
  abstract stream?(
    messages: LLMMessage[],
    tools?: any[]
  ): AsyncGenerator<string, void, unknown>;
}
