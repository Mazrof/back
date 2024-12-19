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
exports.joinGroupByInvite = exports.deleteGroupMember = exports.updateGroupMember = exports.addGroupCreator = exports.addGroupMember = exports.getGroupMembers = exports.checkMember = exports.checkUser = exports.checkGroupAdmin = exports.findGroup = exports.checkCapacity = exports.checkGroupMember = exports.checkGroupMemberPermission = void 0;
var crypto_1 = require("crypto");
var groupMemberRepository = require("../repositories/groupMemberRepository");
var groupRepository = require("../repositories/groupRepository");
var client_1 = require("@prisma/client");
var utility_1 = require("../utility");
var userRepository = require("../repositories/adminRepository");
var checkGroupMemberPermission = function (userId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var groupMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findExistingMember(userId, groupId)];
            case 2:
                groupMember = _a.sent();
                if (!groupMember || !groupMember.active) {
                    throw new utility_1.AppError('this is no user with this id in the group', 403);
                }
                if (groupMember.role !== client_1.CommunityRole.admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkGroupMemberPermission = checkGroupMemberPermission;
var checkGroupMember = function (userId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var groupMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findExistingMember(userId, groupId)];
            case 2:
                groupMember = _a.sent();
                if (!groupMember || !groupMember.active) {
                    throw new utility_1.AppError('this is no user with this id in the group', 403);
                }
                return [2 /*return*/, groupMember];
        }
    });
}); };
exports.checkGroupMember = checkGroupMember;
var checkCapacity = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var full;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupMemberRepository.getMembersCount(groupId)];
            case 1:
                full = _a.sent();
                if (full) {
                    throw new utility_1.AppError('the group reaches its limit', 400);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkCapacity = checkCapacity;
var findGroup = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupRepository.findGroupById(groupId)];
            case 1:
                group = _a.sent();
                if (!group) {
                    throw new utility_1.AppError('this is no group with this id', 404);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.findGroup = findGroup;
var checkGroupAdmin = function (adminId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!adminId) {
                    throw new utility_1.AppError('AdminId is missing', 400);
                }
                return [4 /*yield*/, groupMemberRepository.findGroupMember(adminId, groupId)];
            case 1:
                user = _a.sent();
                if (!user || !user.active || user.role !== client_1.CommunityRole.admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkGroupAdmin = checkGroupAdmin;
var checkUser = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, userRepository.findUserById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new utility_1.AppError('this is no user with this id', 404);
                }
                return [2 /*return*/];
        }
    });
}); };
exports.checkUser = checkUser;
var checkMember = function (userId, groupId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.checkUser)(userId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findExistingMember(userId, groupId)];
            case 2:
                existingMember = _a.sent();
                if (!existingMember) return [3 /*break*/, 6];
                if (!!existingMember.active) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, exports.checkCapacity)(groupId)];
            case 3:
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.updateGroupMemberStatus(userId, groupId, true)];
            case 4: return [2 /*return*/, _a.sent()];
            case 5: throw new utility_1.AppError('Member already exists in this group', 404);
            case 6: return [2 /*return*/, null];
        }
    });
}); };
exports.checkMember = checkMember;
var getGroupMembers = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findGroupMembers(groupId)];
            case 2: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getGroupMembers = getGroupMembers;
