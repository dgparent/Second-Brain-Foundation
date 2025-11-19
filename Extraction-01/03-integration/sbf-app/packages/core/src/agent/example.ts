/**
 * SBF Agent Usage Example
 * 
 * Demonstrates how to use the Phase 1 agent implementation.
 * This example shows:
 * - Creating a new agent
 * - Having a conversation
 * - Managing memory
 * - Persisting and restoring state
 */

import { SBFAgent } from '@sbf/core';

async function example() {
  console.log('🚀 SBF Agent Example - Phase 1\n');

  // ========================================
  // 1. Create a new agent
  // ========================================
  console.log('📝 Creating new agent...');
  
  const agent = await SBFAgent.create({
    userId: 'demo-user',
    vaultPath: './demo-vault',
    name: 'Demo Assistant',
    openaiApiKey: process.env.OPENAI_API_KEY || 'sk-your-key-here',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
  });

  console.log(`✅ Agent created: ${agent.toJSON().id}\n`);

  // ========================================
  // 2. Set initial memory context
  // ========================================
  console.log('🧠 Setting initial memory...');
  
  agent.updateMemory('persona', 
    'I am a helpful AI assistant for Second Brain Foundation. ' +
    'I help users organize their knowledge into entities and create connections.'
  );
  
  agent.updateMemory('human',
    'User: Demo User\n' +
    'Interests: AI, Knowledge Management, PKM\n' +
    'Goals: Build a comprehensive knowledge base'
  );
  
  agent.setCurrentFocus('project-sbf-001', 'Second Brain Foundation MVP');
  agent.addRecentEntity('topic-letta-042');
  agent.addRecentEntity('topic-ai-architecture-015');
  
  console.log('✅ Memory initialized\n');

  // ========================================
  // 3. Have a conversation
  // ========================================
  console.log('💬 Starting conversation...\n');
  
  const response1 = await agent.step([{
    role: 'user',
    content: 'Hello! What can you help me with?'
  }]);

  console.log('🤖 Assistant:', response1.messages[0].content);
  console.log('📊 Usage:', response1.usage);
  console.log('');

  // Continue conversation
  const response2 = await agent.step([{
    role: 'user',
    content: 'What is my current focus?'
  }]);

  console.log('🤖 Assistant:', response2.messages[0].content);
  console.log('📊 Usage:', response2.usage);
  console.log('');

  // ========================================
  // 4. Update memory during conversation
  // ========================================
  console.log('🔄 Updating current focus...');
  agent.setCurrentFocus('topic-letta-042', 'Letta Integration');
  console.log('✅ Focus updated\n');

  const response3 = await agent.step([{
    role: 'user',
    content: 'What should I focus on next?'
  }]);

  console.log('🤖 Assistant:', response3.messages[0].content);
  console.log('');

  // ========================================
  // 5. Save agent state
  // ========================================
  console.log('💾 Saving agent state...');
  await agent.save();
  console.log('✅ State saved to .sbf/agents/\n');

  const agentId = agent.toJSON().id;

  // ========================================
  // 6. Cleanup and restore
  // ========================================
  console.log('🧹 Cleaning up current agent...');
  await agent.cleanup();
  console.log('✅ Cleanup complete\n');

  // ========================================
  // 7. Restore agent from saved state
  // ========================================
  console.log('🔄 Restoring agent from saved state...');
  
  const restoredAgent = await SBFAgent.create({
    userId: 'demo-user',
    vaultPath: './demo-vault',
    openaiApiKey: process.env.OPENAI_API_KEY || 'sk-your-key-here',
    existingAgentId: agentId,
  });

  console.log('✅ Agent restored with full memory!\n');

  // Verify memory was restored
  const memory = restoredAgent.getMemory();
  console.log('🧠 Restored memory blocks:');
  memory.getBlocks().forEach(block => {
    console.log(`  - ${block.label}: ${block.value.substring(0, 50)}...`);
  });
  console.log('');

  // Continue conversation with restored agent
  const response4 = await restoredAgent.step([{
    role: 'user',
    content: 'Do you remember what we were discussing?'
  }]);

  console.log('🤖 Assistant:', response4.messages[0].content);
  console.log('');

  // ========================================
  // 8. Cleanup
  // ========================================
  await restoredAgent.cleanup();
  console.log('✅ Example complete!\n');
}

// Run the example
if (require.main === module) {
  example().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

export { example };
