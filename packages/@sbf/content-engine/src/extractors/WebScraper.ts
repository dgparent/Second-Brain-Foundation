/**
 * @sbf/content-engine - Web Scraper
 * 
 * Extracts content from web pages using axios and cheerio.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';
import {
  ContentExtractor,
  ContentSource,
  ExtractedContent,
  ExtractorOptions,
  ContentMetadata,
} from '../types';

/**
 * Default web scraper options
 */
const DEFAULT_OPTIONS: ExtractorOptions = {
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (compatible; SBF-Bot/1.0; +https://secondbrainfoundation.com)',
  includeRaw: false,
  maxLength: 1000000, // 1MB
};

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Web Scraper - Extracts text content from web pages
 * 
 * Uses cheerio for HTML parsing and html-to-text for conversion.
 * Handles various HTML structures and extracts metadata.
 */
export class WebScraper implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['web'];
  private defaultOptions: ExtractorOptions;

  constructor(options?: ExtractorOptions) {
    this.defaultOptions = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Check if URL is supported
   */
  supports(source: string): boolean {
    try {
      const url = new URL(source);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Extract content from a web page
   */
  async extract(url: string, options?: ExtractorOptions): Promise<ExtractedContent> {
    const opts = { ...this.defaultOptions, ...options };
    const id = generateId();

    try {
      // Fetch the page
      const response = await axios.get(url, {
        timeout: opts.timeout,
        headers: {
          'User-Agent': opts.userAgent || DEFAULT_OPTIONS.userAgent!,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          ...opts.headers,
        },
        maxContentLength: opts.maxLength,
        responseType: 'text',
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract metadata
      const metadata = this.extractMetadata($, url);

      // Clean the HTML
      this.cleanHtml($);

      // Extract main content
      const content = this.extractMainContent($);

      // Convert to text
      const textContent = this.htmlToText(content, $);

      return {
        id,
        source: 'web',
        sourceUri: url,
        content: textContent,
        metadata: {
          ...metadata,
          wordCount: this.countWords(textContent),
        },
        status: 'completed',
        extractedAt: new Date().toISOString(),
        rawContent: opts.includeRaw ? html : undefined,
      };
    } catch (error) {
      return {
        id,
        source: 'web',
        sourceUri: url,
        content: '',
        metadata: { url },
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        extractedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract metadata from HTML
   */
  private extractMetadata($: cheerio.CheerioAPI, url: string): ContentMetadata {
    // Title
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text();

    // Description
    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content');

    // Author
    const author =
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('[rel="author"]').text() ||
      $('[class*="author"]').first().text();

    // Published date
    const publishedAt =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      $('[class*="date"]').first().text();

    // Language
    const language =
      $('html').attr('lang') ||
      $('meta[http-equiv="content-language"]').attr('content');

    // Tags/keywords
    const keywords = $('meta[name="keywords"]').attr('content');
    const tags = keywords ? keywords.split(',').map(t => t.trim()).filter(Boolean) : undefined;

    return {
      title: title?.trim(),
      description: description?.trim(),
      author: author?.trim(),
      publishedAt: publishedAt?.trim(),
      language: language?.trim(),
      tags,
      url,
    };
  }

  /**
   * Remove non-content elements from HTML
   */
  private cleanHtml($: cheerio.CheerioAPI): void {
    // Remove scripts, styles, and other non-content elements
    $('script, style, noscript, iframe, svg, canvas').remove();
    $('header, nav, footer, aside').remove();
    $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
    $('[class*="nav"], [class*="menu"], [class*="sidebar"]').remove();
    $('[class*="footer"], [class*="header"], [class*="advertisement"]').remove();
    $('[class*="cookie"], [class*="popup"], [class*="modal"]').remove();
    $('[id*="nav"], [id*="menu"], [id*="sidebar"]').remove();
    $('[id*="footer"], [id*="header"], [id*="ad"]').remove();
    $('form, button, input, select, textarea').remove();
    $('[hidden], [aria-hidden="true"]').remove();
    $('img, video, audio, embed, object').remove();
  }

  /**
   * Extract main content area
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find main content container
    const mainSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.post-body',
      '#content',
      '#main',
      '.main',
    ];

    for (const selector of mainSelectors) {
      const main = $(selector);
      if (main.length > 0) {
        const html = main.html();
        if (html && html.trim().length > 100) {
          return html;
        }
      }
    }

    // Fallback to body
    return $('body').html() || '';
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string, $: cheerio.CheerioAPI): string {
    const text = convert(html, {
      wordwrap: false,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'table', format: 'dataTable' },
      ],
      preserveNewlines: true,
    });

    // Clean up excessive whitespace
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}
