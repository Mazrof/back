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
exports.applyGroupFilter = exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.findGroupById = exports.findAllGroups = void 0;
var groupRepository = require("../repositories");
var groupMemberService = require("../services");
var client_1 = require("@prisma/client");
var services_1 = require("../services");
var utility_1 = require("../utility");
var invitationLink_1 = require("../utility/invitationLink");
/**
 * Fetch all groups with community details and filter status.
 *
 * @returns {Promise<GroupResponse[]>}
 * An array of groups containing:
 * - `id`: Group ID
 * - `groupSize`: Size of the group
 * - `community`: Details of the community associated with the group, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting
 *   - `imageURL`: Image URL of the community
 * - `hasFilter`: Whether the group has an admin filter applied
 */
var findAllGroups = function () { return __awaiter(void 0, void 0, void 0, function () {
    var groups;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupRepository.findAllGroups()];
            case 1:
                groups = _a.sent();
                return [2 /*return*/, groups.map(function (group) {
                        var _a;
                        return ({
                            id: group.id,
                            groupSize: group.groupSize,
                            community: group.community,
                            hasFilter: ((_a = group.adminGroupFilters) === null || _a === void 0 ? void 0 : _a.groupId) === group.id,
                        });
                    })];
        }
    });
}); };
exports.findAllGroups = findAllGroups;
/**
 * Fetch a group by its ID.
 *
 * @param {number} id - The ID of the group to retrieve.
 * @returns {Promise<GroupResponse>}
 * A group object containing:
 * - `id`: Group ID
 * - `communityId`: ID of the associated community
 * - `community`: Details of the community, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting (nullable)
 *   - `imageURL`: Image URL of the community
 * - `groupSize`: Size of the group (nullable)
 * @throws {AppError} If the group or community is inactive or not found.
 */
var findGroupById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var group;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, groupRepository.findGroupById(id)];
            case 1:
                group = _b.sent();
                if (!group || !group.community.active) {
                    throw new utility_1.AppError('No Group found with that ID', 404);
                }
                group.hasFilter = ((_a = group.adminGroupFilters) === null || _a === void 0 ? void 0 : _a.groupId) === group.id;
                delete group.community.active;
                delete group.adminGroupFilters;
                return [2 /*return*/, group];
        }
    });
}); };
exports.findGroupById = findGroupById;
/**
 * Create a new group with associated community.
 *
 * @param {Object} data - Group creation data.
 * @param {string} data.name - Name of the community.
 * @param {boolean} data.privacy - Privacy setting of the community.
 * @param {number} data.creatorId - ID of the creator.
 * @param {number} data.groupSize - Size of the group.
 * @param {string} [data.imageURL] - Image URL for the community (optional).
 * @returns {Promise<GroupResponse>}
 * The created group object containing:
 * - `id`: Group ID
 * - `community`: Community details, including:
 *   - `name`: Community name
 *   - `privacy`: Privacy setting
 *   - `imageURL`: Image URL of the community
 * - `groupSize`: Size of the group
 * @throws {AppError} If required data is invalid.
 */
var createGroup = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var message, invitationLink, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                message = '';
                if (!data.name)
                    message = 'Invalid Group name';
                if (!data.creatorId)
                    message += message ? ', Invalid Creator ID' : 'Invalid Creator ID';
                if (!data.groupSize || data.groupSize < 1)
                    message += message ? ', Invalid Group size' : 'Invalid Group size';
                if (message)
                    throw new utility_1.AppError(message, 400);
                invitationLink = (0, invitationLink_1.default)();
                return [4 /*yield*/, groupRepository.createGroup(__assign(__assign({}, data), { invitationLink: invitationLink }))];
            case 1:
                group = _a.sent();
                return [4 /*yield*/, groupMemberService.addGroupCreator(group.id, data.creatorId, client_1.CommunityRole.admin)];
            case 2:
                _a.sent();
                return [2 /*return*/, group];
        }
    });
}); };
exports.createGroup = createGroup;
/**
 * Update a group's details.
 *
 * @param {number} groupId - The ID of the group to update.
 * @param {number} adminId - The ID of the admin performing the update.
 * @param {Object} data - Update data.
 * @param {string} [data.name] - Updated group name (optional).
 * @param {boolean} [data.privacy] - Updated privacy setting (optional).
 * @param {number} [data.groupSize] - Updated group size (optional).
 * @param {string} [data.imageURL] - Updated image URL (optional).
 * @returns {Promise<GroupResponse>}
 * The updated group object.
 * @throws {AppError} If the admin lacks permissions or data is invalid.
 */
var updateGroup = function (groupId, adminId, data) { return __awaiter(void 0, void 0, void 0, function () {
    var group, count;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupMemberService.checkGroupMemberPermission(adminId, groupId)];
            case 1:
                _a.sent();
                if (!data.name && !data.privacy && !data.groupSize && !data.imageURL) {
                    throw new utility_1.AppError('No data to update', 400);
                }
                return [4 /*yield*/, (0, exports.findGroupById)(groupId)];
            case 2:
                group = _a.sent();
                if (!(data.name || data.privacy || data.imageURL)) return [3 /*break*/, 4];
                return [4 /*yield*/, groupRepository.updateCommunity(group.communityId, data)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, groupRepository.getGroupSize(groupId)];
            case 5:
                count = _a.sent();
                if (data.groupSize && data.groupSize < count) {
                    throw new utility_1.AppError('Invalid Group Size Limit', 400);
                }
                if (data.groupSize < 1)
                    throw new utility_1.AppError('Invalid Group Size Limit', 400);
                return [2 /*return*/, groupRepository.updateGroup(groupId, data.groupSize)];
        }
    });
}); };
exports.updateGroup = updateGroup;
/**
 * Delete a group.
 *
 * @param {number} groupId - The ID of the group to delete.
 * @param {number} adminId - The ID of the admin performing the deletion.
 * @returns {Promise<null>}
 * @throws {AppError} If the admin lacks permissions.
 */
var deleteGroup = function (groupId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupMemberService.checkGroupMemberPermission(adminId, groupId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, exports.findGroupById)(groupId)];
            case 2:
                group = _a.sent();
                return [4 /*yield*/, groupRepository.updateCommunity(group.communityId, {
                        active: false,
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/, null];
        }
    });
}); };
exports.deleteGroup = deleteGroup;
/**
 * Apply or remove a group filter for admins.
 *
 * @param {number} groupId - The ID of the group.
 * @param {number} adminId - The ID of the admin applying/removing the filter.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The group filter object if applied, otherwise null.
 * @throws {AppError} If the admin lacks permissions.
 */
var applyGroupFilter = function (groupId, adminId) { return __awaiter(void 0, void 0, void 0, function () {
    var group, groupFilter;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, services_1.checkAdmin)(adminId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, exports.findGroupById)(groupId)];
            case 2:
                group = _a.sent();
                return [4 /*yield*/, groupRepository.findGroupFilter(groupId, adminId)];
            case 3:
                groupFilter = _a.sent();
                if (!groupFilter) return [3 /*break*/, 5];
                return [4 /*yield*/, groupRepository.deleteGroupFilter(groupId, adminId)];
            case 4: return [2 /*return*/, _a.sent()];
            case 5: return [4 /*yield*/, groupRepository.createGroupFilter(groupId, adminId)];
            case 6: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.applyGroupFilter = applyGroupFilter;
