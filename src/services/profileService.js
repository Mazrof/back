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
exports.updateProfile = exports.createProfile = exports.getProfileById = exports.getAllProfiles = void 0;
// src/service/profileService.ts
var utility_1 = require("../utility");
var profileRepository = require("../repositories/profileRepository");
var isValidPhoneNumber = function (phoneNumber) {
    var phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return phoneRegex.test(phoneNumber);
};
var isValidEmail = function (email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
var getAllProfiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, profileRepository.findAllProfiles()];
            case 1:
                users = _a.sent();
                return [4 /*yield*/, Promise.all(users.map(function (user) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // user.photo = await getFileFromFirebase(user.photo);
                            return [2 /*return*/, user];
                        });
                    }); }))];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getAllProfiles = getAllProfiles;
var getProfileById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, profileRepository.findProfileById(id)];
            case 1:
                user = _a.sent();
                //user.photo = await getFileFromFirebase(user.photo);
                return [2 /*return*/, user];
        }
    });
}); };
exports.getProfileById = getProfileById;
var createProfile = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (data.phone && !isValidPhoneNumber(data.phone)) {
                    throw new utility_1.AppError('Invalid phone number', 400);
                }
                if (data.email && !isValidEmail(data.email)) {
                    throw new utility_1.AppError('Invalid email format', 400);
                }
                if (data.photo) {
                    //  data.photo = await uploadFileToFirebase(data.photo);
                }
                return [4 /*yield*/, profileRepository.createProfile(data)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.createProfile = createProfile;
var updateProfile = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var updatedUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (data.phone && !isValidPhoneNumber(data.phone)) {
                    throw new utility_1.AppError('Invalid phone number', 400);
                }
                if (data.email && !isValidEmail(data.email)) {
                    throw new utility_1.AppError('Invalid email format', 400);
                }
                if (data.photo) {
                    //   data.photo = await uploadFileToFirebase(data.photo);
                }
                return [4 /*yield*/, profileRepository.updateProfileById(id, data)];
            case 1:
                updatedUser = _a.sent();
                if (!updatedUser)
                    throw new utility_1.AppError('No profile found with that ID', 404);
                return [2 /*return*/, updatedUser];
        }
    });
}); };
exports.updateProfile = updateProfile;
