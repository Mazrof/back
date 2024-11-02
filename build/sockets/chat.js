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
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
const third_party_services_1 = require("../third_party_services");
class Chat {
    constructor(io) {
        this.io = io;
        this.setUpListeners();
        this.onlineUsers = [];
    }
    setUpListeners() {
        this.io.on('connection', (socket) => __awaiter(this, void 0, void 0, function* () {
            console.log('User connected');
            //TODO: socket.join(AllhisPersonalChats.id); store them if needed
            const personalChatsId = yield (0, services_1.getPersonalChatd)(1);
            personalChatsId.forEach((chatId) => {
                socket.join(chatId.toString());
            });
            //TODO: socket.join(hisGroups.id); store them if needed
            //TODO: socket.join(hisChannels.id); store them if needed
            //TODO: push to the online user array [userId,socket]
            //TODO: update all message to him to be deliveredAt this moment may be in the my-chats route
            // this.onlineUsers.push({123:socket})
            // console.log(this.isOnline(123))
            // console.log(this.getUserSocket(123))
            socket.on('message:sent', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('create message', message);
                yield this.handleNewMessage(socket, message);
            }));
            socket.on('message:edited', (message) => {
                this.handleEditMessage(socket, message);
            });
            socket.on('message:deleted', (message) => {
                this.handleDeleteMessage(socket, message);
            });
            socket.on('message:get-info', (message) => {
                this.handleMessageInfo(socket, message);
            });
            socket.on('context:opened', (data) => {
                // data.contextId,
                //TODO: update user seen_at date for messsages of this context for the user who make the request
                //query: message join userDelivery on messageID where conext = contextId and recieverUser = requestedUser
                // 1-get all messages that are unseen in this context
                // 2-update seen_at from message delviey table when id  in (array from the previous step)
                // tell other people about that update
                // this.io.to(message.contextId.toString()).emit('message:update-info',message)
            });
        }));
    }
    handleNewMessage(socket, message) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(message);
            if (message.content && message.content.length > 100) {
                message.url = yield (0, third_party_services_1.uploadFileToFirebase)(message.content);
                message.content = null; // to avoid saving it in db
            }
            //TODO:
            // message.senderId = user.id;
            //TODO: in the frontend emit('context:opened when a new message')
            // add (derived at ,read at) =: =: > TABLE
            const createdMessage = yield (0, services_1.createMessage)(message);
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
    handleEditMessage(socket, message) {
        //TODO: edit in db
        this.io
            .to(message.participantId.toString())
            .emit('message:edited', message);
    }
    handleDeleteMessage(socket, message) {
        //TODO: mark this message as deleted, make content null,
        //TODO: delete from firebase
        //TODO: determine who can delete and post files in firebase
        //TODO:this.io.to(message.contextId.toString()).emit('message:edited', message)
        // deleteFileFromFirebase('http://example.com/uploads/fileurl');
        console.log('deleted message', message);
        this.io
            .to(message.participantId.toString())
            .emit('message:deleted', message);
    }
    handleMessageInfo(socket, message) {
        //
        this.io
            .to(message.participantId.toString())
            .emit('message:update-info', message);
    }
    isOnline(userId) {
        return this.getUserSocket(userId) !== undefined;
    }
    getUserSocket(userId) {
        const userSocket = this.onlineUsers.find((userSocket) => userId in userSocket);
        if (userSocket)
            return userSocket[userId];
        return undefined;
    }
}
exports.default = (io) => {
    new Chat(io);
};
// prisma.participants.deleteMany().then((d) => console.log(d));
// prisma.participants
//   .create({
//     data: {
//       personalChatId: 2,
//     },
//   })
//   .then((d) => console.log(d))
//   .catch((d) => console.log(d));
//TODO: DROP COLUMN ATTACKMENT,EXPIREAT
