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
exports.deleteChannelMember = exports.inviteChannelMember = exports.updateChannelMember = exports.addChannelMember = exports.getChannelMembers = void 0;
var utility_1 = require("../utility");
var channelMemberService = require("../services/channelMemberService");
/**
 * Controller to fetch all members of a channel.
 *
 * @param req - The request object, containing user ID and channel ID.
 * @param res - The response object used to send the list of members back to the client.
 * @param next - The next function to pass control to the next middleware.
 */
exports.getChannelMembers = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, channelId, members;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.user.id;
                channelId = parseInt(req.params.channelId);
                return [4 /*yield*/, channelMemberService.getChannelMembers(channelId, userId)];
            case 1:
                members = _a.sent();
                // Return the list of members with the total count
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        results: members.length, // Total number of members
                        data: {
                            members: members,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to add a new member to the channel.
 *
 * @param req - The request object, containing user ID, role, and permissions.
 * @param res - The response object used to send back the added member's details.
 * @param next - The next function to pass control to the next middleware.
 */
exports.addChannelMember = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var memberId, requesterId, channelId, role, hasDownloadPermissions, member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                memberId = parseInt(req.body.userId);
                requesterId = req.session.user.id;
                channelId = parseInt(req.params.channelId);
                role = req.body.role;
                hasDownloadPermissions = req.body.hasDownloadPermissions;
                return [4 /*yield*/, channelMemberService.addChannelMember(memberId, channelId, requesterId, role, hasDownloadPermissions)];
            case 1:
                member = _a.sent();
                // Respond with the member's data after they are added
                return [2 /*return*/, res.status(201).json({
                        status: 'success',
                        data: {
                            member: member,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to update an existing channel member's details.
 *
 * @param req - The request object, containing the member's updated data and channel ID.
 * @param res - The response object used to send back the updated member's details.
 * @param next - The next function to pass control to the next middleware.
 */
exports.updateChannelMember = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, channelId, memberId, member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.user.id;
                channelId = parseInt(req.params.channelId);
                memberId = parseInt(req.params.id);
                return [4 /*yield*/, channelMemberService.updateChannelMember(userId, channelId, memberId, req.body // The updated data for the member (e.g., role, permissions)
                    )];
            case 1:
                member = _a.sent();
                // Return the updated member's data
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        data: {
                            member: member,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to invite a user to join a channel using an invitation token.
 *
 * @param req - The request object containing the invitation token.
 * @param res - The response object used to send back the member's details after they join.
 * @param next - The next function to pass control to the next middleware.
 */
exports.inviteChannelMember = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, memberId, member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = req.body.token;
                memberId = req.session.user.id;
                return [4 /*yield*/, channelMemberService.joinChannelByInvite(token, memberId)];
            case 1:
                member = _a.sent();
                // Respond with the member's data after they join the channel
                return [2 /*return*/, res.status(201).json({
                        status: 'success',
                        data: {
                            member: member,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to remove a member from the channel.
 *
 * @param req - The request object containing the member's ID and channel ID.
 * @param res - The response object used to confirm the member's deletion.
 * @param next - The next function to pass control to the next middleware.
 */
exports.deleteChannelMember = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var memberId, userId, channelId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                memberId = parseInt(req.params.id);
                userId = req.session.user.id;
                channelId = parseInt(req.params.channelId);
                if (!(memberId !== channelId)) return [3 /*break*/, 2];
                return [4 /*yield*/, channelMemberService.checkChannelMemberPermission(userId, channelId)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: 
            // Call the service to delete the member
            return [4 /*yield*/, channelMemberService.deleteChannelMember(channelId, memberId)];
            case 3:
                // Call the service to delete the member
                _a.sent();
                // Respond with a success message after the member is deleted
                return [2 /*return*/, res.status(204).json({
                        status: 'success',
                        data: null, // No content to return as the member has been removed
                    })];
        }
    });
}); });
