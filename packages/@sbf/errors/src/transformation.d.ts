import { SBFError, SBFErrorOptions } from './base';
export type TransformationType = 'summarize' | 'expand' | 'translate' | 'format' | 'outline' | 'qa' | 'flashcards' | 'key_points' | 'custom';
export declare class TransformationError extends SBFError {
    readonly transformationType?: TransformationType;
    readonly sourceId?: string;
    readonly sourceType?: string;
    readonly reason?: string;
    readonly provider?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        transformationType?: TransformationType;
        sourceId?: string;
        sourceType?: string;
        reason?: string;
        provider?: string;
    });
    static summarizationFailed(sourceId: string, reason?: string): TransformationError;
    static translationFailed(sourceId: string, targetLanguage: string, reason?: string): TransformationError;
    static formatConversionFailed(sourceId: string, fromFormat: string, toFormat: string, reason?: string): TransformationError;
    static unsupportedTransformation(transformationType: string): TransformationError;
    static contentLengthInvalid(transformationType: TransformationType, contentLength: number, minLength?: number, maxLength?: number): TransformationError;
}
//# sourceMappingURL=transformation.d.ts.map