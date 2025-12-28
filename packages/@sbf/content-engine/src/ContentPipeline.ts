/**
 * @sbf/content-engine - Content Pipeline
 * 
 * Orchestrates content extraction, processing, and chunking.
 */

import {
  ContentExtractor,
  ExtractedContent,
  ContentChunk,
  PipelineResult,
  PipelineStageResult,
  PipelineOptions,
  ExtractorOptions,
  ChunkingOptions,
} from './types';
import { ContentChunker } from './ContentChunker';
import { WebScraper } from './extractors/WebScraper';
import { PDFExtractor } from './extractors/PDFExtractor';
import { YouTubeExtractor } from './extractors/YouTubeExtractor';
import { AudioExtractor, AudioTranscriptionConfig } from './extractors/AudioExtractor';

/**
 * Content Pipeline - Orchestrates content ingestion
 * 
 * Handles:
 * 1. Source detection and extractor selection
 * 2. Content extraction
 * 3. Content chunking
 * 4. Error handling and retries
 * 
 * @example
 * ```typescript
 * const pipeline = new ContentPipeline();
 * 
 * // Process a web page
 * const result = await pipeline.process('https://example.com/article');
 * console.log(result.content?.content);
 * console.log(result.chunks?.length);
 * 
 * // Process a PDF
 * const pdfResult = await pipeline.process('./document.pdf');
 * ```
 */
export class ContentPipeline {
  private extractors: ContentExtractor[];
  private chunker: ContentChunker;
  private defaultOptions: PipelineOptions;

  constructor(options?: PipelineOptions & { audioConfig?: AudioTranscriptionConfig }) {
    this.defaultOptions = options || {};
    
    // Initialize default extractors
    this.extractors = options?.extractors || [
      new WebScraper(),
      new PDFExtractor(),
      new YouTubeExtractor(),
      new AudioExtractor(options?.audioConfig),
    ];

    // Initialize chunker
    this.chunker = new ContentChunker(options?.chunkingOptions);
  }

  /**
   * Process a content source through the pipeline
   */
  async process(source: string, options?: PipelineOptions): Promise<PipelineResult> {
    const opts = { ...this.defaultOptions, ...options };
    const stages: PipelineStageResult[] = [];
    const startTime = Date.now();

    let content: ExtractedContent | undefined;
    let chunks: ContentChunk[] | undefined;

    try {
      // Stage 1: Find appropriate extractor
      const extractorStart = Date.now();
      const extractor = this.findExtractor(source);
      
      if (!extractor) {
        return this.createFailedResult(
          source,
          stages,
          startTime,
          `No extractor found for source: ${source}`
        );
      }

      stages.push({
        stage: 'extractor_selection',
        success: true,
        duration: Date.now() - extractorStart,
      });

      // Stage 2: Extract content
      const extractStart = Date.now();
      content = await extractor.extract(source, opts.extractorOptions);
      
      stages.push({
        stage: 'extraction',
        success: content.status === 'completed',
        duration: Date.now() - extractStart,
        error: content.error,
      });

      if (content.status === 'failed') {
        return this.createFailedResult(
          content.id,
          stages,
          startTime,
          content.error || 'Extraction failed'
        );
      }

      // Stage 3: Chunk content (optional)
      if (!opts.skipChunking && content.content) {
        const chunkStart = Date.now();
        
        try {
          chunks = this.chunker.chunk(content);
          
          stages.push({
            stage: 'chunking',
            success: true,
            duration: Date.now() - chunkStart,
          });
        } catch (error) {
          stages.push({
            stage: 'chunking',
            success: false,
            duration: Date.now() - chunkStart,
            error: error instanceof Error ? error.message : 'Chunking failed',
          });
        }
      }

      return {
        contentId: content.id,
        content,
        chunks,
        stages,
        success: true,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      return this.createFailedResult(
        content?.id || 'unknown',
        stages,
        startTime,
        error instanceof Error ? error.message : 'Pipeline failed'
      );
    }
  }

  /**
   * Process multiple sources in parallel
   */
  async processMany(
    sources: string[],
    options?: PipelineOptions & { concurrency?: number }
  ): Promise<PipelineResult[]> {
    const concurrency = options?.concurrency || 3;
    const results: PipelineResult[] = [];
    
    // Process in batches
    for (let i = 0; i < sources.length; i += concurrency) {
      const batch = sources.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(source => this.process(source, options))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Extract content only (no chunking)
   */
  async extract(source: string, options?: ExtractorOptions): Promise<ExtractedContent> {
    const extractor = this.findExtractor(source);
    
    if (!extractor) {
      return {
        id: `unknown-${Date.now()}`,
        source: 'text',
        sourceUri: source,
        content: '',
        metadata: {},
        status: 'failed',
        error: `No extractor found for source: ${source}`,
        extractedAt: new Date().toISOString(),
      };
    }

    return extractor.extract(source, options);
  }

  /**
   * Chunk content only (already extracted)
   */
  chunkContent(content: ExtractedContent, options?: ChunkingOptions): ContentChunk[] {
    if (options) {
      const chunker = new ContentChunker(options);
      return chunker.chunk(content);
    }
    return this.chunker.chunk(content);
  }

  /**
   * Chunk raw text
   */
  chunkText(text: string, contentId: string, options?: ChunkingOptions): ContentChunk[] {
    if (options) {
      const chunker = new ContentChunker(options);
      return chunker.chunkText(text, contentId);
    }
    return this.chunker.chunkText(text, contentId);
  }

  /**
   * Find appropriate extractor for source
   */
  private findExtractor(source: string): ContentExtractor | undefined {
    return this.extractors.find(e => e.supports(source));
  }

  /**
   * Create a failed result
   */
  private createFailedResult(
    contentId: string,
    stages: PipelineStageResult[],
    startTime: number,
    error: string
  ): PipelineResult {
    return {
      contentId,
      stages,
      success: false,
      totalDuration: Date.now() - startTime,
      error,
    };
  }

  /**
   * Add a custom extractor
   */
  addExtractor(extractor: ContentExtractor): void {
    this.extractors.push(extractor);
  }

  /**
   * Remove an extractor by source type
   */
  removeExtractor(sourceType: string): void {
    this.extractors = this.extractors.filter(
      e => !e.supportedSources.includes(sourceType as any)
    );
  }

  /**
   * Get available extractors
   */
  getExtractors(): ContentExtractor[] {
    return [...this.extractors];
  }

  /**
   * Update chunking options
   */
  setChunkingOptions(options: ChunkingOptions): void {
    this.chunker.setOptions(options);
  }

  /**
   * Get current chunking options
   */
  getChunkingOptions(): Required<ChunkingOptions> {
    return this.chunker.getOptions();
  }
}
