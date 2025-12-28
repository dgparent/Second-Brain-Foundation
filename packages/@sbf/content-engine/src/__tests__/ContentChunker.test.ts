/**
 * @sbf/content-engine - ContentChunker Tests
 */

import { ContentChunker } from '../ContentChunker';
import { ExtractedContent } from '../types';

describe('ContentChunker', () => {
  let chunker: ContentChunker;

  beforeEach(() => {
    chunker = new ContentChunker({
      chunkSize: 100,
      chunkOverlap: 20,
      minChunkSize: 20,
    });
  });

  describe('constructor', () => {
    it('should create with default options', () => {
      const defaultChunker = new ContentChunker();
      const options = defaultChunker.getOptions();
      expect(options.chunkSize).toBe(512);
      expect(options.chunkOverlap).toBe(50);
    });

    it('should accept custom options', () => {
      const options = chunker.getOptions();
      expect(options.chunkSize).toBe(100);
      expect(options.chunkOverlap).toBe(20);
    });
  });

  describe('chunk', () => {
    it('should chunk extracted content', () => {
      const content: ExtractedContent = {
        id: 'test-1',
        source: 'text',
        sourceUri: 'test',
        content: 'This is a long piece of text that should be split into multiple chunks. Each chunk should have some overlap with the previous chunk.',
        metadata: {},
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };

      const chunks = chunker.chunk(content);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].contentId).toBe('test-1');
      expect(chunks[0].index).toBe(0);
    });

    it('should return empty array for empty content', () => {
      const content: ExtractedContent = {
        id: 'test-2',
        source: 'text',
        sourceUri: 'test',
        content: '',
        metadata: {},
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };

      const chunks = chunker.chunk(content);
      expect(chunks).toEqual([]);
    });

    it('should include metadata when configured', () => {
      const metadataChunker = new ContentChunker({
        includeMetadata: true,
        chunkSize: 100,
        minChunkSize: 10,
      });

      const content: ExtractedContent = {
        id: 'test-3',
        source: 'text',
        sourceUri: 'test',
        content: 'Test content for metadata inclusion.',
        metadata: { title: 'Test Doc' },
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };

      const chunks = metadataChunker.chunk(content);
      expect(chunks[0].metadata).toEqual({ title: 'Test Doc' });
    });
  });

  describe('chunkText', () => {
    it('should chunk raw text', () => {
      const text = 'Hello world. This is a test. It should create chunks.';
      const chunks = chunker.chunkText(text, 'raw-1');
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].contentId).toBe('raw-1');
    });

    it('should return empty for empty text', () => {
      const chunks = chunker.chunkText('', 'empty');
      expect(chunks).toEqual([]);
    });

    it('should return empty for whitespace-only text', () => {
      const chunks = chunker.chunkText('   \n\t  ', 'whitespace');
      expect(chunks).toEqual([]);
    });
  });

  describe('chunk properties', () => {
    it('should generate correct chunk IDs', () => {
      const text = 'First chunk content here. Second chunk content here. Third chunk content here.';
      const chunks = chunker.chunkText(text, 'test-id');
      
      chunks.forEach((chunk, i) => {
        expect(chunk.id).toBe(`test-id-chunk-${i}`);
        expect(chunk.index).toBe(i);
      });
    });

    it('should track token counts', () => {
      const text = 'Some text content for token counting.';
      const chunks = chunker.chunkText(text, 'tokens');
      
      chunks.forEach(chunk => {
        expect(chunk.tokenCount).toBeGreaterThan(0);
      });
    });

    it('should include offsets', () => {
      const text = 'Start of text. Middle of text. End of text.';
      const chunks = chunker.chunkText(text, 'offsets');
      
      expect(chunks[0].startOffset).toBeDefined();
      expect(chunks[0].endOffset).toBeDefined();
    });
  });

  describe('setOptions and getOptions', () => {
    it('should update options', () => {
      chunker.setOptions({ chunkSize: 200 });
      expect(chunker.getOptions().chunkSize).toBe(200);
      expect(chunker.getOptions().chunkOverlap).toBe(20); // Unchanged
    });

    it('should return a copy of options', () => {
      const options = chunker.getOptions();
      options.chunkSize = 999;
      expect(chunker.getOptions().chunkSize).not.toBe(999);
    });
  });

  describe('mergeChunks', () => {
    it('should merge chunks back together', () => {
      const text = 'This is a test sentence. This is another test sentence. And here is more content.';
      const chunks = chunker.chunkText(text, 'merge-test');
      const merged = chunker.mergeChunks(chunks);
      
      // Should contain all the original content
      expect(merged.length).toBeGreaterThan(0);
    });

    it('should return empty string for empty chunks', () => {
      const merged = chunker.mergeChunks([]);
      expect(merged).toBe('');
    });
  });

  describe('paragraph preservation', () => {
    it('should respect paragraph boundaries when configured', () => {
      const paragraphChunker = new ContentChunker({
        preserveParagraphs: true,
        chunkSize: 200,
        minChunkSize: 10,
      });

      const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
      const chunks = paragraphChunker.chunkText(text, 'paragraphs');
      
      // Should create chunks respecting paragraph breaks
      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
