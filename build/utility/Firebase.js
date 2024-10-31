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
exports.deleteFileFromFirebase = exports.uploadFileToFirebase = void 0;
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
const uploadFileToFirebase = (messageContent) => __awaiter(void 0, void 0, void 0, function* () {
    const randomName = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const stringBlob = new Blob([messageContent], { type: 'text/plain' });
    const storageRef = (0, storage_1.ref)(storage, `uploads/${randomName}.txt`);
    yield (0, storage_1.uploadBytes)(storageRef, stringBlob);
    return yield (0, storage_1.getDownloadURL)(storageRef);
});
exports.uploadFileToFirebase = uploadFileToFirebase;
const deleteFileFromFirebase = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract the file path from the URL
        const filePath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
        // Create a reference to the file in the storage
        const fileRef = (0, storage_1.ref)(storage, filePath);
        // Delete the file
        yield (0, storage_1.deleteObject)(fileRef);
        console.log(`File ${filePath} deleted successfully.`);
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
});
exports.deleteFileFromFirebase = deleteFileFromFirebase;
