/**
 * @sbf/content-engine - Content Chunker
 * 
 * Splits content into overlapping chunks for embedding and processing.
 */

import { ContentChunk, ChunkingOptions, ExtractedContent } from './types';

/**
 * Default chunking options
 */
const DEFAULT_OPTIONS: Required<ChunkingOptions> = {
  chunkSize: 512,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '],
  preserveParagraphs: true,
  minChunkSize: 100,
  includeMetadata: false,
};

/**
 * Simple token count estimation (4 chars per token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Content Chunker - Splits text into overlapping chunks
 * 
 * Uses recursive character splitting with semantic separators
 * to create chunks that respect document structure.
 */
export class ContentChunker {
  private options: Required<ChunkingOptions>;

  constructor(options?: ChunkingOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Chunk extracted content into smaller pieces
   */
  chunk(content: ExtractedContent): ContentChunk[] {
    const text = content.content;
    if (!text || text.trim().length === 0) {
      return [];
    }

    const splits = this.splitText(text, this.options.separators);
    const chunks = this.createChunks(splits, content.id);

    // Add metadata if requested
    if (this.options.includeMetadata) {
      return chunks.map(chunk => ({
        ...chunk,
        metadata: content.metadata,
      }));
    }

    return chunks;
  }

  /**
   * Chunk raw text directly
   */
  chunkText(text: string, contentId: string): ContentChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const splits = this.splitText(text, this.options.separators);
    return this.createChunks(splits, contentId);
  }

  /**
   * Recursively split text using separators
   */
  private splitText(text: string, separators: string[]): string[] {
    const separator = separators[0];
    const remainingSeparators = separators.slice(1);

    // Split by current separator
    const splits = separator ? text.split(separator) : [text];
    
    const results: string[] = [];
    
    for (const split of splits) {
      const trimmed = split.trim();
      if (!trimmed) continue;

      const tokens = estimateTokens(trimmed);
      
      // If split is small enough or no more separators, keep it
      if (tokens <= this.options.chunkSize || remainingSeparators.length === 0) {
        results.push(separator ? trimmed + separator : trimmed);
      } else {
        // Recursively split with next separator
        results.push(...this.splitText(trimmed, remainingSeparators));
      }
    }

    return results;
  }

  /**
   * Create chunks from splits with overlap
   */
  private createChunks(splits: string[], contentId: string): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;
    let currentOffset = 0;
    let chunkStartOffset = 0;

    for (const split of splits) {
      const splitTokens = estimateTokens(split);

      // If adding this split would exceed chunk size
      if (currentTokens + splitTokens > this.options.chunkSize && currentChunk.length > 0) {
        // Create chunk from current content
        const chunkText = currentChunk.join('').trim();
        if (estimateTokens(chunkText) >= this.options.minChunkSize) {
          chunks.push(this.createChunk(
            contentId,
            chunks.length,
            chunkText,
            chunkStartOffset,
            currentOffset,
            chunks.length > 0 ? this.options.chunkOverlap : 0
          ));
        }

        // Start new chunk with overlap from previous
        currentChunk = this.getOverlapContent(currentChunk);
        currentTokens = estimateTokens(currentChunk.join(''));
        chunkStartOffset = currentOffset - currentChunk.join('').length;
      }

      currentChunk.push(split);
      currentTokens += splitTokens;
      currentOffset += split.length;
    }

    // Add final chunk
    if (currentChunk.length > 0) {
      const chunkText = currentChunk.join('').trim();
      if (chunkText.length > 0) {
        const tokenCount = estimateTokens(chunkText);
        // Only add if it's substantial or it's the only chunk
        if (tokenCount >= this.options.minChunkSize || chunks.length === 0) {
          chunks.push(this.createChunk(
            contentId,
            chunks.length,
            chunkText,
            chunkStartOffset,
            currentOffset,
            chunks.length > 0 ? this.options.chunkOverlap : 0
          ));
        } else if (chunks.length > 0 && chunkText.length > 0) {
          // Append small final chunk to previous
          const lastChunk = chunks[chunks.length - 1];
          lastChunk.text = lastChunk.text + ' ' + chunkText;
          lastChunk.endOffset = currentOffset;
          lastChunk.tokenCount = estimateTokens(lastChunk.text);
        }
      }
    }

    return chunks;
  }

  /**
   * Get content for overlap from current chunk
   */
  private getOverlapContent(currentChunk: string[]): string[] {
    if (this.options.chunkOverlap === 0 || currentChunk.length === 0) {
      return [];
    }

    const overlap: string[] = [];
    let overlapTokens = 0;

    // Take content from end for overlap
    for (let i = currentChunk.length - 1; i >= 0 && overlapTokens < this.options.chunkOverlap; i--) {
      overlap.unshift(currentChunk[i]);
      overlapTokens += estimateTokens(currentChunk[i]);
    }

    return overlap;
  }

  /**
   * Create a chunk object
   */
  private createChunk(
    contentId: string,
    index: number,
    text: string,
    startOffset: number,
    endOffset: number,
    overlapTokens: number
  ): ContentChunk {
    return {
      id: `${contentId}-chunk-${index}`,
      contentId,
      index,
      text,
      startOffset,
      endOffset,
      tokenCount: estimateTokens(text),
      overlapTokens,
    };
  }

  /**
   * Merge chunks back into content (for verification)
   */
  mergeChunks(chunks: ContentChunk[]): string {
    if (chunks.length === 0) return '';
    
    // Sort by index
    const sorted = [...chunks].sort((a, b) => a.index - b.index);
    
    // Use offsets to reconstruct
    let result = sorted[0].text;
    
    for (let i = 1; i < sorted.length; i++) {
      const chunk = sorted[i];
      const prevChunk = sorted[i - 1];
      
      // Find where the overlap ends in current chunk
      if (chunk.overlapTokens > 0) {
        const overlapChars = chunk.overlapTokens * 4; // Approximate
        const uniquePart = chunk.text.slice(Math.min(overlapChars, chunk.text.length / 2));
        result += ' ' + uniquePart;
      } else {
        result += ' ' + chunk.text;
      }
    }
    
    return result;
  }

  /**
   * Update chunking options
   */
  setOptions(options: Partial<ChunkingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current options
   */
  getOptions(): Required<ChunkingOptions> {
    return { ...this.options };
  }
}
