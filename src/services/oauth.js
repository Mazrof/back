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
var passport_1 = require("passport");
var passport_google_oauth20_1 = require("passport-google-oauth20"); // or passport-google-oauth2 for older version
var passport_github2_1 = require("passport-github2");
var userRepo = require("../repositories/userRepository");
var client_1 = require("@prisma/client");
// Your Google OAuth credentials
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "".concat(process.env.BACKEND_URL, "/api/v1/auth/google/callback"),
}, function (accessToken, refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userWithEmail, userToInsert, saved_user, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, userRepo.findUserByProvider(profile.id, client_1.Social.google)];
            case 1:
                user = _a.sent();
                return [4 /*yield*/, userRepo.findUserByEmail(profile._json.email)];
            case 2:
                userWithEmail = _a.sent();
                if (user || userWithEmail) {
                    return [2 /*return*/, done(null, user)];
                }
                userToInsert = {
                    providerId: profile.id,
                    email: profile._json.email,
                    provider: 'google',
                    userName: profile.displayName,
                    email_verified: profile._json.email_verified,
                    picture: profile._json.picture,
                };
                return [4 /*yield*/, userRepo.storeOAuthUser(userToInsert)];
            case 3:
                saved_user = _a.sent();
                return [2 /*return*/, done(null, saved_user)];
            case 4:
                err_1 = _a.sent();
                return [2 /*return*/, done(err_1, false)];
            case 5: return [2 /*return*/];
        }
    });
}); }));
// Serialize user into the session
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport_1.default.serializeUser(function (user, done) {
    done(null, user.id);
});
// Deserialize user from the session
passport_1.default.deserializeUser(function (id, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, userRepo.findUserById(id)];
            case 1:
                user = _a.sent();
                done(null, user);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                done(error_1, null);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "".concat(process.env.BACKEND_URL, "/api/v1/auth/github/callback"),
}, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function (accessToken, refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userToInsert, saved_user, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, userRepo.findUserByProvider(profile.id, client_1.Social.github)];
            case 1:
                user = _a.sent();
                if (user) {
                    return [2 /*return*/, done(null, user)];
                }
                userToInsert = {
                    providerId: profile.id,
                    email: profile._json.email,
                    provider: 'github',
                    userName: profile.username,
                    email_verified: profile._json.email_verified,
                    picture: profile._json.avatar_url,
                };
                return [4 /*yield*/, userRepo.storeOAuthUser(userToInsert)];
            case 2:
                saved_user = _a.sent();
                return [2 /*return*/, done(null, saved_user)];
            case 3:
                err_2 = _a.sent();
                return [2 /*return*/, done(err_2, false)];
            case 4: return [2 /*return*/];
        }
    });
}); }));
exports.default = passport_1.default;
