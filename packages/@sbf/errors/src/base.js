"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SBFError = void 0;
const codes_1 = require("./codes");
class SBFError extends Error {
    constructor(options) {
        const message = options.message || codes_1.ErrorCodeDescriptions[options.code];
        super(message);
        this.name = this.constructor.name;
        this.code = options.code;
        this.details = options.details;
        this.cause = options.cause;
        this.timestamp = new Date();
        this.requestId = options.requestId;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    get httpStatus() {
        return codes_1.ErrorCodeHttpStatus[this.code];
    }
    get description() {
        return codes_1.ErrorCodeDescriptions[this.code];
    }
    is(code) {
        return this.code === code;
    }
    isClientError() {
        return this.httpStatus >= 400 && this.httpStatus < 500;
    }
    isServerError() {
        return this.httpStatus >= 500;
    }
    isRetryable() {
        const retryableCodes = [
            codes_1.ErrorCode.CONNECTION_ERROR,
            codes_1.ErrorCode.TIMEOUT_ERROR,
            codes_1.ErrorCode.NETWORK_ERROR,
            codes_1.ErrorCode.SERVICE_UNAVAILABLE,
            codes_1.ErrorCode.RATE_LIMIT_ERROR,
        ];
        return retryableCodes.includes(this.code);
    }
    toJSON() {
        return {
            error: this.name,
            code: this.code,
            message: this.message,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            requestId: this.requestId,
        };
    }
    toAPIResponse() {
        return {
            success: false,
            error: this.toJSON(),
        };
    }
    withDetails(additionalDetails) {
        return new SBFError({
            code: this.code,
            message: this.message,
            details: { ...this.details, ...additionalDetails },
            cause: this.cause,
            requestId: this.requestId,
        });
    }
    withRequestId(requestId) {
        return new SBFError({
            code: this.code,
            message: this.message,
            details: this.details,
            cause: this.cause,
            requestId,
        });
    }
    toString() {
        let str = `${this.name} [${this.code}]: ${this.message}`;
        if (this.details) {
            str += `\nDetails: ${JSON.stringify(this.details, null, 2)}`;
        }
        if (this.cause) {
            str += `\nCaused by: ${this.cause.message}`;
        }
        return str;
    }
    static isSBFError(error) {
        return error instanceof SBFError;
    }
    static wrap(error, code) {
        if (error instanceof SBFError) {
            return error;
        }
        const errorCode = code || codes_1.ErrorCode.UNKNOWN_ERROR;
        const message = error instanceof Error ? error.message : String(error);
        const cause = error instanceof Error ? error : undefined;
        return new SBFError({
            code: errorCode,
            message,
            cause,
        });
    }
}
exports.SBFError = SBFError;
//# sourceMappingURL=base.js.map