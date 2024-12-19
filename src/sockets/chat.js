"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = void 0;
var chatListeners_1 = require("./listeners/chatListeners");
var Chat = /** @class */ (function () {
    function Chat(io) {
        this.io = io;
        this.onlineUsers = new Map();
        this.socketToUserMap = new Map();
        this.setUpAuth();
        this.setUpListeners();
    }
    Chat.prototype.addUser = function (userId, socket) {
        var userSockets = this.onlineUsers.get(userId);
        if (!userSockets) {
            userSockets = [];
        }
        this.onlineUsers.set(userId, __spreadArray(__spreadArray([], userSockets, true), [socket], false));
        this.socketToUserMap.set(socket.id, userId);
    };
    Chat.prototype.getUserUsingSocketId = function (socketId) {
        return this.socketToUserMap.get(socketId);
    };
    Chat.prototype.getSocketsByUserId = function (userId) {
        return this.onlineUsers.get(userId) || [];
    };
    Chat.prototype.setUpListeners = function () {
        this.io.on('connection', chatListeners_1.handleNewConnection);
    };
    Chat.prototype.removeUser = function (socketId) {
        var userId = this.socketToUserMap.get(socketId);
        if (userId !== undefined) {
            this.onlineUsers.delete(userId);
            this.socketToUserMap.delete(socketId);
            return userId;
        }
        return -1;
    };
    Chat.getInstance = function (io) {
        if (!this._instance) {
            if (io)
                this._instance = new Chat(io);
            else
                throw new Error("io is not defined: ".concat(io));
        }
        return this._instance;
    };
    Chat.prototype.setUpAuth = function () {
        this.io.use(function (socket, next) {
            var session = socket.request.session;
            if (session && session.user) {
                // Attach user info to the socket object for later use
                socket.user = __assign({ id: session.user.id }, session.userData);
                next();
            }
            else {
                next(new Error('Unauthorized'));
            }
        });
    };
    return Chat;
}());
exports.Chat = Chat;
