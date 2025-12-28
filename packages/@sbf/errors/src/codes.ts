/**
 * @sbf/errors - Error Codes
 * 
 * Standardized error codes for the Second Brain Foundation.
 * Codes are organized by category:
 * - E1xxx: Database errors
 * - E2xxx: Validation errors
 * - E3xxx: External service errors
 * - E4xxx: Domain-specific errors
 * - E5xxx: Authentication/Authorization errors
 * - E6xxx: Content processing errors
 */

export enum ErrorCode {
  // ===========================================
  // E1xxx: Database Errors
  // ===========================================
  DATABASE_ERROR = 'E1000',
  NOT_FOUND = 'E1001',
  ENTITY_NOT_FOUND = 'E1002',
  CONNECTION_ERROR = 'E1003',
  QUERY_ERROR = 'E1004',
  TRANSACTION_ERROR = 'E1005',
  DUPLICATE_KEY = 'E1006',
  FOREIGN_KEY_VIOLATION = 'E1007',
  CONSTRAINT_VIOLATION = 'E1008',
  MIGRATION_ERROR = 'E1009',

  // ===========================================
  // E2xxx: Validation Errors
  // ===========================================
  VALIDATION_ERROR = 'E2000',
  INVALID_INPUT = 'E2001',
  MISSING_REQUIRED_FIELD = 'E2002',
  INVALID_FORMAT = 'E2003',
  OUT_OF_RANGE = 'E2004',
  INVALID_TYPE = 'E2005',
  SCHEMA_VALIDATION_FAILED = 'E2006',
  INVALID_UID_FORMAT = 'E2007',
  INVALID_TIMESTAMP = 'E2008',

  // ===========================================
  // E3xxx: External Service Errors
  // ===========================================
  EXTERNAL_SERVICE_ERROR = 'E3000',
  AI_PROVIDER_ERROR = 'E3001',
  RATE_LIMIT_ERROR = 'E3002',
  TIMEOUT_ERROR = 'E3003',
  NETWORK_ERROR = 'E3004',
  API_ERROR = 'E3005',
  AUTHENTICATION_FAILED = 'E3006',
  SERVICE_UNAVAILABLE = 'E3007',
  QUOTA_EXCEEDED = 'E3008',
  INVALID_RESPONSE = 'E3009',

  // ===========================================
  // E4xxx: Domain-Specific Errors
  // ===========================================
  DOMAIN_ERROR = 'E4000',
  SENSITIVITY_VIOLATION = 'E4001',
  LIFECYCLE_INVALID_TRANSITION = 'E4002',
  LIFECYCLE_EXPIRED = 'E4003',
  RELATIONSHIP_INVALID = 'E4004',
  CIRCULAR_DEPENDENCY = 'E4005',
  TENANT_ISOLATION_VIOLATION = 'E4006',
  CHECKSUM_MISMATCH = 'E4007',

  // ===========================================
  // E5xxx: Authentication/Authorization Errors
  // ===========================================
  AUTH_ERROR = 'E5000',
  UNAUTHORIZED = 'E5001',
  FORBIDDEN = 'E5002',
  TOKEN_EXPIRED = 'E5003',
  TOKEN_INVALID = 'E5004',
  SESSION_EXPIRED = 'E5005',
  INSUFFICIENT_PERMISSIONS = 'E5006',

  // ===========================================
  // E6xxx: Content Processing Errors
  // ===========================================
  CONTENT_ERROR = 'E6000',
  CONTENT_PROCESSING_ERROR = 'E6001',
  EMBEDDING_ERROR = 'E6002',
  TRANSFORMATION_ERROR = 'E6003',
  PODCAST_ERROR = 'E6004',
  INDEXING_ERROR = 'E6005',
  EXTRACTION_ERROR = 'E6006',
  CHUNKING_ERROR = 'E6007',
  VECTOR_OPERATION_ERROR = 'E6008',

