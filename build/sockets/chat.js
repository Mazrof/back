"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Chat {
    constructor(io) {
        this.io = io;
        this.setUpListeners();
    }
    setUpListeners() {
        this.io.on('connection', (socket) => {
            console.log('user connected');
        });
    }
}
exports.default = (io) => {
    new Chat(io);
};
