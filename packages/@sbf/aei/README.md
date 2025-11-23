# @sbf/aei

AI Entity Integration for Second Brain Foundation. Provides multi-provider entity extraction, classification, and relationship discovery using OpenAI, Anthropic, or local models.

## Features

- **Multi-Provider Support**: OpenAI, Anthropic, Ollama (local)
- **Entity Extraction**: Automatic entity detection from text
- **Classification**: Content categorization and tagging
- **Relationship Discovery**: Infer connections between entities
- **Privacy-Aware**: Respects entity sensitivity and AEI codes
- **Confidence Scoring**: All extractions include confidence metrics
- **Provenance Tracking**: Track AI decisions for auditability

## Architecture

```
@sbf/aei/
├── src/
│   ├── providers/          # AI provider implementations
│   │   ├── BaseProvider.ts
│   │   ├── OpenAIProvider.ts
│   │   ├── AnthropicProvider.ts
│   │   └── OllamaProvider.ts
│   ├── extraction/         # Entity extraction logic
│   │   ├── EntityExtractor.ts
│   │   └── prompts/
│   ├── classification/     # Content classification
│   │   └── Classifier.ts
│   ├── relationships/      # Relationship inference
│   │   └── RelationshipDiscovery.ts
│   └── index.ts
```

## Usage

```typescript
import { AEI, OpenAIProvider } from '@sbf/aei';
import { MemoryEngine } from '@sbf/memory-engine';

// Initialize
const provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
const aei = new AEI({ provider });
const memory = new MemoryEngine({ vaultRoot: './vault' });

// Extract entities from text
const text = "Met with Sarah Johnson to discuss the AI project...";
const entities = await aei.extractEntities(text);

// Save to memory engine
for (const entity of entities) {
  await memory.createEntity(entity);
}

// Discover relationships
const relationships = await aei.discoverRelationships(entities);
```

## Privacy-Aware Processing

AEI respects entity sensitivity levels:

```typescript
// Only use local AI for sensitive content
const sensitiveEntity = await memory.getEntity('secret-note');
if (sensitiveEntity.aei_code.includes('AI:LOC')) {
  // Use local provider only
  const localProvider = new OllamaProvider();
  const aei = new AEI({ provider: localProvider });
}

// Skip AI entirely for highest sensitivity
if (sensitiveEntity.aei_code.includes('AI:NONE')) {
  // No AI processing allowed
}
```

## Development

```bash
npm run dev      # Watch mode
npm run build    # Build package
npm test         # Run tests
```

## License

MIT
