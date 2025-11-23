/**
 * SBF Agent - Main Agent Implementation
 * 
 * Integrates all Letta-inspired components:
 * - Memory system (blocks)
 * - LLM client (OpenAI)
 * - Tool system (Phase 2)
 * - State persistence
 * - Conversation management
 * 
 * Implements the core agent step loop.
 */

import { BaseAgent, MessageCreate, AgentResponse, UsageStatistics } from './base-agent';
import { SBFMemory, Memory } from './memory';
import { AgentState, createAgentState } from './schemas/agent-state';
import { StateManager } from './managers/state-manager';
import { ConversationManager } from './managers/conversation-manager';
import { ToolManager } from './managers/tool-manager';
import { LLMClient, LLMMessage } from './llm/llm-client';
import { OpenAIClient } from './llm/openai-client';
import { AnthropicClient } from './llm/anthropic-client';
import { OllamaClient } from './llm/ollama-client';
import { toolToOpenAIFunction } from './schemas/tool';

/**
 * LLM Provider types
 */
export type LLMProvider = 'openai' | 'anthropic' | 'ollama';

/**
 * SBF Agent Configuration
 */
export interface SBFAgentConfig {
  userId: string;
  vaultPath: string;
  name?: string;
  
  // LLM Configuration
  llmProvider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  
  // Provider-specific API keys
  openaiApiKey?: string;
  anthropicApiKey?: string;
  
  // Ollama configuration
  ollamaBaseUrl?: string;
  
  // Agent configuration
  existingAgentId?: string;
  entityManager?: any; // EntityFileManager - optional for tool registration
}

/**
 * Main SBF Agent
 * 
 * Stateful agent with:
 * - Persistent memory (persona, user, focus, etc.)
 * - Tool calling capabilities
 * - Conversation history
 * - State persistence
 */
export class SBFAgent extends BaseAgent {
  private state: AgentState;
  private memory: SBFMemory;
  private stateManager: StateManager;
  private conversationManager: ConversationManager;
  private toolManager: ToolManager;
  private llmClient: LLMClient;

  private constructor(
    state: AgentState,
    memory: SBFMemory,
    stateManager: StateManager,
    conversationManager: ConversationManager,
    toolManager: ToolManager,
    llmClient: LLMClient
  ) {
    super(state.id, state.user_id);
    this.state = state;
    this.memory = memory;
    this.stateManager = stateManager;
    this.conversationManager = conversationManager;
    this.toolManager = toolManager;
    this.llmClient = llmClient;
  }

  /**
   * Create a new SBF Agent
   */
  static async create(config: SBFAgentConfig): Promise<SBFAgent> {
    const stateManager = new StateManager(config.vaultPath);
    const conversationManager = new ConversationManager();
    const toolManager = new ToolManager();
    
    // Wire up persistence
    conversationManager.setStateManager(stateManager);

    let state: AgentState;
    
    // Try to load existing state if ID provided
    if (config.existingAgentId) {
      const existingState = await stateManager.loadState(config.existingAgentId);
      if (existingState) {
        state = existingState;
        // Load existing messages
        await conversationManager.loadMessages(config.existingAgentId);
      } else {
        throw new Error(`Agent ${config.existingAgentId} not found`);
      }
    } else {
      // Create new state
      const provider = config.llmProvider || 'openai';
      
      state = createAgentState({
        userId: config.userId,
        vaultPath: config.vaultPath,
        name: config.name,
        llmConfig: {
          model: config.model || SBFAgent.getDefaultModel(provider),
          temperature: config.temperature ?? 0.7,
          api_key: config.openaiApiKey || config.anthropicApiKey,
          max_tokens: config.maxTokens,
        },
      });
    }

    // Initialize memory from state
    const memory = new SBFMemory(
      'You are a helpful AI assistant for Second Brain Foundation, a personal knowledge management system.',
      `User ID: ${config.userId}\nVault: ${config.vaultPath}`
    );
    
    // Load memory blocks from state if they exist
    if (state.memory.blocks.length > 0) {
      memory.fromJSON(state.memory);
    }

    // Initialize LLM client based on provider
    const provider = config.llmProvider || 'openai';
    const llmClient = await SBFAgent.createLLMClient(provider, config, state);

    const agent = new SBFAgent(state, memory, stateManager, conversationManager, toolManager, llmClient);
    
    // Register tools if entity manager provided
    if (config.entityManager) {
      await agent.registerDefaultTools(config.entityManager);
    }
    
    await agent.initialize();
    return agent;
  }

