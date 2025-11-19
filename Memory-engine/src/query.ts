import { InMemoryVectorIndex } from './vectorIndex';
import { embed } from './embedding';

// For a real system we'd persist index; here just illustrative with process-provided JSON
// Usage: node query.js '<question>' '<serializedRecordsJSON>'

const question = process.argv[2] || 'test';
const raw = process.argv[3];

if (!raw) {
  console.error('Provide serialized records JSON from ingest phase.');
  process.exit(1);
}

const records = JSON.parse(raw);
const index = new InMemoryVectorIndex();
index.upsert(records);
const qVec = embed(question);
const results = index.query(qVec, 5);
console.log(JSON.stringify(results, null, 2));
