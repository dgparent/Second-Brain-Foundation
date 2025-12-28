/**
 * @sbf/errors - Unit Tests
 * 
 * Comprehensive tests for the exception hierarchy.
 */

import {
  SBFError,
  ErrorCode,
  ErrorCodeHttpStatus,
  NotFoundError,
  EntityNotFoundError,
  ValidationError,
  InvalidInputError,
  MissingRequiredFieldError,
  AIProviderError,
  RateLimitError,
  EmbeddingError,
  TransformationError,
  PodcastError,
  SensitivityViolationError,
  LifecycleTransitionError,
  TenantIsolationError,
  serializeError,
  toAPIErrorResponse,
  getHttpStatusCode,
  isRetryableError,
  isClientError,
  isServerError,
  formatErrorForLogging,
  assertSBF,
} from './index';

describe('SBFError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new SBFError({
        code: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
      });

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('SBFError');
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should use default message from error code', () => {
      const error = new SBFError({
        code: ErrorCode.NOT_FOUND,
      });

      expect(error.message).toBe('The requested resource was not found');
    });

    it('should include details', () => {
      const error = new SBFError({
        code: ErrorCode.NOT_FOUND,
        details: { id: '123', type: 'user' },
      });

      expect(error.details).toEqual({ id: '123', type: 'user' });
    });

    it('should preserve cause', () => {
      const cause = new Error('Original error');
      const error = new SBFError({
        code: ErrorCode.DATABASE_ERROR,
        cause,
      });

      expect(error.cause).toBe(cause);
    });
  });

  describe('httpStatus', () => {
    it('should return correct HTTP status for error code', () => {
      const error = new SBFError({ code: ErrorCode.NOT_FOUND });
      expect(error.httpStatus).toBe(404);
    });

    it('should return 500 for server errors', () => {
      const error = new SBFError({ code: ErrorCode.DATABASE_ERROR });
      expect(error.httpStatus).toBe(500);
    });

    it('should return 400 for validation errors', () => {
      const error = new SBFError({ code: ErrorCode.VALIDATION_ERROR });
      expect(error.httpStatus).toBe(400);
    });
  });

  describe('isRetryable', () => {
    it('should return true for connection errors', () => {
      const error = new SBFError({ code: ErrorCode.CONNECTION_ERROR });
      expect(error.isRetryable()).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = new SBFError({ code: ErrorCode.RATE_LIMIT_ERROR });
      expect(error.isRetryable()).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = new SBFError({ code: ErrorCode.VALIDATION_ERROR });
      expect(error.isRetryable()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON format', () => {
      const error = new SBFError({
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
        details: { id: '123' },
        requestId: 'req-456',
      });

      const json = error.toJSON();

      expect(json.error).toBe('SBFError');
      expect(json.code).toBe(ErrorCode.NOT_FOUND);
      expect(json.message).toBe('Not found');
      expect(json.details).toEqual({ id: '123' });
      expect(json.requestId).toBe('req-456');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('toAPIResponse', () => {
    it('should create API error response', () => {
      const error = new SBFError({ code: ErrorCode.NOT_FOUND });
      const response = error.toAPIResponse();

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.NOT_FOUND);
    });
  });

  describe('static methods', () => {
    it('isSBFError should identify SBFError instances', () => {
      const sbfError = new SBFError({ code: ErrorCode.NOT_FOUND });
      const normalError = new Error('test');

      expect(SBFError.isSBFError(sbfError)).toBe(true);
      expect(SBFError.isSBFError(normalError)).toBe(false);
      expect(SBFError.isSBFError('string')).toBe(false);
    });

    it('wrap should convert Error to SBFError', () => {
      const original = new Error('Original message');
      const wrapped = SBFError.wrap(original);

      expect(wrapped).toBeInstanceOf(SBFError);
      expect(wrapped.message).toBe('Original message');
      expect(wrapped.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(wrapped.cause).toBe(original);
    });

    it('wrap should return SBFError unchanged', () => {
      const original = new SBFError({ code: ErrorCode.NOT_FOUND });
      const wrapped = SBFError.wrap(original);

      expect(wrapped).toBe(original);
    });
  });
});

describe('Database Errors', () => {
  describe('NotFoundError', () => {
    it('should create error with NOT_FOUND code', () => {
      const error = new NotFoundError({ message: 'User not found' });
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.httpStatus).toBe(404);
    });

    it('forEntity should create descriptive error', () => {
      const error = NotFoundError.forEntity('User', '123');
      expect(error.message).toBe('User not found: 123');
      expect(error.details).toEqual({ entityType: 'User', entityId: '123' });
    });
  });

  describe('EntityNotFoundError', () => {
    it('should store entity type and id', () => {
      const error = new EntityNotFoundError('User', '123');
      expect(error.entityType).toBe('User');
      expect(error.entityId).toBe('123');
      expect(error.code).toBe(ErrorCode.ENTITY_NOT_FOUND);
    });
  });
});

describe('Validation Errors', () => {
  describe('ValidationError', () => {
    it('should include field errors', () => {
      const error = new ValidationError({
        fields: [
          { field: 'email', message: 'Invalid email' },
          { field: 'age', message: 'Must be positive' },
        ],
      });

      expect(error.fields).toHaveLength(2);
      expect(error.hasFieldError('email')).toBe(true);
      expect(error.hasFieldError('name')).toBe(false);
    });

    it('fromFields should create error from field list', () => {
      const error = ValidationError.fromFields([
        { field: 'email', message: 'Invalid' },
      ]);

      expect(error.message).toContain('email');
      expect(error.fields).toHaveLength(1);
    });
  });

  describe('InvalidInputError', () => {
    it('typeMismatch should create descriptive error', () => {
      const error = InvalidInputError.typeMismatch('age', 'number', 'string');
      expect(error.message).toContain('number');
      expect(error.message).toContain('string');
      expect(error.inputName).toBe('age');
    });
  });

  describe('MissingRequiredFieldError', () => {
    it('should store field name', () => {
      const error = new MissingRequiredFieldError('username');
      expect(error.fieldName).toBe('username');
      expect(error.code).toBe(ErrorCode.MISSING_REQUIRED_FIELD);
    });
  });
});

describe('External Service Errors', () => {
  describe('AIProviderError', () => {
    it('should store provider information', () => {
      const error = new AIProviderError({
        message: 'API failed',
        provider: 'openai',
        model: 'gpt-4',
        operation: 'chat',
      });

      expect(error.provider).toBe('openai');
      expect(error.model).toBe('gpt-4');
      expect(error.operation).toBe('chat');
    });

    it('should have factory methods for each provider', () => {
      expect(AIProviderError.openai('test').provider).toBe('openai');
      expect(AIProviderError.anthropic('test').provider).toBe('anthropic');
      expect(AIProviderError.google('test').provider).toBe('google');
      expect(AIProviderError.ollama('test').provider).toBe('ollama');
    });
  });

  describe('RateLimitError', () => {
    it('should calculate retry delay', () => {
      const error = new RateLimitError({
        message: 'Rate limited',
        retryAfter: 30,
      });

      expect(error.getRetryDelayMs()).toBe(30000);
    });

    it('should check if retry is allowed', () => {
      const pastDate = new Date(Date.now() - 1000);
      const error = new RateLimitError({
        message: 'Rate limited',
        resetAt: pastDate,
      });

      expect(error.shouldRetryNow()).toBe(true);
    });
  });
});

describe('Content Processing Errors', () => {
  describe('EmbeddingError', () => {
    it('inputTooLong should create descriptive error', () => {
      const error = EmbeddingError.inputTooLong(10000, 8192, 'text-embedding-3-small');
      expect(error.inputLength).toBe(10000);
      expect(error.maxInputLength).toBe(8192);
      expect(error.model).toBe('text-embedding-3-small');
    });
  });
});

describe('Transformation Errors', () => {
  describe('TransformationError', () => {
    it('should store transformation details', () => {
      const error = new TransformationError({
        message: 'Failed',
        transformationType: 'summarize',
        sourceId: 'note-123',
      });

      expect(error.transformationType).toBe('summarize');
      expect(error.sourceId).toBe('note-123');
    });

    it('should have factory methods', () => {
      const error = TransformationError.summarizationFailed('note-123', 'Content too short');
      expect(error.transformationType).toBe('summarize');
      expect(error.message).toContain('Content too short');
    });
  });
});

describe('Podcast Errors', () => {
  describe('PodcastError', () => {
    it('should store podcast generation details', () => {
      const error = PodcastError.ttsFailed('elevenlabs', 'voice-123', 'API error');
      expect(error.stage).toBe('tts_synthesis');
      expect(error.provider).toBe('elevenlabs');
      expect(error.voiceId).toBe('voice-123');
    });

    it('should create error for audio too long', () => {
      const error = PodcastError.audioTooLong(3600, 1800);
      expect(error.audioDuration).toBe(3600);
      expect(error.details?.maxDuration).toBe(1800);
    });
  });
});

describe('Domain Errors', () => {
  describe('SensitivityViolationError', () => {
    it('cloudAINotAllowed should create correct error', () => {
      const error = SensitivityViolationError.cloudAINotAllowed('note-123', 'secret');
      expect(error.entitySensitivity).toBe('secret');
      expect(error.attemptedAction).toBe('cloud_ai_processing');
      expect(error.httpStatus).toBe(403);
    });
  });

  describe('LifecycleTransitionError', () => {
    it('invalidTransition should describe the transition', () => {
      const error = LifecycleTransitionError.invalidTransition('note-123', 'archived', 'capture');
      expect(error.currentState).toBe('archived');
      expect(error.targetState).toBe('capture');
    });

    it('getValidTransitions should return valid states', () => {
      expect(LifecycleTransitionError.getValidTransitions('capture')).toEqual([
        'transitional',
        'permanent',
        'archived',
      ]);
      expect(LifecycleTransitionError.getValidTransitions('archived')).toEqual([]);
    });
  });

  describe('TenantIsolationError', () => {
    it('crossTenantAccess should create correct error', () => {
      const error = TenantIsolationError.crossTenantAccess('Notebook', 'nb-123');
      expect(error.resourceType).toBe('Notebook');
      expect(error.resourceId).toBe('nb-123');
      expect(error.httpStatus).toBe(403);
    });
  });
});

describe('Serialization Utilities', () => {
  describe('serializeError', () => {
    it('should serialize SBFError', () => {
      const error = new SBFError({ code: ErrorCode.NOT_FOUND });
      const serialized = serializeError(error);

      expect(serialized.code).toBe(ErrorCode.NOT_FOUND);
      expect(serialized.timestamp).toBeDefined();
    });

    it('should serialize standard Error', () => {
      const error = new Error('Standard error');
      const serialized = serializeError(error);

      expect(serialized.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(serialized.message).toBe('Standard error');
    });

    it('should handle non-Error values', () => {
      const serialized = serializeError('string error');
      expect(serialized.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(serialized.message).toBe('string error');
    });
  });

  describe('toAPIErrorResponse', () => {
    it('should create API response', () => {
      const error = new NotFoundError({ message: 'Not found' });
      const response = toAPIErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe(ErrorCode.NOT_FOUND);
    });
  });

  describe('getHttpStatusCode', () => {
    it('should return correct status for SBFError', () => {
      const error = new SBFError({ code: ErrorCode.VALIDATION_ERROR });
      expect(getHttpStatusCode(error)).toBe(400);
    });

    it('should return 500 for non-SBFError', () => {
      expect(getHttpStatusCode(new Error('test'))).toBe(500);
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryable = new SBFError({ code: ErrorCode.CONNECTION_ERROR });
      const notRetryable = new SBFError({ code: ErrorCode.VALIDATION_ERROR });

      expect(isRetryableError(retryable)).toBe(true);
      expect(isRetryableError(notRetryable)).toBe(false);
      expect(isRetryableError(new Error())).toBe(false);
    });
  });

  describe('isClientError / isServerError', () => {
    it('should correctly identify error types', () => {
      const clientError = new SBFError({ code: ErrorCode.VALIDATION_ERROR });
      const serverError = new SBFError({ code: ErrorCode.DATABASE_ERROR });

      expect(isClientError(clientError)).toBe(true);
      expect(isClientError(serverError)).toBe(false);
      expect(isServerError(serverError)).toBe(true);
      expect(isServerError(clientError)).toBe(false);
    });
  });

  describe('formatErrorForLogging', () => {
    it('should include full error details', () => {
      const error = new SBFError({
        code: ErrorCode.NOT_FOUND,
        message: 'Not found',
        details: { id: '123' },
      });

      const formatted = formatErrorForLogging(error);

      expect(formatted.code).toBe(ErrorCode.NOT_FOUND);
      expect(formatted.details).toEqual({ id: '123' });
      expect(formatted.stack).toBeDefined();
    });
  });

  describe('assertSBF', () => {
    it('should not throw when condition is true', () => {
      expect(() => assertSBF(true, ErrorCode.VALIDATION_ERROR)).not.toThrow();
    });

    it('should throw SBFError when condition is false', () => {
      expect(() => assertSBF(false, ErrorCode.VALIDATION_ERROR, 'Test failed')).toThrow(SBFError);
    });
  });
});
