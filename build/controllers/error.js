"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const sendErrorDev = (err, req, res) => {
    console.log(req.originalUrl);
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            message: err.message,
            status: err.status,
            stack: err.stack,
            error: err,
        });
    }
};
const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                message: err.message,
                status: err.status,
            });
        }
        //programming errors
        console.error('Error 💣️💣️💣️', err);
        return res.status(500).json({
            message: 'Something went wrong',
            status: 'error',
        });
    }
};
const globalErrorHandler = (err, req, res, next) => {
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
