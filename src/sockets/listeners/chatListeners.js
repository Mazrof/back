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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.setupSocketEventHandlers = exports.disconnectAllUser = exports.disconnectedHandler = exports.handleNewConnection = exports.handleOpenContext = exports.handleEditMessage = exports.handleDeleteMessage = exports.handleNewMessage = void 0;
var server_1 = require("../../server");
var logger_1 = require("../../utility/logger");
// import {} from // deleteFileFromFirebase,
// uploadFileToFirebase,
// '../../third_party_services';
var client_1 = require("@prisma/client");
var services_1 = require("../../services");
var chat_1 = require("../chat");
var userRepository_1 = require("../../repositories/userRepository");
var utility_1 = require("../../utility");
var client_2 = require("../../prisma/client");
exports.handleNewMessage = (0, utility_1.catchSocketError)(function (socket, callback, message) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, repliedMsg, userExistsInGroupOrChannel, endFunction, createdMessage, roomSockets, messageReadReceipts, userSockets, _i, roomSockets_1, socketId, userId, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                message.senderId = socket.user.id;
                if (message.status === 'drafted') {
                    if (callback)
                        callback({
                            message: "you can't save a new message as drafted you are allowed to update the drafted messages only",
                        });
                    return [2 /*return*/];
                }
                if (!message.content) {
                    callback({
                        message: 'message is empty',
                    });
                    return [2 /*return*/];
                }
                if (!message.receiverId) return [3 /*break*/, 2];
                // if you provide a receiver id this means I will create new personal chat
                _a = message;
                return [4 /*yield*/, (0, services_1.createPersonalChat)(message.receiverId, message.senderId)];
            case 1:
                // if you provide a receiver id this means I will create new personal chat
                _a.participantId = (_d.sent()).participants.id;
                chat_1.Chat.getInstance()
                    .getSocketsByUserId(message.senderId)
                    .forEach(function (socket) {
                    socket.join(message.participantId.toString());
                });
                chat_1.Chat.getInstance()
                    .getSocketsByUserId(message.receiverId)
                    .forEach(function (socket) {
                    socket.join(message.participantId.toString());
                });
                _d.label = 2;
            case 2:
                if (!message.replyTo) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, services_1.getMessageById)(message.replyTo)];
            case 3:
                repliedMsg = _d.sent();
                if (!repliedMsg ||
                    repliedMsg.participantId !== message.participantId ||
                    repliedMsg.status === 'drafted') {
                    callback({
                        message: 'message being reply to is not found',
                    });
                    logger_1.default.info('message being reply to is not found');
                    return [2 /*return*/];
                }
                _d.label = 4;
            case 4:
                userExistsInGroupOrChannel = [];
                if (!message.inputMessageMentions) return [3 /*break*/, 9];
                if (!(message.participantType === 'channel')) return [3 /*break*/, 6];
                return [4 /*yield*/, client_2.default.channelSubscriptions.findMany({
                        where: { channelId: message.channelOrGroupId },
                        select: {
                            userId: true,
                        },
                    })];
            case 5:
                userExistsInGroupOrChannel = _d.sent();
                return [3 /*break*/, 9];
            case 6:
                if (!(message.participantType === 'group')) return [3 /*break*/, 8];
                return [4 /*yield*/, client_2.default.groupMemberships.findMany({
                        where: { groupId: message.channelOrGroupId },
                        select: {
                            userId: true,
                        },
                    })];
            case 7:
                userExistsInGroupOrChannel = _d.sent();
                return [3 /*break*/, 9];
            case 8:
                callback({ message: 'you cannot add mention in personal chats' });
                _d.label = 9;
            case 9:
                endFunction = false;
                userExistsInGroupOrChannel = userExistsInGroupOrChannel.map(function (user) { return user.userId; });
                message.inputMessageMentions = message.inputMessageMentions || [];
                message.inputMessageMentions.forEach(function (userId) {
                    if (!userExistsInGroupOrChannel.includes(userId)) {
                        callback({
                            message: "mention with id ".concat(userId, " doesnt exists in this group or channel"),
                        });
                        endFunction = true;
                        return;
                    }
                });
                if (endFunction)
                    return [2 /*return*/];
                message.messageMentions = message.inputMessageMentions.map(function (mention) { return ({
                    userId: mention,
                }); });
                message.inputMessageMentions = undefined;
                message.receiverId = undefined;
                return [4 /*yield*/, (0, services_1.createMessage)(__assign(__assign({}, message), { 
                        // content: null,
                        url: null, participantType: undefined, channelOrGroupId: undefined }))];
            case 10:
                createdMessage = _d.sent();
                roomSockets = server_1.io.sockets.adapter.rooms.get(message.participantId.toString());
                messageReadReceipts = [];
                userSockets = [];
                if (!roomSockets) return [3 /*break*/, 14];
                _i = 0, roomSockets_1 = roomSockets;
                _d.label = 11;
            case 11:
                if (!(_i < roomSockets_1.length)) return [3 /*break*/, 14];
                socketId = roomSockets_1[_i];
                userId = chat_1.Chat.getInstance().getUserUsingSocketId(socketId);
                if (!(userId !== message.senderId && !userSockets.includes(userId))) return [3 /*break*/, 13];
                console.log('created message', createdMessage);
                userSockets.push(userId);
                socket.to(userId.toString()).emit('message:receive', __assign(__assign({}, createdMessage), { 
                    // content: message.content,
                    url: undefined }));
                _c = (_b = messageReadReceipts).push;
                return [4 /*yield*/, (0, services_1.insertMessageRecipient)(userId, createdMessage)];
            case 12:
                _c.apply(_b, [_d.sent()]);
                _d.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 11];
            case 14:
                console.log(messageReadReceipts);
                server_1.io.to(message.senderId.toString()).emit('message:receive', __assign(__assign({}, createdMessage), { 
                    // content: message.content,
                    messageReadReceipts: messageReadReceipts, url: undefined }));
                if (message.durationInMinutes) {
                    setTimeout(function () {
                        (0, exports.handleDeleteMessage)(socket, undefined, createdMessage);
                    }, message.durationInMinutes * 60 * 1000);
                }
                return [2 /*return*/];
        }
    });
}); });
exports.handleDeleteMessage = (0, utility_1.catchSocketError)(function (socket, callback, data) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = socket.user.id;
                return [4 /*yield*/, (0, services_1.getMessageById)(data.id)];
            case 1:
                message = _a.sent();
                if (!message || message.senderId !== userId) {
                    if (callback)
                        callback({ message: 'message is not found' });
                    return [2 /*return*/];
                }
                logger_1.default.info('deleted message', message);
                // if (message!.url) await deleteFileFromFirebase(message!.url);
                return [4 /*yield*/, (0, services_1.deleteMessage)(message.id)];
            case 2:
                // if (message!.url) await deleteFileFromFirebase(message!.url);
                _a.sent();
                server_1.io.to(message.participantId.toString()).emit('message:deleted', {
                    message: { id: message.id, participantId: message.participantId },
                });
                return [2 /*return*/];
        }
    });
}); });
exports.handleEditMessage = (0, utility_1.catchSocketError)(function (socket, callback, data) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, message, url, content, updatedMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = socket.user.id;
                logger_1.default.info("message with id ".concat(data.id, " is being edited"));
                if (!data.content) {
                    callback({ message: 'message cannot have empty content' });
                }
                return [4 /*yield*/, (0, services_1.getMessageById)(data.id)];
            case 1:
                message = _a.sent();
                if (!message || message.senderId !== userId) {
                    if (callback)
                        callback({ message: 'message is not found' });
                    logger_1.default.info('message not found');
                    return [2 /*return*/];
                }
                content = data.content;
                return [4 /*yield*/, (0, services_1.updateMessageById)(data.id, {
                        content: content,
                    })];
            case 2:
                updatedMessage = _a.sent();
                if (message.status === client_1.MessageStatus.drafted) {
                    server_1.io.to(updatedMessage.senderId.toString()).emit('message:edited', __assign(__assign({}, updatedMessage), { messageReadReceipts: undefined, url: undefined, content: content }));
                    return [2 /*return*/];
                }
                server_1.io.to(updatedMessage.participantId.toString()).emit('message:edited', __assign(__assign({}, updatedMessage), { messageReadReceipts: undefined, url: undefined, content: content }));
                return [2 /*return*/];
        }
    });
}); });
exports.handleOpenContext = (0, utility_1.catchSocketError)(function (socket, callback, data) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, updatedMessages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = socket.user.id;
                console.log(userId);
                return [4 /*yield*/, (0, services_1.markMessagesAsRead)(userId, data.participantId)];
            case 1:
                updatedMessages = _a.sent();
                updatedMessages.forEach(function (msg) {
                    server_1.io.to(msg.messages.senderId.toString()).emit('message:update-info', __assign(__assign({}, msg), { messages: undefined }));
                });
                return [2 /*return*/];
        }
    });
}); });
exports.handleNewConnection = (0, utility_1.catchSocketError)(function (socket, callback) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, chatInstance, userParticipants, insertedData, rooms;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = socket.user.id;
                //mark user as active now
                return [4 /*yield*/, (0, userRepository_1.updateUserById)(userId, { activeNow: true, lastSeen: null })];
            case 1:
                //mark user as active now
                _a.sent();
                logger_1.default.info("User connected: ".concat(userId));
                chatInstance = chat_1.Chat.getInstance();
                chatInstance.addUser(userId, socket);
                return [4 /*yield*/, getAllParticipantIds(userId)];
            case 2:
                userParticipants = _a.sent();
                // Join user to all their chat rooms
                logger_1.default.info('userParticipants', userParticipants);
                userParticipants.forEach(function (chatId) { return socket.join(chatId.toString()); });
                //to sync drafted messages and send his message readAt
                socket.join(userId.toString());
                return [4 /*yield*/, (0, services_1.insertParticipantDate)(userId, userParticipants)];
            case 3:
                insertedData = _a.sent();
                notifyParticipants(insertedData, socket);
                // Set up socket event handlers
                (0, exports.setupSocketEventHandlers)(socket);
                rooms = Array.from(socket.rooms);
                socket.userRooms = rooms;
                console.log(rooms, 'rooms');
                rooms.forEach(function (room) {
                    socket.broadcast.to(room).emit('user:connected', {
                        socketId: socket.id,
                        userId: socket.user.id,
                        connected: true,
                    });
                });
                return [2 /*return*/];
        }
    });
}); });
// const handleCreateCall = catchSocketError(
//   async (
//     socket: MySocket,
//     callback: (arg: object) => void,
//     callDetails: object
//   ) => {}
// );
// Helper function to retrieve all participant IDs
var getAllParticipantIds = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, personalChatIds, groupIds, channelIds;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    (0, services_1.getParticipantIdsOfUserPersonalChats)(userId),
                    (0, services_1.getParticipantIdsOfUserGroups)(userId),
                    (0, services_1.getParticipantIdsOfUserChannels)(userId),
                ])];
            case 1:
                _a = _b.sent(), personalChatIds = _a[0], groupIds = _a[1], channelIds = _a[2];
                return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray([], personalChatIds, true), groupIds, true), channelIds, true)];
        }
    });
}); };
// Notify other participants about the updated info
var notifyParticipants = function (insertedData, socket) {
    insertedData.forEach(function (userRecipient) {
        server_1.io.to(userRecipient.senderId.toString()).emit('message:update-info', [
            userRecipient,
        ]);
    });
};
exports.disconnectedHandler = (0, utility_1.catchSocketError)(function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    var rooms, userId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger_1.default.info("User disconnected: ".concat(socket.user.id.toString()));
                rooms = Array.from(socket.userRooms);
                console.log(rooms);
                rooms.forEach(function (room) {
                    socket.broadcast.to(room).emit('user:disconnected', {
                        socketId: socket.id,
                        userId: socket.user.id,
                        connected: false,
                    });
                });
                userId = chat_1.Chat.getInstance().removeUser(socket.id);
                return [4 /*yield*/, (0, userRepository_1.updateUserById)(userId, {
                        activeNow: false,
                        lastSeen: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var disconnectAllUser = function () {
    if (server_1.io)
        server_1.io.sockets.sockets.forEach(function (socket) {
            (0, exports.disconnectedHandler)(socket).then(function (r) {
                socket.disconnect(true);
                logger_1.default.info("Disconnected socket: ".concat(socket.id));
            });
        });
};
exports.disconnectAllUser = disconnectAllUser;
var setupSocketEventHandlers = function (socket) {
    socket.on('message:sent', function (message, callback) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.handleNewMessage)(socket, callback, message)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('message:edit', function (message, callback) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.handleEditMessage)(socket, callback, message)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('message:delete', function (message, callback) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.handleDeleteMessage)(socket, callback, message)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('context:opened', function (data, callback) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.handleOpenContext)(socket, callback, data)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on('disconnect', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(socket.rooms, 'disconnected');
                    return [4 /*yield*/, (0, exports.disconnectedHandler)(socket)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    //One to One voice call setup
    socket.on('call-user', function (_a) {
        var targetId = _a.targetId, offer = _a.offer;
        server_1.io.to(targetId).emit('incoming-call', { from: socket.id, offer: offer });
    });
    socket.on('answer-call', function (_a) {
        var callerId = _a.callerId, answer = _a.answer;
        server_1.io.to(callerId).emit('call-answered', { from: socket.id, answer: answer });
    });
    socket.on('ice-candidate', function (_a) {
        var targetId = _a.targetId, candidate = _a.candidate;
        server_1.io.to(targetId).emit('ice-candidate', { from: socket.id, candidate: candidate });
    });
    //Group voice call setup
    socket.on('start-room', function (_a) {
        var roomId = _a.roomId, participinatId = _a.participinatId;
        socket.join(roomId);
        //TODO:I may need to store the current rooms
        server_1.io.to(participinatId.toString()).emit('room-created', {
            roomId: roomId,
            from: socket.id,
        });
    });
    socket.on('join-room', function (_a) {
        var roomId = _a.roomId;
        if (roomId) {
            socket.join(roomId);
            server_1.io.to(roomId).emit('user-joined', {
                userId: socket.id,
            });
        }
    });
    socket.on('offer', function (_a) {
        var roomId = _a.roomId, offer = _a.offer, to = _a.to;
        if (roomId) {
            socket.to(roomId).emit('offer', { from: socket.id, offer: offer, to: to });
        }
    });
    socket.on('answer', function (_a) {
        var roomId = _a.roomId, answer = _a.answer, to = _a.to;
        if (roomId) {
            socket.to(roomId).emit('answer', { from: socket.id, answer: answer, to: to });
        }
    });
    socket.on('group-ice-candidate', function (_a) {
        var roomId = _a.roomId, candidate = _a.candidate;
        if (roomId) {
            socket.to(roomId).emit('ice-candidate', { from: socket.id, candidate: candidate });
        }
    });
    socket.on('leave-room', function (_a) {
        var roomId = _a.roomId;
        if (roomId) {
            socket.leave(roomId);
            server_1.io.to(roomId).emit('user-left', { userId: socket.id });
        }
    });
};
exports.setupSocketEventHandlers = setupSocketEventHandlers;
