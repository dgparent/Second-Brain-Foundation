"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = serializeError;
exports.toAPIErrorResponse = toAPIErrorResponse;
exports.toAPISuccessResponse = toAPISuccessResponse;
exports.getHttpStatusCode = getHttpStatusCode;
exports.isRetryableError = isRetryableError;
exports.isClientError = isClientError;
exports.isServerError = isServerError;
exports.formatErrorForLogging = formatErrorForLogging;
exports.sanitizeErrorForExternal = sanitizeErrorForExternal;
exports.createErrorHandler = createErrorHandler;
exports.wrapAsync = wrapAsync;
exports.assertSBF = assertSBF;
const base_1 = require("./base");
const codes_1 = require("./codes");
function serializeError(error, requestId) {
    if (error instanceof base_1.SBFError) {
        const serialized = error.toJSON();
        if (requestId && !serialized.requestId) {
            serialized.requestId = requestId;
        }
        return serialized;
    }
    if (error instanceof Error) {
        return {
            error: error.name,
            code: codes_1.ErrorCode.UNKNOWN_ERROR,
            message: error.message,
            timestamp: new Date().toISOString(),
            requestId,
        };
    }
    return {
        error: 'UnknownError',
        code: codes_1.ErrorCode.UNKNOWN_ERROR,
        message: String(error),
        timestamp: new Date().toISOString(),
        requestId,
    };
}
function toAPIErrorResponse(error, requestId) {
    return {
        success: false,
        error: serializeError(error, requestId),
    };
}
function toAPISuccessResponse(data, meta) {
    return {
        success: true,
        data,
        meta: {
            ...meta,
            timestamp: new Date().toISOString(),
        },
    };
}
function getHttpStatusCode(error) {
    if (error instanceof base_1.SBFError) {
        return error.httpStatus;
    }
    return 500;
}
function isRetryableError(error) {
    if (error instanceof base_1.SBFError) {
        return error.isRetryable();
    }
    return false;
}
function isClientError(error) {
    if (error instanceof base_1.SBFError) {
        return error.isClientError();
    }
    return false;
}
function isServerError(error) {
    if (error instanceof base_1.SBFError) {
        return error.isServerError();
    }
    return true;
}
function formatErrorForLogging(error) {
    const base = {
        timestamp: new Date().toISOString(),
    };
    if (error instanceof base_1.SBFError) {
        return {
            ...base,
            name: error.name,
            code: error.code,
            message: error.message,
            details: error.details,
            requestId: error.requestId,
            stack: error.stack,
            cause: error.cause ? formatErrorForLogging(error.cause) : undefined,
        };
    }
    if (error instanceof Error) {
        return {
            ...base,
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return {
        ...base,
        error: String(error),
    };
}
function sanitizeErrorForExternal(error) {
    const serialized = serializeError(error);
    const sanitized = {
        error: serialized.error,
        code: serialized.code,
        message: serialized.message,
        timestamp: serialized.timestamp,
        requestId: serialized.requestId,
    };
    if (serialized.details) {
        const safeKeys = ['entityId', 'entityType', 'field', 'fields'];
        const safeDetails = {};
        for (const key of safeKeys) {
            if (key in serialized.details) {
                safeDetails[key] = serialized.details[key];
            }
        }
        if (Object.keys(safeDetails).length > 0) {
            sanitized.details = safeDetails;
        }
    }
    return sanitized;
}
function createErrorHandler(options) {
    const { logErrors = true, includeStack = false, sanitize = true } = options || {};
    return function errorHandler(err, req, res, _next) {
        if (logErrors) {
            console.error('Error:', formatErrorForLogging(err));
        }
        const statusCode = getHttpStatusCode(err);
        let errorResponse = serializeError(err, req.requestId);
        if (sanitize) {
            errorResponse = sanitizeErrorForExternal(err);
            errorResponse.requestId = req.requestId;
        }
        if (includeStack && err instanceof Error) {
            errorResponse.stack = err.stack;
        }
        res.status(statusCode).json({
            success: false,
            error: errorResponse,
        });
    };
}
function wrapAsync(fn, defaultCode) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            throw base_1.SBFError.wrap(error, defaultCode);
        }
    });
}
function assertSBF(condition, code, message, details) {
    if (!condition) {
        throw new base_1.SBFError({ code, message, details });
    }
}
//# sourceMappingURL=serializer.js.map