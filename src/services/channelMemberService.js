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
exports.joinChannelByInvite = exports.deleteChannelMember = exports.updateChannelMember = exports.addChannelMember = exports.getChannelMembers = exports.checkChannelMember = exports.checkChannelMemberPermission = void 0;
var Repository = require("../repositories");
var Service = require("../services");
var utility_1 = require("../utility");
var client_1 = require("@prisma/client");
/**
 * Helper function to check if a channel exists by its ID.
 * @param channelId - The ID of the channel to check.
 * @throws {AppError} If the channel does not exist.
 */
var findChannel = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Repository.findChannelById(channelId)];
            case 1:
                channel = _a.sent();
                if (!channel || !channel.community.active) {
                    throw new utility_1.AppError('No channel found with this ID', 404);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Helper function to check if a user exists by their ID.
 * @param userId - The ID of the user to check.
 * @throws {AppError} If the user does not exist.
 */
var checkUser = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Repository.findUserById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new utility_1.AppError('No user found with this ID', 404);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Function to check if a user has admin permissions for a specific channel.
 * @param userId - The ID of the user whose permissions are being checked.
 * @param channelId - The ID of the channel.
 * @throws {AppError} If the user is not an admin.
 */
var checkChannelMemberPermission = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channelMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.checkChannelMember)(userId, channelId)];
            case 1:
                channelMember = _a.sent();
                if (channelMember.role !== client_1.CommunityRole.admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkChannelMemberPermission = checkChannelMemberPermission;
/**
 * Helper function to check if a user is a member of a channel.
 * @param userId - The ID of the user to check.
 * @param channelId - The ID of the channel.
 * @returns The channel member's details, including permissions and role.
 * @throws {AppError} If the user is not a member or is inactive.
 */
var checkChannelMember = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channelMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, findChannel(channelId)];
            case 1:
                _a.sent(); // Ensure the channel exists
                return [4 /*yield*/, Repository.findExistingMember(userId, channelId)];
            case 2:
                channelMember = _a.sent();
                if (!channelMember || !channelMember.active) {
                    throw new utility_1.AppError('User is not a member of the channel', 403);
                }
                return [2 /*return*/, channelMember];
        }
    });
}); };
exports.checkChannelMember = checkChannelMember;
/**
 * Function to check if a member exists and update them if inactive.
 * @param userId - The ID of the user.
 * @param channelId - The ID of the channel.
 * @returns The updated member details if the user is inactive and is updated.
 * @throws {AppError} If the user already exists as an active member.
 */
var checkMember = function (userId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, checkUser(userId)];
            case 1:
                _a.sent(); // Ensure the user exists
                return [4 /*yield*/, Repository.findExistingMember(userId, channelId)];
            case 2:
                existingMember = _a.sent();
                if (!existingMember) return [3 /*break*/, 5];
                if (!!existingMember.active) return [3 /*break*/, 4];
                return [4 /*yield*/, Repository.updateChannelMember(userId, channelId, {
                        active: true,
                        role: client_1.CommunityRole.member,
                    })];
            case 3: return [2 /*return*/, _a.sent()];
            case 4: throw new utility_1.AppError('Member already exists in this channel', 400);
            case 5: return [2 /*return*/, null];
        }
    });
}); };
/**
 * Helper function to check if the user is an admin of the channel.
 * @param adminId - The ID of the admin to check.
 * @param channelId - The ID of the channel.
 * @throws {AppError} If the user is not an admin or is not authorized.
 */
var checkAdmin = function (adminId, channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!adminId) {
                    throw new utility_1.AppError('Admin ID is missing', 400);
                }
                return [4 /*yield*/, Repository.findChannelMember(adminId, channelId)];
            case 1:
                user = _a.sent();
                if (!user || !user.active || user.role !== client_1.CommunityRole.admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Function to get all members of a channel.
 * @param channelId - The ID of the channel to get members for.
 * @param userId - The ID of the user requesting the member list.
 * @returns A list of channel members with their roles and permissions.
 * @throws {AppError} If the channel does not exist or the user is not a member.
 */
var getChannelMembers = function (channelId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, findChannel(channelId)];
            case 1:
                _a.sent(); // Ensure the channel exists
                return [4 /*yield*/, (0, exports.checkChannelMember)(userId, channelId)];
            case 2:
                _a.sent(); // Ensure the user is a member of the channel
                return [2 /*return*/, Repository.findChannelMembers(channelId)]; // Retrieve the members
        }
    });
}); };
exports.getChannelMembers = getChannelMembers;
/**
 * Function to add a new member to the channel.
 * @param userId - The ID of the user to add.
 * @param channelId - The ID of the channel to add the user to.
 * @param requesterId - The ID of the user making the request.
 * @param role - The role to assign to the new member.
 * @param hasDownloadPermissions - Whether the new member has download permissions.
 * @returns The newly added member's details.
 * @throws {AppError} If the requester does not have permission to add an admin or if the member already exists.
 */
