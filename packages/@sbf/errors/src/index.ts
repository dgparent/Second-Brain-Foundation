/**
 * @sbf/errors
 * 
 * Standardized exception hierarchy for Second Brain Foundation.
 * Provides consistent error handling across all packages and services.
 * 
 * @example
 * ```typescript
 * import { 
 *   SBFError, 
 *   NotFoundError, 
 *   ValidationError,
 *   ErrorCode 
 * } from '@sbf/errors';
 * 
 * // Throw a specific error
 * throw NotFoundError.forEntity('User', '123');
 * 
 * // Catch and handle
 * try {
 *   await doSomething();
 * } catch (error) {
 *   if (SBFError.isSBFError(error)) {
 *     console.log(error.code, error.message);
 *     return error.toAPIResponse();
 *   }
 *   throw SBFError.wrap(error);
 * }
 * ```
 */

// Error codes and constants
export { 
  ErrorCode, 
  ErrorCodeDescriptions, 
  ErrorCodeHttpStatus 
} from './codes';

// Base error class
export { 
  SBFError, 
  type SBFErrorOptions, 
  type SerializedError, 
  type APIErrorResponse 
} from './base';

// Database errors
export {
  DatabaseError,
  NotFoundError,
  EntityNotFoundError,
  ConnectionError,
  QueryError,
  TransactionError,
  DuplicateKeyError,
  ForeignKeyError,
  ConstraintViolationError,
  MigrationError,
} from './database';

// Validation errors
export {
  ValidationError,
  InvalidInputError,
  MissingRequiredFieldError,
  InvalidFormatError,
  OutOfRangeError,
  SchemaValidationError,
  type FieldError,
} from './validation';

// External service errors
export {
  ExternalServiceError,
  AIProviderError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  APIError,
  ServiceUnavailableError,
  QuotaExceededError,
  InvalidResponseError,
} from './external';

// Content processing errors
export {
  ContentProcessingError,
  EmbeddingError,
  IndexingError,
  ExtractionError,
  ChunkingError,
  VectorOperationError,
} from './content';

// Transformation errors
export {
  TransformationError,
  type TransformationType,
} from './transformation';

// Podcast errors
export {
  PodcastError,
  type PodcastStage,
} from './podcast';

// Domain-specific errors
export {
  DomainError,
  SensitivityViolationError,
  LifecycleTransitionError,
  LifecycleExpiredError,
  RelationshipError,
  CircularDependencyError,
  TenantIsolationError,
  ChecksumMismatchError,
  type SensitivityLevel,
  type LifecycleState,
} from './domain';

// Serialization utilities
export {
  serializeError,
  toAPIErrorResponse,
  toAPISuccessResponse,
  getHttpStatusCode,
  isRetryableError,
  isClientError,
  isServerError,
  formatErrorForLogging,
  sanitizeErrorForExternal,
  createErrorHandler,
  wrapAsync,
  assertSBF,
  type StandardAPIResponse,
} from './serializer';
