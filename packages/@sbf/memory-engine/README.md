# @sbf/memory-engine

Full knowledge layer for Second Brain Foundation providing CRUD operations, graph database integration, lifecycle management, and security controls.

## Features

- **Storage Layer**: Markdown + frontmatter persistence with metadata
- **Graph Database**: Entity relationships and graph traversal
- **Lifecycle Engine**: Automated 48-hour memory level transitions
- **Security**: Privacy-aware querying and access controls
- **Search**: Full-text and semantic search capabilities
- **Sync**: Optional cloud synchronization

## Architecture

```
@sbf/memory-engine/
├── src/
│   ├── storage/          # Markdown storage & vault adapter
│   ├── graph/            # Graph database operations
│   ├── lifecycle/        # Memory lifecycle engine
│   ├── search/           # Search implementations
│   ├── security/         # Access control & privacy
│   ├── sync/             # Cloud sync (optional)
│   └── index.ts          # Public API
```

## Usage

```typescript
import { MemoryEngine } from '@sbf/memory-engine';

const engine = new MemoryEngine({
  vaultRoot: '/path/to/vault',
  graphDb: 'arangodb://localhost:8529',
});

// Create entity
const entity = await engine.createEntity({
  title: 'My Note',
  content: '# My Note\n\nContent here',
  memory_level: 'short_term',
  sensitivity: { level: 2, privacy: { /* ... */ } }
});

// Query graph
const related = await engine.queryGraph({
  from: entity.id,
  depth: 2,
  relationshipTypes: ['references', 'related_to']
});

// Lifecycle management
await engine.lifecycle.tick(); // Run 48-hour transitions
```

## Graph Database Options

Recommended: **ArangoDB** for multi-model support (document + graph)

Alternative: **Neo4j** for pure graph operations

## Development

```bash
npm run dev      # Watch mode
npm run build    # Build package
npm test         # Run tests
```

## License

MIT