var addChannelMember = function (userId, channelId, requesterId, role, hasDownloadPermissions) { return __awaiter(void 0, void 0, void 0, function () {
    var member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, findChannel(channelId)];
            case 1:
                _a.sent(); // Ensure the channel exists
                return [4 /*yield*/, checkMember(userId, channelId)];
            case 2:
                member = _a.sent();
                if (!(requesterId && role === client_1.CommunityRole.admin)) return [3 /*break*/, 4];
                return [4 /*yield*/, checkAdmin(requesterId, channelId)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                if (member) {
                    return [2 /*return*/, member]; // Return existing member if already added
                }
                return [4 /*yield*/, Repository.addChannelMember({
                        channelId: channelId,
                        userId: userId,
                        role: role,
                        hasDownloadPermissions: hasDownloadPermissions,
                    })];
            case 5: 
            // Add the new member to the channel
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.addChannelMember = addChannelMember;
/**
 * Function to update an existing channel member's data.
 * @param adminId - The ID of the admin requesting the update.
 * @param channelId - The ID of the channel.
 * @param userId - The ID of the member to update.
 * @param data - The data to update (role and/or permissions).
 * @returns The updated member's role and permissions.
 * @throws {AppError} If there is no data to update, or if the admin does not have permission.
 */
var updateChannelMember = function (adminId, channelId, userId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!data.role && !data.hasDownloadPermissions) {
                    throw new utility_1.AppError('No data to update', 400);
                }
                return [4 /*yield*/, findChannel(channelId)];
            case 1:
                _a.sent(); // Ensure the channel exists
                return [4 /*yield*/, checkAdmin(adminId, channelId)];
            case 2:
                _a.sent(); // Ensure the admin has permission
                return [4 /*yield*/, Repository.findExistingMember(userId, channelId)];
            case 3:
                existingMember = _a.sent();
                if (!existingMember || !existingMember.active) {
                    throw new utility_1.AppError('Member not found in this Channel', 404);
                }
                return [4 /*yield*/, Repository.updateChannelMember(userId, channelId, data)];
            case 4: return [2 /*return*/, _a.sent()]; // Update the member's data
        }
    });
}); };
exports.updateChannelMember = updateChannelMember;
/**
 * Function to delete a member from a channel.
 * @param channelId - The ID of the channel.
 * @param userId - The ID of the member to delete.
 * @returns The deleted member's details.
 * @throws {AppError} If the member is not found or is inactive.
 */
var deleteChannelMember = function (channelId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember, adminCount, members, _i, members_1, member, channelMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Repository.findExistingMember(userId, channelId)];
            case 1:
                existingMember = _a.sent();
                if (!existingMember || !existingMember.active) {
                    throw new utility_1.AppError('Member not found in this channel', 404);
                }
                if (!(existingMember.role === client_1.CommunityRole.admin)) return [3 /*break*/, 9];
                return [4 /*yield*/, Repository.getAdminCounts(channelId)];
            case 2:
                adminCount = _a.sent();
                if (!(adminCount === 1)) return [3 /*break*/, 9];
                console.log('terminate');
                return [4 /*yield*/, Service.getChannelMembers(channelId, userId)];
            case 3:
                members = _a.sent();
                _i = 0, members_1 = members;
                _a.label = 4;
            case 4:
                if (!(_i < members_1.length)) return [3 /*break*/, 7];
                member = members_1[_i];
                if (!(member.active && member.userId !== existingMember.userId)) return [3 /*break*/, 6];
                return [4 /*yield*/, Repository.updateChannelMember(member.userId, channelId, {
                        active: false,
                    })];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 4];
            case 7: 
            // Delete the channel if no admin remains
            return [4 /*yield*/, Service.deleteChannel(channelId, userId)];
            case 8:
                // Delete the channel if no admin remains
                _a.sent();
                _a.label = 9;
            case 9: return [4 /*yield*/, Repository.updateChannelMember(userId, channelId, { active: false })];
            case 10:
                channelMember = _a.sent();
                return [2 /*return*/, channelMember];
        }
    });
}); };
exports.deleteChannelMember = deleteChannelMember;
/**
 * Function to allow a user to join a channel via an invitation link.
 *
 * This function verifies the invitation link, checks if the user is already a member,
 * and adds the user to the channel if they are not already a member. The user will be
 * assigned default permissions and role as a member.
 *
 * @param token - The invitation token containing the invitation link hash.
 * @param userId - The ID of the user accepting the invitation.
 * @returns The channel details including channelId, userId, role, and download permissions.
 * @throws {AppError} If the invitation link is invalid or the community is inactive.
 */
var joinChannelByInvite = function (token, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Repository.findChannelByInvitationLinkHash(token)];
            case 1:
                channel = _a.sent();
                // Check if the channel exists and is active
                if (!channel || !channel.community.active) {
                    throw new utility_1.AppError('Invalid invitation link', 400);
                }
                return [4 /*yield*/, checkMember(userId, channel.id)];
            case 2:
                member = _a.sent();
                if (member) {
                    return [2 /*return*/, member]; // Return existing member if they are already part of the channel
                }
                return [4 /*yield*/, Repository.addChannelMember({
                        channelId: channel.id,
                        userId: userId,
                        role: client_1.CommunityRole.member,
                        hasDownloadPermissions: false,
                    })];
            case 3: 
            // Add the user to the channel with default permissions (role: member, no download permissions)
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.joinChannelByInvite = joinChannelByInvite;
