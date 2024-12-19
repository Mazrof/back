"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
var express_1 = require("express");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var app_1 = require("./app");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var chat_1 = require("./sockets/chat");
var logger_1 = require("./utility/logger");
var chatListeners_1 = require("./sockets/listeners/chatListeners");
var PORT = 3000;
process.on('uncaughtException', function (err) {
    logger_1.default.error('ERROR 🔥: ', err);
    (0, chatListeners_1.disconnectAllUser)();
    exports.io.emit('server:shutdown', { message: 'Server encountered an issue' });
    process.exit(1);
});
var wrapMiddlewareForSocket = function (
// eslint-disable-next-line no-unused-vars
middleware) {
    return function (socket, next) {
        middleware(socket.request, {}, next);
    };
};
var startServer = function () {
    var app = (0, express_1.default)();
    var server = http_1.default.createServer(app);
    var io = new socket_io_1.Server(server, {
        cors: {
            origin: ["".concat(process.env.FRONTEND_URL), 'http://localhost:3000'], // Adjust based on your front-end domain
            credentials: true, // Allow cookies to be sent
        },
        maxHttpBufferSize: 10e6,
    });
    io.use(wrapMiddlewareForSocket(app_1.sessionMiddleware));
    chat_1.Chat.getInstance(io);
    (0, app_1.default)(app);
    server.listen(PORT, function () {
        logger_1.default.info("Server run on port ".concat(PORT));
    });
    return { server: server, io: io };
};
exports.server = (_a = startServer(), _a.server), exports.io = _a.io;
process.on('unhandledRejection', function (err) {
    logger_1.default.error('ERROR 🔥: ', err.name, err.message);
    exports.io.emit('server:shutdown', {
        message: 'Server is shutting down for maintenance',
    });
    gracefulShutdown();
});
var isShuttingDown = false;
function gracefulShutdown() {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger_1.default.info('Starting graceful shutdown...');
    (0, chatListeners_1.disconnectAllUser)();
    exports.server.close(function () {
        logger_1.default.info('Closed all connections and server stopped.');
        process.exit(0);
    });
    setTimeout(function () {
        logger_1.default.warn('Force shutdown after 10 seconds.');
        process.exit(1);
    }, 5000);
}
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
