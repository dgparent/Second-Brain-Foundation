/**
 * Test VA Plugin - Email to Task Workflow
 * 
 * Demonstrates:
 * 1. Email arrives from client
 * 2. AEI extracts tasks
 * 3. Tasks stored in Memory Engine
 * 4. Client relationship created
 * 5. Query tasks by client
 * 
 * Run: npm run test:va
 */

import { EmailToTaskWorkflow } from '../packages/@sbf/plugins/va-dashboard/dist/workflows/EmailToTaskWorkflow.js';

// Sample email from a client
const SAMPLE_EMAIL = {
  from: 'Sarah Johnson <sarah@techstartup.io>',
  subject: 'Quick tasks for this week',
  body: `
Hi there,

Hope you're doing well! I need your help with a few things this week:

1. Update the company website with our new product launch details - this is urgent, need it by Friday
2. Schedule a team meeting for next Monday at 2 PM to discuss Q4 planning
3. Research and compile a list of potential marketing partners - low priority, can be done next week
4. Draft social media posts for the product launch - high priority
5. Book a conference room for the investor meeting on Thursday

Let me know if you have any questions!

Best,
Sarah
  `.trim(),
  timestamp: new Date().toISOString(),
};

// Configuration
const config = {
  aei: {
    provider: 'ollama' as const,
    ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:latest',
  },
  memoryEngine: {
    url: process.env.ARANGO_URL || 'http://localhost:8529',
    database: process.env.ARANGO_DATABASE || 'sbf_knowledge',
    username: process.env.ARANGO_USERNAME || 'root',
    password: process.env.ARANGO_PASSWORD || 'sbf_development',
  },
};

async function testVAWorkflow() {
  console.log('🎯 Testing VA Plugin - Email to Task Workflow\n');
  console.log('=' .repeat(60));

  try {
    // Initialize workflow
    console.log('\n1️⃣  Initializing VA Workflow...');
    const workflow = new EmailToTaskWorkflow(config);
    await workflow.initialize();
    console.log('   ✅ Workflow initialized');

    // Process sample email
    console.log('\n2️⃣  Processing Email...');
    console.log('   From:', SAMPLE_EMAIL.from);
    console.log('   Subject:', SAMPLE_EMAIL.subject);
    
    const result = await workflow.processEmail(SAMPLE_EMAIL);

    // Display results
    console.log('\n3️⃣  Extraction Results:');
    console.log('   Client:', result.client?.title);
    console.log('   Email:', result.client?.metadata?.email);
    console.log('   Tasks extracted:', result.tasks.length);
    console.log('   Overall confidence:', (result.confidence * 100).toFixed(1) + '%');
    
    console.log('\n4️⃣  Created Tasks:');
    result.tasks.forEach((task, idx) => {
      console.log(`\n   ${idx + 1}. ${task.title}`);
      console.log(`      Priority: ${task.metadata.priority}`);
      console.log(`      Status: ${task.metadata.status}`);
      console.log(`      Source: ${task.metadata.source}`);
      console.log(`      UID: ${task.uid}`);
      if (task.metadata.confidence) {
        console.log(`      Confidence: ${(task.metadata.confidence * 100).toFixed(1)}%`);
      }
    });

    console.log('\n5️⃣  Relationships:');
    result.relationships.forEach((rel, idx) => {
      console.log(`   ${idx + 1}. ${rel.type}: ${rel.source_uid.split('-').slice(0, 2).join('-')} → ${rel.target_uid.split('-').slice(0, 2).join('-')}`);
    });

    // Query tasks by client
    if (result.client) {
      console.log('\n6️⃣  Querying tasks for client...');
      const clientTasks = await workflow.getClientTasks(result.client.uid);
      console.log(`   ✅ Found ${clientTasks.length} tasks for ${result.client.title}`);
      
      // Show task summary
      const byPriority = {
        urgent: clientTasks.filter(t => t.metadata.priority === 'urgent').length,
        high: clientTasks.filter(t => t.metadata.priority === 'high').length,
        medium: clientTasks.filter(t => t.metadata.priority === 'medium').length,
        low: clientTasks.filter(t => t.metadata.priority === 'low').length,
      };
      
      console.log('\n   Task Breakdown by Priority:');
      console.log(`      🔴 Urgent: ${byPriority.urgent}`);
      console.log(`      🟠 High: ${byPriority.high}`);
      console.log(`      🟡 Medium: ${byPriority.medium}`);
      console.log(`      🟢 Low: ${byPriority.low}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ VA WORKFLOW TEST COMPLETE!\n');
    console.log('🎉 Full pipeline working:');
    console.log('   ✅ Email → AEI Extraction');
    console.log('   ✅ Tasks → Memory Engine Storage');
    console.log('   ✅ Client → Task Relationships');
    console.log('   ✅ Query by Client\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nStack:', (error as Error).stack);
    process.exit(1);
  }
}

testVAWorkflow().catch(console.error);
