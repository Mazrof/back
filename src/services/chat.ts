import { prisma } from '../prisma/client';

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

export const createPersonalChat = async (user1Id: number, user2Id: number) => {
  // TODO:Ensure the IDs are ordered to enforce bidirectional uniqueness
  if (user1Id > user2Id) [user1Id, user2Id] = [user2Id, user1Id];
  return prisma.personalChat.create({
    data: {
      user1Id,
      user2Id,
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
  const participantIds = personalChats.flatMap((chat) =>
    chat.participants.map((participant) => participant.id)
  );
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
  return memberships.flatMap((membership) =>
    membership.groups.communities!.participants!.map(
      (participant) => participant.id
    )
  );
};
//TODO: ensure the groups has communities and commnites has particpinats

export const getParticipantIdsOfUserChannles = async (userId: number) => {
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
  return memberships.flatMap((membership) =>
    membership.channels.communities!.participants!.map(
      (participant) => participant.id
    )
  );
};
