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
exports.updateUserProfile = exports.canSeeMessages = exports.getMessagesService = exports.getUserParticipants = exports.getUserGroupsChannelsChats = exports.createPersonalChat = exports.updateMessageById = exports.getMessageById = exports.deleteMessage = exports.insertMessageRecipient = exports.insertParticipantDate = exports.markMessagesAsRead = exports.getParticipantIdsOfUserChannels = exports.getParticipantIdsOfUserGroups = exports.getParticipantIdsOfUserPersonalChats = exports.createMessage = void 0;
const client_1 = require("../prisma/client");
const client_2 = require("@prisma/client");
const createMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.prisma.messages.create({
        data: Object.assign(Object.assign({}, data), { participantId: undefined, participants: { connect: { id: data.participantId } }, messages: data.replyTo ? { connect: { id: data.replyTo } } : undefined, replyTo: undefined, users: { connect: { id: data.senderId } }, senderId: undefined, createdAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), messageMentions: {
                create: data.messageMentions,
            } }),
        include: {
            messageMentions: true,
            messageReadReceipts: true,
        },
    });
});
exports.createMessage = createMessage;
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
    return personalChats.flatMap((chat) => chat.participants.id);
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
    return memberships.flatMap((membership) => membership.groups.communities.participants.id);
});
exports.getParticipantIdsOfUserGroups = getParticipantIdsOfUserGroups;
//TODO: ensure the groups has communities and commnites has particpinats
const getParticipantIdsOfUserChannels = (userId) => __awaiter(void 0, void 0, void 0, function* () {
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
    return memberships.flatMap((membership) => membership.channels.communities.participants.id);
});
exports.getParticipantIdsOfUserChannels = getParticipantIdsOfUserChannels;
const markMessagesAsRead = (userId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const receiptsToUpdate = yield client_1.prisma.messageReadReceipts.findMany({
        where: {
            userId: userId,
            participantId: participantId,
            readAt: null,
        },
    });
    const messageIds = receiptsToUpdate.map((receipts) => receipts.messageId);
    yield client_1.prisma.messageReadReceipts.updateMany({
        where: {
            userId: userId,
            participantId: participantId,
            readAt: null,
        },
        data: {
            readAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        },
    });
    return client_1.prisma.messageReadReceipts.findMany({
        where: {
            userId: userId,
            participantId: participantId,
            messageId: { in: messageIds },
            readAt: { not: null },
        },
    });
});
exports.markMessagesAsRead = markMessagesAsRead;
const insertParticipantDate = (userId, participantIds) => __awaiter(void 0, void 0, void 0, function* () {
    const missingMessages = yield client_1.prisma.messages.findMany({
        where: {
            //TODO: TEST THIS
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
    });
    const insertData = missingMessages.map((message) => {
        return {
            userId: userId,
            messageId: message.id,
            participantId: message.participantId,
            deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
            readAt: null,
        };
    });
    yield client_1.prisma.messageReadReceipts.createMany({
        data: insertData,
    });
    return insertData;
});
exports.insertParticipantDate = insertParticipantDate;
const insertMessageRecipient = (userId, message) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.prisma.messageReadReceipts.create({
        data: {
            userId,
            participantId: message.participantId,
            messageId: message.id,
            deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60),
            readAt: null,
        },
    });
});
exports.insertMessageRecipient = insertMessageRecipient;
const deleteMessage = (messageId) => __awaiter(void 0, void 0, void 0, function* () {
    yield client_1.prisma.messages.delete({
        where: { id: messageId },
    });
});
exports.deleteMessage = deleteMessage;
const getMessageById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.prisma.messages.findUnique({ where: { id } });
});
exports.getMessageById = getMessageById;
const updateMessageById = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield client_1.prisma.messages.update({
        where: { id },
        data: Object.assign(Object.assign({}, data), { updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000) }),
        include: {
            messageReadReceipts: true,
            messageMentions: true,
        },
    });
    return Object.assign({}, message);
});
exports.updateMessageById = updateMessageById;
const createPersonalChat = (user1Id, user2Id) => __awaiter(void 0, void 0, void 0, function* () {
    if (user1Id > user2Id)
        [user1Id, user2Id] = [user2Id, user1Id];
    console.log('creating personal chat between', user1Id, 'and', user2Id);
    // if this pair was exists before return it existing
    const personalChat = yield client_1.prisma.personalChat.findFirst({
        where: {
            user1Id,
            user2Id,
        },
        include: {
            participants: true,
        },
    });
    if (personalChat)
        return personalChat;
    return client_1.prisma.personalChat.create({
        data: {
            user1Id,
            user2Id,
            participants: {
                create: {
                    type: client_2.ParticipiantTypes.personalChat,
                },
            },
        },
        include: {
            participants: true,
        },
    });
});
exports.createPersonalChat = createPersonalChat;
const getUserGroupsChannelsChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield client_1.prisma.users.findUnique({
        where: { id: userId },
        select: {
            groupMemberships: {
                include: {
                    groups: {
                        include: {
                            communities: {
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
                            communities: {
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
    });
    const combinedPersonalChats = [
        ...((userData === null || userData === void 0 ? void 0 : userData.personalChatsAsUser1) || []),
        ...((userData === null || userData === void 0 ? void 0 : userData.personalChatsAsUser2) || []),
    ];
    return Object.assign(Object.assign({}, userData), { personalChatsAsUser1: undefined, personalChatsAsUser2: undefined, personalChats: combinedPersonalChats });
});
exports.getUserGroupsChannelsChats = getUserGroupsChannelsChats;
const getUserParticipants = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userParticipants = yield client_1.prisma.participants.findMany({
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
                            some: {
                                groupMemberships: {
                                    some: { userId },
                                },
                            },
                        },
                    },
                },
                {
                    communities: {
                        channels: {
                            some: {
                                channelSubscriptions: {
                                    some: { userId },
                                },
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
    });
    const results = userParticipants.map((participant) => (Object.assign(Object.assign({}, participant), { communityId: undefined, personalChatId: undefined, messages: undefined, personalChat: undefined, user1: participant.personalChat
            ? participant.personalChat.users1
            : undefined, user2: participant.personalChat
            ? participant.personalChat.users2
            : undefined, lastMessage: participant.messages ? participant.messages[0] : undefined, channel: {}, group: {} })));
    results.forEach((participant) => {
        var _a, _b;
        if (participant.type !== 'personalChat') {
            if (participant.communities.channels.length) {
                participant.channel = Object.assign(Object.assign(Object.assign({}, participant.communities), (_a = participant.communities) === null || _a === void 0 ? void 0 : _a.channels[0]), { groups: undefined, channels: undefined });
                participant.group = undefined;
                participant.type = 'channel';
            }
            else {
                participant.group = Object.assign(Object.assign(Object.assign({}, participant.communities), (_b = participant.communities) === null || _b === void 0 ? void 0 : _b.groups[0]), { groups: undefined, channels: undefined });
                participant.type = 'group';
                participant.channel = undefined;
            }
        }
        else {
            // personal chat
            participant.group = undefined;
            participant.channel = undefined;
            console.log(participant);
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
    results.sort((p1, p2) => {
        if (!p1.lastMessage)
            return 1;
        if (!p2.lastMessage)
            return -1;
        return (p2.lastMessage.createdAt.getTime() - p1.lastMessage.createdAt.getTime());
    });
    return results;
});
exports.getUserParticipants = getUserParticipants;
const getMessagesService = (participantId, senderId, take, skip) => __awaiter(void 0, void 0, void 0, function* () {
    let messages = yield client_1.prisma.messages.findMany({
        take,
        skip,
        where: {
            participantId,
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
    });
    messages.forEach((msg) => {
        if (msg.senderId !== senderId) {
            //TODO: CHECK THIS MENTIONS
            msg.messageMentions = [];
            msg.messageReadReceipts = [];
        }
    });
    if (skip !== 0)
        return messages;
    let draftedMessage = yield client_1.prisma.messages.findFirst({
        where: {
            participantId,
            senderId,
            status: client_2.MessageStatus.drafted,
        },
        include: {
            messageReadReceipts: true,
            messageMentions: true,
        },
    });
    if (!draftedMessage) {
        const data = {
            participantId,
            senderId,
            status: client_2.MessageStatus.drafted,
            content: '',
        };
        draftedMessage = yield (0, exports.createMessage)(data);
    }
    return [...messages, draftedMessage];
});
exports.getMessagesService = getMessagesService;
const canSeeMessages = (userId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield client_1.prisma.participants.findMany({
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
                            some: {
                                groupMemberships: {
                                    some: { userId },
                                },
                            },
                        },
                    },
                },
                {
                    communities: {
                        channels: {
                            some: {
                                channelSubscriptions: {
                                    some: { userId },
                                },
                            },
                        },
                    },
                },
            ],
        },
    });
    return participant.length !== 0;
});
exports.canSeeMessages = canSeeMessages;
//TODO: MOVE THIS TO ANOTHER FILE
const updateUserProfile = (userId, userInfo) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.prisma.users.update({ where: { id: userId }, data: Object.assign({}, userInfo) });
});
exports.updateUserProfile = updateUserProfile;