  // ===========================================
  // E9xxx: System/Infrastructure Errors
  // ===========================================
  SYSTEM_ERROR = 'E9000',
  CONFIGURATION_ERROR = 'E9001',
  JOB_EXECUTION_ERROR = 'E9002',
  QUEUE_ERROR = 'E9003',
  CACHE_ERROR = 'E9004',
  FILE_SYSTEM_ERROR = 'E9005',
  UNKNOWN_ERROR = 'E9999',
}

/**
 * Human-readable descriptions for error codes
 */
export const ErrorCodeDescriptions: Record<ErrorCode, string> = {
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found',
  [ErrorCode.ENTITY_NOT_FOUND]: 'The requested entity was not found',
  [ErrorCode.CONNECTION_ERROR]: 'Failed to connect to the database',
  [ErrorCode.QUERY_ERROR]: 'Database query failed',
  [ErrorCode.TRANSACTION_ERROR]: 'Database transaction failed',
  [ErrorCode.DUPLICATE_KEY]: 'A record with this key already exists',
  [ErrorCode.FOREIGN_KEY_VIOLATION]: 'Foreign key constraint violation',
  [ErrorCode.CONSTRAINT_VIOLATION]: 'Database constraint violation',
  [ErrorCode.MIGRATION_ERROR]: 'Database migration failed',

  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.INVALID_INPUT]: 'The provided input is invalid',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'A required field is missing',
  [ErrorCode.INVALID_FORMAT]: 'The input format is invalid',
  [ErrorCode.OUT_OF_RANGE]: 'The value is out of the allowed range',
  [ErrorCode.INVALID_TYPE]: 'The value type is incorrect',
  [ErrorCode.SCHEMA_VALIDATION_FAILED]: 'Schema validation failed',
  [ErrorCode.INVALID_UID_FORMAT]: 'The UID format is invalid',
  [ErrorCode.INVALID_TIMESTAMP]: 'The timestamp format is invalid',

  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCode.AI_PROVIDER_ERROR]: 'AI provider error',
  [ErrorCode.RATE_LIMIT_ERROR]: 'Rate limit exceeded',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out',
  [ErrorCode.NETWORK_ERROR]: 'Network error',
  [ErrorCode.API_ERROR]: 'API error',
  [ErrorCode.AUTHENTICATION_FAILED]: 'Authentication failed',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is unavailable',
  [ErrorCode.QUOTA_EXCEEDED]: 'Quota exceeded',
  [ErrorCode.INVALID_RESPONSE]: 'Invalid response from service',

  [ErrorCode.DOMAIN_ERROR]: 'Domain error',
  [ErrorCode.SENSITIVITY_VIOLATION]: 'Sensitivity level violation',
  [ErrorCode.LIFECYCLE_INVALID_TRANSITION]: 'Invalid lifecycle state transition',
  [ErrorCode.LIFECYCLE_EXPIRED]: 'Entity lifecycle has expired',
  [ErrorCode.RELATIONSHIP_INVALID]: 'Invalid relationship',
  [ErrorCode.CIRCULAR_DEPENDENCY]: 'Circular dependency detected',
  [ErrorCode.TENANT_ISOLATION_VIOLATION]: 'Tenant isolation violation',
  [ErrorCode.CHECKSUM_MISMATCH]: 'Checksum verification failed',

  [ErrorCode.AUTH_ERROR]: 'Authentication/Authorization error',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.TOKEN_EXPIRED]: 'Token has expired',
  [ErrorCode.TOKEN_INVALID]: 'Token is invalid',
  [ErrorCode.SESSION_EXPIRED]: 'Session has expired',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',

  [ErrorCode.CONTENT_ERROR]: 'Content error',
  [ErrorCode.CONTENT_PROCESSING_ERROR]: 'Content processing failed',
  [ErrorCode.EMBEDDING_ERROR]: 'Embedding generation failed',
  [ErrorCode.TRANSFORMATION_ERROR]: 'Content transformation failed',
  [ErrorCode.PODCAST_ERROR]: 'Podcast generation failed',
  [ErrorCode.INDEXING_ERROR]: 'Content indexing failed',
  [ErrorCode.EXTRACTION_ERROR]: 'Content extraction failed',
  [ErrorCode.CHUNKING_ERROR]: 'Content chunking failed',
  [ErrorCode.VECTOR_OPERATION_ERROR]: 'Vector operation failed',

  [ErrorCode.SYSTEM_ERROR]: 'System error',
  [ErrorCode.CONFIGURATION_ERROR]: 'Configuration error',
  [ErrorCode.JOB_EXECUTION_ERROR]: 'Job execution failed',
  [ErrorCode.QUEUE_ERROR]: 'Queue operation failed',
  [ErrorCode.CACHE_ERROR]: 'Cache operation failed',
  [ErrorCode.FILE_SYSTEM_ERROR]: 'File system error',
  [ErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
};

