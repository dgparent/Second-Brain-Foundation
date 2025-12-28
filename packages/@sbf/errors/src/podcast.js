"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodcastError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class PodcastError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.PODCAST_ERROR,
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
    static scriptGenerationFailed(sourceId, reason) {
        return new PodcastError({
            message: `Failed to generate podcast script${reason ? `: ${reason}` : ''}`,
            stage: 'script_generation',
            sourceId,
            details: { reason },
        });
    }
    static ttsFailed(provider, voiceId, reason) {
        return new PodcastError({
            message: `TTS synthesis failed with ${provider}${reason ? `: ${reason}` : ''}`,
            stage: 'tts_synthesis',
            provider,
            voiceId,
            details: { reason },
        });
    }
    static voiceNotFound(voiceId, provider) {
        return new PodcastError({
            message: `Voice not found: ${voiceId} (provider: ${provider})`,
            stage: 'voice_selection',
            provider,
            voiceId,
        });
    }
    static audioProcessingFailed(operation, reason) {
        return new PodcastError({
            message: `Audio processing failed during ${operation}${reason ? `: ${reason}` : ''}`,
            stage: 'audio_processing',
            details: { operation, reason },
        });
    }
    static audioTooLong(duration, maxDuration) {
        return new PodcastError({
            message: `Audio duration (${duration}s) exceeds maximum (${maxDuration}s)`,
            stage: 'tts_synthesis',
            audioDuration: duration,
            details: { maxDuration },
        });
    }
    static contentTooShort(minWords, actualWords) {
        return new PodcastError({
            message: `Content too short for podcast generation (${actualWords} words, minimum: ${minWords})`,
            stage: 'script_generation',
            details: { minWords, actualWords },
        });
    }
    static mergeFailed(segmentCount, reason) {
        return new PodcastError({
            message: `Failed to merge ${segmentCount} audio segments${reason ? `: ${reason}` : ''}`,
            stage: 'audio_merge',
            details: { segmentCount, reason },
        });
    }
    static encodingFailed(format, reason) {
        return new PodcastError({
            message: `Failed to encode audio to ${format}${reason ? `: ${reason}` : ''}`,
            stage: 'encoding',
            details: { format, reason },
        });
    }
}
exports.PodcastError = PodcastError;
//# sourceMappingURL=podcast.js.map