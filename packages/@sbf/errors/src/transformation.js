"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformationError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class TransformationError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.TRANSFORMATION_ERROR,
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
    static summarizationFailed(sourceId, reason) {
        return new TransformationError({
            message: `Summarization failed for ${sourceId}${reason ? `: ${reason}` : ''}`,
            transformationType: 'summarize',
            sourceId,
            reason,
        });
    }
    static translationFailed(sourceId, targetLanguage, reason) {
        return new TransformationError({
            message: `Translation to ${targetLanguage} failed for ${sourceId}`,
            transformationType: 'translate',
            sourceId,
            reason,
            details: { targetLanguage },
        });
    }
    static formatConversionFailed(sourceId, fromFormat, toFormat, reason) {
        return new TransformationError({
            message: `Format conversion from ${fromFormat} to ${toFormat} failed`,
            transformationType: 'format',
            sourceId,
            reason,
            details: { fromFormat, toFormat },
        });
    }
    static unsupportedTransformation(transformationType) {
        return new TransformationError({
            message: `Unsupported transformation type: ${transformationType}`,
            transformationType: 'custom',
            reason: 'Transformation type not supported',
            details: { requestedType: transformationType },
        });
    }
    static contentLengthInvalid(transformationType, contentLength, minLength, maxLength) {
        let reason = `Content length (${contentLength}) is invalid`;
        if (minLength !== undefined && contentLength < minLength) {
            reason = `Content too short (${contentLength} < ${minLength})`;
        }
        else if (maxLength !== undefined && contentLength > maxLength) {
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
exports.TransformationError = TransformationError;
//# sourceMappingURL=transformation.js.map