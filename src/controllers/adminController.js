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
exports.banUser = exports.getAllUsers = void 0;
var userService = require("../services");
var utility_1 = require("../utility");
/**
 * Controller to fetch all users.
 * Requires the requester to be an authorized admin.
 *
 * @param {Request} req - The HTTP request object, containing admin session ID.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of user objects.
 * @throws {AppError} If the admin is not authorized or no users are found.
 */
exports.getAllUsers = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                return [4 /*yield*/, userService.getAllUsers(adminId)];
            case 1:
                users = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        results: users.length,
                        data: {
                            users: users,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to toggle the active status of a user.
 * Requires the requester to be an authorized admin.
 *
 * @param {Request} req - The HTTP request object, containing admin session ID and user ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated user object.
 * @throws {AppError} If the admin is not authorized or the user is not found.
 */
exports.banUser = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                userId = parseInt(req.params.userId);
                return [4 /*yield*/, userService.toggleUserStatus(userId, adminId)];
            case 1:
                user = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        data: {
                            user: user,
                        },
                    })];
        }
    });
}); });
