/**
 * Base Agent Class
 * Inspired by Letta's BaseAgent pattern
 * 
 * Provides abstract interface for all agents in SBF.
 * Implements the core agent step loop and lifecycle methods.
 */

import { z } from 'zod';

/**
 * Message schemas for agent communication
 */
export const MessageCreateSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.string().datetime().optional(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export type MessageCreate = z.infer<typeof MessageCreateSchema>;

/**
 * Usage statistics for tracking token consumption
 */
export const UsageStatisticsSchema = z.object({
  total_tokens: z.number(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  step_count: z.number(),
});

export type UsageStatistics = z.infer<typeof UsageStatisticsSchema>;

/**
 * Agent response containing message and metadata
 */
export interface AgentResponse {
  messages: MessageCreate[];
  usage: UsageStatistics;
  metadata?: Record<string, any>;
}

/**
 * Base abstract class for all agents.
 * 
 * Inspired by Letta's BaseAgent, this provides the core interface
 * that all SBF agents must implement.
 */
export abstract class BaseAgent {
  protected agentId: string;
  protected userId: string;

  constructor(agentId: string, userId: string) {
    this.agentId = agentId;
    this.userId = userId;
  }

  /**
   * Top-level event message handler for the agent.
   * 
   * This is the main entry point for agent interactions.
   * The agent processes input messages, executes tools if needed,
   * and returns a response with usage statistics.
   * 
   * @param inputMessages - Array of messages to process
   * @returns Agent response with messages and usage stats
   */
  abstract step(inputMessages: MessageCreate[]): Promise<AgentResponse>;

  /**
   * Initialize agent state and resources.
   * 
   * Called once when the agent is first created.
   * Should load persisted state if available.
   */
  abstract initialize(): Promise<void>;

  /**
   * Save current agent state to persistent storage.
   * 
   * Should be called after each step to ensure state is preserved.
   */
  abstract save(): Promise<void>;

  /**
   * Cleanup agent resources.
   * 
   * Called when the agent is being destroyed.
   */
  abstract cleanup(): Promise<void>;

  /**
   * Get current agent state as JSON.
   * 
   * Used for debugging and state inspection.
   */
  abstract toJSON(): Record<string, any>;
}
