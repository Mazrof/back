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
exports.deleteChannel = exports.updateChannel = exports.createChannel = exports.getChannel = exports.getAllChannels = void 0;
var channelService = require("../services");
var utility_1 = require("../utility");
/**
 * Controller to fetch all channels.
 * Fetches a list of all channels from the database.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing an array of channel objects.
 * @throws {AppError} If the channels cannot be fetched.
 */
exports.getAllChannels = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var channels;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, channelService.findAllChannels()];
            case 1:
                channels = _a.sent();
                res.status(200).json({
                    status: 'success',
                    results: channels.length,
                    data: {
                        channels: channels,
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
/**
 * Controller to fetch a single channel by ID.
 * Retrieves a specific channel's details based on the channel ID provided in the request parameters.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing a single channel object.
 * @throws {AppError} If the channel is not found.
 */
exports.getChannel = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var channelId, channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                channelId = parseInt(req.params.id);
                return [4 /*yield*/, channelService.findChannelById(channelId)];
            case 1:
                channel = _a.sent();
                res.status(200).json({
                    status: 'success',
                    data: {
                        channel: channel,
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
/**
 * Controller to create a new channel.
 * Accepts the details of a new channel from the request body and creates a new channel.
 *
 * @param {Request} req - The HTTP request object, containing the new channel details in the body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the newly created channel object.
 * @throws {AppError} If the channel cannot be created.
 */
exports.createChannel = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, privacy, canAddComments, imageURL, creatorId, channel;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, privacy = _a.privacy, canAddComments = _a.canAddComments, imageURL = _a.imageURL;
                creatorId = req.session.user.id;
                return [4 /*yield*/, channelService.createChannel({
                        name: name,
                        privacy: privacy,
                        creatorId: creatorId,
                        canAddComments: canAddComments,
                        imageURL: imageURL,
                    })];
            case 1:
                channel = _b.sent();
                res.status(201).json({
                    status: 'success',
                    data: {
                        channel: channel,
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
/**
 * Controller to update an existing channel.
 * Updates the properties of an existing channel if the requester is an admin of the channel.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter and updated data in the body.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response containing the updated channel object.
 * @throws {AppError} If the user is not authorized or the channel is not found.
 */
exports.updateChannel = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, channelId, channel;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                channelId = parseInt(req.params.id);
                return [4 /*yield*/, channelService.updateChannel(channelId, adminId, req.body)];
            case 1:
                channel = _a.sent();
                res.status(200).json({
                    status: 'success',
                    data: {
                        channel: channel,
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
/**
 * Controller to delete an existing channel.
 * Deletes the channel if the requester is an admin of the channel.
 *
 * @param {Request} req - The HTTP request object, containing the channel ID in the URL parameter.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<Response>} The response confirming the deletion of the channel.
 * @throws {AppError} If the user is not authorized or the channel is not found.
 */
exports.deleteChannel = (0, utility_1.catchAsync)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var adminId, channelId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                adminId = req.session.user.id;
                channelId = parseInt(req.params.id);
                return [4 /*yield*/, channelService.deleteChannel(channelId, adminId)];
            case 1:
                _a.sent();
                res.status(204).json({
                    status: 'success',
                    data: null, // No content to return after deletion
                });
                return [2 /*return*/];
        }
    });
}); });
