"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.storage = void 0;
var firebase_admin_1 = require("firebase-admin");
var path_1 = require("path");
var serviceAccount = path_1.default.join(__dirname, '../../../serviceAccountKey.json'); // Make sure this path is correct
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // If you're using Cloud Storage
});
var storage = firebase_admin_1.default.storage();
exports.storage = storage;
var bucket = storage.bucket();
exports.bucket = bucket;
