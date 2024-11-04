"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const third_party_services_1 = require("../third_party_services");
const logger_1 = __importDefault(require("../utility/logger"));
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
    setUpListeners() {
        this.io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info('User connected');
            this.addUser(1, socket);
            // add user to his personal chats,groups,channels
            const userParticipants = [];
            const participantIdsOfUserPersonalChats = yield (0, services_1.getParticipantIdsOfUserPersonalChats)(1);
            const participantIdsOfUserGroups = yield (0, services_1.getParticipantIdsOfUserGroups)(1);
            const participantIdsOfUserChannels = yield (0, services_1.getParticipantIdsOfUserChannles)(1);
            userParticipants.push(...participantIdsOfUserPersonalChats);
            userParticipants.push(...participantIdsOfUserGroups);
            userParticipants.push(...participantIdsOfUserChannels);
            console.log('userParticipants', userParticipants);
            userParticipants.forEach((chatId) => {
                socket.join(chatId.toString());
            });
            // for each message id with particpiant id (insert a new row)
            const insertedData = yield (0, services_1.insertParticiantDate)(1, userParticipants);
            // tell others about that
            insertedData.forEach((userRecipient) => {
                this.io
                    .to(userRecipient.participantId.toString())
                    .emit('message:update-info', [userRecipient]);
                //TODO: DELETE THIS
                this.io.emit('message:update-info', [userRecipient]);
            });
            socket.on('message:sent', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('create message', message);
                yield this.handleNewMessage(socket, message);
            }));
            socket.on('message:edit', (message) => {
                this.handleEditMessage(socket, message);
            });
            socket.on('message:delete', (message) => {
                this.handleDeleteMessage(socket, message);
            });
            socket.on('context:opened', (data) => __awaiter(this, void 0, void 0, function* () {
                //TODO: get the data of the user from req after auth
                const updatedMessages = yield (0, services_1.markMessagesAsRead)(1, data.participantId);
                this.io
                    .to(data.participantId.toString())
                    .emit('message:update-info', updatedMessages);
                //TODO: DELETE THIS LINE
                this.io.emit('message:update-info', updatedMessages);
            }));
            socket.on('disconnect', () => {
                this.removeUser(socket.id);
            });
        }));
    }
    handleNewMessage(socket, message) {
        return __awaiter(this, void 0, void 0, function* () {
            // if you provide a receiver id this means I will create new personal chat
            if (message.receiverId) {
                //TODO : ADD SENDER ID FROM AUTH
                message.participantId = (yield (0, services_1.createPersonalChat)(message.receiverId, 1)).participants.id;
            }
            message.receiverId = undefined;
            if (message.content && message.content.length > 100) {
                message.url = yield (0, third_party_services_1.uploadFileToFirebase)(message.content);
                message.content = null; // to avoid saving it in db
            }
            //TODO: message.senderId = user.id
            const createdMessage = yield (0, services_1.createMessage)(message);
            console.log(createdMessage);
            const roomSockets = this.io.sockets.adapter.rooms.get(message.participantId.toString());
            if (roomSockets) {
                for (const socketId of roomSockets) {
                    const userId = this.socketToUserMap.get(socketId);
                    const socket = this.io.sockets.sockets.get(socketId);
                    yield (0, services_1.insertMessageRecipient)(userId, createdMessage);
                    if (socket) {
                        socket.emit('message:receive', { MSG: message });
                    }
                }
            }
            this.io
                .to(message.participantId.toString())
                .emit('message:receive', createdMessage);
            //TODO: DELETE THIS
            //TODO: WHAT IF THE ROW WAS NOT INSTERED AND YOU SAVE IT IN FIREBASE
            this.io.emit('message:receive', createdMessage);
            if (message.durationInMinutes) {
                setTimeout(() => {
                    this.handleDeleteMessage(socket, createdMessage);
                }, message.durationInMinutes * 60 * 1000);
            }
        });
    }
    handleEditMessage(socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO:problem of drafted messages(discuss with frontend)
            logger_1.default.info(`message with id ${data.id} is being edited`);
            const message = yield (0, services_1.getMessageById)(data.id);
            if (!message) {
                //TODO: WHAT if message doesn't exist
                return;
            }
            if (data.status === 'drafted') {
                //TODO: return error "you can not make the message drafted"
            }
            console.log(message);
            let url;
            if (data.content) {
                if (message.url) {
                    yield (0, third_party_services_1.deleteFileFromFirebase)(message.url);
                }
                if (data.content.length > 100) {
                    url = yield (0, third_party_services_1.uploadFileToFirebase)(data.content);
                    data.content = null; // to avoid saving it in db
                }
                else {
                    url = null;
                }
            }
            const { content, status, isAnnouncement } = data;
            const updatedMessage = yield (0, services_1.updateMessageById)(data.id, {
                content,
                status,
                isAnnouncement,
                url,
            });
            this.io
                .to(updatedMessage.participantId.toString())
                .emit('message:edited', updatedMessage);
        });
    }
    handleDeleteMessage(socket, data) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO: determine who can delete and post files in firebase
            const message = yield (0, services_1.getMessageById)(data.id);
            if (!message) {
                //TODO: RETURN ERROR HERE
            }
            console.log('deleted message', message);
            if (message.url)
                yield (0, third_party_services_1.deleteFileFromFirebase)(message.url);
            yield (0, services_1.deleteMessage)(message.id);
            this.io.to(message.participantId.toString()).emit('message:deleted', {
                message: { id: message.id, participantId: message.participantId },
            });
            //TODO: DELETE THIS
            this.io.emit('message:deleted', {
                message: { id: message.id, participantId: message.participantId },
            });
        });
    }
    isOnline(userId) {
        return this.onlineUsers.has(userId);
    }
    removeUser(socketId) {
        // Get user ID based on socket ID and remove both mappings
        const userId = this.socketToUserMap.get(socketId);
        if (userId !== undefined) {
            this.onlineUsers.delete(userId);
            this.socketToUserMap.delete(socketId);
        }
    }
}
exports.default = (io) => {
    new Chat(io);
};
//TODO: to create group or channel ==> create partitcipant also ask omar
//TODO: popluate the public key of the user
//TODO: how to start messaging on group or message
