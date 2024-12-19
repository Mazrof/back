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
exports.resetPassword = exports.requestPasswordReset = exports.verifyCode = exports.sendVerificationCode = void 0;
var ioredis_1 = require("ioredis");
var nodemailer_1 = require("nodemailer");
var utility_1 = require("../utility");
var crypto_1 = require("crypto");
var userRepository_1 = require("../repositories/userRepository");
// Connect to Redis with host, port, and password from environment variables
var redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || '127.0.0.1', // Default to localhost
    port: parseInt(process.env.REDIS_PORT, 10) || 6379, // Default to port 6379
    password: process.env.REDIS_PASSWORD || '', // Default to no password
});
var transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
// Send verification code
var sendVerificationCode = function (email, code) { return __awaiter(void 0, void 0, void 0, function () {
    var mailOptions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mailOptions = {
                    from: '"Mazroof" <no-reply@Mazroof.com>',
                    to: email,
                    subject: 'Email Verification Code',
                    text: "Your verification code is: ".concat(code),
                    html: "<p>Your verification code is: <strong>".concat(code, "</strong></p>"),
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 2:
                _a.sent();
                // Store the code in Redis with a 10-minute expiration
                return [4 /*yield*/, redis.set("verification:".concat(email), code, 'EX', 600)];
            case 3:
                // Store the code in Redis with a 10-minute expiration
                _a.sent();
                console.log('Verification email sent');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error sending email:', error_1);
                throw new utility_1.AppError('Failed to send email', 500);
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.sendVerificationCode = sendVerificationCode;
// Verify the code
var verifyCode = function (email, code) { return __awaiter(void 0, void 0, void 0, function () {
    var storedCode, isValid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, redis.get("verification:".concat(email))];
            case 1:
                storedCode = _a.sent();
                if (!storedCode) {
                    throw new utility_1.AppError('Code expired', 400);
                }
                isValid = storedCode === code;
                if (!isValid) return [3 /*break*/, 3];
                return [4 /*yield*/, redis.del("verification:".concat(email))];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, isValid];
        }
    });
}); };
exports.verifyCode = verifyCode;
// Request password reset
var requestPasswordReset = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var user, resetToken, tokenHash, resetUrl, mailOptions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, userRepository_1.findUserByEmail)(email)];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new utility_1.AppError('User not found', 404);
                }
                resetToken = crypto_1.default.randomBytes(32).toString('hex');
                tokenHash = crypto_1.default
                    .createHash('sha256')
                    .update(resetToken)
                    .digest('hex');
                return [4 /*yield*/, redis.set("passwordReset:".concat(user.id), tokenHash, 'EX', 900)];
            case 2:
                _a.sent();
                resetUrl = "".concat(process.env.FRONTEND_URL, "/reset-password?token=").concat(resetToken, "&id=").concat(user.id);
                mailOptions = {
                    from: '"Mazroof" <no-reply@yourapp.com>',
                    to: email,
                    subject: 'Password Reset Request',
                    html: "<p>You requested a password reset. Click the link below to reset your password:</p>\n           <a href=\"".concat(resetUrl, "\">").concat(resetUrl, "</a>\n           <p>If you did not request this, please ignore this email.</p>"),
                };
                return [4 /*yield*/, transporter.sendMail(mailOptions)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.requestPasswordReset = requestPasswordReset;
var resetPassword = function (id, token, newPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var storedTokenHash, incomingTokenHash, hashedPassword;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, redis.get("passwordReset:".concat(id))];
            case 1:
                storedTokenHash = _a.sent();
                if (!storedTokenHash) {
                    throw new utility_1.AppError('Token is invalid or expired', 400);
                }
                incomingTokenHash = crypto_1.default
                    .createHash('sha256')
                    .update(token)
                    .digest('hex');
                if (storedTokenHash !== incomingTokenHash) {
                    throw new utility_1.AppError('Token is invalid', 400);
                }
                hashedPassword = crypto_1.default
                    .createHash('sha256')
                    .update(newPassword)
                    .digest('hex');
                return [4 /*yield*/, (0, userRepository_1.updateUserById)(id, { password: hashedPassword })];
            case 2:
                _a.sent();
                return [4 /*yield*/, redis.del("passwordReset:".concat(id))];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.resetPassword = resetPassword;
