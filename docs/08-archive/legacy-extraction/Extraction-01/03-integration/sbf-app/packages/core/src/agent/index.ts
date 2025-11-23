/**
 * Agent Module Exports
 * Main entry point for SBF agent functionality
 * 
 * Phase 1 - Core Foundation Complete ✅
 */

// Main agent
export { SBFAgent } from './sbf-agent';
export type { SBFAgentConfig } from './sbf-agent';

// Base classes
export { BaseAgent } from './base-agent';
export type { MessageCreate, AgentResponse, UsageStatistics } from './base-agent';

// Memory system
export { Memory, ChatMemory, SBFMemory } from './memory';
export type { Block } from './memory';

// State management
export type { AgentState, LLMConfig, ToolDefinition } from './schemas/agent-state';
export { createAgentState, DEFAULT_SYSTEM_PROMPT } from './schemas/agent-state';
export { StateManager } from './managers/state-manager';
export { ConversationManager } from './managers/conversation-manager';

// LLM clients
export { LLMClient } from './llm/llm-client';
export type { LLMMessage, LLMResponse, ToolCall } from './llm/llm-client';
export { OpenAIClient } from './llm/openai-client';

// Legacy exports (for backwards compatibility)
export * from './memory';
export * from './tools';
export * from './learning';
export * from './llm';
