/**
 * @sbf/ai-client - Models Module
 * 
 * AI model registry and management.
 */

export { Model } from './Model';
export type {
  ModelType,
  ProviderType,
  ModelCapabilities,
  ModelConfig,
  ModelCost,
  ModelData,
} from './Model';

export { ModelManager } from './ModelManager';
export type {
  ModelManagerDatabase,
  DefaultModelSelections,
  ModelFilter,
  SensitivityLevel,
  ModelSelectionContext,
} from './ModelManager';
