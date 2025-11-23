# Memory Engine Module (Initial Scaffold)

Purpose: Provide AEI memory engine that couples vault entities to a vector index with traceability and security-aware retrieval.

## Components (Planned)
1. Vault Adapter: Scans vault folders -> normalized entity objects (id, path, title, content, metadata).
2. AEI Code Service: Pure function computeAeiCode (implemented) to derive aei_code from memory/security fields.
3. Embedding Service: Pluggable (OpenAI local/remote, or local models). Respects AI:NONE / META (metadata only) rules.
4. Vector Index: Abstraction over provider (Qdrant, pgvector, SQLite Vec). Stores {id, vector, aei_code, memory_level, security_level, vault_path}.
5. Traceback Resolver: Given vector hits, maps back to vault path + loads metadata but filters sensitive body content based on AI code.
6. Evolution Engine: Adjusts memory_level, stability_score, importance_score; triggers recompute of aei_code + conditional re-embedding.
7. Security Gate: Enforces privacy flags, export rules, AI routing policies at query + ingest.
8. Query Orchestrator: Accepts query with filters (memory tiers, security bounds, visibility) -> similarity search -> post-filter -> traceback.

## Data Flow
Vault Scan -> Entity Normalize -> computeAeiCode -> Embedding (if allowed) -> Index Upsert -> Query -> Filter -> Traceback -> Response.

## Next Steps
- Integrate evolution.ts into ingest or scheduled maintenance pass.
- Add persistence layer for index & entity state.
- Add visibility/group filters & export gate.
- Implement traceback resolver returning masked content for META.
- Add CLI commands: memory-evolve, memory-query.
