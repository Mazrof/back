"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const PORT = 3000;
process.on('uncaughtException', (err) => {
    console.log("ERROR 🔥: ", err);
    process.exit(1);
});
const startServer = () => {
    const app = (0, express_1.default)();
    let server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server);
    // TODO: connect to db
    // await connectToDB();
    (0, app_1.default)(app);
    server.listen(PORT, () => {
        console.log(`Server run on port ${PORT}`);
    });
    return server;
};
exports.server = startServer();
process.on('unhandledRejection', (err) => {
    console.log("ERROR 🔥: ", err.name, err.message);
    console.log("Shutting down ...");
    // process.exit(1);//will abort all running reqeusts
    exports.server.close(() => {
        process.exit(1);
    });
});
