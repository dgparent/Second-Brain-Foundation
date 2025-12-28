"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidResponseError = exports.QuotaExceededError = exports.ServiceUnavailableError = exports.APIError = exports.NetworkError = exports.TimeoutError = exports.RateLimitError = exports.AIProviderError = exports.ExternalServiceError = void 0;
const base_1 = require("./base");
const codes_1 = require("./codes");
class ExternalServiceError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: options.code || codes_1.ErrorCode.EXTERNAL_SERVICE_ERROR,
            details: {
                serviceName: options.serviceName,
                endpoint: options.endpoint,
                statusCode: options.statusCode,
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.endpoint = options.endpoint;
        this.statusCode = options.statusCode;
    }
}
exports.ExternalServiceError = ExternalServiceError;
class AIProviderError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.AI_PROVIDER_ERROR,
            details: {
                provider: options.provider,
                model: options.model,
                operation: options.operation,
                providerErrorCode: options.providerErrorCode,
                ...options.details,
            },
        });
        this.provider = options.provider;
        this.model = options.model;
        this.operation = options.operation;
        this.providerErrorCode = options.providerErrorCode;
    }
    static openai(message, options) {
        return new AIProviderError({
            message,
            provider: 'openai',
            ...options,
        });
    }
    static anthropic(message, options) {
        return new AIProviderError({
            message,
            provider: 'anthropic',
            ...options,
        });
    }
    static google(message, options) {
        return new AIProviderError({
            message,
            provider: 'google',
            ...options,
        });
    }
    static ollama(message, options) {
        return new AIProviderError({
            message,
            provider: 'ollama',
            ...options,
        });
    }
}
exports.AIProviderError = AIProviderError;
class RateLimitError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.RATE_LIMIT_ERROR,
            details: {
                serviceName: options.serviceName,
                retryAfter: options.retryAfter,
                limit: options.limit,
                remaining: options.remaining,
                resetAt: options.resetAt?.toISOString(),
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.retryAfter = options.retryAfter;
        this.limit = options.limit;
        this.remaining = options.remaining;
        this.resetAt = options.resetAt;
    }
    shouldRetryNow() {
        if (this.resetAt) {
            return new Date() >= this.resetAt;
        }
        return false;
    }
    getRetryDelayMs() {
        if (this.retryAfter !== undefined) {
            return this.retryAfter * 1000;
        }
        if (this.resetAt) {
            return Math.max(0, this.resetAt.getTime() - Date.now());
        }
        return 60000;
    }
}
exports.RateLimitError = RateLimitError;
class TimeoutError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.TIMEOUT_ERROR,
            details: {
                timeoutMs: options.timeoutMs,
                operation: options.operation,
                ...options.details,
            },
        });
        this.timeoutMs = options.timeoutMs;
        this.operation = options.operation;
    }
}
exports.TimeoutError = TimeoutError;
class NetworkError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.NETWORK_ERROR,
            details: {
                url: options.url,
                method: options.method,
                networkErrorCode: options.networkErrorCode,
                ...options.details,
            },
        });
        this.url = options.url;
        this.method = options.method;
        this.networkErrorCode = options.networkErrorCode;
    }
}
exports.NetworkError = NetworkError;
class APIError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.API_ERROR,
            details: {
                serviceName: options.serviceName,
                statusCode: options.statusCode,
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.statusCode = options.statusCode;
        this.responseBody = options.responseBody;
    }
}
exports.APIError = APIError;
class ServiceUnavailableError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.SERVICE_UNAVAILABLE,
            details: {
                serviceName: options.serviceName,
                retryAfter: options.retryAfter,
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.retryAfter = options.retryAfter;
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class QuotaExceededError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.QUOTA_EXCEEDED,
            details: {
                serviceName: options.serviceName,
                quotaType: options.quotaType,
                currentUsage: options.currentUsage,
                limit: options.limit,
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.quotaType = options.quotaType;
        this.currentUsage = options.currentUsage;
        this.limit = options.limit;
    }
}
exports.QuotaExceededError = QuotaExceededError;
class InvalidResponseError extends base_1.SBFError {
    constructor(options) {
        super({
            ...options,
            code: codes_1.ErrorCode.INVALID_RESPONSE,
            details: {
                serviceName: options.serviceName,
                expectedFormat: options.expectedFormat,
                ...options.details,
            },
        });
        this.serviceName = options.serviceName;
        this.expectedFormat = options.expectedFormat;
    }
}
exports.InvalidResponseError = InvalidResponseError;
//# sourceMappingURL=external.js.map