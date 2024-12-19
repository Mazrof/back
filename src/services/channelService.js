"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.deleteChannel = exports.updateChannel = exports.createChannel = exports.findChannelById = exports.findAllChannels = exports.checkData = void 0;
var channelRepository = require("../repositories");
var invitationLink_1 = require("../utility/invitationLink");
var channelMemberService = require("../services");
var client_1 = require("@prisma/client");
var utility_1 = require("../utility");
/**
 * Checks the validity of the input data for creating or updating a channel.
 *
 * @param {Object} data - The data to check.
 * @param {string} data.name - The name of the channel.
 * @param {number} data.creatorId - The ID of the creator of the channel.
 * @param {boolean} [data.privacy] - The privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The image URL for the channel (optional).
 * @throws {AppError} If required data is missing, an error is thrown.
 */
var checkData = function (data) {
    var message = '';
    if (!data.name) {
        message = 'Invalid Group name';
    }
    if (!data.creatorId) {
        if (message)
            message += ', ';
        message += 'Invalid Creator ID';
    }
    if (message) {
        throw new utility_1.AppError("".concat(message), 400);
    }
};
exports.checkData = checkData;
/**
 * Fetches all channels from the repository.
 *
 * @returns {Promise<commonChannelResponse[]>} A promise that resolves to an array of channel objects.
 */
var findAllChannels = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, channelRepository.findAllChannels()];
    });
}); };
exports.findAllChannels = findAllChannels;
/**
 * Finds a channel by its ID.
 *
 * @param {number} channelId - The ID of the channel to retrieve.
 * @returns {Promise<channelResponse>} A promise that resolves to the channel object.
 * @throws {AppError} If no channel is found or the community is not active.
 */
var findChannelById = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, channelRepository.findChannelById(channelId)];
            case 1:
                channel = _a.sent();
                if (!channel || !channel.community.active) {
                    throw new utility_1.AppError('No channel found with that ID', 404);
                }
                delete channel.community.active;
                return [2 /*return*/, channel];
        }
    });
}); };
exports.findChannelById = findChannelById;
/**
 * Creates a new channel and adds the creator as an admin member.
 *
 * @param {Object} data - The data to create a new channel.
 * @param {string} data.name - The name of the channel.
 * @param {number} data.creatorId - The ID of the creator of the channel.
 * @param {boolean} [data.privacy] - The privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The image URL for the channel (optional).
 * @returns {Promise<{id: number; canAddComments: boolean; community: {name: string; privacy: boolean}}>} A promise that resolves to the created channel object.
 * @throws {AppError} If the data is invalid.
 */
var createChannel = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var invitationLink, channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                (0, exports.checkData)(data);
                invitationLink = (0, invitationLink_1.default)();
                return [4 /*yield*/, channelRepository.createChannel(__assign(__assign({}, data), { invitationLink: invitationLink }))];
            case 1:
                channel = _a.sent();
                return [4 /*yield*/, channelMemberService.addChannelMember(data.creatorId, channel.id, null, client_1.CommunityRole.admin, true)];
            case 2:
                _a.sent();
                return [2 /*return*/, channel];
        }
    });
}); };
exports.createChannel = createChannel;
/**
 * Updates a channel's details and its associated community.
 *
 * @param {number} channelId - The ID of the channel to update.
 * @param {number} adminId - The ID of the admin making the update request.
 * @param {Object} data - The data to update the channel with.
 * @param {string} [data.name] - The new name of the channel (optional).
 * @param {boolean} [data.privacy] - The new privacy setting of the channel (optional).
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} [data.imageURL] - The new image URL for the channel (optional).
 * @returns {Promise<commonChannelResponse>} A promise that resolves to the updated channel object.
 * @throws {AppError} If no data is provided to update or the user does not have permission.
 */
var updateChannel = function (channelId, adminId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // check permissions
            return [4 /*yield*/, channelMemberService.checkChannelMemberPermission(adminId, channelId)];
            case 1:
                // check permissions
                _a.sent();
                if (!data.name && !data.privacy && !data.canAddComments && !data.imageURL) {
                    throw new utility_1.AppError('No data to update', 400);
                }
                return [4 /*yield*/, (0, exports.findChannelById)(channelId)];
            case 2:
                channel = _a.sent();
                if (!(data.name || data.privacy || data.imageURL)) return [3 /*break*/, 4];
                return [4 /*yield*/, channelRepository.updateCommunity(channel.communityId, __assign({}, data))];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, channelRepository.updateChannel(channelId, data.canAddComments)];
            case 5: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.updateChannel = updateChannel;
/**
 * Deletes a channel by its ID and deactivates its associated community.
 *
 * @param {number} channelId - The ID of the channel to delete.
 * @param {number} adminId - The ID of the admin making the delete request.
 * @returns {Promise<null>} A promise that resolves once the channel has been deleted and the community deactivated.
 * @throws {AppError} If the user does not have permission to delete the channel.
 */
var deleteChannel = function (channelId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // check permissions
            return [4 /*yield*/, channelMemberService.checkChannelMemberPermission(adminId, channelId)];
            case 1:
                // check permissions
                _a.sent();
                return [4 /*yield*/, (0, exports.findChannelById)(channelId)];
            case 2:
                channel = _a.sent();
                return [4 /*yield*/, channelRepository.updateCommunity(channel.communityId, {
                        active: false,
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, null];
        }
    });
}); };
exports.deleteChannel = deleteChannel;
