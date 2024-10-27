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
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
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
        console.log(fileData);
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
        console.log(fileData.file.name);
        yield (0, storage_1.uploadBytes)(storageRef, fileData.file);
        return yield (0, storage_1.getDownloadURL)(storageRef);
    });
}
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
            socket.on('message:create', (message) => __awaiter(this, void 0, void 0, function* () {
                console.log('create message', message);
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
            //add createdAt,updatedAt,add url, derived at ,read at
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
