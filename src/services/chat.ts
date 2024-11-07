import { prisma, Schemas } from '../prisma/client';
import { ParticipiantTypes } from '@prisma/client';

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
  const participantIds = personalChats.flatMap((chat) => chat.participants!.id);
  console.log(participantIds);
  return participantIds;
};
export const getParticipantIdsOfUserGroups = async (userId: number) => {
  const memberships = await prisma.groupMemberships.findMany({
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
  return memberships.flatMap(
    (membership) => membership.groups.communities!.participants!.id
  );
};
//TODO: ensure the groups has communities and commnites has particpinats

export const getParticipantIdsOfUserChannels = async (userId: number) => {
  const memberships = await prisma.channelSubscriptions.findMany({
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
  console.log(memberships[0].channels.communities!.participants!.id);
  return memberships.flatMap(
    (membership) => membership.channels.communities!.participants!.id
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
  });
};

export const insertParticipantDate = async (
  userId: number,
  participantIds: number[]
) => {
  const missingMessages = await prisma.messages.findMany({
    where: {
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
    },
  });
  console.log(missingMessages);
  const insertData = missingMessages.map((message) => ({
    userId: userId,
    messageId: message.id,
    participantId: message.participantId,
    deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    readAt: null,
  }));

  await prisma.messageReadReceipts.createMany({
    data: insertData,
  });
  return insertData;
};

export const insertMessageRecipient = async (userId: number, message: any) => {
  await prisma.messageReadReceipts.create({
    data: {
      userId,
      participantId: message.participantId,
      messageId: message.id,
      deliveredAt: new Date(new Date().getTime() + 2 * 60 * 60),
      readAt: null,
    },
  });
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
  return prisma.messages.update({ where: { id }, data });
};
export const createPersonalChat = async (user1Id: number, user2Id: number) => {
  if (user1Id > user2Id) [user1Id, user2Id] = [user2Id, user1Id];
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
              communities: {
                include: {
                  participants: {
                    include: {
                      messages: {
                        include: {
                          messageReadReceipts: true,
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
                        include: {
                          messageReadReceipts: true,
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
                include: {
                  messageReadReceipts: true,
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
                include: {
                  messageReadReceipts: true,
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
