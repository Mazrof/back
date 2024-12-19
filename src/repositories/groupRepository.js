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
exports.createGroupFilter = exports.deleteGroupFilter = exports.findGroupFilter = exports.deleteGroup = exports.getGroupSize = exports.updateGroup = exports.createGroup = exports.findGroupById = exports.findAllGroups = void 0;
var client_1 = require("../prisma/client");
var client_2 = require("@prisma/client");
/**
 * Fetch all active groups with their community details.
 *
 * @returns {Promise<GroupResponse[]>}
 * Array of groups, each containing:
 *  - `id`: Group ID
 *  - `groupSize`: Number of members in the group
 *  - `adminGroupFilters`: Admin filters associated with the group
 *  - `community`: Community details including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 */
var findAllGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.groups.findMany({
                where: {
                    community: {
                        active: true,
                    },
                },
                select: {
                    id: true,
                    groupSize: true,
                    community: {
                        select: {
                            name: true,
                            privacy: true,
                            imageURL: true,
                        },
                    },
                    adminGroupFilters: {
                        select: {
                            groupId: true,
                        },
                    },
                },
            })];
    });
}); };
exports.findAllGroups = findAllGroups;
/**
 * Find a group by its ID with detailed community information.
 *
 * @param {number} id - The ID of the group to retrieve.
 * @returns {Promise<DetailedGroupResponse | null>}
 * A group object or `null` if not found.
 */
var findGroupById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.groups.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    groupSize: true,
                    communityId: true,
                    community: {
                        select: {
                            name: true,
                            privacy: true,
                            active: true,
                            imageURL: true,
                        },
                    },
                    adminGroupFilters: {
                        select: {
                            groupId: true,
                        },
                    },
                },
            })];
    });
}); };
exports.findGroupById = findGroupById;
/**
 * Create a new group and its associated community.
 *
 * @param {Object} data - The data to create a new group.
 * @param {string} data.name - Community name.
 * @param {boolean} data.privacy - Community privacy setting.
 * @param {number} data.creatorId - ID of the creator.
 * @param {number} data.groupSize - Initial size of the group.
 * @param {string} data.invitationLink - Group invitation link.
 * @param {string} [data.imageURL] - Community image URL (optional).
 * @returns {Promise<GroupResponse>}
 * The newly created group object.
 */
var createGroup = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.groups.create({
                data: {
                    groupSize: data.groupSize,
                    invitationLink: data.invitationLink,
                    community: {
                        create: {
                            name: data.name,
                            privacy: data.privacy,
                            creatorId: data.creatorId,
                            imageURL: data.imageURL,
                            participants: {
                                create: {
                                    type: client_2.ParticipiantTypes.community,
                                },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    groupSize: true,
                    community: {
                        select: {
                            name: true,
                            privacy: true,
                            imageURL: true,
                        },
                    },
                },
            })];
    });
}); };
exports.createGroup = createGroup;
/**
 * Update the size of a group.
 *
 * @param {number} groupId - The ID of the group to update.
 * @param {number} [groupSize] - The new group size (optional).
 * @returns {Promise<GroupResponse>}
 * The updated group object.
 */
var updateGroup = function (groupId, groupSize) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.groups.update({
                where: { id: groupId },
                data: {
                    groupSize: groupSize,
                },
                select: {
                    id: true,
                    groupSize: true,
                    community: {
                        select: {
                            name: true,
                            privacy: true,
                            imageURL: true,
                        },
                    },
                },
            })];
    });
}); };
exports.updateGroup = updateGroup;
/**
 * Get the number of active members in a group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<number>}
 * The count of active members.
 */
var getGroupSize = function (groupId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.groupMemberships.count({
                where: {
                    AND: {
                        groupId: groupId,
                        active: true,
                    },
                },
            })];
    });
}); };
exports.getGroupSize = getGroupSize;
/**
 * Deactivate a group by its community ID.
 *
 * @param {number} communityId - The ID of the community to deactivate.
 * @returns {Promise<void>}
 */
var deleteGroup = function (communityId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.communities.update({
                    where: { id: communityId },
                    data: { active: false },
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteGroup = deleteGroup;
/**
 * Find an admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The filter object or `null` if not found.
 */
var findGroupFilter = function (groupId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.adminGroupFilters.findUnique({
                where: {
                    adminId_groupId: {
                        adminId: adminId,
                        groupId: groupId,
                    },
                },
                select: {
                    groupId: true,
                    adminId: true,
                },
            })];
    });
}); };
exports.findGroupFilter = findGroupFilter;
/**
 * Remove an admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The deleted filter object or `null` if not found.
 */
var deleteGroupFilter = function (groupId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.adminGroupFilters.delete({
                where: {
                    adminId_groupId: {
                        adminId: adminId,
                        groupId: groupId,
                    },
                },
                select: {
                    groupId: true,
                    adminId: true,
                },
            })];
    });
}); };
exports.deleteGroupFilter = deleteGroupFilter;
/**
 * Create a new admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number }>}
 * The created filter object.
 */
var createGroupFilter = function (groupId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.adminGroupFilters.create({
                data: {
                    groupId: groupId,
                    adminId: adminId,
                },
                select: {
                    groupId: true,
                    adminId: true,
                },
            })];
    });
}); };
exports.createGroupFilter = createGroupFilter;
