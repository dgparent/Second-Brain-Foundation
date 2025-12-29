/**
 * @sbf/entity-framework
 * 
 * Entity framework for Second Brain Foundation with PRD-compliant UID generation,
 * frontmatter parsing, and wikilink support.
 * 
 * @example
 * ```typescript
 * import { 
 *   EntityService, 
 *   EntityTypeRegistry, 
 *   UIDGenerator,
 *   FrontmatterParser,
 *   WikilinkParser,
 * } from '@sbf/entity-framework';
 * 
 * // Initialize services
 * const registry = new EntityTypeRegistry(db);
 * const uidGenerator = new UIDGenerator(db);
 * const entityService = new EntityService(db, uidGenerator, registry);
 * 
 * // Create an entity
 * const entity = await entityService.create({
 *   tenantId: 'tenant-123',
 *   typeSlug: 'person',
 *   name: 'John Smith',
 * });
 * // entity.uid = 'person-john-smith-001'
 * 
 * // Parse frontmatter
 * const parser = new FrontmatterParser();
 * const { frontmatter, body } = parser.parse(markdownContent);
 * 
 * // Extract wikilinks
 * const wikilinks = new WikilinkParser();
 * const links = wikilinks.extract('See [[person-john-smith-001]] for details');
 * ```
 */

// Types
export * from './types';

// Entities
export {
  EntityType,
  Entity,
  EntityRelationship,
  RELATIONSHIP_TYPES,
} from './entities';

// Services
export {
  EntityTypeRegistry,
  UIDGenerator,
  EntityService,
  BMOMExtractor,
  ConfidenceScorer,
  ReviewQueueService,
  type EntityTypeRegistryConfig,
  type UIDGeneratorConfig,
  type EntityServiceConfig,
  type DatabaseAdapter,
  type AIClient,
  type BMOMExtractorConfig,
  type ConfidenceScorerConfig,
  type ExtractedEntity,
  type ExtractionContext,
  type ReviewQueueConfig,
} from './services';

// Parsers
export {
  FrontmatterParser,
  WikilinkParser,
  type ParseResult,
  type WikiLinkResolver,
} from './parsers';
