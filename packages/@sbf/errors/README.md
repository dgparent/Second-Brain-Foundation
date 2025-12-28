# @sbf/errors

Standardized exception hierarchy for Second Brain Foundation.

## Installation

```bash
pnpm add @sbf/errors
```

## Overview

This package provides a comprehensive error hierarchy for consistent error handling across all SBF packages and services. All errors extend from `SBFError` and include:

- Unique error codes (e.g., `E1001` for NOT_FOUND)
- HTTP status code mapping
- Automatic serialization for API responses
- Rich error details and context
- Support for error cause chains

## Quick Start

```typescript
import { 
  NotFoundError, 
  ValidationError, 
  SBFError,
  ErrorCode 
} from '@sbf/errors';

// Throw a specific error
throw NotFoundError.forEntity('User', '123');

// Catch and handle errors
try {
  await performOperation();
} catch (error) {
  if (SBFError.isSBFError(error)) {
    // Handle SBF errors with proper codes and HTTP status
    console.log(error.code);       // E1001
    console.log(error.httpStatus); // 404
    return error.toAPIResponse();
  }
  // Wrap unknown errors
  throw SBFError.wrap(error);
}
```

## Error Categories

### Database Errors (E1xxx)

```typescript
import { 
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
} from '@sbf/errors';

// Resource not found
throw NotFoundError.forEntity('User', userId);

// Entity not found with type
throw new EntityNotFoundError('Notebook', notebookId);

// Database connection issues
throw new ConnectionError({
  message: 'Failed to connect to database',
  host: 'localhost',
  port: 5432,
});
```

### Validation Errors (E2xxx)

```typescript
import {
  ValidationError,
  InvalidInputError,
  MissingRequiredFieldError,
  InvalidFormatError,
  OutOfRangeError,
  SchemaValidationError,
} from '@sbf/errors';

// Multiple field validation errors
throw ValidationError.fromFields([
  { field: 'email', message: 'Invalid email format' },
  { field: 'age', message: 'Must be a positive number' },
]);

// Type mismatch
throw InvalidInputError.typeMismatch('age', 'number', 'string');

// Missing required field
throw new MissingRequiredFieldError('username');

// Invalid format
throw InvalidFormatError.invalidUID('invalid-uid-format');
throw InvalidFormatError.invalidTimestamp('not-a-date');
```

### External Service Errors (E3xxx)

```typescript
import {
  AIProviderError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  ServiceUnavailableError,
  QuotaExceededError,
} from '@sbf/errors';

// AI provider errors
throw AIProviderError.openai('API key invalid', { model: 'gpt-4' });
throw AIProviderError.anthropic('Rate limited', { operation: 'chat' });

// Rate limiting with retry info
throw new RateLimitError({
  message: 'Rate limit exceeded',
  serviceName: 'openai',
  retryAfter: 60,
});

// Quota exceeded
throw new QuotaExceededError({
  serviceName: 'openai',
  quotaType: 'tokens',
  currentUsage: 1000000,
  limit: 500000,
});
```

### Content Processing Errors (E6xxx)

```typescript
import {
  ContentProcessingError,
  EmbeddingError,
  IndexingError,
  ExtractionError,
  ChunkingError,
  VectorOperationError,
} from '@sbf/errors';

// Embedding generation
throw EmbeddingError.inputTooLong(10000, 8192, 'text-embedding-3-small');

// Content extraction
throw ExtractionError.unsupportedFileType('.xyz');

// Vector operations
throw VectorOperationError.pinecone('Index not found', {
  namespace: 'default',
  operation: 'upsert',
});
```

### Domain-Specific Errors (E4xxx)

```typescript
import {
  SensitivityViolationError,
  LifecycleTransitionError,
  TenantIsolationError,
  ChecksumMismatchError,
} from '@sbf/errors';

// Privacy/Sensitivity violations
throw SensitivityViolationError.cloudAINotAllowed(entityId, 'secret');
throw SensitivityViolationError.exportNotAllowed(entityId, 'confidential');

// Lifecycle transitions
throw LifecycleTransitionError.invalidTransition(entityId, 'archived', 'capture');

// Tenant isolation
throw TenantIsolationError.crossTenantAccess('Notebook', notebookId);

// Data integrity
throw ChecksumMismatchError.verificationFailed(entityId);
```

### Transformation & Podcast Errors

```typescript
import { TransformationError, PodcastError } from '@sbf/errors';

// Transformation failures
throw TransformationError.summarizationFailed(sourceId, 'Content too short');
throw TransformationError.translationFailed(sourceId, 'es', 'API error');

// Podcast generation
throw PodcastError.ttsFailed('elevenlabs', voiceId, 'Voice not available');
throw PodcastError.audioTooLong(3600, 1800);
```

## API Response Serialization

```typescript
import { 
  serializeError, 
  toAPIErrorResponse,
  toAPISuccessResponse,
  createErrorHandler,
} from '@sbf/errors';

// Create standard API error response
const errorResponse = toAPIErrorResponse(error, requestId);
// { success: false, error: { code: 'E1001', message: '...', ... } }

// Create success response
const successResponse = toAPISuccessResponse(data, { requestId });
// { success: true, data: {...}, meta: { requestId, timestamp } }

// Express error handler middleware
app.use(createErrorHandler({
  logErrors: true,
  sanitize: true,  // Remove sensitive details for external APIs
}));
```

## Error Utilities

```typescript
import {
  getHttpStatusCode,
  isRetryableError,
  isClientError,
  isServerError,
  formatErrorForLogging,
  assertSBF,
  wrapAsync,
} from '@sbf/errors';

// Get HTTP status code
const status = getHttpStatusCode(error); // 404

// Check error type
if (isRetryableError(error)) {
  // Implement retry logic
}

if (isClientError(error)) {
  // Don't retry, it's a user error
}

// Assert with SBFError
assertSBF(user !== null, ErrorCode.NOT_FOUND, 'User not found');

// Wrap async functions
const safeOperation = wrapAsync(async () => {
  // ... operation that might throw
}, ErrorCode.DATABASE_ERROR);
```

## Error Codes Reference

| Range | Category | Examples |
|-------|----------|----------|
| E1xxx | Database | E1000 DATABASE_ERROR, E1001 NOT_FOUND |
| E2xxx | Validation | E2000 VALIDATION_ERROR, E2001 INVALID_INPUT |
| E3xxx | External Services | E3001 AI_PROVIDER_ERROR, E3002 RATE_LIMIT |
| E4xxx | Domain | E4001 SENSITIVITY_VIOLATION, E4002 LIFECYCLE_INVALID |
| E5xxx | Auth | E5001 UNAUTHORIZED, E5002 FORBIDDEN |
| E6xxx | Content | E6001 CONTENT_PROCESSING_ERROR, E6002 EMBEDDING_ERROR |
| E9xxx | System | E9000 SYSTEM_ERROR, E9999 UNKNOWN_ERROR |

## Best Practices

1. **Use specific error types** instead of generic SBFError when possible
2. **Include relevant details** to help with debugging
3. **Use factory methods** for common error scenarios
4. **Wrap unknown errors** at service boundaries
5. **Check isRetryable()** before implementing retry logic
6. **Sanitize errors** before sending to external clients

## License

MIT
