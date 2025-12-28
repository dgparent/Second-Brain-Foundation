/**
 * @sbf/content-engine
 * 
 * Content ingestion pipeline for Second Brain Foundation.
 * Extracts, processes, and chunks content from multiple sources.
 */

// Main pipeline
export { ContentPipeline } from './ContentPipeline';

// Chunking
export { ContentChunker } from './ContentChunker';

// Extractors
export {
  WebScraper,
  PDFExtractor,
  YouTubeExtractor,
  AudioExtractor,
} from './extractors';

// Re-export AudioTranscriptionConfig for convenience
export type { AudioTranscriptionConfig } from './extractors/AudioExtractor';

// Types
export type {
  // Source types
  ContentSource,
  
  // Content types
  ExtractedContent,
  ContentMetadata,
  ContentChunk,
  
  // Options
  ExtractorOptions,
  ChunkingOptions,
  PipelineOptions,
  
  // Results
  PipelineResult,
  PipelineStageResult,
  
  // Interfaces
  ContentExtractor,
} from './types';
