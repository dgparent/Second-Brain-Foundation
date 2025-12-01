import { MemoryEngine } from '../packages/@sbf/memory-engine/src/index';
import { VaultOptions } from '../packages/@sbf/memory-engine/src/types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Clients
class MockVectorClient {
  public upsertedRecords: any[] = [];
  public deletedIds: string[] = [];

  async upsert(tenantId: string, records: any[]) {
    this.upsertedRecords.push(...records);
    console.log(`[MockVector] Upserted ${records.length} records for tenant ${tenantId}`);
  }
  async delete(tenantId: string, ids: string[]) {
    this.deletedIds.push(...ids);
    console.log(`[MockVector] Deleted ${ids.length} records for tenant ${tenantId}`);
  }
}

class MockAiClient {
  async embed(request: { input: string }) {
    return { embeddings: [[0.1, 0.2, 0.3]] };
  }
  async generate(request: any) {
    return {
      content: JSON.stringify({
        entities: [{ name: 'Alice', type: 'Person' }],
        relations: [{ source: 'Test Note', target: 'Alice', type: 'met_with', description: 'Meeting' }]
      })
    };
  }
}

// Test Configuration
const TEST_VAULT_PATH = path.resolve(__dirname, '../temp_test_vault');
const TENANT_ID = 'test-tenant';

async function setupVault() {
  console.log('   [Setup] Cleaning up old vault...');
  try {
    await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
  } catch (e) { console.log('   [Setup] Cleanup error (ignored):', e); }
  
  console.log('   [Setup] Creating vault directories...');
  await fs.mkdir(TEST_VAULT_PATH, { recursive: true });
  await fs.mkdir(path.join(TEST_VAULT_PATH, 'Daily'), { recursive: true });
  await fs.mkdir(path.join(TEST_VAULT_PATH, '08_Archive/Daily'), { recursive: true });
  console.log('✅ Test Vault Setup Complete');
}