/**
 * HTTP status code mapping for error codes
 */
export const ErrorCodeHttpStatus: Record<ErrorCode, number> = {
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.ENTITY_NOT_FOUND]: 404,
  [ErrorCode.CONNECTION_ERROR]: 503,
  [ErrorCode.QUERY_ERROR]: 500,
  [ErrorCode.TRANSACTION_ERROR]: 500,
  [ErrorCode.DUPLICATE_KEY]: 409,
  [ErrorCode.FOREIGN_KEY_VIOLATION]: 409,
  [ErrorCode.CONSTRAINT_VIOLATION]: 409,
  [ErrorCode.MIGRATION_ERROR]: 500,

  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INVALID_INPUT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCode.INVALID_FORMAT]: 400,
  [ErrorCode.OUT_OF_RANGE]: 400,
  [ErrorCode.INVALID_TYPE]: 400,
  [ErrorCode.SCHEMA_VALIDATION_FAILED]: 400,
  [ErrorCode.INVALID_UID_FORMAT]: 400,
  [ErrorCode.INVALID_TIMESTAMP]: 400,

  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.AI_PROVIDER_ERROR]: 502,
  [ErrorCode.RATE_LIMIT_ERROR]: 429,
  [ErrorCode.TIMEOUT_ERROR]: 504,
  [ErrorCode.NETWORK_ERROR]: 502,
  [ErrorCode.API_ERROR]: 502,
  [ErrorCode.AUTHENTICATION_FAILED]: 401,
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.QUOTA_EXCEEDED]: 429,
  [ErrorCode.INVALID_RESPONSE]: 502,

  [ErrorCode.DOMAIN_ERROR]: 422,
  [ErrorCode.SENSITIVITY_VIOLATION]: 403,
  [ErrorCode.LIFECYCLE_INVALID_TRANSITION]: 422,
  [ErrorCode.LIFECYCLE_EXPIRED]: 410,
  [ErrorCode.RELATIONSHIP_INVALID]: 422,
  [ErrorCode.CIRCULAR_DEPENDENCY]: 422,
  [ErrorCode.TENANT_ISOLATION_VIOLATION]: 403,
  [ErrorCode.CHECKSUM_MISMATCH]: 409,

  [ErrorCode.AUTH_ERROR]: 401,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.TOKEN_INVALID]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  [ErrorCode.CONTENT_ERROR]: 500,
  [ErrorCode.CONTENT_PROCESSING_ERROR]: 500,
  [ErrorCode.EMBEDDING_ERROR]: 500,
  [ErrorCode.TRANSFORMATION_ERROR]: 500,
  [ErrorCode.PODCAST_ERROR]: 500,
  [ErrorCode.INDEXING_ERROR]: 500,
  [ErrorCode.EXTRACTION_ERROR]: 500,
  [ErrorCode.CHUNKING_ERROR]: 500,
  [ErrorCode.VECTOR_OPERATION_ERROR]: 500,

  [ErrorCode.SYSTEM_ERROR]: 500,
  [ErrorCode.CONFIGURATION_ERROR]: 500,
  [ErrorCode.JOB_EXECUTION_ERROR]: 500,
  [ErrorCode.QUEUE_ERROR]: 500,
  [ErrorCode.CACHE_ERROR]: 500,
  [ErrorCode.FILE_SYSTEM_ERROR]: 500,
  [ErrorCode.UNKNOWN_ERROR]: 500,
};