  /**
   * Create LLM client based on provider
   */
  private static async createLLMClient(
    provider: LLMProvider,
    config: SBFAgentConfig,
    state: AgentState
  ): Promise<LLMClient> {
    const model = config.model || state.llm_config.model || 'gpt-4-turbo-preview';
    const temperature = config.temperature ?? state.llm_config.temperature ?? 0.7;
    const maxTokens = config.maxTokens || state.llm_config.max_tokens;
    const contextWindow = state.llm_config.context_window;

    switch (provider) {
      case 'openai': {
        const apiKey = config.openaiApiKey || 
                       state.llm_config.api_key || 
                       process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
          throw new Error('OpenAI API key not provided. Set openaiApiKey in config or OPENAI_API_KEY env var.');
        }

        return new OpenAIClient(
          apiKey,
          model,
          temperature,
          maxTokens,
          state.llm_config.base_url,
          contextWindow
        );
      }

      case 'anthropic': {
        const apiKey = config.anthropicApiKey || 
                       process.env.ANTHROPIC_API_KEY;
        
        if (!apiKey) {
          throw new Error('Anthropic API key not provided. Set anthropicApiKey in config or ANTHROPIC_API_KEY env var.');
        }

        return new AnthropicClient(
          apiKey,
          model || 'claude-3-5-sonnet-20241022',
          temperature,
          maxTokens,
          contextWindow || 200000
        );
      }

      case 'ollama': {
        const baseUrl = config.ollamaBaseUrl || 
                        process.env.OLLAMA_BASE_URL || 
                        'http://localhost:11434';

        const client = new OllamaClient(
          model || 'llama3.2',
          temperature,
          maxTokens,
          baseUrl
        );

        // Try to get model info for context window
        try {
          await client.getModelInfo();
        } catch (error) {
          console.warn('Could not connect to Ollama server. Make sure it is running.');
        }

        return client;
      }

      default:
        throw new Error(`Unknown LLM provider: ${provider}`);
    }
  }

  /**
   * Get default model for provider
   */
  private static getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case 'openai':
        return 'gpt-4-turbo-preview';
      case 'anthropic':
        return 'claude-3-5-sonnet-20241022';
      case 'ollama':
        return 'llama3.2';
      default:
        return 'gpt-4-turbo-preview';
    }
  }

  /**
   * Register default SBF tools (entity and relationship tools)
   */
  private async registerDefaultTools(entityManager: any): Promise<void> {
    // Import and register entity tools
    const { registerEntityTools } = await import('./tools/entity-tools');
    const { registerRelationshipTools } = await import('./tools/relationship-tools');
    
    registerEntityTools(this.toolManager, entityManager);
    registerRelationshipTools(this.toolManager, entityManager);
    
    console.log(`Registered ${this.toolManager.getToolCount()} tools`);
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    // Agent is already initialized in constructor
    console.log(`Agent ${this.state.id} initialized`);
  }

  /**
   * Main agent step loop
   * 
   * Processes user messages through the following steps:
   * 1. Add user messages to conversation history
   * 2. Build context from memory and conversation
   * 3. Generate LLM response with tool calling
   * 4. Parse and execute any tool calls
   * 5. Update memory if needed
   * 6. Save state
   * 7. Return response
   */
  async step(inputMessages: MessageCreate[]): Promise<AgentResponse> {
    // Track usage
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    // Step 1: Add messages to conversation history
    await this.conversationManager.addMessages(this.agentId, inputMessages);

    // Step 2: Build LLM context with tools
    const context = await this.buildContext();
    const tools = this.toolManager.getAllTools().map(toolToOpenAIFunction);

    // Step 3: Get LLM response with tool definitions
    const response = await this.llmClient.complete(context, tools);

    // Track usage
    if (response.usage) {
      totalTokens += response.usage.total_tokens;
      promptTokens += response.usage.prompt_tokens;
      completionTokens += response.usage.completion_tokens;
    }

    // Step 4: Handle tool calls if any
    const responseMessages: MessageCreate[] = [];
    
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Add assistant message with tool calls
      responseMessages.push({
        role: 'assistant',
        content: response.content,
        tool_calls: response.tool_calls,
      });

      // Execute tools (Phase 2 implementation)
      for (const toolCall of response.tool_calls) {
        const toolResult = await this.executeTool(toolCall);
        responseMessages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });
      }

      // Get final response after tool execution
      await this.conversationManager.addMessages(this.agentId, responseMessages);
      const finalContext = await this.buildContext();
      const finalTools = tools; // Same tools available
      const finalResponse = await this.llmClient.complete(finalContext, finalTools);
      
      if (finalResponse.usage) {
        totalTokens += finalResponse.usage.total_tokens;
        promptTokens += finalResponse.usage.prompt_tokens;
        completionTokens += finalResponse.usage.completion_tokens;
      }

      responseMessages.push({
        role: 'assistant',
        content: finalResponse.content,
      });
    } else {
      // No tool calls, just add the response
      responseMessages.push({
        role: 'assistant',
        content: response.content,
      });
    }

    // Step 5: Update conversation
    await this.conversationManager.addMessages(this.agentId, responseMessages);

    // Step 6: Save state
    await this.save();

    // Step 7: Return response
    const usage: UsageStatistics = {
      total_tokens: totalTokens,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      step_count: 1,
    };

    return {
      messages: responseMessages,
      usage,
    };
  }

  /**
   * Build context for LLM from memory and conversation
   */
  private async buildContext(): Promise<LLMMessage[]> {
    const messages: LLMMessage[] = [];

    // Add system prompt
    messages.push({
      role: 'system',
      content: this.state.system_prompt,
    });

    // Add memory context
    const memoryContext = this.memory.toContextString();
    messages.push({
      role: 'system',
      content: `## Core Memory\n${memoryContext}`,
    });

    // Add recent conversation history
    const recentMessages = await this.conversationManager.getMessages(this.agentId, 20);
    for (const msg of recentMessages) {
      messages.push({
        role: msg.role,
        content: msg.content,
        tool_calls: msg.tool_calls,
        tool_call_id: msg.tool_call_id,
      });
    }

    return messages;
  }

  /**
   * Execute a tool call
   * 
   * Phase 2: Full tool execution with validation and error handling
   */
  private async executeTool(toolCall: any): Promise<any> {
    const functionName = toolCall.function?.name || toolCall.name;
    const functionArgs = typeof toolCall.function?.arguments === 'string'
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function?.arguments || toolCall.arguments || {};

    console.log(`Executing tool: ${functionName} with args:`, functionArgs);

    try {
      // Execute through ToolManager
      const result = await this.toolManager.executeTool(functionName, functionArgs);
      
      return result;
    } catch (error) {
      console.error(`Tool execution error (${functionName}):`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Save agent state to disk
   */
  async save(): Promise<void> {
    // Update state timestamp
    this.state.updated_at = new Date().toISOString();
    
    // Save memory to state
    this.state.memory = this.memory.toJSON();

    // Persist to disk
    await this.stateManager.saveState(this.state);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.save();
  }

  /**
   * Get agent state as JSON
   */
  toJSON(): Record<string, any> {
    return {
      ...this.state,
      memory: this.memory.toJSON(),
    };
  }

  /**
   * Update memory block
   */
  updateMemory(label: string, value: string): void {
    this.memory.updateBlock(label, value);
  }

  /**
   * Get current memory state
   */
  getMemory(): Memory {
    return this.memory;
  }

  /**
   * Set current focus entity
   */
  setCurrentFocus(entityUid: string, entityTitle: string): void {
    this.memory.setCurrentFocus(entityUid, entityTitle);
  }

  /**
   * Add entity to recent entities
   */
  addRecentEntity(entityUid: string): void {
    this.memory.addRecentEntity(entityUid);
  }

  /**
   * Get the tool manager (for registering custom tools)
   */
  getToolManager(): ToolManager {
    return this.toolManager;
  }

  /**
   * Get list of available tools
   */
  getAvailableTools(): string[] {
    return this.toolManager.getAllTools().map(t => t.name);
  }

  /**
   * Get LLM configuration info
   */
  getLLMInfo(): {
    model: string;
    temperature: number;
    maxTokens?: number;
    contextWindow?: number;
  } {
    return {
      model: this.state.llm_config.model,
      temperature: this.state.llm_config.temperature,
      maxTokens: this.state.llm_config.max_tokens,
      contextWindow: this.state.llm_config.context_window,
    };
  }

  /**
   * Get LLM client (for advanced usage)
   */
  getLLMClient(): LLMClient {
    return this.llmClient;
  }
}
