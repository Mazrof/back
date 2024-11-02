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
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessagesAsRead = exports.getParticipantIdsOfUserChannles = exports.getParticipantIdsOfUserGroups = exports.getParticipantIdsOfUserPersonalChats = exports.createPersonalChat = exports.createMessage = void 0;
const client_1 = require("../prisma/client");
const createMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.prisma.messages.create({
        data: Object.assign(Object.assign({}, data), { participantId: undefined, participants: { connect: { id: data.participantId } }, messages: data.replyTo ? { connect: { id: data.replyTo } } : undefined, replyTo: undefined, users: { connect: { id: data.senderId } }, senderId: undefined }),
    });
});
exports.createMessage = createMessage;
const createPersonalChat = (user1Id, user2Id) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO:Ensure the IDs are ordered to enforce bidirectional uniqueness
    if (user1Id > user2Id)
        [user1Id, user2Id] = [user2Id, user1Id];
    return client_1.prisma.personalChat.create({
        data: {
            user1Id,
            user2Id,
        },
    });
});
exports.createPersonalChat = createPersonalChat;
const getParticipantIdsOfUserPersonalChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const personalChats = yield client_1.prisma.personalChat.findMany({
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
    });
    // Flatten to get only participant IDs
    const participantIds = personalChats.flatMap((chat) => chat.participants.map((participant) => participant.id));
    console.log(participantIds);
    return participantIds;
});
exports.getParticipantIdsOfUserPersonalChats = getParticipantIdsOfUserPersonalChats;
const getParticipantIdsOfUserGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberships = yield client_1.prisma.groupMemberships.findMany({
        where: {
            userId: userId,
        },
        select: {
            groups: {
                select: {
                    communities: {
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
    });
    // Extract participant IDs step-by-step and handle nullable values
    return memberships.flatMap((membership) => membership.groups.communities.participants.map((participant) => participant.id));
});
exports.getParticipantIdsOfUserGroups = getParticipantIdsOfUserGroups;
//TODO: ensure the groups has communities and commnites has particpinats
const getParticipantIdsOfUserChannles = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const memberships = yield client_1.prisma.channelSubscriptions.findMany({
        where: {
            userId: userId,
        },
        select: {
            channels: {
                select: {
                    communities: {
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
    });
    // Extract participant IDs step-by-step and handle nullable values
    return memberships.flatMap((membership) => membership.channels.communities.participants.map((participant) => participant.id));
});
exports.getParticipantIdsOfUserChannles = getParticipantIdsOfUserChannles;
const markMessagesAsRead = (userId, participantId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const updateReceipt = yield client_1.prisma.messageReadReceipts.updateMany({
        where: {
            userId: userId,
            participantId: participantId,
            messageId: messageId,
            readAt: null, // Only update if readAt is currently null
        },
        data: {
            readAt: new Date(), // Set readAt to the current timestamp
        },
    });
    console.log(updateReceipt);
});
exports.markMessagesAsRead = markMessagesAsRead;