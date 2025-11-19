/**
 * Agent Type Definitions
 * Types for Letta-inspired agentic AI system
 */

import { Entity } from './entity.types';

/**
 * Agent Configuration
 */
export interface AgentConfig {
  vaultPath: string;
  userProfile: UserProfile;
  llmConfig: LLMConfig;
  tools: string[]; // Tool names to enable
}

/**
 * User Profile (Core Memory)
 */
export interface UserProfile {
  persona: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  organizationStyle: string;
  sensitivityDefaults: Record<string, string>;
  entityPreferences: string[];
}

/**
 * LLM Configuration
 */
export interface LLMConfig {
  provider: 'local' | 'openai' | 'anthropic';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Memory System Types
 */
export interface CoreMemory {
  persona: string;
  preferences: UserPreferences;
}

export interface ArchivalMemoryEntry {
  entity: Entity;
  embedding?: number[];
  timestamp: string;
}

export interface RecallMemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Agent Tool Types
 */
export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

/**
 * Agent Response
 */
export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
  memoryUpdates?: MemoryUpdate[];
}

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result?: any;
}

export interface MemoryUpdate {
  type: 'core' | 'archival' | 'recall';
  operation: 'insert' | 'update' | 'delete';
  data: any;
}

/**
 * Entity Suggestion (from Agent)
 */
export interface EntitySuggestion {
  entityType: string;
  title: string;
  content: string;
  relationships?: Array<{ type: string; target: string }>;
  confidence: number; // 0.0-1.0
  context: string;
}

/**
 * Filing Suggestion
 */
export interface FilingSuggestion {
  targetFolder: string;
  reason: string;
  confidence: number;
  alternativeOptions?: string[];
}

/**
 * Learning Pattern
 */
export interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  lastUsed: string;
}
