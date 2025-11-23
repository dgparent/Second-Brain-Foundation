/**
 * Conversation Manager
 * Manages message history for agents with persistence
 * 
 * Inspired by Letta's MessageManager
 */

import { MessageCreate } from '../base-agent';
import { StateManager } from './state-manager';
import { z } from 'zod';

/**
 * Message Schema - persisted message
 */
const MessageSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.string(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

type Message = z.infer<typeof MessageSchema>;

/**
 * Conversation Manager
 * 
 * Manages conversation history for agents with persistence.
 */
export class ConversationManager {
  private messages: Map<string, Message[]> = new Map();
  private stateManager: StateManager | null = null;

  /**
   * Set the state manager for persistence
   */
  setStateManager(stateManager: StateManager): void {
    this.stateManager = stateManager;
  }

  /**
   * Load messages from disk for an agent
   */
  async loadMessages(agentId: string): Promise<void> {
    if (!this.stateManager) return;
    
    const persistedMessages = await this.stateManager.loadMessages(agentId);
    this.messages.set(agentId, persistedMessages);
  }

  /**
   * Save messages to disk for an agent
   */
  private async persistMessages(agentId: string): Promise<void> {
    if (!this.stateManager) return;
    
    const agentMessages = this.messages.get(agentId) || [];
    await this.stateManager.saveMessages(agentId, agentMessages);
  }

  /**
   * Add messages to conversation history
   */
  async addMessages(agentId: string, messages: MessageCreate[]): Promise<Message[]> {
    const agentMessages = this.messages.get(agentId) || [];

    const newMessages = messages.map((msg, idx) => ({
      id: `msg-${Date.now()}-${idx}`,
      agent_id: agentId,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      tool_calls: msg.tool_calls,
      tool_call_id: msg.tool_call_id,
    }));

    agentMessages.push(...newMessages);
    this.messages.set(agentId, agentMessages);

    // Persist to disk
    await this.persistMessages(agentId);

    return newMessages;
  }

  /**
   * Get recent conversation history
   */
  async getMessages(agentId: string, limit: number = 50): Promise<Message[]> {
    const agentMessages = this.messages.get(agentId) || [];
    return agentMessages.slice(-limit);
  }

  /**
   * Get messages in a specific time range
   */
  async getMessagesByTimeRange(
    agentId: string,
    startTime: string,
    endTime: string
  ): Promise<Message[]> {
    const agentMessages = this.messages.get(agentId) || [];
    return agentMessages.filter(
      msg => msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }

  /**
   * Clear conversation history
   */
  async clearMessages(agentId: string): Promise<void> {
    this.messages.delete(agentId);
    
    // Clear from disk
    if (this.stateManager) {
      await this.stateManager.deleteMessages(agentId);
    }
  }

  /**
   * Get message count for an agent
   */
  async getMessageCount(agentId: string): Promise<number> {
    const agentMessages = this.messages.get(agentId) || [];
    return agentMessages.length;
  }
}
