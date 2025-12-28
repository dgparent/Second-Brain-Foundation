import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';
export declare class ContentProcessingError extends SBFError {
    readonly contentId?: string;
    readonly contentType?: string;
    readonly stage?: 'extraction' | 'parsing' | 'chunking' | 'processing' | 'storage';
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        code?: ErrorCode;
        contentId?: string;
        contentType?: string;
        stage?: 'extraction' | 'parsing' | 'chunking' | 'processing' | 'storage';
    });
}
export declare class EmbeddingError extends SBFError {
    readonly provider?: string;
    readonly model?: string;
    readonly inputLength?: number;
    readonly maxInputLength?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        provider?: string;
        model?: string;
        inputLength?: number;
        maxInputLength?: number;
    });
    static inputTooLong(inputLength: number, maxInputLength: number, model?: string): EmbeddingError;
}
export declare class IndexingError extends SBFError {
    readonly indexName?: string;
    readonly documentId?: string;
    readonly operation?: 'create' | 'update' | 'delete' | 'search';
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        indexName?: string;
        documentId?: string;
        operation?: 'create' | 'update' | 'delete' | 'search';
    });
}
export declare class ExtractionError extends SBFError {
    readonly source?: string;
    readonly sourceType?: 'file' | 'url' | 'html' | 'pdf' | 'image' | 'audio' | 'video';
    readonly extractorName?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        source?: string;
        sourceType?: 'file' | 'url' | 'html' | 'pdf' | 'image' | 'audio' | 'video';
        extractorName?: string;
    });
    static unsupportedFileType(fileType: string): ExtractionError;
}
export declare class ChunkingError extends SBFError {
    readonly chunkerName?: string;
    readonly contentLength?: number;
    readonly chunkSize?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        chunkerName?: string;
        contentLength?: number;
        chunkSize?: number;
    });
}
export declare class VectorOperationError extends SBFError {
    readonly vectorStore?: string;
    readonly namespace?: string;
    readonly operation?: 'upsert' | 'query' | 'delete' | 'fetch';
    readonly vectorCount?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        vectorStore?: string;
        namespace?: string;
        operation?: 'upsert' | 'query' | 'delete' | 'fetch';
        vectorCount?: number;
    });
    static pinecone(message: string, options?: Partial<VectorOperationError>): VectorOperationError;
    static pgvector(message: string, options?: Partial<VectorOperationError>): VectorOperationError;
}
//# sourceMappingURL=content.d.ts.map