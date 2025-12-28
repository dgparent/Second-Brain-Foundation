/**
 * @sbf/content-engine - Audio Extractor
 * 
 * Extracts transcripts from audio files using speech-to-text.
 * This is a placeholder that would integrate with Whisper or similar services.
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
 * Supported audio formats
 */
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.webm'];

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `audio-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Audio transcription configuration
 */
export interface AudioTranscriptionConfig {
  /** Whisper API endpoint (if using local or self-hosted) */
  whisperEndpoint?: string;
  /** OpenAI API key for Whisper API */
  openaiApiKey?: string;
  /** Model to use (whisper-1, etc.) */
  model?: string;
  /** Response format */
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

/**
 * Audio Extractor - Transcribes audio files to text
 * 
 * Can use:
 * 1. Local Whisper endpoint (Ollama, etc.)
 * 2. OpenAI Whisper API
 * 3. Other speech-to-text services
 */
export class AudioExtractor implements ContentExtractor {
  readonly supportedSources: ContentSource[] = ['audio'];
  private defaultOptions: ExtractorOptions;
  private config: AudioTranscriptionConfig;

  constructor(config?: AudioTranscriptionConfig, options?: ExtractorOptions) {
    this.config = config || {};
    this.defaultOptions = { timeout: 120000, language: 'en', ...options };
  }

  /**
   * Check if file is a supported audio format
   */
  supports(source: string): boolean {
    const ext = path.extname(source).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  }

  /**
   * Extract transcript from audio file
   */
  async extract(source: string, options?: ExtractorOptions): Promise<ExtractedContent> {
    const opts = { ...this.defaultOptions, ...options };
    const id = generateId();

    try {
      // Verify file exists
      if (!source.startsWith('http') && !fs.existsSync(source)) {
        throw new Error(`Audio file not found: ${source}`);
      }

      // Get file metadata
      const metadata = this.extractMetadata(source);

      // Transcribe using configured service
      const transcript = await this.transcribe(source, opts);

      return {
        id,
        source: 'audio',
        sourceUri: source,
        content: transcript,
        metadata: {
          ...metadata,
          wordCount: this.countWords(transcript),
          language: opts.language,
        },
        status: 'completed',
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id,
        source: 'audio',
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
   * Extract file metadata
   */
  private extractMetadata(source: string): ContentMetadata {
    if (source.startsWith('http')) {
      return { url: source };
    }

    try {
      const stats = fs.statSync(source);
      const filename = path.basename(source);
      
      return {
        title: filename.replace(path.extname(filename), ''),
        url: source,
      };
    } catch {
      return {};
    }
  }

  /**
   * Transcribe audio using configured service
   */
  private async transcribe(source: string, options: ExtractorOptions): Promise<string> {
    // If OpenAI API key is provided, use Whisper API
    if (this.config.openaiApiKey) {
      return this.transcribeWithOpenAI(source, options);
    }

    // If local Whisper endpoint is configured
    if (this.config.whisperEndpoint) {
      return this.transcribeWithLocalWhisper(source, options);
    }

    // Placeholder - in production, you'd integrate with a real service
    throw new Error(
      'No transcription service configured. ' +
      'Provide openaiApiKey for OpenAI Whisper API or whisperEndpoint for local Whisper.'
    );
  }

  /**
   * Transcribe using OpenAI Whisper API
   */
  private async transcribeWithOpenAI(source: string, options: ExtractorOptions): Promise<string> {
    const axios = (await import('axios')).default;
    const FormData = (await import('form-data')).default;

    // Read audio file
    let audioData: Buffer;
    if (source.startsWith('http')) {
      const response = await axios.get(source, { responseType: 'arraybuffer' });
      audioData = Buffer.from(response.data);
    } else {
      audioData = fs.readFileSync(source);
    }

    // Create form data
    const form = new FormData();
    form.append('file', audioData, {
      filename: path.basename(source) || 'audio.mp3',
      contentType: 'audio/mpeg',
    });
    form.append('model', this.config.model || 'whisper-1');
    form.append('response_format', this.config.responseFormat || 'json');
    if (options.language) {
      form.append('language', options.language);
    }

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          ...form.getHeaders(),
        },
        timeout: options.timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return this.config.responseFormat === 'text' 
      ? response.data 
      : response.data.text;
  }

  /**
   * Transcribe using local Whisper endpoint
   */
  private async transcribeWithLocalWhisper(source: string, options: ExtractorOptions): Promise<string> {
    const axios = (await import('axios')).default;
    const FormData = (await import('form-data')).default;

    // Read audio file
    let audioData: Buffer;
    if (source.startsWith('http')) {
      const response = await axios.get(source, { responseType: 'arraybuffer' });
      audioData = Buffer.from(response.data);
    } else {
      audioData = fs.readFileSync(source);
    }

    // Create form data
    const form = new FormData();
    form.append('file', audioData, {
      filename: path.basename(source) || 'audio.mp3',
    });
    if (options.language) {
      form.append('language', options.language);
    }

    // Call local endpoint
    const response = await axios.post(
      this.config.whisperEndpoint!,
      form,
      {
        headers: form.getHeaders(),
        timeout: options.timeout,
      }
    );

    // Handle different response formats
    if (typeof response.data === 'string') {
      return response.data;
    }
    return response.data.text || response.data.transcript || JSON.stringify(response.data);
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
}
