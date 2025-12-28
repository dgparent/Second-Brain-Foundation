/**
 * @sbf/content-engine - YouTube Extractor
 * 
 * Extracts transcripts and metadata from YouTube videos.
 */

import axios from 'axios';
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
  return `youtube-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * YouTube Extractor - Extracts transcripts from YouTube videos
 * 
 * Uses YouTube's transcript API when available.
 * Falls back to video metadata if transcript unavailable.
 */
export class YouTubeExtractor implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['youtube'];
  private defaultOptions: ExtractorOptions;

  constructor(options?: ExtractorOptions) {
    this.defaultOptions = { timeout: 30000, ...options };
  }

  /**
   * Check if URL is a YouTube video
   */
  supports(source: string): boolean {
    return extractVideoId(source) !== null;
  }

  /**
   * Extract content from a YouTube video
   */
  async extract(url: string, options?: ExtractorOptions): Promise<ExtractedContent> {
    const opts = { ...this.defaultOptions, ...options };
    const id = generateId();

    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        id,
        source: 'youtube',
        sourceUri: url,
        content: '',
        metadata: {},
        status: 'failed',
        error: 'Invalid YouTube URL',
        extractedAt: new Date().toISOString(),
      };
    }

    try {
      // Fetch video metadata via oEmbed
      const metadata = await this.fetchMetadata(videoId, opts.timeout);

      // Try to fetch transcript
      const transcript = await this.fetchTranscript(videoId, opts.language || 'en');

      const content = transcript || 
        `[Video: ${metadata.title || videoId}]\n\n` +
        (metadata.description || 'No transcript available.');

      return {
        id,
        source: 'youtube',
        sourceUri: url,
        content,
        metadata: {
          ...metadata,
          wordCount: this.countWords(content),
        },
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id,
        source: 'youtube',
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
   * Fetch video metadata via oEmbed API
   */
  private async fetchMetadata(videoId: string, timeout?: number): Promise<ContentMetadata> {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await axios.get(oembedUrl, { timeout });
      
      return {
        title: response.data.title,
        author: response.data.author_name,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        description: response.data.title, // oEmbed doesn't provide description
      };
    } catch {
      return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
  }

  /**
   * Attempt to fetch video transcript
   * Uses YouTube's timedtext API
   */
  private async fetchTranscript(videoId: string, language: string = 'en'): Promise<string | null> {
    try {
      // Fetch the video page to get transcript data
      const videoPageResponse = await axios.get(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SBF-Bot/1.0)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 15000,
        }
      );

      const html = videoPageResponse.data;
      
      // Try to find caption track URL in the page
      const captionMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
      if (!captionMatch) {
        return null;
      }

      try {
        const captionTracks = JSON.parse(captionMatch[1]);
        
        // Find matching language track
        const track = captionTracks.find(
          (t: { languageCode?: string; vssId?: string }) => 
            t.languageCode === language || 
            t.vssId?.includes(language)
        ) || captionTracks[0];

        if (!track?.baseUrl) {
          return null;
        }

        // Fetch the transcript
        const transcriptResponse = await axios.get(track.baseUrl, { timeout: 10000 });
        const transcriptXml = transcriptResponse.data;

        // Parse XML transcript
        return this.parseTranscriptXml(transcriptXml);
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Parse YouTube transcript XML format
   */
  private parseTranscriptXml(xml: string): string {
    // Simple XML parsing for transcript format
    const lines: string[] = [];
    const textRegex = /<text[^>]*>([^<]*)<\/text>/g;
    let match;

    while ((match = textRegex.exec(xml)) !== null) {
      const text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ')
        .trim();
      
      if (text) {
        lines.push(text);
      }
    }

    return lines.join(' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}
