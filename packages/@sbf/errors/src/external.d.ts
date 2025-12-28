import { SBFError, SBFErrorOptions } from './base';
import { ErrorCode } from './codes';
export declare class ExternalServiceError extends SBFError {
    readonly serviceName?: string;
    readonly endpoint?: string;
    readonly statusCode?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        code?: ErrorCode;
        serviceName?: string;
        endpoint?: string;
        statusCode?: number;
    });
}
export declare class AIProviderError extends SBFError {
    readonly provider: string;
    readonly model?: string;
    readonly operation?: 'chat' | 'completion' | 'embedding' | 'transcription' | 'tts';
    readonly providerErrorCode?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        provider: string;
        model?: string;
        operation?: 'chat' | 'completion' | 'embedding' | 'transcription' | 'tts';
        providerErrorCode?: string;
    });
    static openai(message: string, options?: {
        model?: string;
        operation?: AIProviderError['operation'];
    }): AIProviderError;
    static anthropic(message: string, options?: {
        model?: string;
        operation?: AIProviderError['operation'];
    }): AIProviderError;
    static google(message: string, options?: {
        model?: string;
        operation?: AIProviderError['operation'];
    }): AIProviderError;
    static ollama(message: string, options?: {
        model?: string;
        operation?: AIProviderError['operation'];
    }): AIProviderError;
}
export declare class RateLimitError extends SBFError {
    readonly serviceName?: string;
    readonly retryAfter?: number;
    readonly limit?: number;
    readonly remaining?: number;
    readonly resetAt?: Date;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        serviceName?: string;
        retryAfter?: number;
        limit?: number;
        remaining?: number;
        resetAt?: Date;
    });
    shouldRetryNow(): boolean;
    getRetryDelayMs(): number;
}
export declare class TimeoutError extends SBFError {
    readonly timeoutMs?: number;
    readonly operation?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        timeoutMs?: number;
        operation?: string;
    });
}
export declare class NetworkError extends SBFError {
    readonly url?: string;
    readonly method?: string;
    readonly networkErrorCode?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        url?: string;
        method?: string;
        networkErrorCode?: string;
    });
}
export declare class APIError extends SBFError {
    readonly serviceName?: string;
    readonly statusCode?: number;
    readonly responseBody?: unknown;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        serviceName?: string;
        statusCode?: number;
        responseBody?: unknown;
    });
}
export declare class ServiceUnavailableError extends SBFError {
    readonly serviceName?: string;
    readonly retryAfter?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        serviceName?: string;
        retryAfter?: number;
    });
}
export declare class QuotaExceededError extends SBFError {
    readonly serviceName?: string;
    readonly quotaType?: 'tokens' | 'requests' | 'storage' | 'compute';
    readonly currentUsage?: number;
    readonly limit?: number;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        serviceName?: string;
        quotaType?: 'tokens' | 'requests' | 'storage' | 'compute';
        currentUsage?: number;
        limit?: number;
    });
}
export declare class InvalidResponseError extends SBFError {
    readonly serviceName?: string;
    readonly expectedFormat?: string;
    constructor(options: Omit<SBFErrorOptions, 'code'> & {
        serviceName?: string;
        expectedFormat?: string;
    });
}
//# sourceMappingURL=external.d.ts.map