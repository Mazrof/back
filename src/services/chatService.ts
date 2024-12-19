import { prisma, Schemas } from '../prisma/client';
import {
  $Enums,
  Messages,
  MessageStatus,
  ParticipiantTypes,
  Prisma,
  Privacy,
  Social,
} from '@prisma/client';
import { NewMessages } from '../sockets/listeners/chatListeners';
import logger from '../utility/logger';
// import { getFileFromFirebase } from '../third_party_services';

interface Participant {
  communityId: undefined;
  messagesCount?: number;
  personalChatId: undefined;
  messages: undefined;
  personalChat: undefined | object;
  user1: { id: number } | undefined;
  user2: { id: number } | undefined;
  lastMessage: Messages | undefined;
  channel: object | undefined | null;
  group: object | undefined;
  communities:
    | { channels: object | null; groups: object | null }
    | null
    | undefined;
  id: number;
  secondUser?: {
    id: number;
    lastSeenVisibility?: Privacy;
    profilePicVisibility?: Privacy;
  };
  type: $Enums.ParticipiantTypes | string;
}
export const createMessage = async (data: any) => {
  return prisma.messages.create({
    data: {
      ...data,
      participantId: undefined,
      participants: { connect: { id: data.participantId } },
      messages: data.replyTo ? { connect: { id: data.replyTo } } : undefined,
      replyTo: undefined,
      users: { connect: { id: data.senderId } },
      senderId: undefined,
      createdAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      messageMentions: {
        create: data.messageMentions,
      },
    },
    include: {
      messageMentions: true,
      messageReadReceipts: true,
    },
  });
};

export const getParticipantIdsOfUserPersonalChats = async (userId: number) => {
  const personalChats = await prisma.personalChat.findMany({
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
  return personalChats.flatMap((chat) => chat.participants!.id);
};
export const getParticipantIdsOfUserGroups = async (userId: number) => {
  const memberships = await prisma.groupMemberships.findMany({
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
  });
  // Extract participant IDs step-by-step and handle nullable values
  return memberships.flatMap(
    (membership) => membership.groups.community!.participants!.id
  );
};

export const getParticipantIdsOfUserChannels = async (userId: number) => {
  const memberships = await prisma.channelSubscriptions.findMany({
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
  });
  // Extract participant IDs step-by-step and handle nullable values
  return memberships.flatMap(
    (membership) => membership.channels.community!.participants!.id
  );
};
export const markMessagesAsRead = async (
  userId: number,
  participantId: number
) => {
  const receiptsToUpdate = await prisma.messageReadReceipts.findMany({
    where: {
      userId: userId,
      participantId: participantId,
      readAt: null,
    },
  });
  const messageIds = receiptsToUpdate.map((receipts) => receipts.messageId);
  await prisma.messageReadReceipts.updateMany({
    where: {
      userId: userId,
      participantId: participantId,
      readAt: null,
    },
    data: {
      readAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    },
  });
  return prisma.messageReadReceipts.findMany({
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
  });
};

export const insertParticipantDate = async (
  userId: number,
  participantIds: number[]
) => {
  const missingMessages = await prisma.messages.findMany({
    where: {
      senderId: {
        not: userId,
      },
      status: {
        not: MessageStatus.drafted,
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
      senderId: message.senderId,
    };
  });

  await prisma.messageReadReceipts.createMany({
    data: insertData.map((d) => ({ ...d, senderId: undefined })),
  });
  return insertData;
};

export const insertMessageRecipient = async (
  userId: number,
  message: Messages
) => {
  try {
    return prisma.messageReadReceipts.create({
      data: {
        userId,
        participantId: message.participantId,
        messageId: message.id,
        deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
        readAt: null,
      },
    });
  } catch (error) {}
};

export const deleteMessage = async (messageId: number) => {
  await prisma.messages.delete({
    where: { id: messageId },
  });
};

export const getMessageById = async (id: number) => {
  return prisma.messages.findUnique({ where: { id } });
};

export const updateMessageById = async (
  id: number,
  data: Schemas.MessagesUpdateInput
) => {
  const message = await prisma.messages.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    },
    include: {
      messageReadReceipts: true,
      messageMentions: true,
    },
  });
  return {
    ...message,
  };
};

