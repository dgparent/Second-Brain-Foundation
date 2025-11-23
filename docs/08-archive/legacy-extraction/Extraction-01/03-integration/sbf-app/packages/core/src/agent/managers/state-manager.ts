/**
 * State Manager
 * Manages persistent agent state and message history
 * 
 * Handles saving and loading agent state and conversations to/from disk.
 */

import { AgentState, AgentStateSchema } from '../schemas/agent-state';
import { MessageCreate } from '../base-agent';
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Persisted Message Schema
 */
const PersistedMessageSchema = z.object({
  id: z.string(),
  agent_id: z.string(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.string(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

type PersistedMessage = z.infer<typeof PersistedMessageSchema>;

/**
 * State Manager
 * 
 * Responsible for persisting agent state to the file system.
 * Stores agent state in .sbf/agents/ directory.
 */
export class StateManager {
  private vaultPath: string;

  constructor(vaultPath: string) {
    this.vaultPath = vaultPath;
  }

  /**
   * Get the agent state directory path
   */
  private getAgentStatePath(agentId: string): string {
    return path.join(this.vaultPath, '.sbf', 'agents', `${agentId}.json`);
  }

  /**
   * Get the agent messages file path
   */
  private getAgentMessagesPath(agentId: string): string {
    return path.join(this.vaultPath, '.sbf', 'agents', `${agentId}-messages.json`);
  }

  /**
   * Ensure the agents directory exists
   */
  private async ensureAgentsDirectory(): Promise<void> {
    const agentsDir = path.join(this.vaultPath, '.sbf', 'agents');
    await fs.mkdir(agentsDir, { recursive: true });
  }

  /**
   * Save agent state to disk
   */
  async saveState(state: AgentState): Promise<void> {
    await this.ensureAgentsDirectory();
    
    const statePath = this.getAgentStatePath(state.id);
    const stateJson = JSON.stringify(state, null, 2);
    
    // Atomic write: write to temp file then rename
    const tempPath = `${statePath}.tmp`;
    await fs.writeFile(tempPath, stateJson, 'utf-8');
    await fs.rename(tempPath, statePath);
  }

  /**
   * Load agent state from disk
   */
  async loadState(agentId: string): Promise<AgentState | null> {
    try {
      const statePath = this.getAgentStatePath(agentId);
      const stateJson = await fs.readFile(statePath, 'utf-8');
      const state = JSON.parse(stateJson);
      
      // Validate with Zod
      return AgentStateSchema.parse(state);
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  /**
   * Check if agent state exists
   */
  async stateExists(agentId: string): Promise<boolean> {
    try {
      const statePath = this.getAgentStatePath(agentId);
      await fs.access(statePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete agent state
   */
  async deleteState(agentId: string): Promise<void> {
    const statePath = this.getAgentStatePath(agentId);
    try {
      await fs.unlink(statePath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List all agent IDs
   */
  async listAgents(): Promise<string[]> {
    try {
      const agentsDir = path.join(this.vaultPath, '.sbf', 'agents');
      const files = await fs.readdir(agentsDir);
      return files
        .filter(f => f.endsWith('.json') && !f.endsWith('-messages.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Save messages to disk
   */
  async saveMessages(agentId: string, messages: PersistedMessage[]): Promise<void> {
    await this.ensureAgentsDirectory();
    
    const messagesPath = this.getAgentMessagesPath(agentId);
    const messagesJson = JSON.stringify(messages, null, 2);
    
    // Atomic write
    const tempPath = `${messagesPath}.tmp`;
    await fs.writeFile(tempPath, messagesJson, 'utf-8');
    await fs.rename(tempPath, messagesPath);
  }

  /**
   * Load messages from disk
   */
  async loadMessages(agentId: string): Promise<PersistedMessage[]> {
    try {
      const messagesPath = this.getAgentMessagesPath(agentId);
      const messagesJson = await fs.readFile(messagesPath, 'utf-8');
      const messages = JSON.parse(messagesJson);
      
      // Validate each message
      return messages.map((msg: any) => PersistedMessageSchema.parse(msg));
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return []; // No messages file exists
      }
      throw error;
    }
  }

  /**
   * Delete messages file
   */
  async deleteMessages(agentId: string): Promise<void> {
    const messagesPath = this.getAgentMessagesPath(agentId);
    try {
      await fs.unlink(messagesPath);
    } catch (error) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
