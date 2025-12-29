/**
 * @sbf/db-migrations - Built-in Migrations
 */

export { migration001CoreSchema } from './001_core_schema';
export { migration002Embeddings } from './002_embeddings';
export { migration003ModelsRegistry } from './003_models_registry';
export { migration004LangGraphCheckpoints } from './004_langgraph_checkpoints';

import { Migration } from '../types';
import { migration001CoreSchema } from './001_core_schema';
import { migration002Embeddings } from './002_embeddings';
import { migration003ModelsRegistry } from './003_models_registry';
import { migration004LangGraphCheckpoints } from './004_langgraph_checkpoints';

/**
 * Get all built-in migrations in order
 */
export function getBuiltInMigrations(): Migration[] {
  return [
    migration001CoreSchema,
    migration002Embeddings,
    migration003ModelsRegistry,
    migration004LangGraphCheckpoints,
  ];
}
