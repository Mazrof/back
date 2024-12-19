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
exports.resetPasswordController = exports.requestPasswordResetController = exports.logoutController = exports.VerifyCodeSMSController = exports.sendVerificationCodeSmSController = exports.verifyCodeController = exports.sendVerificationCodeController = exports.whoami = exports.login = exports.signup = void 0;
var emailService_1 = require("./../services/emailService");
var authService_1 = require("../services/authService");
var utility_1 = require("../utility");
var authSchema_1 = require("../schemas/authSchema");
var emailService_2 = require("../services/emailService");
var smsService_1 = require("../services/smsService");
var crypto_1 = require("crypto");
exports.signup = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var validatedData, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                validatedData = authSchema_1.signupSchema.parse(req.body);
                return [4 /*yield*/, (0, authService_1.registerUser)(validatedData)];
            case 1:
                user = _a.sent();
                res.status(201).json({
                    status: 'success',
                    data: { user: { id: user.id, username: user.username } },
                });
                return [2 /*return*/];
        }
    });
}); });
exports.login = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, (0, authService_1.authenticateUser)(email, password)];
            case 1:
                user = _b.sent();
                if (!user)
                    throw new utility_1.AppError('Invalid credentials', 401);
                console.log(user);
                if ('bannedUsers' in user) {
                    req.session.user = { id: user.id, userType: 'Admin', user: user }; // Store user in session
                    res.status(200).json({
                        status: 'success',
                        data: { user: { id: user.id, user_type: 'Admin', user: user } },
                    });
                }
                else {
                    req.session.user = { id: user.id, userType: 'user', user: user }; // Store user in session
                    res.status(200).json({
                        status: 'success',
                        data: { user: { id: user.id, user_type: 'user', user: user } },
                    });
                }
                return [2 /*return*/];
        }
    });
}); });
exports.whoami = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        user = req.session.user;
        if (!user)
            throw new utility_1.AppError('User not logged in', 401);
        res.status(200).json({ status: 'success', data: { user: user } });
        return [2 /*return*/];
    });
}); });
exports.sendVerificationCodeController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, code, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                email = req.body.email;
                if (!email) {
                    throw new utility_1.AppError('Email is required', 400);
                }
                code = crypto_1.default.randomInt(100000, 999999).toString();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, emailService_2.sendVerificationCode)(email, code)];
            case 2:
                _b.sent();
                res.status(200).json({
                    status: 'success',
                    data: { message: 'Verification code sent' },
                });
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                throw new utility_1.AppError('Failed to send email', 500);
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.verifyCodeController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, code;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, code = _a.code;
                if (!email || !code) {
                    throw new utility_1.AppError('Email and code are required', 400);
                }
                return [4 /*yield*/, (0, emailService_2.verifyCode)(email, code)];
            case 1:
                if (_b.sent()) {
                    res
                        .status(200)
                        .json({ status: 'success', data: { message: 'Code is valid' } });
                }
                else {
                    throw new utility_1.AppError('Invalid code', 400);
                }
                return [2 /*return*/];
        }
    });
}); });
exports.sendVerificationCodeSmSController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var phoneNumber, code, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                phoneNumber = req.body.phoneNumber;
                if (!phoneNumber) {
                    throw new utility_1.AppError('Phone number is required', 400);
                }
                code = crypto_1.default.randomInt(100000, 999999).toString();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, smsService_1.sendVerificationCodeSMS)(phoneNumber, code)];
            case 2:
                _b.sent();
                res.status(200).json({
                    status: 'success',
                    data: { message: 'Verification code sent' },
                });
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                throw new utility_1.AppError('Failed to send SMS', 500);
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.VerifyCodeSMSController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, phoneNumber, code;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, phoneNumber = _a.phoneNumber, code = _a.code;
                if (!phoneNumber || !code) {
                    throw new utility_1.AppError('Phone number and code are required', 400);
                }
                return [4 /*yield*/, (0, emailService_2.verifyCode)(phoneNumber, code)];
            case 1:
                if (_b.sent()) {
                    res
                        .status(200)
                        .json({ status: 'success', data: { message: 'Code is valid' } });
                }
                else {
                    throw new utility_1.AppError('Invalid code', 400);
                }
                return [2 /*return*/];
        }
    });
}); });
exports.logoutController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        req.logout(function (err) {
            if (err)
                throw new utility_1.AppError('Failed to logout', 500);
            res.clearCookie('connect.sid');
            res
                .status(200)
                .json({ status: 'success', data: { message: 'Logged out' } });
        });
        return [2 /*return*/];
    });
}); });
exports.requestPasswordResetController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!email) {
                    throw new utility_1.AppError('Email is required', 400);
                }
                return [4 /*yield*/, (0, emailService_1.requestPasswordReset)(email)];
            case 1:
                _a.sent();
                res.status(200).json({
                    status: 'success',
                    data: { message: 'Reset link sent' },
                });
                return [2 /*return*/];
        }
    });
}); });
exports.resetPasswordController = (0, utility_1.catchAsync)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, token, newPassword, userId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, token = _a.token, newPassword = _a.newPassword, userId = _a.userId;
                if (!userId || !token || !newPassword) {
                    throw new utility_1.AppError('Missing required fields', 400);
                }
                return [4 /*yield*/, (0, emailService_1.resetPassword)(userId, token, newPassword)];
            case 1:
                _b.sent();
                res.status(200).json({
                    status: 'success',
                    data: { message: 'Password reset successful' },
                });
                return [2 /*return*/];
        }
    });
}); });