export const createPersonalChat = async (user1Id: number, user2Id: number) => {
  if (user1Id > user2Id) [user1Id, user2Id] = [user2Id, user1Id];
  logger.info('creating personal chat between', user1Id, 'and', user2Id);
  // if this pair was exists before return it existing
  const personalChat = await prisma.personalChat.findFirst({
    where: {
      user1Id,
      user2Id,
    },
    include: {
      participants: true,
    },
  });
  if (personalChat) return personalChat;
  return prisma.personalChat.create({
    data: {
      user1Id,
      user2Id,
      participants: {
        create: {
          type: ParticipiantTypes.personalChat,
        },
      },
    },
    include: {
      participants: true,
    },
  });
};
export const getUserGroupsChannelsChats = async (userId: number) => {
  const userData = await prisma.users.findUnique({
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
  });
  const combinedPersonalChats = [
    ...(userData?.personalChatsAsUser1 || []),
    ...(userData?.personalChatsAsUser2 || []),
  ];
  return {
    ...userData,
    personalChatsAsUser1: undefined,
    personalChatsAsUser2: undefined,
    personalChats: combinedPersonalChats,
  };
};
const countUnreadMessage = async (userId: number, participantId: number) => {
  return prisma.messages.count({
    where: {
      senderId: {
        not: userId,
      },
      status: {
        not: MessageStatus.drafted,
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
  });
};
export const getUserParticipants = async (userId: number) => {
  const userParticipants = await prisma.participants.findMany({
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
                some: { userId },
              },
            },
          },
        },
        {
          communities: {
            channels: {
              channelSubscriptions: {
                some: { userId },
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
  });
  const results: Participant[] = userParticipants.map((participant) => ({
    ...participant,
    communityId: undefined,
    personalChatId: undefined,
    messages: undefined,
    personalChat: undefined,
    user1: participant.personalChat
      ? participant.personalChat.users1
      : undefined,
    user2: participant.personalChat
      ? participant.personalChat.users2
      : undefined,
    lastMessage: participant.messages ? participant.messages[0] : undefined,
    channel: {} as undefined | object,
    group: {} as undefined | object,
  }));
  //
  // for (const participant of results) {
  //   if (participant.lastMessage && participant.lastMessage.url) {
  //     participant.lastMessage.content = await getFileFromFirebase(
  //       participant.lastMessage.url
  //     );
  //     participant.lastMessage.url = undefined;
  //   }
  // }
  for (const participant of results) {
    participant.messagesCount = await countUnreadMessage(
      userId,
      participant.id
    );
  }
  results.forEach((participant) => {
    if (participant.type !== 'personalChat') {
      if (participant.communities!.channels) {
        participant.channel = {
          ...participant.communities,
          ...participant.communities?.channels,
          groups: undefined,
          channels: undefined,
        };
        participant.group = undefined;
        participant.type = 'channel';
      } else {
        participant.group = {
          ...participant.communities,
          ...participant.communities?.groups,
          groups: undefined,
          channels: undefined,
        };
        participant.type = 'group';
        participant.channel = undefined;
      }
    } else {
      // personal chat
      participant.group = undefined;
      participant.channel = undefined;
      if (participant!.user1!.id === userId) {
        participant.secondUser = participant.user2;
      }
      if (participant!.user2!.id === userId) {
        participant.secondUser = participant.user1;
      }

      participant.user1 = undefined;
      participant.user2 = undefined;
    }
    participant.communities = undefined;
  });
  results.sort((p1, p2) => {
    if (!p1.lastMessage) return 1;
    if (!p2.lastMessage) return -1;
    return (
      p2.lastMessage.createdAt!.getTime() - p1.lastMessage.createdAt!.getTime()
    );
  });

  return results;
};

export const getMessagesService = async (
  participantId: number,
  senderId: number,
  take: number,
  skip: number
) => {
  let messages = await prisma.messages.findMany({
    take,
    skip,
    where: {
      participantId,
      status: {
        not: MessageStatus.drafted,
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
  if (skip !== 0) return messages;
  let draftedMessage = await prisma.messages.findFirst({
    where: {
      participantId,
      senderId,
      status: MessageStatus.drafted,
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
      status: MessageStatus.drafted,
      content: '',
    };
    draftedMessage = await createMessage(data);
  }
  // if (draftedMessage.url) {
  //   draftedMessage.content = await getFileFromFirebase(draftedMessage.url);
  //   draftedMessage.url = undefined;
  // }

  return [...messages, draftedMessage];
};
export const canSeeMessages = async (
  userId: number,
  participantId: number
): Promise<boolean> => {
  const participant = await prisma.participants.findMany({
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
                some: { userId },
              },
            },
          },
        },
        {
          communities: {
            channels: {
              channelSubscriptions: {
                some: { userId },
              },
            },
          },
        },
      ],
    },
  });
  return participant.length !== 0;
};
