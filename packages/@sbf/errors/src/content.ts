/**
 * @sbf/errors - Content Processing Errors
 * 
 * Errors related to content processing, embedding generation,
 * indexing, and vector operations.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * General content processing error
 */
export class ContentProcessingError extends SBFError {
  public readonly contentId?: string;
  public readonly contentType?: string;
  public readonly stage?: 'extraction' | 'parsing' | 'chunking' | 'processing' | 'storage';

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      code?: ErrorCode;
      contentId?: string;
      contentType?: string;
      stage?: 'extraction' | 'parsing' | 'chunking' | 'processing' | 'storage';
    }
  ) {
    super({
      ...options,
      code: options.code || ErrorCode.CONTENT_PROCESSING_ERROR,
      details: {
        contentId: options.contentId,
        contentType: options.contentType,
        stage: options.stage,
        ...options.details,
      },
    });
    this.contentId = options.contentId;
    this.contentType = options.contentType;
    this.stage = options.stage;
  }
}

/**
 * Embedding generation error
 */
export class EmbeddingError extends SBFError {
  public readonly provider?: string;
  public readonly model?: string;
  public readonly inputLength?: number;
  public readonly maxInputLength?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      provider?: string;
      model?: string;
      inputLength?: number;
      maxInputLength?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.EMBEDDING_ERROR,
      details: {
        provider: options.provider,
        model: options.model,
        inputLength: options.inputLength,
        maxInputLength: options.maxInputLength,
        ...options.details,
      },
    });
    this.provider = options.provider;
    this.model = options.model;
    this.inputLength = options.inputLength;
    this.maxInputLength = options.maxInputLength;
  }

  /**
   * Create error for input too long
   */
  static inputTooLong(inputLength: number, maxInputLength: number, model?: string): EmbeddingError {
    return new EmbeddingError({
      message: `Input too long for embedding: ${inputLength} tokens (max: ${maxInputLength})`,
      inputLength,
      maxInputLength,
      model,
    });
  }
}

/**
 * Content indexing error
 */
export class IndexingError extends SBFError {
  public readonly indexName?: string;
  public readonly documentId?: string;
  public readonly operation?: 'create' | 'update' | 'delete' | 'search';

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      indexName?: string;
      documentId?: string;
      operation?: 'create' | 'update' | 'delete' | 'search';
    }
  ) {
    super({
      ...options,
      code: ErrorCode.INDEXING_ERROR,
      details: {
        indexName: options.indexName,
        documentId: options.documentId,
        operation: options.operation,
        ...options.details,
      },
    });
    this.indexName = options.indexName;
    this.documentId = options.documentId;
    this.operation = options.operation;
  }
}

/**
 * Content extraction error (extracting from files, URLs, etc.)
 */
export class ExtractionError extends SBFError {
  public readonly source?: string;
  public readonly sourceType?: 'file' | 'url' | 'html' | 'pdf' | 'image' | 'audio' | 'video';
  public readonly extractorName?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      source?: string;
      sourceType?: 'file' | 'url' | 'html' | 'pdf' | 'image' | 'audio' | 'video';
      extractorName?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.EXTRACTION_ERROR,
      details: {
        source: options.source,
        sourceType: options.sourceType,
        extractorName: options.extractorName,
        ...options.details,
      },
    });
    this.source = options.source;
    this.sourceType = options.sourceType;
    this.extractorName = options.extractorName;
  }

  /**
   * Create error for unsupported file type
   */
  static unsupportedFileType(fileType: string): ExtractionError {
    return new ExtractionError({
      message: `Unsupported file type: ${fileType}`,
      sourceType: 'file',
      details: { fileType },
    });
  }
}

/**
 * Content chunking error
 */
export class ChunkingError extends SBFError {
  public readonly chunkerName?: string;
  public readonly contentLength?: number;
  public readonly chunkSize?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      chunkerName?: string;
      contentLength?: number;
      chunkSize?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.CHUNKING_ERROR,
      details: {
        chunkerName: options.chunkerName,
        contentLength: options.contentLength,
        chunkSize: options.chunkSize,
        ...options.details,
      },
    });
    this.chunkerName = options.chunkerName;
    this.contentLength = options.contentLength;
    this.chunkSize = options.chunkSize;
  }
}

/**
 * Vector operation error (Pinecone, pgvector, etc.)
 */
export class VectorOperationError extends SBFError {
  public readonly vectorStore?: string;
  public readonly namespace?: string;
  public readonly operation?: 'upsert' | 'query' | 'delete' | 'fetch';
  public readonly vectorCount?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      vectorStore?: string;
      namespace?: string;
      operation?: 'upsert' | 'query' | 'delete' | 'fetch';
      vectorCount?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.VECTOR_OPERATION_ERROR,
      details: {
        vectorStore: options.vectorStore,
        namespace: options.namespace,
        operation: options.operation,
        vectorCount: options.vectorCount,
        ...options.details,
      },
    });
    this.vectorStore = options.vectorStore;
    this.namespace = options.namespace;
    this.operation = options.operation;
    this.vectorCount = options.vectorCount;
  }

  /**
   * Create error for Pinecone operations
   */
  static pinecone(message: string, options?: Partial<VectorOperationError>): VectorOperationError {
    return new VectorOperationError({
      message,
      vectorStore: 'pinecone',
      ...options,
    });
  }

  /**
   * Create error for pgvector operations
   */
  static pgvector(message: string, options?: Partial<VectorOperationError>): VectorOperationError {
    return new VectorOperationError({
      message,
      vectorStore: 'pgvector',
      ...options,
    });
  }
}
