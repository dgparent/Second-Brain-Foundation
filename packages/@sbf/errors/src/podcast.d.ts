import { SBFError, SBFErrorOptions } from './base';
export type PodcastStage = 'script_generation' | 'voice_selection' | 'tts_synthesis' | 'audio_processing' | 'audio_merge' | 'encoding' | 'upload';
export declare class PodcastError extends SBFError {
    readonly stage?: PodcastStage;
    readonly provider?: string;
    readonly sourceId?: string;
    readonly voiceId?: string;
    readonly audioDuration?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        stage?: PodcastStage;
        provider?: string;
        sourceId?: string;
        voiceId?: string;
        audioDuration?: number;
    });
    static scriptGenerationFailed(sourceId: string, reason?: string): PodcastError;
    static ttsFailed(provider: string, voiceId?: string, reason?: string): PodcastError;
    static voiceNotFound(voiceId: string, provider: string): PodcastError;
    static audioProcessingFailed(operation: string, reason?: string): PodcastError;
    static audioTooLong(duration: number, maxDuration: number): PodcastError;
    static contentTooShort(minWords: number, actualWords: number): PodcastError;
    static mergeFailed(segmentCount: number, reason?: string): PodcastError;
    static encodingFailed(format: string, reason?: string): PodcastError;
}
//# sourceMappingURL=podcast.d.ts.map