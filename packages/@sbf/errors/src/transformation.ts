/**
 * @sbf/errors - Transformation Errors
 * 
 * Errors related to content transformations like summarization,
 * format conversion, and AI-powered transformations.
 */

import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';

/**
 * Transformation types supported by the system
 */
export type TransformationType = 
  | 'summarize'
  | 'expand'
  | 'translate'
  | 'format'
  | 'outline'
  | 'qa'
  | 'flashcards'
  | 'key_points'
  | 'custom';

/**
 * Content transformation error
 * 
 * @example
 * ```typescript
 * throw new TransformationError({
 *   message: 'Failed to generate summary',
 *   transformationType: 'summarize',
 *   sourceId: 'note-123',
 *   reason: 'Content too short for summarization'
 * });
 * ```
 */
export class TransformationError extends SBFError {
  public readonly transformationType?: TransformationType;
  public readonly sourceId?: string;
  public readonly sourceType?: string;
  public readonly reason?: string;
  public readonly provider?: string;

  constructor(
    options: Omit<SBFErrorOptions, 'code'> & {
      transformationType?: TransformationType;
      sourceId?: string;
      sourceType?: string;
      reason?: string;
      provider?: string;
    }
  ) {
    super({
      ...options,
      code: ErrorCode.TRANSFORMATION_ERROR,
      details: {
        transformationType: options.transformationType,
        sourceId: options.sourceId,
        sourceType: options.sourceType,
        reason: options.reason,
        provider: options.provider,
        ...options.details,
      },
    });
    this.transformationType = options.transformationType;
    this.sourceId = options.sourceId;
    this.sourceType = options.sourceType;
    this.reason = options.reason;
    this.provider = options.provider;
  }

  /**
   * Create error for summarization failure
   */
  static summarizationFailed(sourceId: string, reason?: string): TransformationError {
    return new TransformationError({
      message: `Summarization failed for ${sourceId}${reason ? `: ${reason}` : ''}`,
      transformationType: 'summarize',
      sourceId,
      reason,
    });
  }

  /**
   * Create error for translation failure
   */
  static translationFailed(
    sourceId: string,
    targetLanguage: string,
    reason?: string
  ): TransformationError {
    return new TransformationError({
      message: `Translation to ${targetLanguage} failed for ${sourceId}`,
      transformationType: 'translate',
      sourceId,
      reason,
      details: { targetLanguage },
    });
  }

  /**
   * Create error for format conversion failure
   */
  static formatConversionFailed(
    sourceId: string,
    fromFormat: string,
    toFormat: string,
    reason?: string
  ): TransformationError {
    return new TransformationError({
      message: `Format conversion from ${fromFormat} to ${toFormat} failed`,
      transformationType: 'format',
      sourceId,
      reason,
      details: { fromFormat, toFormat },
    });
  }

  /**
   * Create error for unsupported transformation
   */
  static unsupportedTransformation(transformationType: string): TransformationError {
    return new TransformationError({
      message: `Unsupported transformation type: ${transformationType}`,
      transformationType: 'custom',
      reason: 'Transformation type not supported',
      details: { requestedType: transformationType },
    });
  }

  /**
   * Create error for content too short/long for transformation
   */
  static contentLengthInvalid(
    transformationType: TransformationType,
    contentLength: number,
    minLength?: number,
    maxLength?: number
  ): TransformationError {
    let reason = `Content length (${contentLength}) is invalid`;
    if (minLength !== undefined && contentLength < minLength) {
      reason = `Content too short (${contentLength} < ${minLength})`;
    } else if (maxLength !== undefined && contentLength > maxLength) {
      reason = `Content too long (${contentLength} > ${maxLength})`;
    }

    return new TransformationError({
      message: `Cannot perform ${transformationType}: ${reason}`,
      transformationType,
      reason,
      details: { contentLength, minLength, maxLength },
    });
  }
}
