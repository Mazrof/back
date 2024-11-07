"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
const chatListeners_1 = require("./listeners/chatListeners");
class Chat {
    constructor(io) {
        this.io = io;
        this.onlineUsers = new Map();
        this.socketToUserMap = new Map();
        this.setUpListeners();
    }
    addUser(userId, socket) {
        this.onlineUsers.set(userId, socket);
        this.socketToUserMap.set(socket.id, userId);
    }
    getUserUsingSocketId(socketId) {
        return this.socketToUserMap.get(socketId);
    }
    setUpListeners() {
        this.io.on('connection', chatListeners_1.handleNewConnection);
    }
    isOnline(userId) {
        return this.onlineUsers.has(userId);
    }
    removeUser(socketId) {
        const userId = this.socketToUserMap.get(socketId);
        if (userId !== undefined) {
            this.onlineUsers.delete(userId);
            this.socketToUserMap.delete(socketId);
        }
    }
    static getInstance(io) {
        if (!this._instance) {
            if (io)
                this._instance = new Chat(io);
            else
                throw new Error(`io is not defined: ${io}`);
        }
        return this._instance;
    }
}
exports.Chat = Chat;
//TODO: to create group or channel ==> create partitcipant also ask omar
//TODO: popluate the public key of the user
//TODO: how to start messaging on group or message
//TODO: error handling
//TODO: UNIT TEST
//TODO: WHEN the server opened delete all messages that expires while the server down
// io.use((socket, next) => {
//   // Middleware logic, e.g., authentication
//   const isAuthenticated = true; // Replace with your logic
//   if (isAuthenticated) {
//     next(); // Proceed to the event handler
//   } else {
//     next(new Error("Authentication error")); // Reject connection
//   }
// });