var addGroupMember = function (adminId, groupId, userId, role, hasDownloadPermissions, hasMessagePermissions) { return __awaiter(void 0, void 0, void 0, function () {
    var member;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Check if there is a group
            return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                // Check if there is a group
                _a.sent();
                // Check if the user is an admin in the group
                return [4 /*yield*/, (0, exports.checkGroupAdmin)(adminId, groupId)];
            case 2:
                // Check if the user is an admin in the group
                _a.sent();
                return [4 /*yield*/, (0, exports.checkMember)(userId, groupId)];
            case 3:
                member = _a.sent();
                if (member) {
                    return [2 /*return*/, member];
                }
                // check the group size
                return [4 /*yield*/, (0, exports.checkCapacity)(groupId)];
            case 4:
                // check the group size
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.addGroupMember({
                        groupId: groupId,
                        userId: userId,
                        role: role,
                        hasDownloadPermissions: hasDownloadPermissions,
                        hasMessagePermissions: hasMessagePermissions,
                    })];
            case 5: 
            // Create a new group membership for the member
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.addGroupMember = addGroupMember;
var addGroupCreator = function (groupId, userId, role) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Check if the user is not admin
            return [4 /*yield*/, (0, exports.checkUser)(userId)];
            case 1:
                // Check if the user is not admin
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.addGroupMember({
                        groupId: groupId,
                        userId: userId,
                        role: role,
                        hasDownloadPermissions: true,
                        hasMessagePermissions: true,
                    })];
            case 2: 
            // Create a new group membership for the member
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.addGroupCreator = addGroupCreator;
var updateGroupMember = function (adminId, groupId, userId, updates) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember, updatedData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Check if there is a group
            return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                // Check if there is a group
                _a.sent();
                // Check if the user is an admin in the group
                return [4 /*yield*/, (0, exports.checkGroupAdmin)(adminId, groupId)];
            case 2:
                // Check if the user is an admin in the group
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findExistingMember(userId, groupId)];
            case 3:
                existingMember = _a.sent();
                if (!existingMember) {
                    throw new utility_1.AppError('Member not found in this group', 404);
                }
                updatedData = {};
                if (updates.role) {
                    updatedData.role =
                        updates.role === 'admin' ? client_1.CommunityRole.admin : client_1.CommunityRole.member;
                }
                if (updates.hasMessagePermissions) {
                    updatedData.hasMessagePermissions = updates.hasMessagePermissions;
                }
                if (updates.hasDownloadPermissions) {
                    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
                }
                if (!updates.role &&
                    !updates.hasMessagePermissions &&
                    !updates.hasDownloadPermissions) {
                    throw new utility_1.AppError('Not Data to update', 400);
                }
                return [4 /*yield*/, groupMemberRepository.updateGroupMemberData(userId, groupId, updatedData)];
            case 4: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.updateGroupMember = updateGroupMember;
var deleteGroupMember = function (adminId, groupId, userId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingMember, user, groupMember, adminCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // Check if there is a group
            return [4 /*yield*/, (0, exports.findGroup)(groupId)];
            case 1:
                // Check if there is a group
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.findExistingMember(userId, groupId)];
            case 2:
                existingMember = _a.sent();
                if (!existingMember || !existingMember.active) {
                    throw new utility_1.AppError('Member not found in this group', 404);
                }
                if (!(adminId !== userId)) return [3 /*break*/, 4];
                return [4 /*yield*/, groupMemberRepository.findGroupMember(adminId, groupId)];
            case 3:
                user = _a.sent();
                if (!user || user.role !== client_1.CommunityRole.admin) {
                    throw new utility_1.AppError('Not Authorized', 403);
                }
                _a.label = 4;
            case 4: return [4 /*yield*/, groupMemberRepository.updateGroupMemberStatus(userId, groupId, false)];
            case 5:
                groupMember = _a.sent();
                return [4 /*yield*/, groupMemberRepository.getAdminCounts(groupId)];
            case 6:
                adminCount = _a.sent();
                if (!!adminCount) return [3 /*break*/, 8];
                return [4 /*yield*/, groupRepository.deleteGroup(groupId)];
            case 7:
                _a.sent();
                _a.label = 8;
            case 8: return [2 /*return*/, groupMember];
        }
    });
}); };
exports.deleteGroupMember = deleteGroupMember;
var joinGroupByInvite = function (token, userId, role) { return __awaiter(void 0, void 0, void 0, function () {
    var invitationLinkHash, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                invitationLinkHash = crypto_1.default
                    .createHash('sha256')
                    .update(token)
                    .digest('hex');
                return [4 /*yield*/, groupMemberRepository.findGroupByInvitationLinkHash(invitationLinkHash)];
            case 1:
                group = _a.sent();
                if (!group) {
                    throw new Error('Invalid or expired invitation link');
                }
                // Check if the member already exists in the group
                return [4 /*yield*/, (0, exports.checkMember)(userId, group.id)];
            case 2:
                // Check if the member already exists in the group
                _a.sent();
                return [4 /*yield*/, groupMemberRepository.addGroupMember({
                        groupId: group.id,
                        userId: userId,
                        role: role,
                        hasDownloadPermissions: false,
                        hasMessagePermissions: false,
                    })];
            case 3: 
            // Create a new group membership for the member
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.joinGroupByInvite = joinGroupByInvite;
