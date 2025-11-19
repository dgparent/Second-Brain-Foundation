/**
 * SBFAgent Multi-Provider Usage Examples
 * 
 * Demonstrates how to create agents with different LLM providers:
 * - OpenAI (GPT-4)
 * - Anthropic (Claude)
 * - Ollama (Local LLMs)
 */

import { SBFAgent } from './sbf-agent';
import { EntityFileManager } from '../entities/entity-file-manager';
import { Vault } from '../filesystem/vault';

// ============================================================================
// Example 1: OpenAI Agent (Default)
// ============================================================================

async function createOpenAIAgent() {
  const agent = await SBFAgent.create({
    userId: 'user-001',
    vaultPath: '/path/to/vault',
    llmProvider: 'openai', // or omit for default
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    openaiApiKey: process.env.OPENAI_API_KEY,
    entityManager: new EntityFileManager(new Vault('/path/to/vault')),
  });

  console.log('Created OpenAI agent:', agent.getLLMInfo());
  
  // Use the agent
  const response = await agent.step([
    {
      role: 'user',
      content: 'Create a topic about machine learning',
    }
  ]);

  console.log('Agent response:', response.messages[0].content);
  return agent;
}

// ============================================================================
// Example 2: Anthropic Agent (Claude)
// ============================================================================

async function createAnthropicAgent() {
  const agent = await SBFAgent.create({
    userId: 'user-002',
    vaultPath: '/path/to/vault',
    llmProvider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022', // or claude-3-opus-20240229
    temperature: 0.7,
    maxTokens: 4096,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    entityManager: new EntityFileManager(new Vault('/path/to/vault')),
  });

  console.log('Created Anthropic agent:', agent.getLLMInfo());
  
  // Claude excels at reasoning tasks
  const response = await agent.step([
    {
      role: 'user',
      content: 'Analyze the relationships between these entities and suggest connections',
    }
  ]);

  console.log('Claude response:', response.messages[0].content);
  return agent;
}

// ============================================================================
// Example 3: Ollama Agent (Local/Privacy-First)
// ============================================================================

async function createOllamaAgent() {
  const agent = await SBFAgent.create({
    userId: 'user-003',
    vaultPath: '/path/to/vault',
    llmProvider: 'ollama',
    model: 'llama3.2', // or mistral, mixtral, phi, etc.
    temperature: 0.7,
    ollamaBaseUrl: 'http://localhost:11434', // default Ollama server
    entityManager: new EntityFileManager(new Vault('/path/to/vault')),
  });

  console.log('Created Ollama agent:', agent.getLLMInfo());
  
  // 100% local, privacy-first agent
  const response = await agent.step([
    {
      role: 'user',
      content: 'Search for entities related to "AI"',
    }
  ]);

  console.log('Ollama response:', response.messages[0].content);
  return agent;
}

// ============================================================================
// Example 4: Switching Providers for Different Tasks
// ============================================================================

async function multiProviderWorkflow() {
  // Use GPT-4 for complex reasoning
  const gptAgent = await SBFAgent.create({
    userId: 'user-004',
    vaultPath: '/path/to/vault',
    llmProvider: 'openai',
    model: 'gpt-4-turbo-preview',
    openaiApiKey: process.env.OPENAI_API_KEY,
  });

  // Use Ollama for simple entity operations (privacy + cost)
  const localAgent = await SBFAgent.create({
    userId: 'user-004',
    vaultPath: '/path/to/vault',
    llmProvider: 'ollama',
    model: 'llama3.2',
  });

  // Complex task: Use GPT-4
  console.log('Using GPT-4 for analysis...');
  const analysis = await gptAgent.step([
    {
      role: 'user',
      content: 'Analyze the semantic connections in my knowledge graph',
    }
  ]);

  // Simple task: Use Ollama
  console.log('Using Llama for entity creation...');
  const creation = await localAgent.step([
    {
      role: 'user',
      content: 'Create a topic about TypeScript',
    }
  ]);

  return { analysis, creation };
}

// ============================================================================
// Example 5: Agent with Custom Configuration
// ============================================================================

async function createCustomAgent() {
  const agent = await SBFAgent.create({
    userId: 'user-005',
    vaultPath: '/path/to/vault',
    name: 'My Research Assistant',
    
    // LLM config
    llmProvider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.8, // More creative
    maxTokens: 8192, // Longer responses
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    
    // Entity manager for tools
    entityManager: new EntityFileManager(new Vault('/path/to/vault')),
  });

  // Check configuration
  console.log('Agent LLM:', agent.getLLMInfo());
  console.log('Available tools:', agent.getAvailableTools());

  return agent;
}

// ============================================================================
// Example 6: Loading Existing Agent
// ============================================================================

async function loadExistingAgent() {
  // Load agent by ID (preserves all config including provider)
  const agent = await SBFAgent.create({
    userId: 'user-001',
    vaultPath: '/path/to/vault',
    existingAgentId: 'agent-abc123',
    
    // You may need to provide API keys again
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  console.log('Loaded agent:', agent.agentId);
  console.log('Model:', agent.getLLMInfo().model);
  
  return agent;
}

// ============================================================================
// Example 7: Ollama Model Management
// ============================================================================

async function ollamaModelManagement() {
  const agent = await SBFAgent.create({
    userId: 'user-006',
    vaultPath: '/path/to/vault',
    llmProvider: 'ollama',
    model: 'mistral',
  });

  const ollamaClient = agent.getLLMClient();
  
  // Check if using Ollama
  if ('listModels' in ollamaClient) {
    // List available models
    const models = await (ollamaClient as any).listModels();
    console.log('Available Ollama models:', models);

    // Pull a new model if needed
    if (!models.includes('mixtral')) {
      console.log('Pulling Mixtral model...');
      await (ollamaClient as any).pullModel('mixtral');
    }
  }

  return agent;
}

// ============================================================================
// Example 8: Streaming Responses
// ============================================================================

async function streamingExample() {
  const agent = await SBFAgent.create({
    userId: 'user-007',
    vaultPath: '/path/to/vault',
    llmProvider: 'anthropic',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Get the LLM client for direct streaming
  const client = agent.getLLMClient();

  console.log('Streaming response:');
  for await (const chunk of client.stream([
    { role: 'user', content: 'Explain the concept of emergence in complex systems' }
  ])) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  return agent;
}

// ============================================================================
// Run Examples
// ============================================================================

async function main() {
  try {
    console.log('=== SBF Agent Multi-Provider Examples ===\n');

    // Uncomment to run specific examples:
    
    // await createOpenAIAgent();
    // await createAnthropicAgent();
    // await createOllamaAgent();
    // await multiProviderWorkflow();
    // await createCustomAgent();
    // await loadExistingAgent();
    // await ollamaModelManagement();
    // await streamingExample();

    console.log('\nAll examples completed successfully!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  createOpenAIAgent,
  createAnthropicAgent,
  createOllamaAgent,
  multiProviderWorkflow,
  createCustomAgent,
  loadExistingAgent,
  ollamaModelManagement,
  streamingExample,
};
