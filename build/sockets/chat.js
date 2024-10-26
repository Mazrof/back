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
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMfMq-VLTXH7TxgOrOvHy5BKm5XUICWxg",
    authDomain: "mazrof-fca98.firebaseapp.com",
    projectId: "mazrof-fca98",
    storageBucket: "mazrof-fca98.appspot.com",
    messagingSenderId: "241101833503",
    appId: "1:241101833503:web:d16acd43ec1b22dded1c2a",
    measurementId: "G-PMG3VSFGXC"
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
const storage = (0, storage_1.getStorage)(app);
function uploadFile(fileData) {
    return __awaiter(this, void 0, void 0, function* () {
        //TODO: UNCOMMENT THIS
        // const fileType = file.type.split('/')[0];
        let folderPath = 'uploads/';
        // Organize by file type
        if (fileData.fileType === 'image') {
            folderPath += 'images/';
        }
        else if (fileData.fileType === 'video') {
            folderPath += 'videos/';
        }
        else {
            folderPath += 'documents/';
        }
        const storageRef = (0, storage_1.ref)(storage, `${folderPath}${fileData.filename}`);
        yield (0, storage_1.uploadBytes)(storageRef, fileData.file);
        return yield (0, storage_1.getDownloadURL)(storageRef);
    });
}
// .then((url) => {
//     fileUrl =  url;
// }).catch((error) => {
//     console.error('Error retrieving file URL:', error);
// });
class Chat {
    // private f: boolean;
    constructor(io) {
        this.io = io;
        this.setUpListeners();
        // this.f = false;
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
            socket.on('create-message', (message) => __awaiter(this, void 0, void 0, function* () {
                yield this.handleNewMessage(socket, message);
            }));
            socket.on('edit-message', (message) => {
                this.handleEditMessage(socket, message);
            });
            socket.on('delete-message', (message) => {
                this.handleDeleteMessage(socket, message);
            });
        });
    }
    handleNewMessage(socket, message) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO:Save message in the db
            console.log(message);
            let url = undefined;
            if (message.file != undefined) {
                url = yield uploadFile(message);
                console.log(url);
            }
            this.io.to(message.recieverId.toString()).emit('new-message', Object.assign(Object.assign({}, message), { url, file: undefined }));
            //TODO: DELETE THIS;
            this.io.emit('new-message', Object.assign(Object.assign({}, message), { url, file: undefined }));
        });
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
