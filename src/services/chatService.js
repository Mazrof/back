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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSeeMessages = exports.getMessagesService = exports.getUserParticipants = exports.getUserGroupsChannelsChats = exports.createPersonalChat = exports.updateMessageById = exports.getMessageById = exports.deleteMessage = exports.insertMessageRecipient = exports.insertParticipantDate = exports.markMessagesAsRead = exports.getParticipantIdsOfUserChannels = exports.getParticipantIdsOfUserGroups = exports.getParticipantIdsOfUserPersonalChats = exports.createMessage = void 0;
var client_1 = require("../prisma/client");
var client_2 = require("@prisma/client");
var logger_1 = require("../utility/logger");
var createMessage = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.messages.create({
                data: __assign(__assign({}, data), { participantId: undefined, participants: { connect: { id: data.participantId } }, messages: data.replyTo ? { connect: { id: data.replyTo } } : undefined, replyTo: undefined, users: { connect: { id: data.senderId } }, senderId: undefined, createdAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), messageMentions: {
                        create: data.messageMentions,
                    } }),
                include: {
                    messageMentions: true,
                    messageReadReceipts: true,
                },
            })];
    });
}); };
exports.createMessage = createMessage;
var getParticipantIdsOfUserPersonalChats = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var personalChats;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.personalChat.findMany({
                    where: {
                        OR: [{ user1Id: userId }, { user2Id: userId }],
                    },
                    select: {
                        participants: {
                            select: {
                                id: true,
                            },
                        },
                    },
                })];
            case 1:
                personalChats = _a.sent();
                // Flatten to get only participant IDs
                return [2 /*return*/, personalChats.flatMap(function (chat) { return chat.participants.id; })];
        }
    });
}); };
exports.getParticipantIdsOfUserPersonalChats = getParticipantIdsOfUserPersonalChats;
var getParticipantIdsOfUserGroups = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var memberships;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.groupMemberships.findMany({
                    where: {
                        userId: userId,
                    },
                    select: {
                        groups: {
                            select: {
                                community: {
                                    select: {
                                        participants: {
                                            select: {
                                                id: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                memberships = _a.sent();
                // Extract participant IDs step-by-step and handle nullable values
                return [2 /*return*/, memberships.flatMap(function (membership) { return membership.groups.community.participants.id; })];
        }
    });
}); };
exports.getParticipantIdsOfUserGroups = getParticipantIdsOfUserGroups;
var getParticipantIdsOfUserChannels = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var memberships;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.channelSubscriptions.findMany({
                    where: {
                        userId: userId,
                    },
                    select: {
                        channels: {
                            select: {
                                community: {
                                    select: {
                                        participants: {
                                            select: {
                                                id: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                memberships = _a.sent();
                // Extract participant IDs step-by-step and handle nullable values
                return [2 /*return*/, memberships.flatMap(function (membership) { return membership.channels.community.participants.id; })];
        }
    });
}); };
exports.getParticipantIdsOfUserChannels = getParticipantIdsOfUserChannels;
var markMessagesAsRead = function (userId, participantId) { return __awaiter(void 0, void 0, void 0, function () {
    var receiptsToUpdate, messageIds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.messageReadReceipts.findMany({
                    where: {
                        userId: userId,
                        participantId: participantId,
                        readAt: null,
                    },
                })];
            case 1:
                receiptsToUpdate = _a.sent();
                messageIds = receiptsToUpdate.map(function (receipts) { return receipts.messageId; });
                return [4 /*yield*/, client_1.prisma.messageReadReceipts.updateMany({
                        where: {
                            userId: userId,
                            participantId: participantId,
                            readAt: null,
                        },
                        data: {
                            readAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                        },
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, client_1.prisma.messageReadReceipts.findMany({
                        where: {
                            userId: userId,
                            participantId: participantId,
                            messageId: { in: messageIds },
                            readAt: { not: null },
                        },
                        include: {
                            messages: {
                                select: {
                                    senderId: true,
                                },
                            },
                        },
                    })];
        }
    });
}); };
exports.markMessagesAsRead = markMessagesAsRead;
var insertParticipantDate = function (userId, participantIds) { return __awaiter(void 0, void 0, void 0, function () {
    var missingMessages, insertData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.messages.findMany({
                    where: {
                        senderId: {
                            not: userId,
                        },
                        status: {
                            not: client_2.MessageStatus.drafted,
                        },
                        participants: {
                            id: { in: participantIds },
                        },
                        NOT: {
                            messageReadReceipts: {
                                some: {
                                    userId: userId,
                                },
                            },
                        },
                    },
                    select: {
                        id: true,
                        participantId: true,
                        senderId: true,
                    },
                })];
            case 1:
                missingMessages = _a.sent();
                insertData = missingMessages.map(function (message) {
                    return {
                        userId: userId,
                        messageId: message.id,
                        participantId: message.participantId,
                        deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                        readAt: null,
                        senderId: message.senderId,
                    };
                });
                return [4 /*yield*/, client_1.prisma.messageReadReceipts.createMany({
                        data: insertData.map(function (d) { return (__assign(__assign({}, d), { senderId: undefined })); }),
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, insertData];
        }
    });
}); };
exports.insertParticipantDate = insertParticipantDate;
var insertMessageRecipient = function (userId, message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, client_1.prisma.messageReadReceipts.create({
                    data: {
                        userId: userId,
                        participantId: message.participantId,
                        messageId: message.id,
                        deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                        readAt: null,
                    },
                })];
        }
        catch (error) { }
        return [2 /*return*/];
    });
}); };
exports.insertMessageRecipient = insertMessageRecipient;
var deleteMessage = function (messageId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.messages.delete({
                    where: { id: messageId },
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.deleteMessage = deleteMessage;
var getMessageById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.messages.findUnique({ where: { id: id } })];
    });
}); };
exports.getMessageById = getMessageById;
var updateMessageById = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.messages.update({
                    where: { id: id },
                    data: __assign(__assign({}, data), { updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000) }),
                    include: {
                        messageReadReceipts: true,
                        messageMentions: true,
                    },
                })];
            case 1:
                message = _a.sent();
                return [2 /*return*/, __assign({}, message)];
        }
    });
}); };
exports.updateMessageById = updateMessageById;
var createPersonalChat = function (user1Id, user2Id) { return __awaiter(void 0, void 0, void 0, function () {
    var personalChat;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (user1Id > user2Id)
                    _a = [user2Id, user1Id], user1Id = _a[0], user2Id = _a[1];
                logger_1.default.info('creating personal chat between', user1Id, 'and', user2Id);
                return [4 /*yield*/, client_1.prisma.personalChat.findFirst({
                        where: {
                            user1Id: user1Id,
                            user2Id: user2Id,
                        },
                        include: {
                            participants: true,
                        },
                    })];
            case 1:
                personalChat = _b.sent();
                if (personalChat)
                    return [2 /*return*/, personalChat];
                return [2 /*return*/, client_1.prisma.personalChat.create({
                        data: {
                            user1Id: user1Id,
                            user2Id: user2Id,
                            participants: {
                                create: {
                                    type: client_2.ParticipiantTypes.personalChat,
                                },
                            },
                        },
                        include: {
                            participants: true,
                        },
                    })];
        }
    });
}); };
exports.createPersonalChat = createPersonalChat;
var getUserGroupsChannelsChats = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var userData, combinedPersonalChats;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.users.findUnique({
                    where: { id: userId },
                    select: {
                        groupMemberships: {
                            include: {
                                groups: {
                                    include: {
                                        community: {
                                            include: {
                                                participants: {
                                                    include: {
                                                        messages: {
                                                            orderBy: { createdAt: 'desc' },
                                                            take: 1,
                                                            include: {
                                                                messageReadReceipts: true,
                                                                messageMentions: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        channelSubscriptions: {
                            include: {
                                channels: {
                                    include: {
                                        community: {
                                            include: {
                                                participants: {
                                                    include: {
                                                        messages: {
                                                            orderBy: { createdAt: 'desc' },
                                                            take: 1,
                                                            include: {
                                                                messageReadReceipts: true,
                                                                messageMentions: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        personalChatsAsUser1: {
                            include: {
                                participants: {
                                    include: {
                                        messages: {
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            include: {
                                                messageReadReceipts: true,
                                                messageMentions: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        personalChatsAsUser2: {
                            include: {
                                participants: {
                                    include: {
                                        messages: {
                                            orderBy: { createdAt: 'desc' },
                                            take: 1,
                                            include: {
                                                messageReadReceipts: true,
                                                messageMentions: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })];
            case 1:
                userData = _a.sent();
                combinedPersonalChats = __spreadArray(__spreadArray([], ((userData === null || userData === void 0 ? void 0 : userData.personalChatsAsUser1) || []), true), ((userData === null || userData === void 0 ? void 0 : userData.personalChatsAsUser2) || []), true);
                return [2 /*return*/, __assign(__assign({}, userData), { personalChatsAsUser1: undefined, personalChatsAsUser2: undefined, personalChats: combinedPersonalChats })];
        }
    });
}); };
exports.getUserGroupsChannelsChats = getUserGroupsChannelsChats;
var countUnreadMessage = function (userId, participantId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, client_1.prisma.messages.count({
                where: {
                    senderId: {
                        not: userId,
                    },
                    status: {
                        not: client_2.MessageStatus.drafted,
                    },
                    participants: {
                        id: participantId,
                    },
                    OR: [
                        {
                            NOT: {
                                messageReadReceipts: {
                                    some: {
                                        userId: userId,
                                    },
                                },
                            },
                        },
                        {
                            messageReadReceipts: {
                                some: {
                                    userId: userId,
                                    readAt: null,
                                },
                            },
                        },
                    ],
                },
            })];
    });
}); };
var getUserParticipants = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var userParticipants, results, _i, results_1, participant, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, client_1.prisma.participants.findMany({
                    where: {
                        OR: [
                            {
                                personalChat: {
                                    OR: [{ user1Id: userId }, { user2Id: userId }],
                                },
                            },
                            {
                                communities: {
                                    groups: {
                                        groupMemberships: {
                                            some: { userId: userId },
                                        },
                                    },
                                },
                            },
                            {
                                communities: {
                                    channels: {
                                        channelSubscriptions: {
                                            some: { userId: userId },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: {
                            // messageReadReceipts: true,
                            // messageMentions: true,
                            },
                        },
                        personalChat: {
                            include: {
                                users1: {
                                    select: {
                                        id: true,
                                        username: true,
                                        photo: true,
                                        screenName: true,
                                        phone: true,
                                        publicKey: true,
                                        lastSeen: true,
                                        activeNow: true,
                                        profilePicVisibility: true,
                                        lastSeenVisibility: true,
                                    },
                                },
                                users2: {
                                    select: {
                                        id: true,
                                        username: true,
                                        photo: true,
                                        screenName: true,
                                        phone: true,
                                        publicKey: true,
                                        lastSeen: true,
                                        activeNow: true,
                                        profilePicVisibility: true,
                                        lastSeenVisibility: true,
                                    },
                                },
                            },
                        },
                        communities: {
                            include: {
                                groups: true,
                                channels: true,
                            },
                        },
                    },
                })];
            case 1:
                userParticipants = _b.sent();
                results = userParticipants.map(function (participant) { return (__assign(__assign({}, participant), { communityId: undefined, personalChatId: undefined, messages: undefined, personalChat: undefined, user1: participant.personalChat
                        ? participant.personalChat.users1
                        : undefined, user2: participant.personalChat
                        ? participant.personalChat.users2
                        : undefined, lastMessage: participant.messages ? participant.messages[0] : undefined, channel: {}, group: {} })); });
                _i = 0, results_1 = results;
                _b.label = 2;
            case 2:
                if (!(_i < results_1.length)) return [3 /*break*/, 5];
                participant = results_1[_i];
                _a = participant;
                return [4 /*yield*/, countUnreadMessage(userId, participant.id)];
            case 3:
                _a.messagesCount = _b.sent();
                _b.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                results.forEach(function (participant) {
                    var _a, _b;
                    if (participant.type !== 'personalChat') {
                        if (participant.communities.channels) {
                            participant.channel = __assign(__assign(__assign({}, participant.communities), (_a = participant.communities) === null || _a === void 0 ? void 0 : _a.channels), { groups: undefined, channels: undefined });
                            participant.group = undefined;
                            participant.type = 'channel';
                        }
                        else {
                            participant.group = __assign(__assign(__assign({}, participant.communities), (_b = participant.communities) === null || _b === void 0 ? void 0 : _b.groups), { groups: undefined, channels: undefined });
                            participant.type = 'group';
                            participant.channel = undefined;
                        }
                    }
                    else {
                        // personal chat
                        participant.group = undefined;
                        participant.channel = undefined;
                        if (participant.user1.id === userId) {
                            participant.secondUser = participant.user2;
                        }
                        if (participant.user2.id === userId) {
                            participant.secondUser = participant.user1;
                        }
                        participant.user1 = undefined;
                        participant.user2 = undefined;
                    }
                    participant.communities = undefined;
                });
                results.sort(function (p1, p2) {
                    if (!p1.lastMessage)
                        return 1;
                    if (!p2.lastMessage)
                        return -1;
                    return (p2.lastMessage.createdAt.getTime() - p1.lastMessage.createdAt.getTime());
                });
                return [2 /*return*/, results];
        }
    });
}); };
exports.getUserParticipants = getUserParticipants;
var getMessagesService = function (participantId, senderId, take, skip) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, draftedMessage, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.messages.findMany({
                    take: take,
                    skip: skip,
                    where: {
                        participantId: participantId,
                        status: {
                            not: client_2.MessageStatus.drafted,
                        },
                    },
                    include: {
                        messageReadReceipts: true,
                        messageMentions: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                })];
            case 1:
                messages = _a.sent();
                messages.forEach(function (msg) {
                    if (msg.senderId !== senderId) {
                        msg.messageMentions = [];
                        msg.messageReadReceipts = [];
                    }
                });
                // for (const message of messages) {
                //   if (message.url) {
                //     console.log(message.url);
                //     message.content = await getFileFromFirebase(message.url);
                //     message.url = undefined;
                //   }
                // }
                if (skip !== 0)
                    return [2 /*return*/, messages];
                return [4 /*yield*/, client_1.prisma.messages.findFirst({
                        where: {
                            participantId: participantId,
                            senderId: senderId,
                            status: client_2.MessageStatus.drafted,
                        },
                        include: {
                            messageReadReceipts: true,
                            messageMentions: true,
                        },
                    })];
            case 2:
                draftedMessage = _a.sent();
                if (!!draftedMessage) return [3 /*break*/, 4];
                data = {
                    participantId: participantId,
                    senderId: senderId,
                    status: client_2.MessageStatus.drafted,
                    content: '',
                };
                return [4 /*yield*/, (0, exports.createMessage)(data)];
            case 3:
                draftedMessage = _a.sent();
                _a.label = 4;
            case 4: 
            // if (draftedMessage.url) {
            //   draftedMessage.content = await getFileFromFirebase(draftedMessage.url);
            //   draftedMessage.url = undefined;
            // }
            return [2 /*return*/, __spreadArray(__spreadArray([], messages, true), [draftedMessage], false)];
        }
    });
}); };
exports.getMessagesService = getMessagesService;
var canSeeMessages = function (userId, participantId) { return __awaiter(void 0, void 0, void 0, function () {
    var participant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client_1.prisma.participants.findMany({
                    where: {
                        id: participantId,
                        OR: [
                            {
                                personalChat: {
                                    OR: [{ user1Id: userId }, { user2Id: userId }],
                                },
                            },
                            {
                                communities: {
                                    groups: {
                                        groupMemberships: {
                                            some: { userId: userId },
                                        },
                                    },
                                },
                            },
                            {
                                communities: {
                                    channels: {
                                        channelSubscriptions: {
                                            some: { userId: userId },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                })];
            case 1:
                participant = _a.sent();
                return [2 /*return*/, participant.length !== 0];
        }
    });
}); };
exports.canSeeMessages = canSeeMessages;
