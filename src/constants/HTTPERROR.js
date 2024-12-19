"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTTPERROR = void 0;
exports.HTTPERROR = {
    // Client Errors
    BAD_REQUEST: 400, // Invalid request data
    UNAUTHORIZED: 401, // Authentication failed
    FORBIDDEN: 403, // User does not have permission
    NOT_FOUND: 404, // Resource not found
    CONFLICT: 409, // Conflict with existing resource
    UNPROCESSABLE_ENTITY: 422, // Validation errors
    // Server Errors
    INTERNAL_SERVER_ERROR: 500, // Generic server error
    NOT_IMPLEMENTED: 501, // Server does not support the functionality
    BAD_GATEWAY: 502, // Invalid response from upstream server
    SERVICE_UNAVAILABLE: 503, // Server is temporarily unavailable
    GATEWAY_TIMEOUT: 504, // Server did not receive a timely response
    // Other Common Codes
    CREATED: 201, // Resource created successfully
    ACCEPTED: 202, // Request accepted, processing may continue
    NO_CONTENT: 204, // Successful request with no content
    MOVED_PERMANENTLY: 301, // Resource moved permanently
    TEMPORARY_REDIRECT: 307, // Temporary redirect
    PRECONDITION_FAILED: 412, // Precondition failed
};
