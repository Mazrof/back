"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
// Define log levels and colors
var logFormat = winston_1.format.printf(function (_a) {
    var level = _a.level, message = _a.message, timestamp = _a.timestamp;
    return "[".concat(timestamp, "] ").concat(level, ": ").concat(message);
});
var logger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.colorize(), logFormat),
    // transports: [new transports.Console()],
});
logger.add(new winston_1.transports.Console({
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
}));
exports.default = logger;
