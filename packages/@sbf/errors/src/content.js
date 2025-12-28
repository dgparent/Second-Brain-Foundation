"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorOperationError = exports.ChunkingError = exports.ExtractionError = exports.IndexingError = exports.EmbeddingError = exports.ContentProcessingError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class ContentProcessingError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: options.code || codes_1.ErrorCode.CONTENT_PROCESSING_ERROR,
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
exports.ContentProcessingError = ContentProcessingError;
class EmbeddingError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.EMBEDDING_ERROR,
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
    static inputTooLong(inputLength, maxInputLength, model) {
        return new EmbeddingError({
            message: `Input too long for embedding: ${inputLength} tokens (max: ${maxInputLength})`,
            inputLength,
            maxInputLength,
            model,
        });
    }
}
exports.EmbeddingError = EmbeddingError;
class IndexingError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.INDEXING_ERROR,
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
exports.IndexingError = IndexingError;
class ExtractionError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.EXTRACTION_ERROR,
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
    static unsupportedFileType(fileType) {
        return new ExtractionError({
            message: `Unsupported file type: ${fileType}`,
            sourceType: 'file',
            details: { fileType },
        });
    }
}
exports.ExtractionError = ExtractionError;
class ChunkingError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.CHUNKING_ERROR,
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
exports.ChunkingError = ChunkingError;
class VectorOperationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.VECTOR_OPERATION_ERROR,
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
    static pinecone(message, options) {
        return new VectorOperationError({
            message,
            vectorStore: 'pinecone',
            ...options,
        });
    }
    static pgvector(message, options) {
        return new VectorOperationError({
            message,
            vectorStore: 'pgvector',
            ...options,
        });
    }
}
exports.VectorOperationError = VectorOperationError;
//# sourceMappingURL=content.js.map