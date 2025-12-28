/**
 * @sbf/ai-client - Interfaces
 * 
 * Core interfaces for LLM provider abstraction.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
  toolCalls?: ToolCall[];
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: FunctionCall;
}

export interface FunctionDefinition {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

export interface ToolDefinition {
  type: 'function';
  function: FunctionDefinition;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[];
  stream?: boolean;
  responseFormat?: {
    type: 'text' | 'json_object';
  };
  tools?: ToolDefinition[];
  toolChoice?: 'none' | 'auto' | 'required' | { type: 'function'; function: { name: string } };
}

export interface ChatCompletionResponse {
  id?: string;
  content: string;
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'function_call';
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Streaming chunk for chat completions
 */
export interface ChatCompletionChunk {
  id?: string;
  content?: string;
  finishReason?: string;
  toolCalls?: Partial<ToolCall>[];
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
  dimensions?: number;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model?: string;
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
}

/**
 * Provider information
 */
export interface ProviderInfo {
  name: string;
  displayName: string;
  supportsStreaming: boolean;
  supportsEmbedding: boolean;
  supportsTools: boolean;
  supportsJsonMode: boolean;
  isLocal: boolean;
  defaultModels: {
    chat?: string;
    embedding?: string;
  };
}

/**
 * Stream handler callback type
 */
export type StreamHandler = (chunk: ChatCompletionChunk) => void;

/**
 * LLM Provider interface - enhanced for Phase 01
 */
export interface LlmProvider {
  /**
   * Provider identification
   */
  readonly providerInfo: ProviderInfo;
  
  /**
   * Generate a chat completion
   */
  generate(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  
  /**
   * Generate a streaming chat completion
   */
  generateStream?(
    request: ChatCompletionRequest,
    onChunk: StreamHandler
  ): Promise<ChatCompletionResponse>;
  
  /**
   * Create embeddings for input text
   */
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  
  /**
   * Count tokens for a message list (optional)
   */
  countTokens?(messages: ChatMessage[]): Promise<number>;
  
  /**
   * Check if the provider is available/healthy
   */
  healthCheck?(): Promise<boolean>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  projectId?: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}
