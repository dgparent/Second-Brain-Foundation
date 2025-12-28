/**
 * @sbf/content-engine - Types
 * 
 * Core types for content extraction and processing.
 */

/**
 * Content source types
 */
export type ContentSource = 'web' | 'pdf' | 'youtube' | 'audio' | 'text' | 'markdown';

/**
 * Content extraction status
 */
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Extracted content metadata
 */
export interface ContentMetadata {
  title?: string;
  author?: string;
  publishedAt?: string;
  description?: string;
  url?: string;
  duration?: number;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Extracted content result
 */
export interface ExtractedContent {
  /** Unique identifier for the content */
  id: string;
  
  /** Source type */
  source: ContentSource;
  
  /** Original source URL or path */
  sourceUri: string;
  
  /** Main text content */
  content: string;
  
  /** Metadata about the content */
  metadata: ContentMetadata;
  
  /** Extraction status */
  status: ExtractionStatus;
  
  /** Error message if failed */
  error?: string;
  
  /** When extraction was performed */
  extractedAt: string;
  
  /** Raw content (if available) */
  rawContent?: string;
}

/**
 * Content chunk for processing
 */
export interface ContentChunk {
  /** Chunk identifier */
  id: string;
  
  /** Parent content ID */
  contentId: string;
  
  /** Chunk index (0-based) */
  index: number;
  
  /** Chunk text content */
  text: string;
  
  /** Character offset in original content */
  startOffset: number;
  
  /** End character offset */
  endOffset: number;
  
  /** Token count estimate */
  tokenCount: number;
  
  /** Overlap with previous chunk (in tokens) */
  overlapTokens: number;
  
  /** Metadata inherited from parent */
  metadata?: ContentMetadata;
}

/**
 * Chunking options
 */
export interface ChunkingOptions {
  /** Target chunk size in tokens */
  chunkSize?: number;
  
  /** Overlap between chunks in tokens */
  chunkOverlap?: number;
  
  /** Separators to split on (in order of preference) */
  separators?: string[];
  
  /** Whether to preserve paragraphs */
  preserveParagraphs?: boolean;
  
  /** Minimum chunk size (avoid tiny chunks) */
  minChunkSize?: number;
  
  /** Include metadata in each chunk */
  includeMetadata?: boolean;
}

/**
 * Content extractor interface
 */
export interface ContentExtractor {
  /** Supported source types */
  readonly supportedSources: ContentSource[];
  
  /** Extract content from a source */
  extract(source: string, options?: ExtractorOptions): Promise<ExtractedContent>;
  
  /** Check if source is supported */
  supports(source: string): boolean;
}

/**
 * Extractor options
 */
export interface ExtractorOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** User agent for web requests */
  userAgent?: string;
  
  /** Additional headers */
  headers?: Record<string, string>;
  
  /** Whether to include raw content */
  includeRaw?: boolean;
  
  /** Maximum content length */
  maxLength?: number;
  
  /** Language hint for audio */
  language?: string;
}

/**
 * Pipeline stage result
 */
export interface PipelineStageResult {
  stage: string;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  /** Original content ID */
  contentId: string;
  
  /** Extracted content */
  content?: ExtractedContent;
  
  /** Processed chunks */
  chunks?: ContentChunk[];
  
  /** Pipeline execution stages */
  stages: PipelineStageResult[];
  
  /** Overall success */
  success: boolean;
  
  /** Total execution time */
  totalDuration: number;
  
  /** Error if failed */
  error?: string;
}

/**
 * Pipeline options
 */
export interface PipelineOptions {
  /** Extractor options */
  extractorOptions?: ExtractorOptions;
  
  /** Chunking options */
  chunkingOptions?: ChunkingOptions;
  
  /** Whether to skip chunking */
  skipChunking?: boolean;
  
  /** Custom extractors */
  extractors?: ContentExtractor[];
}
