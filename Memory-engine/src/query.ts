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
// Optional security level upper bound from argv[4]
const secBound = process.argv[4] ? Number(process.argv[4]) : undefined;
const results = index.query(qVec, 5, secBound !== undefined ? { security_level: secBound } : undefined);
console.log(JSON.stringify(results, null, 2));
