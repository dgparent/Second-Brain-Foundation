/**
 * Test VA Plugin - Email to Task Workflow (Simplified)
 * 
 * Run: npm run test:va-simple
 */

import { OllamaProvider } from '../packages/@sbf/aei/dist/providers/OllamaProvider.js';
import { ArangoDBAdapter } from '../packages/@sbf/memory-engine/dist/graph/ArangoDBAdapter.js';
import type { Entity } from '../packages/@sbf/shared/dist/types/entity.js';
import type { Relationship } from '../packages/@sbf/shared/dist/types/relationship.js';

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
};

// Config
const config = {
  arangoUrl: process.env.ARANGO_URL || 'http://localhost:8529',
  arangoDatabase: process.env.ARANGO_DATABASE || 'sbf_knowledge',
  arangoUsername: process.env.ARANGO_USERNAME || 'root',
  arangoPassword: process.env.ARANGO_PASSWORD || 'sbf_development',
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:latest',
};

async function testVAWorkflow() {
  console.log('🎯 Testing VA Plugin - Email to Task Workflow\n');
  console.log('='.repeat(60));

  try {
    // Initialize providers
    console.log('\n1️⃣  Initializing...');
    const aeiProvider = new OllamaProvider({
      baseUrl: config.ollamaUrl,
      model: config.ollamaModel,
    });
    
    const memoryEngine = new ArangoDBAdapter({
      url: config.arangoUrl,
      database: config.arangoDatabase,
      username: config.arangoUsername,
      password: config.arangoPassword,
    });
    
    await memoryEngine.initialize();
    console.log('   ✅ Initialized');

    // Process email
    console.log('\n2️⃣  Processing Email from:', SAMPLE_EMAIL.from);
    console.log('   Subject:', SAMPLE_EMAIL.subject);
    
    const fullText = `From: ${SAMPLE_EMAIL.from}\nSubject: ${SAMPLE_EMAIL.subject}\n\n${SAMPLE_EMAIL.body}`;
    
    console.log('\n3️⃣  Extracting tasks with AEI...');
    const extracted = await aeiProvider.extractEntities(fullText);
    console.log(`   ✅ Extracted ${extracted.length} entities`);
    
    extracted.forEach((entity: any, idx: number) => {
      console.log(`      ${idx + 1}. ${entity.name} (${entity.type}) - confidence: ${entity.confidence}`);
    });

    // Create client
    console.log('\n4️⃣  Creating client entity...');
    const clientEmail = SAMPLE_EMAIL.from.match(/<(.+)>/)?.[1] || SAMPLE_EMAIL.from;
    const clientName = SAMPLE_EMAIL.from.split('<')[0].trim() || clientEmail.split('@')[0];
    
    const clientEntity: Entity = {
      uid: `va-client-${clientEmail.replace(/[@.]/g, '-')}`,
      type: 'va-client',
      title: clientName,
      lifecycle: { state: 'permanent' },
      sensitivity: {
        level: 'confidential',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: false,
        },
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      metadata: { email: clientEmail },
    };

    const existingClient = await memoryEngine.getEntity(clientEntity.uid);
    if (!existingClient) {
      await memoryEngine.createEntity(clientEntity);
      console.log(`   ✅ Created client: ${clientName}`);
    } else {
      console.log(`   ℹ️  Client already exists: ${clientName}`);
    }

    // Create tasks
    console.log('\n5️⃣  Creating task entities...');
    const tasks: Entity[] = [];
    
    for (const entity of extracted) {
      if (entity.type === 'task' || entity.name.toLowerCase().includes('task')) {
        const taskUid = `va-task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const task: Entity = {
          uid: taskUid,
          type: 'va-task',
          title: entity.name,
          lifecycle: {
            state: 'capture',
            review_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          },
          sensitivity: {
            level: 'personal',
            privacy: {
              cloud_ai_allowed: true,
              local_ai_allowed: true,
              export_allowed: true,
            },
          },
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          metadata: {
            client_uid: clientEntity.uid,
            priority: 'medium',
            status: 'todo',
            source: 'email',
            extracted_from: SAMPLE_EMAIL.body,
            confidence: entity.confidence,
          },
        };

        await memoryEngine.createEntity(task);
        tasks.push(task);
        console.log(`   ✅ Created: ${task.title}`);
      }
    }

    // Create relationships
    console.log('\n6️⃣  Creating relationships...');
    for (const task of tasks) {
      const rel: Relationship = {
        type: 'assigned_to',
        source_uid: task.uid,
        target_uid: clientEntity.uid,
        created: new Date().toISOString(),
        metadata: { confidence: 1.0, notes: 'Task assigned from email' },
      };
      
      await memoryEngine.createRelationship(rel);
    }
    console.log(`   ✅ Created ${tasks.length} relationships`);

    // Query tasks
    console.log('\n7️⃣  Querying tasks for client...');
    const relationships = await memoryEngine.getRelationships(clientEntity.uid, 'inbound');
    console.log(`   ✅ Found ${relationships.length} task assignments`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ VA WORKFLOW TEST COMPLETE!\n');
    console.log('🎉 Full pipeline working:');
    console.log('   ✅ Email → AEI Extraction');
    console.log('   ✅ Client Entity Created');
    console.log('   ✅ Tasks → Memory Engine');
    console.log('   ✅ Relationships Created');
    console.log('   ✅ Query by Client Works\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nStack:', (error as Error).stack);
    process.exit(1);
  }
}

testVAWorkflow().catch(console.error);
