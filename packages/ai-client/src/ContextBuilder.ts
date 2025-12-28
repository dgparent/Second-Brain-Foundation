/**
 * @sbf/ai-client - Context Builder
 * 
 * Priority-based context assembly with token budget management.
 */

import { estimateTokenCount, getContextWindow } from './TokenTracker';
import { ChatMessage } from './interfaces';

/**
 * Context priority levels
 */
export enum ContextPriority {
  /** Critical - always include (system prompts, user query) */
  CRITICAL = 0,
  
  /** High - include if space allows (recent context, direct references) */
  HIGH = 1,
  
  /** Medium - include when budget permits (related content) */
  MEDIUM = 2,
  
  /** Low - include only with excess budget (supplementary info) */
  LOW = 3,
}

/**
 * Context item to be assembled
 */
export interface ContextItem {
  /** Unique identifier */
  id: string;
  
  /** Content text */
  content: string;
  
  /** Priority level */
  priority: ContextPriority;
  
  /** Role in conversation (for message items) */
  role?: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  
  /** Estimated or actual token count (computed if not provided) */
  tokens?: number;
  
  /** Item type for filtering */
  type?: string;
  
  /** Relevance score (0-1) for ordering within priority */
  relevance?: number;
  
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Context builder configuration
 */
export interface ContextBuilderConfig {
  /** Model name for context window lookup */
  model: string;
  
  /** Maximum tokens for context (default: model's context window - 1000) */
  maxTokens?: number;
  
  /** Reserved tokens for output (default: 1000) */
  reserveForOutput?: number;
  
  /** Whether to include truncation marker when items are cut */
  includeTruncationMarker?: boolean;
  
  /** Custom truncation marker text */
  truncationMarker?: string;
}

/**
 * Built context result
 */
export interface BuiltContext {
  /** Assembled messages ready for API call */
  messages: ChatMessage[];
  
  /** Total tokens used */
  totalTokens: number;
  
  /** Remaining available tokens */
  remainingTokens: number;
  
  /** Items that were included */
  includedItems: ContextItem[];
  
  /** Items that were excluded due to budget */
  excludedItems: ContextItem[];
  
  /** Whether context was truncated */
  wasTruncated: boolean;
  
  /** Percentage of budget used */
  budgetUtilization: number;
}

/**
 * ContextBuilder class for assembling LLM context with priority and budget management
 */
export class ContextBuilder {
  private items: ContextItem[] = [];
  private config: Required<ContextBuilderConfig>;

  constructor(config: ContextBuilderConfig) {
    const contextWindow = getContextWindow(config.model);
    const reserveForOutput = config.reserveForOutput ?? 1000;
    
    this.config = {
      model: config.model,
      maxTokens: config.maxTokens ?? (contextWindow - reserveForOutput),
      reserveForOutput,
      includeTruncationMarker: config.includeTruncationMarker ?? true,
      truncationMarker: config.truncationMarker ?? '[... additional context truncated ...]',
    };
  }

  /**
   * Add a context item
   */
  add(item: ContextItem): this {
    // Compute tokens if not provided
    if (item.tokens === undefined) {
      item.tokens = estimateTokenCount(item.content);
    }
    
    this.items.push(item);
    return this;
  }

  /**
   * Add multiple context items
   */
  addAll(items: ContextItem[]): this {
    for (const item of items) {
      this.add(item);
    }
    return this;
  }

  /**
   * Add a system message
   */
  addSystemMessage(content: string, id?: string): this {
    return this.add({
      id: id || `system-${Date.now()}`,
      content,
      priority: ContextPriority.CRITICAL,
      role: 'system',
      type: 'system',
    });
  }

  /**
   * Add a user message
   */
  addUserMessage(content: string, id?: string): this {
    return this.add({
      id: id || `user-${Date.now()}`,
      content,
      priority: ContextPriority.CRITICAL,
      role: 'user',
      type: 'user',
    });
  }

  /**
   * Add an assistant message (history)
   */
  addAssistantMessage(content: string, id?: string, priority = ContextPriority.HIGH): this {
    return this.add({
      id: id || `assistant-${Date.now()}`,
      content,
      priority,
      role: 'assistant',
      type: 'assistant',
    });
  }

  /**
   * Add relevant documents/chunks
   */
  addDocument(
    content: string,
    relevance: number,
    id?: string,
    priority = ContextPriority.HIGH
  ): this {
    return this.add({
      id: id || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      priority,
      relevance,
      type: 'document',
    });
  }

  /**
   * Add conversation history
   */
  addHistory(messages: ChatMessage[], priority = ContextPriority.HIGH): this {
    // Add in reverse order so most recent has highest relevance
    const reversed = [...messages].reverse();
    reversed.forEach((msg, index) => {
      const relevance = 1 - (index / reversed.length);
      this.add({
        id: `history-${index}`,
        content: msg.content,
        priority,
        role: msg.role,
        relevance,
        type: 'history',
      });
    });
    return this;
  }

