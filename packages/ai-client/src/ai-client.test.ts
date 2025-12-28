/**
 * @sbf/ai-client - Token Tracker & Context Builder Tests
 */

import {
  TokenTracker,
  InMemoryUsageStorage,
  estimateTokenCount,
  calculateCost,
  getContextWindow,
} from './TokenTracker';
import {
  ContextBuilder,
  ContextPriority,
  createContextBuilder,
} from './ContextBuilder';

describe('TokenTracker Module', () => {
  describe('estimateTokenCount', () => {
    it('should estimate tokens for short text', () => {
      const text = 'Hello, world!';
      const tokens = estimateTokenCount(text);
      // ~3-4 tokens for this text
      expect(tokens).toBeGreaterThan(2);
      expect(tokens).toBeLessThan(10);
    });

    it('should estimate tokens for longer text', () => {
      const text = 'The quick brown fox jumps over the lazy dog. This is a sample sentence with multiple words.';
      const tokens = estimateTokenCount(text);
      // ~20-25 tokens
      expect(tokens).toBeGreaterThan(15);
      expect(tokens).toBeLessThan(35);
    });

    it('should handle empty string', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('should handle code snippets', () => {
      const code = `
        function hello() {
          console.log("Hello, world!");
          return true;
        }
      `;
      const tokens = estimateTokenCount(code);
      expect(tokens).toBeGreaterThan(10);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for GPT-4', () => {
      const cost = calculateCost('gpt-4', 1000, 500);
      // GPT-4: $0.03/1K input + $0.06/1K output
      // 1000 * 0.03/1000 + 500 * 0.06/1000 = 0.03 + 0.03 = 0.06
      expect(cost).toBeCloseTo(0.06, 4);
    });

    it('should calculate cost for GPT-3.5-turbo', () => {
      const cost = calculateCost('gpt-3.5-turbo', 1000, 500);
      // GPT-3.5: $0.0005/1K input + $0.0015/1K output
      // 1000 * 0.0005/1000 + 500 * 0.0015/1000 = 0.0005 + 0.00075 = 0.00125
      expect(cost).toBeCloseTo(0.00125, 6);
    });

    it('should return 0 for unknown models', () => {
      const cost = calculateCost('unknown-model', 1000, 500);
      expect(cost).toBe(0);
    });

    it('should calculate cost for embedding models', () => {
      const cost = calculateCost('text-embedding-3-small', 1000, 0);
      // $0.00002/1K tokens = 1000 * 0.00002/1000 = 0.00002
      expect(cost).toBeCloseTo(0.00002, 8);
    });
  });

  describe('getContextWindow', () => {
    it('should return context window for GPT-4', () => {
      expect(getContextWindow('gpt-4')).toBe(8192);
    });

    it('should return context window for GPT-4-turbo', () => {
      expect(getContextWindow('gpt-4-turbo')).toBe(128000);
    });

    it('should return context window for Claude-3', () => {
      expect(getContextWindow('claude-3-opus')).toBe(200000);
    });

    it('should return default for unknown models', () => {
      expect(getContextWindow('unknown-model')).toBe(4096);
    });
  });

  describe('InMemoryUsageStorage', () => {
    let storage: InMemoryUsageStorage;

    beforeEach(() => {
      storage = new InMemoryUsageStorage();
    });

    it('should store and retrieve usage', async () => {
      await storage.save({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        estimatedCost: 0.005,
        timestamp: new Date().toISOString(),
      });
      
      const now = new Date();
      const start = new Date(now.getTime() - 60000).toISOString();
      const end = new Date(now.getTime() + 60000).toISOString();
      
      const records = await storage.getByPeriod(start, end);
      expect(records).toHaveLength(1);
      expect(records[0].model).toBe('gpt-4');
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      await storage.save({ 
        model: 'gpt-4', 
        inputTokens: 100, 
        outputTokens: 50, 
        totalTokens: 150,
        estimatedCost: 0.005,
        timestamp: now.toISOString() 
      });
      await storage.save({ 
        model: 'gpt-4', 
        inputTokens: 200, 
        outputTokens: 100,
        totalTokens: 300,
        estimatedCost: 0.01,
        timestamp: yesterday.toISOString() 
      });
      await storage.save({ 
        model: 'gpt-4', 
        inputTokens: 300, 
        outputTokens: 150,
        totalTokens: 450,
        estimatedCost: 0.015,
        timestamp: twoDaysAgo.toISOString() 
      });

      const filtered = await storage.getByPeriod(
        yesterday.toISOString(), 
        new Date(now.getTime() + 1000).toISOString()
      );
      expect(filtered.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear all usage', async () => {
      await storage.save({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        estimatedCost: 0.005,
        timestamp: new Date().toISOString(),
      });
      
      storage.clear();
      
      const now = new Date();
      const records = await storage.getByPeriod(
        new Date(now.getTime() - 60000).toISOString(),
        new Date(now.getTime() + 60000).toISOString()
      );
      expect(records).toHaveLength(0);
    });

    it('should calculate stats correctly', async () => {
      const now = new Date();
      await storage.save({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        estimatedCost: 0.005,
        timestamp: now.toISOString(),
      });
      await storage.save({
        model: 'gpt-3.5-turbo',
        inputTokens: 200,
        outputTokens: 100,
        totalTokens: 300,
        estimatedCost: 0.001,
        timestamp: now.toISOString(),
      });

      const stats = await storage.getStats(
        new Date(now.getTime() - 60000).toISOString(),
        new Date(now.getTime() + 60000).toISOString()
      );

      expect(stats.totalInputTokens).toBe(300);
      expect(stats.totalOutputTokens).toBe(150);
      expect(stats.totalTokens).toBe(450);
      expect(stats.callCount).toBe(2);
      expect(Object.keys(stats.byModel)).toHaveLength(2);
    });
  });

  describe('TokenTracker', () => {
    let tracker: TokenTracker;
    let storage: InMemoryUsageStorage;

    beforeEach(() => {
      storage = new InMemoryUsageStorage();
      tracker = new TokenTracker({ storage });
    });

    it('should record usage', async () => {
      const usage = await tracker.record('gpt-4', 1000, 500);

      expect(usage.inputTokens).toBe(1000);
      expect(usage.outputTokens).toBe(500);
      expect(usage.totalTokens).toBe(1500);
      expect(usage.estimatedCost).toBeGreaterThan(0);
      expect(usage.model).toBe('gpt-4');
    });

    it('should estimate tokens for text', () => {
      const tokens = tracker.estimateTokens('Hello, world!');
      expect(tokens).toBeGreaterThan(0);
    });

    it('should estimate cost for text', () => {
      const cost = tracker.estimateCost('gpt-4', 'Hello, world!', 10);
      expect(cost).toBeGreaterThan(0);
    });

    it('should check if content fits in context', () => {
      const shortText = 'Hello!';
      const longText = 'x'.repeat(100000); // Very long text

      expect(tracker.fitsInContext('gpt-4', shortText)).toBe(true);
      expect(tracker.fitsInContext('gpt-4', longText)).toBe(false);
    });

    it('should track budget', async () => {
      await tracker.record('gpt-4', 10000, 5000);

      const remaining = await tracker.getRemainingBudget(1.0, 'day');
      expect(remaining.spent).toBeGreaterThan(0);
      expect(remaining.remaining).toBeLessThan(1.0);
      expect(remaining.percentUsed).toBeGreaterThan(0);
    });

    it('should get today stats', async () => {
      await tracker.record('gpt-4', 100, 50);
      await tracker.record('gpt-3.5-turbo', 200, 100);

      const stats = await tracker.getTodayStats();
      expect(stats.totalInputTokens).toBe(300);
      expect(stats.callCount).toBe(2);
    });
  });
});

describe('ContextBuilder Module', () => {
  describe('ContextBuilder', () => {
    let builder: ContextBuilder;

    beforeEach(() => {
      builder = createContextBuilder('gpt-4');
    });

    it('should add items and build context', () => {
      builder
        .addSystemMessage('You are a helpful assistant.')
        .addUserMessage('What is TypeScript?');

      const result = builder.build();
      
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[1].role).toBe('user');
      expect(result.wasTruncated).toBe(false);
    });

    it('should prioritize items correctly', () => {
      builder
        .add({
          id: 'low',
          content: 'Low priority content',
          priority: ContextPriority.LOW,
        })
        .add({
          id: 'critical',
          content: 'Critical content',
          priority: ContextPriority.CRITICAL,
          role: 'system',
        })
        .add({
          id: 'high',
          content: 'High priority content',
          priority: ContextPriority.HIGH,
        });

      const result = builder.build();
      
      // All should be included in small context
      expect(result.includedItems.length).toBe(3);
      // Critical should be processed first
      expect(result.includedItems[0].id).toBe('critical');
    });

    it('should respect token budget', () => {
      // Create builder with very small budget
      const smallBuilder = new ContextBuilder({
        model: 'gpt-4',
        maxTokens: 50,
      });

      smallBuilder
        .add({
          id: 'item1',
          content: 'Short text',
          priority: ContextPriority.CRITICAL,
          role: 'system',
        })
        .add({
          id: 'item2',
          content: 'x'.repeat(500), // Very long content
          priority: ContextPriority.LOW,
        });

      const result = smallBuilder.build();
      
      // Critical should be included, low priority should be excluded
      expect(result.includedItems.some(i => i.id === 'item1')).toBe(true);
      expect(result.excludedItems.some(i => i.id === 'item2')).toBe(true);
      expect(result.wasTruncated).toBe(true);
    });

    it('should order by relevance within priority', () => {
      builder
        .add({
          id: 'low-relevance',
          content: 'Less relevant',
          priority: ContextPriority.HIGH,
          relevance: 0.3,
        })
        .add({
          id: 'high-relevance',
          content: 'More relevant',
          priority: ContextPriority.HIGH,
          relevance: 0.9,
        });

      const result = builder.build();
      
      // Higher relevance should come first
      const highPriorityItems = result.includedItems.filter(
        i => i.priority === ContextPriority.HIGH
      );
      expect(highPriorityItems[0].id).toBe('high-relevance');
    });

    it('should add documents with relevance', () => {
      builder
        .addDocument('Document A content', 0.9, 'doc-a')
        .addDocument('Document B content', 0.5, 'doc-b');

      const result = builder.build();
      
      expect(result.includedItems).toHaveLength(2);
      expect(result.includedItems.every(i => i.type === 'document')).toBe(true);
    });

    it('should add conversation history', () => {
      const history = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there!' },
        { role: 'user' as const, content: 'How are you?' },
      ];

      builder.addHistory(history);

      const result = builder.build();
      
      expect(result.includedItems).toHaveLength(3);
      expect(result.includedItems.every(i => i.type === 'history')).toBe(true);
    });

    it('should estimate total tokens', () => {
      builder
        .addSystemMessage('You are helpful.')
        .addUserMessage('Hello!');

      const tokens = builder.estimateTotalTokens();
      expect(tokens).toBeGreaterThan(0);
    });

    it('should check if content fits within budget', () => {
      builder.addSystemMessage('Short message');
      expect(builder.fitsWithinBudget()).toBe(true);
    });

    it('should get remaining budget', () => {
      const initialBudget = builder.getRemainingBudget();
      
      builder.addSystemMessage('Some content');
      
      const afterBudget = builder.getRemainingBudget();
      expect(afterBudget).toBeLessThan(initialBudget);
    });

    it('should get items by priority', () => {
      builder
        .add({ id: 'c1', content: 'Critical', priority: ContextPriority.CRITICAL })
        .add({ id: 'h1', content: 'High', priority: ContextPriority.HIGH })
        .add({ id: 'c2', content: 'Critical 2', priority: ContextPriority.CRITICAL });

      const critical = builder.getItemsByPriority(ContextPriority.CRITICAL);
      expect(critical).toHaveLength(2);
    });

    it('should remove items by type', () => {
      builder
        .addSystemMessage('System')
        .addUserMessage('User')
        .addDocument('Doc', 0.5);

      builder.removeByType('document');
      
      const result = builder.build();
      expect(result.includedItems.some(i => i.type === 'document')).toBe(false);
    });

    it('should remove items by ID', () => {
      builder
        .add({ id: 'keep', content: 'Keep this', priority: ContextPriority.HIGH })
        .add({ id: 'remove', content: 'Remove this', priority: ContextPriority.HIGH });

      builder.removeById('remove');
      
      const result = builder.build();
      expect(result.includedItems.some(i => i.id === 'remove')).toBe(false);
      expect(result.includedItems.some(i => i.id === 'keep')).toBe(true);
    });

    it('should clear all items', () => {
      builder
        .addSystemMessage('System')
        .addUserMessage('User');

      builder.clear();
      
      const result = builder.build();
      expect(result.includedItems).toHaveLength(0);
    });

    it('should clone builder', () => {
      builder.addSystemMessage('Original');
      
      const clone = builder.clone();
      clone.addUserMessage('Added to clone');
      
      const originalResult = builder.build();
      const cloneResult = clone.build();
      
      expect(originalResult.includedItems).toHaveLength(1);
      expect(cloneResult.includedItems).toHaveLength(2);
    });

    it('should calculate budget utilization', () => {
      builder.addSystemMessage('Small content');
      
      const result = builder.build();
      
      expect(result.budgetUtilization).toBeGreaterThan(0);
      expect(result.budgetUtilization).toBeLessThan(100);
    });

    it('should always include critical items even over budget', () => {
      // Create builder with very small budget
      const tinyBuilder = new ContextBuilder({
        model: 'gpt-4',
        maxTokens: 5, // Tiny budget
      });

      tinyBuilder.add({
        id: 'critical',
        content: 'This is a longer critical message that exceeds the budget',
        priority: ContextPriority.CRITICAL,
        role: 'system',
      });

      const result = tinyBuilder.build();
      
      // Critical items should always be included
      expect(result.includedItems).toHaveLength(1);
      expect(result.includedItems[0].id).toBe('critical');
    });
  });

  describe('createContextBuilder', () => {
    it('should create builder with default options', () => {
      const builder = createContextBuilder('gpt-4');
      expect(builder).toBeInstanceOf(ContextBuilder);
    });

    it('should create builder with custom options', () => {
      const builder = createContextBuilder('gpt-4', {
        maxTokens: 4000,
        reserveForOutput: 500,
      });
      
      expect(builder.getRemainingBudget()).toBe(4000);
    });
  });
});
