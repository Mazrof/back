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
exports.toggleUserStatus = exports.getAllUsers = exports.checkAdmin = void 0;
/**
 * Import the user repository and application error handling utility.
 */
var userRepository = require("../repositories");
var utility_1 = require("../utility");
/**
 * Checks whether an admin with the given ID exists.
 * Throws an error if the admin is not found.
 *
 * @param {number} adminId - The ID of the admin to verify.
 * @throws {AppError} If the admin is not found.
 */
var checkAdmin = function (adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var admin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, userRepository.findAdminById(adminId)];
            case 1:
                admin = _a.sent();
                if (!admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkAdmin = checkAdmin;
/**
 * Fetches all users from the database.
 * Requires the requester to be an authorized admin.
 *
 * @param {number} adminId - The ID of the admin making the request.
 * @returns {Promise<Array<{id: number, username: string, email: string, phone: string, bio: string, status: boolean, activeNow: boolean}>>}
 * An array of user objects containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `email`: User's email
 *  - `phone`: User's phone number
 *  - `bio`: User's bio
 *  - `status`: User's account status
 *  - `activeNow`: User's online status
 * @throws {AppError} If the admin is not authorized or no users are found.
 */
var getAllUsers = function (adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Verify admin authorization
            return [4 /*yield*/, (0, exports.checkAdmin)(adminId)];
            case 1:
                // Verify admin authorization
                _a.sent();
                return [4 /*yield*/, userRepository.getAllUsers()];
            case 2:
                users = _a.sent();
                if (!users) {
                    throw new utility_1.AppError('No users found', 404);
                }
                return [2 /*return*/, users];
        }
    });
}); };
exports.getAllUsers = getAllUsers;
/**
 * Toggles the active status of a user.
 * Requires the requester to be an authorized admin.
 *
 * @param {number} userId - The ID of the user to toggle status for.
 * @param {number} adminId - The ID of the admin making the request.
 * @returns {Promise<{id: number, username: string, status: boolean | null} | null>}
 * The updated user object containing:
 *  - `id`: User ID
 *  - `username`: User's username
 *  - `status`: User's updated account status
 * Returns `null` if no user is found.
 * @throws {AppError} If the admin is not authorized or the user is not found.
 */
var toggleUserStatus = function (userId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Verify admin authorization
            return [4 /*yield*/, (0, exports.checkAdmin)(adminId)];
            case 1:
                // Verify admin authorization
                _a.sent();
                return [4 /*yield*/, userRepository.findUserById(userId)];
            case 2:
                user = _a.sent();
                if (!user) {
                    throw new utility_1.AppError('No user found with that ID', 404);
                }
                return [4 /*yield*/, userRepository.updateUserStatus(userId, !user.status)];
            case 3: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.toggleUserStatus = toggleUserStatus;
