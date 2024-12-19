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
exports.applyContentFilter = exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getGroup = exports.getAllGroups = void 0;
var groupService = require("../services/groupService");
var utility_1 = require("../utility");
/**
 * Controller to fetch all groups.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of group objects.
 * @throws {AppError} If no groups are found.
 */
exports.getAllGroups = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var groups;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, groupService.findAllGroups()];
            case 1:
                groups = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        results: groups.length,
                        data: {
                            groups: groups,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to fetch a specific group by ID.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the group object.
 * @throws {AppError} If the group is not found or inactive.
 */
exports.getGroup = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = parseInt(req.params.id);
                return [4 /*yield*/, groupService.findGroupById(id)];
            case 1:
                group = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        data: {
                            group: group,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to create a new group.
 *
 * @param {Request} req - The HTTP request object, containing group details in the request body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the created group object.
 * @throws {AppError} If the input data is invalid.
 */
exports.createGroup = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, privacy, groupSize, imageURL, creatorId, group;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, privacy = _a.privacy, groupSize = _a.groupSize, imageURL = _a.imageURL;
                creatorId = req.session.user.id;
                return [4 /*yield*/, groupService.createGroup({
                        name: name,
                        privacy: privacy,
                        creatorId: creatorId,
                        groupSize: groupSize,
                        imageURL: imageURL,
                    })];
            case 1:
                group = _b.sent();
                return [2 /*return*/, res.status(201).json({
                        status: 'success',
                        data: {
                            group: group,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to update an existing group.
 *
 * @param {Request} req - The HTTP request object, containing group details in the request body and group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated group object.
 * @throws {AppError} If the user is not authorized or the input data is invalid.
 */
exports.updateGroup = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, groupId, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                groupId = parseInt(req.params.id);
                return [4 /*yield*/, groupService.updateGroup(groupId, adminId, req.body)];
            case 1:
                group = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        data: {
                            group: group,
                        },
                    })];
        }
    });
}); });
/**
 * Controller to delete a group by ID.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} A response with no content.
 * @throws {AppError} If the user is not authorized.
 */
exports.deleteGroup = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, groupId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                groupId = parseInt(req.params.id);
                return [4 /*yield*/, groupService.deleteGroup(groupId, adminId)];
            case 1:
                _a.sent();
                return [2 /*return*/, res.status(204).json({
                        status: 'success',
                        data: null,
                    })];
        }
    });
}); });
/**
 * Controller to apply or remove a content filter for a group.
 *
 * @param {Request} req - The HTTP request object, containing group ID as a route parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated filter status for the group.
 * @throws {AppError} If the user is not authorized or the group is not found.
 */
exports.applyContentFilter = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var groupId, adminId, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                groupId = parseInt(req.params.groupId);
                adminId = req.session.user.id;
                return [4 /*yield*/, groupService.applyGroupFilter(groupId, adminId)];
            case 1:
                group = _a.sent();
                return [2 /*return*/, res.status(200).json({
                        status: 'success',
                        data: {
                            group: group,
                        },
                    })];
        }
    });
}); });
