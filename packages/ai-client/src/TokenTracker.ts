/**
 * @sbf/ai-client - Token Tracker
 * 
 * Token counting, cost calculation, and usage tracking.
 */

/**
 * Model pricing information
 */
export interface ModelPricing {
  /** Price per 1K input tokens */
  inputPer1K: number;
  
  /** Price per 1K output tokens */
  outputPer1K: number;
  
  /** Max context window size */
  contextWindow: number;
  
  /** Model family for tiktoken encoding */
  encoding?: 'cl100k_base' | 'p50k_base' | 'r50k_base' | 'gpt2';
}

/**
 * Known model pricing (USD)
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI models
  'gpt-4-turbo': { inputPer1K: 0.01, outputPer1K: 0.03, contextWindow: 128000, encoding: 'cl100k_base' },
  'gpt-4-turbo-preview': { inputPer1K: 0.01, outputPer1K: 0.03, contextWindow: 128000, encoding: 'cl100k_base' },
  'gpt-4': { inputPer1K: 0.03, outputPer1K: 0.06, contextWindow: 8192, encoding: 'cl100k_base' },
  'gpt-4-32k': { inputPer1K: 0.06, outputPer1K: 0.12, contextWindow: 32768, encoding: 'cl100k_base' },
  'gpt-3.5-turbo': { inputPer1K: 0.0005, outputPer1K: 0.0015, contextWindow: 16385, encoding: 'cl100k_base' },
  'gpt-3.5-turbo-16k': { inputPer1K: 0.003, outputPer1K: 0.004, contextWindow: 16385, encoding: 'cl100k_base' },
  'gpt-4o': { inputPer1K: 0.005, outputPer1K: 0.015, contextWindow: 128000, encoding: 'cl100k_base' },
  'gpt-4o-mini': { inputPer1K: 0.00015, outputPer1K: 0.0006, contextWindow: 128000, encoding: 'cl100k_base' },
  
  // Anthropic models
  'claude-3-opus': { inputPer1K: 0.015, outputPer1K: 0.075, contextWindow: 200000 },
  'claude-3-sonnet': { inputPer1K: 0.003, outputPer1K: 0.015, contextWindow: 200000 },
  'claude-3-haiku': { inputPer1K: 0.00025, outputPer1K: 0.00125, contextWindow: 200000 },
  'claude-3.5-sonnet': { inputPer1K: 0.003, outputPer1K: 0.015, contextWindow: 200000 },
  
  // Embedding models
  'text-embedding-3-small': { inputPer1K: 0.00002, outputPer1K: 0, contextWindow: 8191, encoding: 'cl100k_base' },
  'text-embedding-3-large': { inputPer1K: 0.00013, outputPer1K: 0, contextWindow: 8191, encoding: 'cl100k_base' },
  'text-embedding-ada-002': { inputPer1K: 0.0001, outputPer1K: 0, contextWindow: 8191, encoding: 'cl100k_base' },
  
  // Local/Free models (zero cost)
  'ollama': { inputPer1K: 0, outputPer1K: 0, contextWindow: 8192 },
  'llama2': { inputPer1K: 0, outputPer1K: 0, contextWindow: 4096 },
  'mistral': { inputPer1K: 0, outputPer1K: 0, contextWindow: 8192 },
  'codellama': { inputPer1K: 0, outputPer1K: 0, contextWindow: 16384 },
};

/**
 * Token usage record
 */
export interface TokenUsage {
  /** Model used */
  model: string;
  
  /** Input tokens */
  inputTokens: number;
  
  /** Output tokens */
  outputTokens: number;
  
  /** Total tokens */
  totalTokens: number;
  
  /** Estimated cost in USD */
  estimatedCost: number;
  
  /** Timestamp */
  timestamp: string;
  
  /** Optional operation identifier */
  operation?: string;
  
  /** Optional tenant ID */
  tenantId?: string;
}

/**
 * Aggregated usage statistics
 */
export interface UsageStats {
  /** Total input tokens */
  totalInputTokens: number;
  
  /** Total output tokens */
  totalOutputTokens: number;
  
  /** Total tokens */
  totalTokens: number;
  
  /** Total estimated cost */
  totalCost: number;
  
  /** Number of API calls */
  callCount: number;
  
  /** Usage by model */
  byModel: Record<string, {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    calls: number;
  }>;
  
  /** Period start */
  periodStart: string;
  
  /** Period end */
  periodEnd: string;
}

/**
 * Approximate token count using character estimation
 * More accurate estimation than simple character division
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Average token is ~4 characters in English
  // But this varies by content type
  const charCount = text.length;
  
  // Count whitespace-separated words
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  // Heuristic: average of char/4 and words*1.3
  // This works reasonably well for mixed content
  const charEstimate = Math.ceil(charCount / 4);
  const wordEstimate = Math.ceil(wordCount * 1.3);
  
  return Math.ceil((charEstimate + wordEstimate) / 2);
}

/**
 * Calculate cost for token usage
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING[model.split(':')[0]];
  
  if (!pricing) {
    // Unknown model, return 0
    return 0;
  }
  
  const inputCost = (inputTokens / 1000) * pricing.inputPer1K;
  const outputCost = (outputTokens / 1000) * pricing.outputPer1K;
  
  return inputCost + outputCost;
}

/**
 * Get model context window size
 */
