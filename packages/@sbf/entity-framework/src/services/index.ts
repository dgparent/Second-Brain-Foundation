/**
 * Entity Framework - Services
 */

export { EntityTypeRegistry, type EntityTypeRegistryConfig, type DatabaseAdapter } from './EntityTypeRegistry';
export { UIDGenerator, type UIDGeneratorConfig } from './UIDGenerator';
export { EntityService, type EntityServiceConfig } from './EntityService';
export { BMOMExtractor, type AIClient, type BMOMExtractorConfig } from './BMOMExtractor';
export { ConfidenceScorer, type ConfidenceScorerConfig, type ExtractedEntity, type ExtractionContext } from './ConfidenceScorer';
export { ReviewQueueService, type ReviewQueueConfig } from './ReviewQueueService';
