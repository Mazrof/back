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
exports.updateChannel = exports.createChannel = exports.findChannelById = exports.findAllChannels = void 0;
var client_1 = require("../prisma/client");
/**
 * The `selectObject` is used to specify the fields to be selected when querying channels and communities.
 */
var selectObject = {
    id: true,
    communityId: true,
    canAddComments: true,
    invitationLink: true,
    community: {
        select: {
            name: true,
            privacy: true,
            imageURL: true,
            active: true,
        },
    },
};
var selectAllObject = {
    id: true,
    communityId: true,
    canAddComments: true,
    invitationLink: true,
    community: {
        select: {
            name: true,
            privacy: true,
            imageURL: true,
        },
    },
};
/**
 * Fetch all active channels from the database.
 *
 * @returns {Promise<commonChannelResponse[]>}
 * An array of channel objects, each containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
var findAllChannels = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.channels.findMany({
                where: {
                    community: {
                        active: true,
                    },
                },
                select: selectAllObject,
            })];
    });
}); };
exports.findAllChannels = findAllChannels;
/**
 * Find a channel by its ID.
 *
 * @param {number} id - The ID of the channel to retrieve.
 * @returns {Promise<channelResponse>}
 * A channel object containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
var findChannelById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.channels.findUnique({
                where: {
                    id: id,
                },
                select: selectObject,
            })];
    });
}); };
exports.findChannelById = findChannelById;
/**
 * Create a new channel with a community.
 *
 * @param {Object} data - The data to create a new channel.
 * @param {string} data.name - The name of the community.
 * @param {boolean} [data.privacy] - The privacy setting of the community (optional).
 * @param {number} data.creatorId - The ID of the creator of the community.
 * @param {boolean} [data.canAddComments] - Whether users can add comments in the channel (optional).
 * @param {string} data.invitationLink - The invitation link for the channel.
 * @param {string} [data.imageURL] - The image URL for the community (optional).
 * @returns {Promise<commonChannelResponse>}
 * A common channel response object containing the newly created channel and community details.
 */
var createChannel = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.channels.create({
                data: {
                    canAddComments: data.canAddComments,
                    invitationLink: data.invitationLink,
                    community: {
                        create: {
                            name: data.name,
                            privacy: data.privacy,
                            creatorId: data.creatorId,
                            imageURL: data.imageURL,
                        },
                    },
                },
                select: selectAllObject,
            })];
    });
}); };
exports.createChannel = createChannel;
/**
 * Update the channel's ability to add comments.
 *
 * @param {number} channelId - The ID of the channel to update.
 * @param {boolean} [canAddComments] - Whether users can add comments in the channel (optional).
 * @returns {Promise<commonChannelResponse>}
 * The updated channel object containing:
 *  - `id`: Channel ID
 *  - `communityId`: Community ID associated with the channel
 *  - `canAddComments`: Whether users can add comments in the channel
 *  - `invitationLink`: The invitation link for the channel
 *  - `community`: The community associated with the channel, including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 *    - `active`: Whether the community is active
 */
var updateChannel = function (channelId, canAddComments) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.channels.update({
                where: { id: channelId },
                data: {
                    canAddComments: canAddComments,
                },
                select: selectAllObject,
            })];
    });
}); };
exports.updateChannel = updateChannel;
