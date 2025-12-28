/**
 * @sbf/content-engine - ContentPipeline Tests
 */

import { ContentPipeline } from '../ContentPipeline';
import { ContentExtractor, ExtractedContent, ContentSource } from '../types';

// Mock extractor for testing
class MockExtractor implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['text'];

  supports(source: string): boolean {
    return source.startsWith('mock://');
  }

  async extract(source: string): Promise<ExtractedContent> {
    return {
      id: `mock-${Date.now()}`,
      source: 'text',
      sourceUri: source,
      content: 'This is mock extracted content. It has enough text to be chunked into pieces.',
      metadata: { title: 'Mock Document' },
      status: 'completed',
      extractedAt: new Date().toISOString(),
    };
  }
}

// Failing mock extractor
class FailingExtractor implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['text'];

  supports(source: string): boolean {
    return source.startsWith('fail://');
  }

  async extract(source: string): Promise<ExtractedContent> {
    return {
      id: `fail-${Date.now()}`,
      source: 'text',
      sourceUri: source,
      content: '',
      metadata: {},
      status: 'failed',
      error: 'Intentional failure for testing',
      extractedAt: new Date().toISOString(),
    };
  }
}

describe('ContentPipeline', () => {
  describe('constructor', () => {
    it('should create with default extractors', () => {
      const pipeline = new ContentPipeline();
      const extractors = pipeline.getExtractors();
      expect(extractors.length).toBeGreaterThan(0);
    });

    it('should accept custom extractors', () => {
      const pipeline = new ContentPipeline({
        extractors: [new MockExtractor()],
      });
      const extractors = pipeline.getExtractors();
      expect(extractors.length).toBe(1);
    });

    it('should accept chunking options', () => {
      const pipeline = new ContentPipeline({
        chunkingOptions: { chunkSize: 256 },
      });
      expect(pipeline.getChunkingOptions().chunkSize).toBe(256);
    });
  });

  describe('process', () => {
    let pipeline: ContentPipeline;

    beforeEach(() => {
      pipeline = new ContentPipeline({
        extractors: [new MockExtractor(), new FailingExtractor()],
        chunkingOptions: { chunkSize: 50, minChunkSize: 10 },
      });
    });

    it('should process content through pipeline', async () => {
      const result = await pipeline.process('mock://test-doc');
      
      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content?.status).toBe('completed');
      expect(result.stages.length).toBeGreaterThan(0);
    });

    it('should chunk content when not skipped', async () => {
      const result = await pipeline.process('mock://test-doc');
      
      expect(result.chunks).toBeDefined();
      expect(result.chunks?.length).toBeGreaterThan(0);
    });

    it('should skip chunking when requested', async () => {
      const result = await pipeline.process('mock://test-doc', {
        skipChunking: true,
      });
      
      expect(result.success).toBe(true);
      expect(result.chunks).toBeUndefined();
    });

    it('should return failed result for unknown source', async () => {
      const result = await pipeline.process('unknown://something');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No extractor found');
    });

    it('should return failed result when extractor fails', async () => {
      const result = await pipeline.process('fail://test');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should track stage durations', async () => {
      const result = await pipeline.process('mock://test-doc');
      
      result.stages.forEach(stage => {
        expect(stage.duration).toBeDefined();
        expect(stage.duration).toBeGreaterThanOrEqual(0);
      });
    });

    it('should report total duration', async () => {
      const result = await pipeline.process('mock://test-doc');
      expect(result.totalDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('processMany', () => {
    let pipeline: ContentPipeline;

    beforeEach(() => {
      pipeline = new ContentPipeline({
        extractors: [new MockExtractor()],
        chunkingOptions: { chunkSize: 50, minChunkSize: 10 },
      });
    });

    it('should process multiple sources', async () => {
      const sources = ['mock://doc1', 'mock://doc2', 'mock://doc3'];
      const results = await pipeline.processMany(sources);
      
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should respect concurrency option', async () => {
      const sources = Array(5).fill('mock://doc').map((s, i) => `${s}${i}`);
      const results = await pipeline.processMany(sources, { concurrency: 2 });
      
      expect(results.length).toBe(5);
    });
  });

  describe('extract', () => {
    it('should extract without chunking', async () => {
      const pipeline = new ContentPipeline({
        extractors: [new MockExtractor()],
      });

      const content = await pipeline.extract('mock://test');
      expect(content.status).toBe('completed');
      expect(content.content).toBeDefined();
    });

    it('should return failed content for unknown source', async () => {
      const pipeline = new ContentPipeline({
        extractors: [new MockExtractor()],
      });

      const content = await pipeline.extract('unknown://test');
      expect(content.status).toBe('failed');
    });
  });

  describe('chunkContent', () => {
    it('should chunk already extracted content', () => {
      const pipeline = new ContentPipeline({
        chunkingOptions: { chunkSize: 50, minChunkSize: 10 },
      });

      const content: ExtractedContent = {
        id: 'test-1',
        source: 'text',
        sourceUri: 'test',
        content: 'Some content to be chunked into multiple parts.',
        metadata: {},
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };

      const chunks = pipeline.chunkContent(content);
      expect(chunks.length).toBeGreaterThan(0);
    });

    it('should accept custom options', () => {
      const pipeline = new ContentPipeline();

      const content: ExtractedContent = {
        id: 'test-2',
        source: 'text',
        sourceUri: 'test',
        content: 'Short text.',
        metadata: {},
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };

      const chunks = pipeline.chunkContent(content, { chunkSize: 1000, minChunkSize: 1 });
      expect(chunks.length).toBe(1);
    });
  });

  describe('chunkText', () => {
    it('should chunk raw text', () => {
      const pipeline = new ContentPipeline({
        chunkingOptions: { chunkSize: 50, minChunkSize: 10 },
      });

      const chunks = pipeline.chunkText('Some text to chunk.', 'text-1');
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].contentId).toBe('text-1');
    });
  });

  describe('extractor management', () => {
    it('should add custom extractor', () => {
      const pipeline = new ContentPipeline({ extractors: [] });
      pipeline.addExtractor(new MockExtractor());
      
      expect(pipeline.getExtractors().length).toBe(1);
    });

    it('should remove extractor by source type', () => {
      const pipeline = new ContentPipeline({
        extractors: [new MockExtractor()],
      });

      pipeline.removeExtractor('text');
      expect(pipeline.getExtractors().length).toBe(0);
    });
  });

  describe('chunking options management', () => {
    it('should update chunking options', () => {
      const pipeline = new ContentPipeline();
      pipeline.setChunkingOptions({ chunkSize: 1024 });
      
      expect(pipeline.getChunkingOptions().chunkSize).toBe(1024);
    });
  });
});
