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
exports.getAdminCounts = exports.findGroupByInvitationLinkHash = exports.updateGroupMemberData = exports.updateGroupMemberStatus = exports.addGroupMember = exports.findExistingMember = exports.findGroupMembers = exports.findGroupMember = exports.getMembersCount = void 0;
var client_1 = require("../prisma/client");
var client_2 = require("@prisma/client");
var getMembersCount = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var group, count;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.default.groups.findUnique({
                    where: { id: groupId },
                    select: {
                        groupSize: true,
                    },
                })];
            case 1:
                group = _a.sent();
                return [4 /*yield*/, client_1.default.groupMemberships.count({
                        where: {
                            AND: {
                                groupId: groupId,
                                active: true,
                            },
                        },
                    })];
            case 2:
                count = _a.sent();
                return [2 /*return*/, count === (group === null || group === void 0 ? void 0 : group.groupSize)];
        }
    });
}); };
exports.getMembersCount = getMembersCount;
var findGroupMember = function (userId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.findUnique({
                where: {
                    userId_groupId: {
                        userId: userId,
                        groupId: groupId,
                    },
                },
                select: {
                    role: true,
                    active: true,
                    hasMessagePermissions: true,
                    hasDownloadPermissions: true,
                },
            })];
    });
}); };
exports.findGroupMember = findGroupMember;
var findGroupMembers = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.findMany({
                where: {
                    groupId: groupId,
                },
                select: {
                    groupId: true,
                    userId: true,
                    role: true,
                    active: true,
                    hasDownloadPermissions: true,
                    hasMessagePermissions: true,
                    users: {
                        select: {
                            username: true,
                        },
                    },
                },
            })];
    });
}); };
exports.findGroupMembers = findGroupMembers;
var findExistingMember = function (memberId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.findUnique({
                where: {
                    userId_groupId: {
                        userId: memberId,
                        groupId: groupId,
                    },
                },
                select: {
                    role: true,
                    hasMessagePermissions: true,
                    hasDownloadPermissions: true,
                    active: true,
                },
            })];
    });
}); };
exports.findExistingMember = findExistingMember;
var addGroupMember = function (memberData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.create({
                data: memberData,
                select: {
                    groupId: true,
                    userId: true,
                    role: true,
                    hasDownloadPermissions: true,
                    hasMessagePermissions: true,
                },
            })];
    });
}); };
exports.addGroupMember = addGroupMember;
var updateGroupMemberStatus = function (userId, groupId, active) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.update({
                where: {
                    userId_groupId: {
                        userId: userId,
                        groupId: groupId,
                    },
                },
                data: { active: active },
            })];
    });
}); };
exports.updateGroupMemberStatus = updateGroupMemberStatus;
var updateGroupMemberData = function (userId, groupId, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.update({
                where: {
                    userId_groupId: {
                        userId: userId,
                        groupId: groupId,
                    },
                },
                data: data,
            })];
    });
}); };
exports.updateGroupMemberData = updateGroupMemberData;
var findGroupByInvitationLinkHash = function (invitationLink) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groups.findUnique({
                where: { invitationLink: invitationLink },
                select: {
                    id: true,
                },
            })];
    });
}); };
exports.findGroupByInvitationLinkHash = findGroupByInvitationLinkHash;
var getAdminCounts = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.default.groupMemberships.count({
                where: {
                    groupId: groupId,
                    role: client_2.CommunityRole.admin,
                    active: true,
                },
            })];
    });
}); };
exports.getAdminCounts = getAdminCounts;
