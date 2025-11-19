import { scanVault } from './vaultAdapter';
import { embed } from './embedding';
import { InMemoryVectorIndex } from './vectorIndex';

const vaultRoot = process.argv[2] || 'vault';

async function main() {
  const entities = scanVault(vaultRoot);
  const index = new InMemoryVectorIndex();
  const records = entities.map(e => ({
    id: e.id,
    vector: embed(e.content.slice(0, 2000)), // naive truncation
    aei_code: e.aei_code,
    memory_level: e.memory_level,
    security_level: e.sensitivity.level,
    vault_path: e.vault_path
  }));
  index.upsert(records);
  console.log(`Ingested ${records.length} entities from ${vaultRoot}`);
  // Simple demo query
  const q = embed('demo query about operations');
  const results = index.query(q, 5);
  console.log('Top 5 results:');
  for (const r of results) {
    console.log(`${r.id} score=${r.score.toFixed(3)} ${r.aei_code}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
