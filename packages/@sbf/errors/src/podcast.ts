/**
 * @sbf/errors - Podcast Errors
 * 
 * Errors specific to podcast generation including TTS,
 * audio processing, and podcast script generation.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * Podcast generation stages
 */
export type PodcastStage = 
  | 'script_generation'
  | 'voice_selection'
  | 'tts_synthesis'
  | 'audio_processing'
  | 'audio_merge'
  | 'encoding'
  | 'upload';

/**
 * Podcast generation error
 * 
 * @example
 * ```typescript
 * throw new PodcastError({
 *   message: 'TTS synthesis failed',
 *   stage: 'tts_synthesis',
 *   provider: 'elevenlabs',
 *   sourceId: 'notebook-123'
 * });
 * ```
 */
export class PodcastError extends SBFError {
  public readonly stage?: PodcastStage;
  public readonly provider?: string;
  public readonly sourceId?: string;
  public readonly voiceId?: string;
  public readonly audioDuration?: number;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      stage?: PodcastStage;
      provider?: string;
      sourceId?: string;
      voiceId?: string;
      audioDuration?: number;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.PODCAST_ERROR,
      details: {
        stage: options.stage,
        provider: options.provider,
        sourceId: options.sourceId,
        voiceId: options.voiceId,
        audioDuration: options.audioDuration,
        ...options.details,
      },
    });
    this.stage = options.stage;
    this.provider = options.provider;
    this.sourceId = options.sourceId;
    this.voiceId = options.voiceId;
    this.audioDuration = options.audioDuration;
  }

  /**
   * Create error for script generation failure
   */
  static scriptGenerationFailed(sourceId: string, reason?: string): PodcastError {
    return new PodcastError({
      message: `Failed to generate podcast script${reason ? `: ${reason}` : ''}`,
      stage: 'script_generation',
      sourceId,
      details: { reason },
    });
  }

  /**
   * Create error for TTS synthesis failure
   */
  static ttsFailed(provider: string, voiceId?: string, reason?: string): PodcastError {
    return new PodcastError({
      message: `TTS synthesis failed with ${provider}${reason ? `: ${reason}` : ''}`,
      stage: 'tts_synthesis',
      provider,
      voiceId,
      details: { reason },
    });
  }

  /**
   * Create error for voice not found
   */
  static voiceNotFound(voiceId: string, provider: string): PodcastError {
    return new PodcastError({
      message: `Voice not found: ${voiceId} (provider: ${provider})`,
      stage: 'voice_selection',
      provider,
      voiceId,
    });
  }

  /**
   * Create error for audio processing failure
   */
  static audioProcessingFailed(operation: string, reason?: string): PodcastError {
    return new PodcastError({
      message: `Audio processing failed during ${operation}${reason ? `: ${reason}` : ''}`,
      stage: 'audio_processing',
      details: { operation, reason },
    });
  }

  /**
   * Create error for audio too long
   */
  static audioTooLong(duration: number, maxDuration: number): PodcastError {
    return new PodcastError({
      message: `Audio duration (${duration}s) exceeds maximum (${maxDuration}s)`,
      stage: 'tts_synthesis',
      audioDuration: duration,
      details: { maxDuration },
    });
  }

  /**
   * Create error for content too short for podcast
   */
  static contentTooShort(minWords: number, actualWords: number): PodcastError {
    return new PodcastError({
      message: `Content too short for podcast generation (${actualWords} words, minimum: ${minWords})`,
      stage: 'script_generation',
      details: { minWords, actualWords },
    });
  }

  /**
   * Create error for audio merge failure
   */
  static mergeFailed(segmentCount: number, reason?: string): PodcastError {
    return new PodcastError({
      message: `Failed to merge ${segmentCount} audio segments${reason ? `: ${reason}` : ''}`,
      stage: 'audio_merge',
      details: { segmentCount, reason },
    });
  }

  /**
   * Create error for encoding failure
   */
  static encodingFailed(format: string, reason?: string): PodcastError {
    return new PodcastError({
      message: `Failed to encode audio to ${format}${reason ? `: ${reason}` : ''}`,
      stage: 'encoding',
      details: { format, reason },
    });
  }
}
