"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
var logger_1 = require("../../utility/logger");
var zod_1 = require("zod");
var sendErrorDev = function (err, req, res) {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.status,
            stack: err.stack,
            error: err,
        });
    }
};
var sendErrorProd = function (err, req, res) {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                message: err.message,
                status: err.status,
            });
        }
        logger_1.default.error('Error 💣️💣️💣️', err);
        return res.status(500).json({
            message: 'Something went wrong',
            status: 'error',
        });
    }
};
var hanldeZodErrors = function (err, req, res) {
    var formattedErrors = err.errors.map(function (error) { return ({
        field: error.path.join('.'),
        message: error.message,
    }); });
    return res.status(422).json({
        status: 'fail',
        message: 'Validation failed',
        errors: formattedErrors,
    });
};
var globalErrorHandler = function (err, req, res, next) {
    logger_1.default.info("Error handled: ".concat(err.message));
    // Handle Zod validation errors
    if (err instanceof zod_1.z.ZodError) {
        hanldeZodErrors(err, req, res);
    }
    // Handle other application errors
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test') {
        sendErrorDev(err, req, res);
    }
    else if (process.env.NODE_ENV === 'production') {
        sendErrorProd(err, req, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
