/**
 * Agent State Schema
 * Defines the complete state of an SBF agent
 * 
 * Inspired by Letta's AgentState with SBF-specific additions.
 */

import { z } from 'zod';
import { BlockSchema } from '../memory';

/**
 * LLM Configuration Schema
 * 
 * Defines which LLM provider and model to use,
 * along with generation parameters.
 */
export const LLMConfigSchema = z.object({
  model: z.string().default('gpt-4-turbo-preview'),
  model_endpoint_type: z.enum(['openai', 'anthropic', 'openrouter', 'local']).default('openai'),
  context_window: z.number().default(128000),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().optional(),
  api_key: z.string().optional(),
  base_url: z.string().optional(),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

/**
 * Tool Definition Schema
 */
export const ToolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()),
  required: z.array(z.string()).default([]),
});

export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

/**
 * Agent State Schema
 * 
 * Complete serializable state of an agent.
 * Can be saved to disk and restored later.
 */
export const AgentStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),

  // User context
  user_id: z.string(),
  vault_path: z.string(),

  // Memory
  memory: z.object({
    type: z.string(),
    blocks: z.array(BlockSchema),
  }),

  // LLM Configuration
  llm_config: LLMConfigSchema,

  // Tools
  tool_names: z.array(z.string()).default([]),

  // System prompt
  system_prompt: z.string(),

  // Conversation history (last N messages)
  conversation_history: z.array(z.any()).default([]),

  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type AgentState = z.infer<typeof AgentStateSchema>;

/**
 * Default system prompt for SBF agents
 */
export const DEFAULT_SYSTEM_PROMPT = `You are an intelligent assistant for Second Brain Foundation (SBF), a personal knowledge management system.

Your role is to help users:
- Organize their knowledge into entities (topics, resources, people, projects)
- Create connections between related entities
- Extract insights from their notes and conversations
- Manage their daily notes and capture queue
- Answer questions about their knowledge base

You have access to tools that let you:
- Create, read, update, and delete entities
- Search for entities and content
- Create relationships between entities
- Access the user's vault structure

Always:
- Be concise and helpful
- Confirm destructive operations before executing
- Explain your reasoning when making suggestions
- Respect the user's privacy settings
- Use the tools available to you to provide accurate information

Remember:
- You have persistent memory across conversations
- The user's current focus and recent entities are in your memory
- You can update your memory to track important context`;

/**
 * Create a new agent state with defaults
 */
export function createAgentState(params: {
  userId: string;
  vaultPath: string;
  name?: string;
  llmConfig?: Partial<LLMConfig>;
}): AgentState {
  const now = new Date().toISOString();
  const agentId = `agent-${params.userId}-${Date.now()}`;

  return {
    id: agentId,
    name: params.name || 'SBF Assistant',
    created_at: now,
    updated_at: now,
    user_id: params.userId,
    vault_path: params.vaultPath,
    memory: {
      type: 'SBFMemory',
      blocks: [],
    },
    llm_config: {
      model: 'gpt-4-turbo-preview',
      model_endpoint_type: 'openai',
      context_window: 128000,
      temperature: 0.7,
      ...params.llmConfig,
    },
    tool_names: [
      'create_entity',
      'read_entity',
      'update_entity',
      'search_entities',
      'create_relationship',
    ],
    system_prompt: DEFAULT_SYSTEM_PROMPT,
    conversation_history: [],
  };
}
