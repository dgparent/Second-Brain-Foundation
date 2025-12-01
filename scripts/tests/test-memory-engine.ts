/**
 * Test Memory Engine Entity Creation
 * 
 * Tests:
 * 1. Initialize Memory Engine
 * 2. Create a test entity
 * 3. Retrieve the entity
 * 4. Verify all properties
 * 
 * Run: npm run test:memory-engine
 */

import { ArangoDBAdapter } from '../packages/@sbf/memory-engine/dist/graph/ArangoDBAdapter.js';
import type { Entity } from '../packages/@sbf/shared/dist/types/entity.js';

const config = {
  url: process.env.ARANGO_URL || 'http://localhost:8529',
  database: process.env.ARANGO_DATABASE || 'sbf_knowledge',
  username: process.env.ARANGO_USERNAME || 'root',
  password: process.env.ARANGO_PASSWORD || 'sbf_development',
};

async function testMemoryEngine() {
  console.log('🧪 Testing Memory Engine\n');

  try {
    // 1. Initialize ArangoDB adapter
    console.log('1️⃣  Initializing ArangoDB adapter...');
    const adapter = new ArangoDBAdapter(config);
    await adapter.initialize();
    console.log('   ✅ Adapter initialized\n');

    // 2. Create a test entity
    console.log('2️⃣  Creating test entity...');
    const testEntity: Entity = {
      uid: 'person-john-doe-001',
      type: 'person',
      title: 'John Doe',
      aliases: ['JD', 'Johnny'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: {
        state: 'capture',
        review_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      },
      sensitivity: {
        level: 'personal',
        privacy: {
          cloud_ai_allowed: false,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
      content: 'Test person entity created by SBF Memory Engine test script.',
      metadata: {
        test: true,
        createdBy: 'test-script',
      },
    };

    await adapter.createEntity(testEntity);
    console.log('   ✅ Entity created:', testEntity.uid);
    console.log('      Type:', testEntity.type);
    console.log('      Title:', testEntity.title);
    console.log('      Lifecycle:', testEntity.lifecycle.state);
    console.log('      Sensitivity:', testEntity.sensitivity.level);
    console.log('');

    // 3. Retrieve the entity
    console.log('3️⃣  Retrieving entity...');
    const retrieved = await adapter.getEntity(testEntity.uid);
    
    if (!retrieved) {
      throw new Error('Entity not found!');
    }

    console.log('   ✅ Entity retrieved:', retrieved.uid);
    console.log('      Title matches:', retrieved.title === testEntity.title);
    console.log('      Type matches:', retrieved.type === testEntity.type);
    console.log('      Lifecycle matches:', retrieved.lifecycle.state === testEntity.lifecycle.state);
    console.log('');

    // 4. Create a relationship
    console.log('4️⃣  Creating test relationship...');
    const testEntity2: Entity = {
      uid: 'project-sbf-001',
      type: 'project',
      title: 'Second Brain Foundation',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      lifecycle: {
        state: 'permanent',
      },
      sensitivity: {
        level: 'public',
        privacy: {
          cloud_ai_allowed: true,
          local_ai_allowed: true,
          export_allowed: true,
        },
      },
    };

    await adapter.createEntity(testEntity2);
    
    await adapter.createRelationship({
      type: 'authored_by',
      source_uid: testEntity2.uid,
      target_uid: testEntity.uid,
      created: new Date().toISOString(),
      metadata: {
        confidence: 1.0,
        notes: 'Test relationship',
      },
    });

    console.log('   ✅ Relationship created: project → person');
    console.log('      Type: authored_by');
    console.log('      From:', testEntity2.uid);
    console.log('      To:', testEntity.uid);
    console.log('');

    // 5. Query relationships
    console.log('5️⃣  Querying relationships...');
    const relationships = await adapter.getRelationships(testEntity2.uid, 'outbound');

    console.log('   ✅ Found', relationships.length, 'relationship(s)');
    relationships.forEach(rel => {
      console.log('      -', rel.type, ':', rel.source_uid, '→', rel.target_uid);
    });
    console.log('');

    // 6. Clean up (optional)
    console.log('6️⃣  Cleanup (removing test entities)...');
    await adapter.deleteEntity(testEntity.uid);
    await adapter.deleteEntity(testEntity2.uid);
    console.log('   ✅ Test entities removed\n');

    console.log('✅ All Memory Engine tests passed!\n');
    console.log('🎉 Memory Engine is working correctly');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('\nStack:', (error as Error).stack);
    process.exit(1);
  }
}

// Run tests
testMemoryEngine();
