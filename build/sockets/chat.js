"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Chat {
    constructor(io) {
        this.io = io;
        this.setUpListeners();
        this.f = false;
    }
    setUpListeners() {
        this.io.on("connection", (socket) => {
            console.log('User connected');
            //TODO: socket.join(user.id); store them if needed
            //TODO: socket.join(hisGroups.id); store them if needed
            //TODO: socket.join(hisChannels.id); store them if needed
            // if(!this.f){
            //     socket.join('1');
            //     this.f = true;
            //     console.log("hi")
            // }else{
            //     socket.join('2');
            //     console.log("bi")
            // }
            socket.on('create-message', (message) => {
                this.handleNewMessage(socket, message);
            });
            socket.on('edit-message', (message) => {
                this.handleEditMessage(socket, message);
            });
            socket.on('delete-message', (message) => {
                this.handleDeleteMessage(socket, message);
            });
        });
    }
    handleNewMessage(socket, message) {
        //TODO:Save message in the db
        console.log(message);
        this.io.to(message.recieverId.toString()).emit('new-message', message);
    }
    handleEditMessage(socket, message) {
        //TODO: edit in db
        this.io.to(message.recieverId.toString()).emit('edited-message', message);
    }
    handleDeleteMessage(socket, message) {
        //TODO: delete from in db
        this.io.to(message.recieverId.toString()).emit('deleted-message', message);
    }
}
exports.default = (io) => {
    new Chat(io);
};
