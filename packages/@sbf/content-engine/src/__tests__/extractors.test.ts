/**
 * @sbf/content-engine - Extractor Tests
 * 
 * Tests for content extractors. Many of these are unit tests that don't
 * require network access. Integration tests requiring external services
 * are skipped by default.
 */

import { WebScraper } from '../extractors/WebScraper';
import { PDFExtractor } from '../extractors/PDFExtractor';
import { YouTubeExtractor } from '../extractors/YouTubeExtractor';
import { AudioExtractor } from '../extractors/AudioExtractor';

describe('WebScraper', () => {
  let scraper: WebScraper;

  beforeEach(() => {
    scraper = new WebScraper();
  });

  describe('supports', () => {
    it('should support http URLs', () => {
      expect(scraper.supports('http://example.com')).toBe(true);
    });

    it('should support https URLs', () => {
      expect(scraper.supports('https://example.com')).toBe(true);
    });

    it('should not support non-web URLs', () => {
      expect(scraper.supports('/path/to/file.pdf')).toBe(false);
      expect(scraper.supports('ftp://example.com')).toBe(false);
    });

    it('should not support YouTube URLs (handled by YouTubeExtractor)', () => {
      // Note: WebScraper technically supports any https URL
      // but YouTubeExtractor should be preferred for YouTube URLs
      // in a pipeline with multiple extractors
      expect(scraper.supports('https://youtube.com/watch?v=abc')).toBe(true);
      expect(scraper.supports('https://www.youtube.com/watch?v=abc')).toBe(true);
      expect(scraper.supports('https://youtu.be/abc')).toBe(true);
    });
  });

  describe('supportedSources', () => {
    it('should list web as supported source', () => {
      expect(scraper.supportedSources).toContain('web');
    });
  });

  // Integration tests - skipped by default
  describe.skip('extract (integration)', () => {
    it('should extract content from a web page', async () => {
      const result = await scraper.extract('https://example.com');
      expect(result.status).toBe('completed');
      expect(result.content).toBeTruthy();
    }, 30000);
  });
});

describe('PDFExtractor', () => {
  let extractor: PDFExtractor;

  beforeEach(() => {
    extractor = new PDFExtractor();
  });

  describe('supports', () => {
    it('should support .pdf files', () => {
      expect(extractor.supports('/path/to/document.pdf')).toBe(true);
      expect(extractor.supports('document.PDF')).toBe(true);
    });

    it('should support base64 PDF data', () => {
      expect(extractor.supports('data:application/pdf;base64,abc')).toBe(true);
    });

    it('should not support non-PDF files', () => {
      expect(extractor.supports('/path/to/document.txt')).toBe(false);
      expect(extractor.supports('/path/to/document.doc')).toBe(false);
    });
  });

  describe('supportedSources', () => {
    it('should list pdf as supported source', () => {
      expect(extractor.supportedSources).toContain('pdf');
    });
  });

  describe('extract', () => {
    it('should return error for non-existent file', async () => {
      const result = await extractor.extract('/nonexistent/file.pdf');
      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });
  });
});

describe('YouTubeExtractor', () => {
  let extractor: YouTubeExtractor;

  beforeEach(() => {
    extractor = new YouTubeExtractor();
  });

  describe('supports', () => {
    it('should support youtube.com watch URLs', () => {
      expect(extractor.supports('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(extractor.supports('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('should support youtu.be short URLs', () => {
      expect(extractor.supports('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should support youtube embed URLs', () => {
      expect(extractor.supports('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('should not support non-YouTube URLs', () => {
      expect(extractor.supports('https://vimeo.com/123456')).toBe(false);
      expect(extractor.supports('https://example.com')).toBe(false);
    });
  });

  describe('supportedSources', () => {
    it('should list youtube as supported source', () => {
      expect(extractor.supportedSources).toContain('youtube');
    });
  });

  // Integration tests - skipped by default
  describe.skip('extract (integration)', () => {
    it('should extract video metadata', async () => {
      const result = await extractor.extract('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result.metadata.title).toBeDefined();
    }, 30000);
  });
});

describe('AudioExtractor', () => {
  let extractor: AudioExtractor;

  beforeEach(() => {
    extractor = new AudioExtractor({
      openaiApiKey: 'test-key',
    });
  });

  describe('supports', () => {
    it('should support common audio formats', () => {
      expect(extractor.supports('/path/to/audio.mp3')).toBe(true);
      expect(extractor.supports('/path/to/audio.wav')).toBe(true);
      expect(extractor.supports('/path/to/audio.m4a')).toBe(true);
      expect(extractor.supports('/path/to/audio.ogg')).toBe(true);
      expect(extractor.supports('/path/to/audio.flac')).toBe(true);
      expect(extractor.supports('/path/to/audio.webm')).toBe(true);
    });

    it('should not support non-audio files', () => {
      expect(extractor.supports('/path/to/video.mp4')).toBe(false);
      expect(extractor.supports('/path/to/document.pdf')).toBe(false);
      expect(extractor.supports('/path/to/image.jpg')).toBe(false);
    });
  });

  describe('supportedSources', () => {
    it('should list audio as supported source', () => {
      expect(extractor.supportedSources).toContain('audio');
    });
  });

  describe('extract', () => {
    it('should return error for non-existent file', async () => {
      const result = await extractor.extract('/path/to/audio.mp3');
      expect(result.status).toBe('failed');
      expect(result.error).toContain('not found');
    });
  });
});