async function runTests() {
  console.log('🚀 Starting Holistic System Test Suite...\n');

  await setupVault();

  // 1. Initialize Memory Engine
  console.log('1️⃣  Initializing Memory Engine...');
  const engine = new MemoryEngine({
    vaultRoot: TEST_VAULT_PATH,
    autoComputeAeiCode: true,
    vector: { apiKey: 'mock', indexName: 'mock' },
    ai: { provider: 'openai', apiKey: 'mock' }
  });

  // Inject Mocks (using any to bypass private/protected if needed, or just relying on JS dynamic nature)
  (engine as any).vectorClient = new MockVectorClient();
  (engine as any).aiClient = new MockAiClient();

  // Clear default rules and add custom rule for testing archiving
  (engine.lifecycle as any).rules = [];
  engine.lifecycle.addRule({
      from: 'transitory',
      to: 'archived',
      conditions: { hours_inactive: 24 }
  });

  console.log('✅ Memory Engine Initialized\n');

  // 2. Test Ingestion (Standard Note)
  console.log('2️⃣  Testing Ingestion (Standard Note)...');
  const notePath = 'Project Alpha.md';
  const noteContent = `---
title: Project Alpha
tags: [project, active]
memory:
  memory_level: short_term
  stability_score: 0.5
  importance_score: 0.8
  last_active_at: ${new Date().toISOString()}
  user_pinned: false
  created_at: ${new Date().toISOString()}
  updated_at: ${new Date().toISOString()}
sensitivity:
  level: 1
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
  visibility: internal
---
# Project Alpha
This is a test project.
`;
  
  await fs.writeFile(path.join(TEST_VAULT_PATH, notePath), noteContent);
  await engine.ingestFile(path.join(TEST_VAULT_PATH, notePath), noteContent, TENANT_ID);
  
  const entity = await engine.getEntity(path.join(TEST_VAULT_PATH, notePath)); // ID might be path or UID
  // In our adapter, ID is UID or generated from path. Let's check cache.
  // We need to find the ID.
  const cachedEntities = Array.from((engine as any).entityCache.values()) as any[];
  const ingestedEntity = cachedEntities.find(e => e.title === 'Project Alpha');

  if (ingestedEntity) {
      console.log(`✅ Entity Ingested: ${ingestedEntity.title}`);
      console.log(`   AEI Code: ${ingestedEntity.aei_code}`);
  } else {
      console.error('❌ Entity Ingestion Failed');
  }
  console.log('');

  // 3. Test Entity Extraction (Daily Note)
  console.log('3️⃣  Testing Entity Extraction (Daily Note)...');
  const dailyPath = 'Daily/2025-01-01.md';
  const dailyContent = `---
title: "2025-01-01"
tags: [daily]
memory:
  memory_level: transitory
  stability_score: 0.1
  importance_score: 0.5
  last_active_at: ${new Date().toISOString()}
  user_pinned: false
  created_at: ${new Date().toISOString()}
  updated_at: ${new Date().toISOString()}
sensitivity:
  level: 0
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
  visibility: public
---
# Daily Note
Met with [[Alice]] today regarding Project Alpha.
`;

  await fs.writeFile(path.join(TEST_VAULT_PATH, dailyPath), dailyContent);
  await engine.ingestFile(path.join(TEST_VAULT_PATH, dailyPath), dailyContent, TENANT_ID);

  const graph = engine.getGraph();
  // Refresh cache snapshot
  const cachedEntities2 = Array.from((engine as any).entityCache.values()) as any[];
  
  // We can't easily inspect the private graph map, but we can check logs or if we exposed a getter.
  // For now, we assume the MockAiClient returned relations and they were added.
  // We can check if the entity is in cache.
  const dailyEntity = cachedEntities2.find(e => e.title === '2025-01-01');
  if (dailyEntity) {
      console.log(`✅ Daily Note Ingested: ${dailyEntity.title}`);
      
      // Verify Graph Edges
      const relationships = graph?.getAllRelationships() || [];
      const hasRelation = relationships.some(r => r.target_uid === 'Alice' && r.type === 'met_with');
      
      if (hasRelation) {
          console.log('✅ Graph Relationship Verified: (Daily Note) -> met_with -> (Alice)');
      } else {
          console.error('❌ Graph Relationship Missing');
          console.log('   Current Relationships:', relationships);
      }

  } else {
      console.error('❌ Daily Note Ingestion Failed. Cache contents:', cachedEntities2.map(e => e.title));
  }
  console.log('');

  // 4. Test Lifecycle (Archiving)
  console.log('4️⃣  Testing Lifecycle Automation...');
  // Create an old note
  const oldPath = 'Daily/2020-01-01.md';
  const oldDate = new Date('2020-01-01').toISOString();
  const oldContent = `---
title: "2020-01-01"
tags: [daily]
memory:
  memory_level: transitory
  stability_score: 0.1
  importance_score: 0.1
  last_active_at: ${oldDate}
  user_pinned: false
  created_at: ${oldDate}
  updated_at: ${oldDate}
sensitivity:
  level: 0
  privacy:
    cloud_ai_allowed: true
    local_ai_allowed: true
    export_allowed: true
  visibility: public
---
Old note.
`;

  await fs.writeFile(path.join(TEST_VAULT_PATH, oldPath), oldContent);
  // Ingest it first so it's in memory
  await engine.ingestFile(path.join(TEST_VAULT_PATH, oldPath), oldContent, TENANT_ID);
  
  // Force lifecycle run
  console.log('   Running automatic transitions...');
  await engine.runAutomaticTransitions();

  // Check if file moved
  const expectedArchivePath = path.join(TEST_VAULT_PATH, '08_Archive/Daily/2020-01-01.md');
  try {
      await fs.access(expectedArchivePath);
      console.log('✅ File successfully moved to Archive');
  } catch {
      console.error(`❌ File NOT found in Archive: ${expectedArchivePath}`);
  }
  console.log('');

  // 5. Test Pinning Logic
  console.log('5️⃣  Testing Pinning Logic...');
  const pinnedPath = 'Daily/2020-01-02.md';
  const pinnedContent = `---
title: "2020-01-02"
tags: [daily]
memory:
  memory_level: transitory
  stability_score: 0.1
  importance_score: 0.1
  last_active_at: ${oldDate}
  user_pinned: true
  created_at: ${oldDate}
  updated_at: ${oldDate}
sensitivity:
  level: 0
---
Pinned note.
`;
  await fs.writeFile(path.join(TEST_VAULT_PATH, pinnedPath), pinnedContent);
  await engine.ingestFile(path.join(TEST_VAULT_PATH, pinnedPath), pinnedContent, TENANT_ID);
  
  console.log('   Running automatic transitions (should skip pinned note)...');
  await engine.runAutomaticTransitions();
  
  const pinnedExists = await fs.access(path.join(TEST_VAULT_PATH, pinnedPath)).then(() => true).catch(() => false);
  if (pinnedExists) {
      console.log('✅ Pinned note was NOT archived');
  } else {
      console.error('❌ Pinned note WAS archived (Failure)');
  }
  console.log('');

  // 6. Test Updates & Deletions
  console.log('6️⃣  Testing Updates & Deletions...');
  
  // Update: Modify Project Alpha
  console.log('   [Update] Modifying Project Alpha...');
  const updatedContent = noteContent.replace('memory_level: short_term', 'memory_level: long_term');
  await fs.writeFile(path.join(TEST_VAULT_PATH, notePath), updatedContent);
  await engine.ingestFile(path.join(TEST_VAULT_PATH, notePath), updatedContent, TENANT_ID);
  
  const updatedEntity = (Array.from((engine as any).entityCache.values()) as any[]).find(e => e.title === 'Project Alpha');
  if (updatedEntity && updatedEntity.memory.memory_level === 'long_term') {
      console.log('✅ Entity Updated: Memory Level changed to long_term');
  } else {
      console.error('❌ Entity Update Failed');
  }

  // Delete: Remove Project Alpha
  console.log('   [Delete] Deleting Project Alpha...');
  await engine.deleteFile(path.join(TEST_VAULT_PATH, notePath), TENANT_ID);
  
  const deletedEntity = (Array.from((engine as any).entityCache.values()) as any[]).find(e => e.title === 'Project Alpha');
  if (!deletedEntity) {
      console.log('✅ Entity Deleted from Cache');
  } else {
      console.error('❌ Entity Delete Failed (Still in Cache)');
  }
  
  // Verify Vector Delete
  const mockVector = (engine as any).vectorClient as MockVectorClient;
  if (mockVector.deletedIds.length > 0) {
      console.log(`✅ Vector Delete Called for ${mockVector.deletedIds.length} IDs`);
  } else {
      console.error('❌ Vector Delete NOT Called');
  }
  console.log('');

  // Cleanup
  try {
    await fs.rm(TEST_VAULT_PATH, { recursive: true, force: true });
  } catch {}
  
  await engine.shutdown();
  
  console.log('✅ Test Vault Cleaned Up');
  console.log('\n🎉 Holistic Test Suite Completed!');
}

runTests().catch(console.error);