export function getContextWindow(model: string): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING[model.split(':')[0]];
  return pricing?.contextWindow || 4096;
}

/**
 * Storage interface for persisting usage data
 */
export interface UsageStorage {
  save(usage: TokenUsage): Promise<void>;
  getByPeriod(start: string, end: string, tenantId?: string): Promise<TokenUsage[]>;
  getStats(start: string, end: string, tenantId?: string): Promise<UsageStats>;
}

/**
 * In-memory usage storage for testing/development
 */
export class InMemoryUsageStorage implements UsageStorage {
  private records: TokenUsage[] = [];

  async save(usage: TokenUsage): Promise<void> {
    this.records.push(usage);
  }

  async getByPeriod(start: string, end: string, tenantId?: string): Promise<TokenUsage[]> {
    return this.records.filter(r => {
      const inRange = r.timestamp >= start && r.timestamp <= end;
      const matchesTenant = !tenantId || r.tenantId === tenantId;
      return inRange && matchesTenant;
    });
  }

  async getStats(start: string, end: string, tenantId?: string): Promise<UsageStats> {
    const records = await this.getByPeriod(start, end, tenantId);
    
    const byModel: UsageStats['byModel'] = {};
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    for (const record of records) {
      totalInputTokens += record.inputTokens;
      totalOutputTokens += record.outputTokens;
      totalCost += record.estimatedCost;

      if (!byModel[record.model]) {
        byModel[record.model] = {
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
          calls: 0,
        };
      }
      byModel[record.model].inputTokens += record.inputTokens;
      byModel[record.model].outputTokens += record.outputTokens;
      byModel[record.model].cost += record.estimatedCost;
      byModel[record.model].calls += 1;
    }

    return {
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCost,
      callCount: records.length,
      byModel,
      periodStart: start,
      periodEnd: end,
    };
  }

  clear(): void {
    this.records = [];
  }
}

/**
 * TokenTracker class for tracking token usage and costs
 */
export class TokenTracker {
  private storage: UsageStorage;
  private tenantId?: string;

  constructor(options: { storage?: UsageStorage; tenantId?: string } = {}) {
    this.storage = options.storage || new InMemoryUsageStorage();
    this.tenantId = options.tenantId;
  }

  /**
   * Record token usage from an API response
   */
  async record(
    model: string,
    inputTokens: number,
    outputTokens: number,
    options?: { operation?: string; tenantId?: string }
  ): Promise<TokenUsage> {
    const usage: TokenUsage = {
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCost: calculateCost(model, inputTokens, outputTokens),
      timestamp: new Date().toISOString(),
      operation: options?.operation,
      tenantId: options?.tenantId || this.tenantId,
    };

    await this.storage.save(usage);
    return usage;
  }

  /**
   * Estimate tokens for text before sending
   */
  estimateTokens(text: string): number {
    return estimateTokenCount(text);
  }

  /**
   * Calculate estimated cost for text
   */
  estimateCost(model: string, inputText: string, estimatedOutputTokens = 0): number {
    const inputTokens = estimateTokenCount(inputText);
    return calculateCost(model, inputTokens, estimatedOutputTokens);
  }

  /**
   * Check if text fits within model context window
   */
  fitsInContext(model: string, text: string, reserveForOutput = 1000): boolean {
    const tokens = estimateTokenCount(text);
    const contextWindow = getContextWindow(model);
    return tokens + reserveForOutput <= contextWindow;
  }

  /**
   * Get usage statistics for a time period
   */
  async getStats(start: string, end: string): Promise<UsageStats> {
    return this.storage.getStats(start, end, this.tenantId);
  }

  /**
   * Get today's usage statistics
   */
  async getTodayStats(): Promise<UsageStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today.toISOString();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const end = tomorrow.toISOString();
    
    return this.getStats(start, end);
  }

  /**
   * Get this month's usage statistics
   */
  async getMonthStats(): Promise<UsageStats> {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    return this.getStats(start, end);
  }

  /**
   * Get remaining tokens within budget
   */
  async getRemainingBudget(budgetUSD: number, period: 'day' | 'month' = 'month'): Promise<{
    spent: number;
    remaining: number;
    percentUsed: number;
  }> {
    const stats = period === 'day' 
      ? await this.getTodayStats()
      : await this.getMonthStats();
    
    const remaining = Math.max(0, budgetUSD - stats.totalCost);
    
    return {
      spent: stats.totalCost,
      remaining,
      percentUsed: budgetUSD > 0 ? (stats.totalCost / budgetUSD) * 100 : 0,
    };
  }
}
