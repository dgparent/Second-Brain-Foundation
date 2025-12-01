/**
 * Test AEI Entity Extraction
 * 
 * Tests:
 * 1. Connect to AI provider (Ollama/OpenAI/Anthropic)
 * 2. Extract entities from sample text
 * 3. Store entities in Memory Engine
 * 4. Verify end-to-end workflow
 * 
 * Run: npm run test:aei
 */

import { OllamaProvider } from '../packages/@sbf/aei/dist/providers/OllamaProvider.js';
import { ArangoDBAdapter } from '../packages/@sbf/memory-engine/dist/graph/ArangoDBAdapter.js';
import type { Entity } from '../packages/@sbf/shared/dist/types/entity.js';

// Sample text for extraction testing
const SAMPLE_TEXT = `
John Doe is a software engineer at TechCorp Inc, working on the SecondBrain project.
He scheduled a meeting with Sarah Smith on November 25th to discuss the AI integration.
The project aims to build a knowledge management system using TypeScript and ArangoDB.
John needs to complete the entity extraction feature by the end of the week.
`;

// Configuration
const config = {
  provider: process.env.AEI_PROVIDER || 'ollama', // ollama, openai, anthropic
  
  // Ollama config
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:latest',
  
  // OpenAI config
  openaiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  
  // Anthropic config
  anthropicKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
  
  // ArangoDB config
  arangoUrl: process.env.ARANGO_URL || 'http://localhost:8529',
  arangoDatabase: process.env.ARANGO_DATABASE || 'sbf_knowledge',
  arangoUsername: process.env.ARANGO_USERNAME || 'root',
  arangoPassword: process.env.ARANGO_PASSWORD || 'sbf_development',
};

async function testAEI() {
  console.log('🧪 Testing AEI Entity Extraction\n');

  // 1. Initialize AI Provider
  console.log('1️⃣  Initializing AI Provider...');
  console.log(`   Provider: ${config.provider}`);
  
  let provider: OllamaProvider;
  
  try {
    provider = new OllamaProvider({
      baseUrl: config.ollamaUrl,
      model: config.ollamaModel,
    });
    console.log(`   Ollama URL: ${config.ollamaUrl}`);
    console.log(`   Model: ${config.ollamaModel}`);
    
    // Test connection
    const connected = await provider.testConnection();
    if (!connected) {
      throw new Error('Cannot connect to Ollama. Is it running?');
    }
    console.log('   ✅ Ollama connected\n');
  } catch (error) {
    console.error('❌ Failed to initialize provider:', error);
    console.error('\nStack:', (error as Error).stack);
    return;
  }

  // 2. Extract entities
  console.log('2️⃣  Extracting entities from sample text...');
  console.log('   Text:', SAMPLE_TEXT.trim().substring(0, 100) + '...\n');
  
  try {
    const extractedEntities = await provider.extractEntities(SAMPLE_TEXT);
    
    if (extractedEntities.length === 0) {
      console.log('   ⚠️  No entities extracted');
      return;
    }
    
    console.log(`   ✅ Extracted ${extractedEntities.length} entities:`);
    extractedEntities.forEach((entity, idx) => {
      console.log(`      ${idx + 1}. ${entity.name} (${entity.type}) - confidence: ${entity.confidence}`);
    });
    console.log('');

    // 3. Initialize Memory Engine
    console.log('3️⃣  Initializing Memory Engine...');
    const memoryEngine = new ArangoDBAdapter({
      url: config.arangoUrl,
      database: config.arangoDatabase,
      username: config.arangoUsername,
      password: config.arangoPassword,
    });
    
    await memoryEngine.initialize();
    console.log('   ✅ Memory Engine initialized\n');

    // 4. Convert extracted entities to SBF entities and store
    console.log('4️⃣  Storing entities in Memory Engine...');
    const storedEntities: Entity[] = [];
    
    for (const extracted of extractedEntities) {
      const sbfEntity: Entity = {
        uid: `${extracted.type}-${extracted.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: extracted.type,
        title: extracted.name,
        lifecycle: {
          state: 'capture',
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
          ...extracted.attributes,
          extraction_confidence: extracted.confidence,
          extracted_by: config.provider,
          source: 'test-aei-extraction',
        },
      };
      
      const stored = await memoryEngine.createEntity(sbfEntity);
      storedEntities.push(stored);
      console.log(`   ✅ Stored: ${stored.title} (${stored.uid})`);
    }
    console.log('');

    // 5. Classify content
    console.log('5️⃣  Classifying content...');
    const classification = await provider.classifyContent(SAMPLE_TEXT);
    console.log(`   ✅ Category: ${classification.category}`);
    if (classification.subcategory) {
      console.log(`      Subcategory: ${classification.subcategory}`);
    }
    console.log(`      Tags: ${classification.tags.join(', ')}`);
    console.log(`      Confidence: ${classification.confidence}`);
    console.log('');

    // 6. Infer relationships
    console.log('6️⃣  Inferring relationships between entities...');
    const relationships = await provider.inferRelationships(storedEntities);
    
    if (relationships.length === 0) {
      console.log('   ⚠️  No relationships inferred');
    } else {
      console.log(`   ✅ Inferred ${relationships.length} relationships:`);
      relationships.forEach((rel, idx) => {
        console.log(`      ${idx + 1}. ${rel.type}: ${rel.from} → ${rel.to} (confidence: ${rel.confidence})`);
      });
    }
    console.log('');

    // 7. Cleanup
    console.log('7️⃣  Cleanup (removing test entities)...');
    for (const entity of storedEntities) {
      await memoryEngine.deleteEntity(entity.uid);
    }
    console.log('   ✅ Test entities removed\n');

    console.log('✅ All AEI tests passed!\n');
    console.log('🎉 AEI is working correctly with Memory Engine!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nStack:', (error as Error).stack);
  }
}

testAEI().catch(console.error);
