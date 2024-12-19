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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToFirebase = void 0;
exports.deleteFileFromFirebase = deleteFileFromFirebase;
exports.getFileFromFirebase = getFileFromFirebase;
var config_1 = require("../config");
var uploadFileToFirebase = function (messageContent) { return __awaiter(void 0, void 0, void 0, function () {
    var randomName, fileBuffer, file, downloadUrl, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                randomName = "file_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 15));
                fileBuffer = Buffer.from(messageContent, 'utf-8');
                file = config_1.bucket.file("uploads/".concat(randomName, ".txt"));
                return [4 /*yield*/, file.save(fileBuffer)];
            case 1:
                _a.sent();
                return [4 /*yield*/, file.getSignedUrl({
                        action: 'read',
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // Expiration date for the URL after 30 days
                    })];
            case 2:
                downloadUrl = (_a.sent())[0];
                return [2 /*return*/, downloadUrl];
            case 3:
                error_1 = _a.sent();
                console.error('Error in uploadFileToFirebase:', error_1);
                throw error_1; // Re-throw for higher-level handling
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.uploadFileToFirebase = uploadFileToFirebase;
function deleteFileFromFirebase(fileURL) {
    return __awaiter(this, void 0, void 0, function () {
        var url, path, file, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!fileURL) {
                        throw new Error('No URL provided');
                    }
                    url = new URL(fileURL);
                    path = decodeURIComponent(url.pathname.split('/uploads/')[1]);
                    // Ensure that the extracted path is valid
                    if (!path) {
                        throw new Error('Invalid file path extracted from URL');
                    }
                    path = 'uploads/' + path;
                    file = config_1.bucket.file(path);
                    // Delete the file
                    return [4 /*yield*/, file.delete()];
                case 1:
                    // Delete the file
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getFileFromFirebase(fileURL) {
    return __awaiter(this, void 0, void 0, function () {
        var url, path, file, fileBuffer, fileContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!fileURL) {
                        throw new Error('No URL provided');
                    }
                    url = new URL(fileURL);
                    path = decodeURIComponent(url.pathname.split('/uploads/')[1]);
                    // Ensure that the extracted path is valid
                    if (!path) {
                        throw new Error('Invalid file path extracted from URL');
                    }
                    path = 'uploads/' + path;
                    file = config_1.bucket.file(path);
                    return [4 /*yield*/, file.download()];
                case 1:
                    fileBuffer = (_a.sent())[0];
                    fileContent = fileBuffer.toString('utf-8');
                    return [2 /*return*/, fileContent];
                case 2:
                    error_3 = _a.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
