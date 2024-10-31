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
const utility_1 = require("../utility");
class Chat {
    constructor(io) {
        this.io = io;
        this.setUpListeners();
        this.onlineUsers = [];
    }
    setUpListeners() {
        this.io.on('connection', (socket) => {
            console.log('User connected');
            //TODO: socket.join(AllhisPersonalChats.id); store them if needed
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
        });
    }
    handleNewMessage(socket, message) {
        return __awaiter(this, void 0, void 0, function* () {
            //add createdAt,updatedAt,add url, (derived at ,read at) ==> TABLE
            console.log(message);
            let url = undefined;
            if (message.content != undefined && message.content.length > 100) {
                message.url = yield (0, utility_1.uploadFileToFirebase)(message.content);
                message.content = undefined; // to avoid saving it in db
            }
            //TODO: using context id to know the targeted users
            //TODO:Save message in the db
            //TODO:send the messages returned from db
            //TODO:if the message has expire duration use set time out then call the even handler for delete message
            //      settimeout(()=>{this.handledeleteMessage()}),duration)
            this.io.to(message.contextId.toString()).emit('message:receive', message);
            //TODO: DELETE THIS;
            this.io.emit('message:receive', message);
        });
    }
    handleEditMessage(socket, message) {
        //TODO: edit in db
        this.io.to(message.contextId.toString()).emit('message:edited', message);
    }
    handleDeleteMessage(socket, message) {
        //TODO: mark this message as deleted, make content null,
        //TODO: delete from firebase
        //TODO: determine who can delete and post files in firebase
        //TODO:this.io.to(message.contextId.toString()).emit('message:edited', message)
        (0, utility_1.deleteFileFromFirebase)('http://example.com/uploads/fileurl');
        this.io.to(message.contextId.toString()).emit('message:deleted', message);
    }
    handleMessageInfo(socket, message) {
        //
        this.io
            .to(message.contextId.toString())
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
