# @sbf/ai-client

AI/LLM client library with token tracking and context management for the SBF platform.

## Features

- **Multi-Provider Support**: OpenAI, Ollama (Anthropic coming soon)
- **Token Tracking**: Monitor token usage across requests
- **Cost Calculation**: Track API costs in real-time
- **Context Building**: Priority-based context assembly with budget management
- **Usage Statistics**: Daily, monthly, and custom period stats

## Installation

```bash
pnpm add @sbf/ai-client
```

## Usage

### Basic LLM Client

```typescript
import { AiClientFactory } from '@sbf/ai-client';

// Create OpenAI client
const openai = AiClientFactory.create({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate text
const response = await openai.generate({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain TypeScript in one paragraph.' },
  ],
});

console.log(response.content);
console.log(`Tokens used: ${response.usage?.totalTokens}`);
```

### Token Tracking

```typescript
import { TokenTracker, estimateTokenCount, calculateCost } from '@sbf/ai-client';

// Estimate tokens before sending
const prompt = 'Your long prompt here...';
const tokens = estimateTokenCount(prompt);
console.log(`Estimated tokens: ${tokens}`);

// Calculate cost
const cost = calculateCost('gpt-4', 1000, 500);
console.log(`Estimated cost: $${cost.toFixed(4)}`);

// Track usage with TokenTracker
const tracker = new TokenTracker();

// Record usage from API response
await tracker.record('gpt-4', 1000, 500, { operation: 'chat' });

// Get statistics
const todayStats = await tracker.getTodayStats();
console.log(`Today's cost: $${todayStats.totalCost.toFixed(4)}`);

// Check remaining budget
const budget = await tracker.getRemainingBudget(10.0, 'day');
console.log(`Remaining: $${budget.remaining.toFixed(2)}`);
```

### Context Building

```typescript
import { ContextBuilder, ContextPriority, createContextBuilder } from '@sbf/ai-client';

// Create context builder for a specific model
const builder = createContextBuilder('gpt-4', {
  maxTokens: 6000,       // Max context tokens
  reserveForOutput: 1000, // Reserve for response
});

// Add system prompt (critical priority)
builder.addSystemMessage('You are a helpful coding assistant.');

// Add relevant documents with priority
builder.addDocument('TypeScript documentation...', 0.9, 'ts-docs');
builder.addDocument('React best practices...', 0.7, 'react-docs');

// Add conversation history
builder.addHistory([
  { role: 'user', content: 'How do I use hooks?' },
  { role: 'assistant', content: 'React hooks are...' },
]);

// Add current user query
builder.addUserMessage('Now explain useEffect');

// Build context (handles budget automatically)
const result = builder.build();

console.log(`Tokens used: ${result.totalTokens}`);
console.log(`Items included: ${result.includedItems.length}`);
console.log(`Items excluded: ${result.excludedItems.length}`);
console.log(`Budget utilization: ${result.budgetUtilization.toFixed(1)}%`);

// Use result.messages for API call
const response = await openai.generate({
  model: 'gpt-4',
  messages: result.messages,
});
```

### Context Priority Levels

```typescript
import { ContextPriority } from '@sbf/ai-client';

// Priority levels (lower number = higher priority)
ContextPriority.CRITICAL  // 0 - Always include (system prompts, user query)
ContextPriority.HIGH      // 1 - Include if space allows (recent context)
ContextPriority.MEDIUM    // 2 - Include when budget permits (related content)
ContextPriority.LOW       // 3 - Include only with excess budget
```

### Using with Local Models (Ollama)

```typescript
import { AiClientFactory } from '@sbf/ai-client';

const ollama = AiClientFactory.create({
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
});

const response = await ollama.generate({
  model: 'llama2',
  messages: [
    { role: 'user', content: 'Hello!' },
  ],
});

// Local models have zero cost
const cost = calculateCost('ollama', 1000, 500); // Returns 0
```

## Supported Models

### OpenAI
- `gpt-4-turbo` (128K context, $0.01/$0.03 per 1K tokens)
- `gpt-4` (8K context, $0.03/$0.06 per 1K tokens)
- `gpt-4-32k` (32K context, $0.06/$0.12 per 1K tokens)
- `gpt-4o` (128K context, $0.005/$0.015 per 1K tokens)
- `gpt-4o-mini` (128K context, $0.00015/$0.0006 per 1K tokens)
- `gpt-3.5-turbo` (16K context, $0.0005/$0.0015 per 1K tokens)

### Anthropic
- `claude-3-opus` (200K context, $0.015/$0.075 per 1K tokens)
- `claude-3-sonnet` (200K context, $0.003/$0.015 per 1K tokens)
- `claude-3-haiku` (200K context, $0.00025/$0.00125 per 1K tokens)
- `claude-3.5-sonnet` (200K context, $0.003/$0.015 per 1K tokens)

### Embeddings
- `text-embedding-3-small` ($0.00002 per 1K tokens)
- `text-embedding-3-large` ($0.00013 per 1K tokens)
- `text-embedding-ada-002` ($0.0001 per 1K tokens)

### Local (Free)
- `ollama` (8K default context)
- `llama2` (4K context)
- `mistral` (8K context)
- `codellama` (16K context)

## API Reference

### TokenTracker

```typescript
class TokenTracker {
  constructor(options?: { storage?: UsageStorage; tenantId?: string });
  
  record(model: string, inputTokens: number, outputTokens: number, options?: { operation?: string; tenantId?: string }): Promise<TokenUsage>;
  estimateTokens(text: string): number;
  estimateCost(model: string, inputText: string, estimatedOutputTokens?: number): number;
  fitsInContext(model: string, text: string, reserveForOutput?: number): boolean;
  getStats(start: string, end: string): Promise<UsageStats>;
  getTodayStats(): Promise<UsageStats>;
  getMonthStats(): Promise<UsageStats>;
  getRemainingBudget(budgetUSD: number, period?: 'day' | 'month'): Promise<{ spent: number; remaining: number; percentUsed: number }>;
}
```

### ContextBuilder

```typescript
class ContextBuilder {
  constructor(config: ContextBuilderConfig);
  
  add(item: ContextItem): this;
  addAll(items: ContextItem[]): this;
  addSystemMessage(content: string, id?: string): this;
  addUserMessage(content: string, id?: string): this;
  addAssistantMessage(content: string, id?: string, priority?: ContextPriority): this;
  addDocument(content: string, relevance: number, id?: string, priority?: ContextPriority): this;
  addHistory(messages: ChatMessage[], priority?: ContextPriority): this;
  
  build(): BuiltContext;
  
  estimateTotalTokens(): number;
  fitsWithinBudget(): boolean;
  getRemainingBudget(): number;
  getItemsByPriority(priority: ContextPriority): ContextItem[];
  
  removeByType(type: string): this;
  removeById(id: string): this;
  clear(): this;
  clone(): ContextBuilder;
}
```

## Testing

```bash
pnpm test
```

## License

MIT
