/**
 * @sbf/content-engine - PDF Extractor
 * 
 * Extracts text content from PDF files.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  ContentExtractor,
  ContentSource,
  ExtractedContent,
  ExtractorOptions,
  ContentMetadata,
} from '../types';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * PDF Extractor - Extracts text from PDF files
 * 
 * Uses pdf-parse library for extraction.
 */
export class PDFExtractor implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['pdf'];
  private defaultOptions: ExtractorOptions;

  constructor(options?: ExtractorOptions) {
    this.defaultOptions = { timeout: 60000, ...options };
  }

  /**
   * Check if file is a PDF
   */
  supports(source: string): boolean {
    const ext = path.extname(source).toLowerCase();
    return ext === '.pdf' || source.startsWith('data:application/pdf');
  }

  /**
   * Extract content from a PDF file
   */
  async extract(source: string, options?: ExtractorOptions): Promise<ExtractedContent> {
    const opts = { ...this.defaultOptions, ...options };
    const id = generateId();

    try {
      // Dynamically import pdf-parse (it has issues with static import)
      const pdfParse = (await import('pdf-parse')).default;

      // Read the PDF file
      let dataBuffer: Buffer;
      
      if (source.startsWith('data:application/pdf;base64,')) {
        // Base64 encoded PDF
        const base64Data = source.replace('data:application/pdf;base64,', '');
        dataBuffer = Buffer.from(base64Data, 'base64');
      } else if (source.startsWith('http://') || source.startsWith('https://')) {
        // URL - fetch the PDF
        const axios = (await import('axios')).default;
        const response = await axios.get(source, {
          responseType: 'arraybuffer',
          timeout: opts.timeout,
        });
        dataBuffer = Buffer.from(response.data);
      } else {
        // File path
        if (!fs.existsSync(source)) {
          throw new Error(`File not found: ${source}`);
        }
        dataBuffer = fs.readFileSync(source);
      }

      // Parse PDF
      const pdfData = await pdfParse(dataBuffer, {
        max: 0, // No page limit
      });

      // Extract metadata
      const metadata = this.extractMetadata(pdfData, source);

      // Get text content
      const content = this.cleanText(pdfData.text);

      return {
        id,
        source: 'pdf',
        sourceUri: source,
        content,
        metadata: {
          ...metadata,
          wordCount: this.countWords(content),
        },
        status: 'completed',
        extractedAt: new Date().toISOString(),
        rawContent: opts.includeRaw ? pdfData.text : undefined,
      };
    } catch (error) {
      return {
        id,
        source: 'pdf',
        sourceUri: source,
        content: '',
        metadata: {},
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        extractedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract metadata from PDF
   */
  private extractMetadata(pdfData: { info?: Record<string, unknown>; numpages?: number }, source: string): ContentMetadata {
    const info = pdfData.info || {};
    
    return {
      title: info.Title as string | undefined,
      author: info.Author as string | undefined,
      publishedAt: info.CreationDate as string | undefined,
      pageCount: pdfData.numpages,
      url: source.startsWith('http') ? source : undefined,
    };
  }

  /**
   * Clean extracted text
   */
  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/[ \t]+/g, ' ')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      // Remove page numbers (common patterns)
      .replace(/^\s*\d+\s*$/gm, '')
      // Remove headers/footers (common patterns)
      .replace(/^(Page|Page \d+|^\d+ of \d+)$/gim, '')
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}
