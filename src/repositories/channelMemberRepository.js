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
exports.getAdminCounts = exports.findChannelByInvitationLinkHash = exports.updateChannelMember = exports.addChannelMember = exports.findExistingMember = exports.findChannelMembers = exports.findChannelMember = void 0;
var client_1 = require("../prisma/client");
var client_2 = require("@prisma/client");
/**
 * Fetches a specific channel member's role and activity status.
 *
 * @param {number} userId - The ID of the user whose membership is being fetched.
 * @param {number} channelId - The ID of the channel where the user is a member.
 * @returns {Promise<{role: CommunityRole, active: boolean}>} A promise that resolves to the member's role and activity status.
 */
var findChannelMember = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.findUnique({
                where: {
                    userId_channelId: {
                        userId: userId,
                        channelId: channelId,
                    },
                },
                select: {
                    role: true,
                    active: true,
                },
            })];
    });
}); };
exports.findChannelMember = findChannelMember;
/**
 * Fetches all members of a specific channel, including their role, activity status, and permission to download.
 *
 * @param {number} channelId - The ID of the channel whose members are being fetched.
 * @returns {Promise<Array<{channelId: number, userId: number, role: CommunityRole, hasDownloadPermissions: boolean, active: boolean, users: { username: string }}>}>
 * A promise that resolves to an array of members with detailed information including role, download permissions, and activity status.
 */
var findChannelMembers = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.findMany({
                where: {
                    channelId: channelId,
                },
                select: {
                    channelId: true,
                    userId: true,
                    role: true,
                    active: true,
                    hasDownloadPermissions: true,
                    users: {
                        select: {
                            username: true,
                        },
                    },
                },
            })];
    });
}); };
exports.findChannelMembers = findChannelMembers;
/**
 * Checks if a user is already a member of a specific channel, and retrieves their role, activity status, and download permissions.
 *
 * @param {number} userId - The ID of the user to check.
 * @param {number} channelId - The ID of the channel to check the user in.
 * @returns {Promise<{active: boolean, role: CommunityRole, hasDownloadPermissions: boolean userId: number; channelId: number;}>} A promise that resolves to the member's status, role, and download permissions.
 */
var findExistingMember = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.findUnique({
                where: {
                    userId_channelId: {
                        userId: userId,
                        channelId: channelId,
                    },
                },
                select: {
                    role: true,
                    hasDownloadPermissions: true,
                    active: true,
                    channelId: true,
                    userId: true,
                },
            })];
    });
}); };
exports.findExistingMember = findExistingMember;
/**
 * Adds a new member to a channel with specified role and download permissions.
 *
 * @param {Object} data - The data to create a new channel membership.
 * @param {number} data.channelId - The ID of the channel.
 * @param {number} data.userId - The ID of the user being added to the channel.
 * @param {CommunityRole} data.role - The role of the user in the channel.
 * @param {boolean} data.hasDownloadPermissions - Whether the user has download permissions.
 * @returns {Promise<{channelId: number, userId: number, role: CommunityRole, hasDownloadPermissions: boolean}>} A promise that resolves to the newly added member.
 */
var addChannelMember = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.create({
                data: data,
                select: {
                    channelId: true,
                    userId: true,
                    role: true,
                    hasDownloadPermissions: true,
                },
            })];
    });
}); };
exports.addChannelMember = addChannelMember;
/**
 * Updates an existing channel member's role, download permissions, or activity status.
 *
 * @param {number} userId - The ID of the user whose membership is being updated.
 * @param {number} channelId - The ID of the channel where the membership is being updated.
 * @param {Object} data - The data to update the channel membership.
 * @param {CommunityRole} [data.role] - The new role of the user (optional).
 * @param {boolean} [data.hasDownloadPermissions] - Whether the user has download permissions (optional).
 * @param {boolean} [data.active] - Whether the user is active (optional).
 * @returns {Promise<{role: CommunityRole, hasDownloadPermissions: boolean}>} A promise that resolves to the updated membership data.
 */
var updateChannelMember = function (userId, channelId, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.update({
                where: {
                    userId_channelId: {
                        userId: userId,
                        channelId: channelId,
                    },
                },
                data: data,
                select: {
                    active: true,
                    role: true,
                    hasDownloadPermissions: true,
                    userId: true,
                    channelId: true,
                },
            })];
    });
}); };
exports.updateChannelMember = updateChannelMember;
/**
 * Finds a channel by its invitation link hash.
 *
 * @param {string} invitationLink - The hashed invitation link to find the channel.
 * @returns {Promise<{id: number} | null>} A promise that resolves to the channel ID if the channel is found, or null if not.
 */
var findChannelByInvitationLinkHash = function (invitationLink) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channels.findUnique({
                where: { invitationLink: invitationLink },
                select: {
                    id: true,
                    community: {
                        select: {
                            active: true,
                        },
                    },
                },
            })];
    });
}); };
exports.findChannelByInvitationLinkHash = findChannelByInvitationLinkHash;
/**
 * Retrieves the count of active admin members in a specific channel.
 *
 * @param {number} channelId - The ID of the channel.
 * @returns {Promise<number>} A promise that resolves to the count of active admin members in the channel.
 */
var getAdminCounts = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.channelSubscriptions.count({
                where: {
                    channelId: channelId,
                    role: client_2.CommunityRole.admin,
                    active: true,
                },
            })];
    });
}); };
exports.getAdminCounts = getAdminCounts;