  /**
   * Clear all items
   */
  clear(): this {
    this.items = [];
    return this;
  }

  /**
   * Build the context, selecting items within budget
   */
  build(): BuiltContext {
    // Sort items by priority, then by relevance (higher first)
    const sorted = [...this.items].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority number = higher importance
      }
      // Within same priority, sort by relevance (higher first)
      return (b.relevance ?? 0) - (a.relevance ?? 0);
    });

    const includedItems: ContextItem[] = [];
    const excludedItems: ContextItem[] = [];
    let totalTokens = 0;

    // Select items within budget
    for (const item of sorted) {
      const itemTokens = item.tokens || estimateTokenCount(item.content);
      
      if (totalTokens + itemTokens <= this.config.maxTokens) {
        includedItems.push(item);
        totalTokens += itemTokens;
      } else if (item.priority === ContextPriority.CRITICAL) {
        // Critical items must be included, even if over budget
        includedItems.push(item);
        totalTokens += itemTokens;
      } else {
        excludedItems.push(item);
      }
    }

    // Build messages from included items
    const messages = this.buildMessages(includedItems, excludedItems.length > 0);

    return {
      messages,
      totalTokens,
      remainingTokens: Math.max(0, this.config.maxTokens - totalTokens),
      includedItems,
      excludedItems,
      wasTruncated: excludedItems.length > 0,
      budgetUtilization: (totalTokens / this.config.maxTokens) * 100,
    };
  }

  /**
   * Build ChatMessage array from items
   */
  private buildMessages(items: ContextItem[], wasTruncated: boolean): ChatMessage[] {
    const messages: ChatMessage[] = [];
    
    // Group items by type for better organization
    const systemItems = items.filter(i => i.type === 'system');
    const documentItems = items.filter(i => i.type === 'document');
    const historyItems = items.filter(i => i.type === 'history');
    const userItems = items.filter(i => i.type === 'user');
    const otherItems = items.filter(i => 
      !['system', 'document', 'history', 'user'].includes(i.type || '')
    );

    // Add system messages first
    for (const item of systemItems) {
      messages.push({
        role: 'system',
        content: item.content,
      });
    }

    // Add relevant documents as system context
    if (documentItems.length > 0) {
      const docsContent = documentItems
        .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
        .map(d => d.content)
        .join('\n\n---\n\n');
      
      messages.push({
        role: 'system',
        content: `Relevant context:\n\n${docsContent}${
          wasTruncated && this.config.includeTruncationMarker 
            ? `\n\n${this.config.truncationMarker}` 
            : ''
        }`,
      });
    }

    // Add conversation history (re-sorted by original order via relevance)
    const sortedHistory = historyItems.sort((a, b) => 
      (a.relevance ?? 0) - (b.relevance ?? 0)
    );
    for (const item of sortedHistory) {
      if (item.role) {
        messages.push({
          role: item.role,
          content: item.content,
        });
      }
    }

    // Add other items as user context
    for (const item of otherItems) {
      messages.push({
        role: item.role || 'user',
        content: item.content,
      });
    }

    // Add user messages last
    for (const item of userItems) {
      messages.push({
        role: 'user',
        content: item.content,
      });
    }

    return messages;
  }

  /**
   * Estimate total tokens for current items
   */
  estimateTotalTokens(): number {
    return this.items.reduce((sum, item) => 
      sum + (item.tokens || estimateTokenCount(item.content)), 
      0
    );
  }

  /**
   * Check if current items fit within budget
   */
  fitsWithinBudget(): boolean {
    return this.estimateTotalTokens() <= this.config.maxTokens;
  }

  /**
   * Get remaining budget in tokens
   */
  getRemainingBudget(): number {
    return Math.max(0, this.config.maxTokens - this.estimateTotalTokens());
  }

  /**
   * Get items by priority
   */
  getItemsByPriority(priority: ContextPriority): ContextItem[] {
    return this.items.filter(i => i.priority === priority);
  }

  /**
   * Remove items by type
   */
  removeByType(type: string): this {
    this.items = this.items.filter(i => i.type !== type);
    return this;
  }

  /**
   * Remove items by ID
   */
  removeById(id: string): this {
    this.items = this.items.filter(i => i.id !== id);
    return this;
  }

  /**
   * Create a copy of this builder
   */
  clone(): ContextBuilder {
    const clone = new ContextBuilder(this.config);
    clone.items = [...this.items];
    return clone;
  }
}

/**
 * Helper function to create a context builder with common defaults
 */
export function createContextBuilder(
  model: string,
  options?: Partial<ContextBuilderConfig>
): ContextBuilder {
  return new ContextBuilder({
    model,
    ...options,
  });
}
