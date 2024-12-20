import prisma from '../prisma/client';
import { MuteDuration } from '@prisma/client';
export const getPersonalChatUsers = async (participantId: number) => {
  const users = await prisma.participants.findUnique({
    where: {
      id: participantId,
    },
    include: {
      personalChat: {
        include: {
          users1: {
            select: {
              id: true,
              fcmtokens: true,
            },
          },
          users2: {
            select: {
              id: true,
              fcmtokens: true,
            },
          },
        },
      },
    },
  });

  const usersWithFCM = [
    users.personalChat.users1,
    users.personalChat.users2,
  ].filter((user) => user.fcmtokens.length > 0);
  return usersWithFCM || [];
};

export const getGroupUsers = async (participantId: number) => {
  const users = await prisma.participants.findUnique({
    where: {
      id: participantId,
    },
    include: {
      communities: {
        include: {
          groups: {
            include: {
              groupMemberships: {
                include: {
                  users: {
                    select: {
                      id: true,
                      fcmtokens: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const usersWithFCM = users.communities.groups.groupMemberships
    .map((user) => user.users)
    .filter((user) => user.fcmtokens.length > 0);

  return usersWithFCM || [];
};

export const getChannelUsers = async (participantId: number) => {
  const users = await prisma.participants.findUnique({
    where: {
      id: participantId,
    },
    include: {
      communities: {
        include: {
          channels: {
            include: {
              channelSubscriptions: {
                include: {
                  users: {
                    select: {
                      id: true,
                      fcmtokens: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const usersWithFCM = users.communities.channels?.channelSubscriptions
    .map((user) => user.users)
    .filter((user) => user.fcmtokens.length > 0);

  return usersWithFCM || [];
};

export const getUserMutedParticipants = async (participantId: number) => {
  const mutedParticipants = await prisma.mutedParticipants.findMany({
    where: {
      participantId: participantId,
    },
    select: {
        userId: true,
        expiryDate: true,
        participantId: true,
        },
  });
  const nonExpiredMutedParticipants = mutedParticipants.filter(
    (participant) =>
      new Date(participant.expiryDate).getTime() > new Date().getTime()
  );
  const ExpiredMutedParticipants = mutedParticipants.filter(
    (participant) =>
      new Date(participant.expiryDate).getTime() < new Date().getTime()
  );
  removeExpiredMutedParticipants(
    ExpiredMutedParticipants.map((participant) => ({
      participantId: participant.participantId,
      userId: participant.userId,
    }))
  );
  return (
    nonExpiredMutedParticipants.map((participant) => participant.userId) || []
  );
};

export const getParticipantType = async (participantId: number) => {
  return await prisma.participants.findUnique({
    where: {
      id: participantId,
    },
    select: {
      type: true,
    },
  });
};

const calcExoiryDate = (duration: MuteDuration) => {
    const curDate = new Date();
    let expiryDate: Date | null = null;
    switch (duration) {
        case MuteDuration.oneHour:
          expiryDate = new Date(curDate.getTime() + 1 * 60 * 60 * 1000); // Add 1 hour
          break;
        case MuteDuration.oneDay:
          expiryDate = new Date(curDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
          break;
        case MuteDuration.oneWeek:
          expiryDate = new Date(curDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 1 week
          break;
        case MuteDuration.oneMonth:
          expiryDate = new Date(curDate); // Start from current date
          expiryDate.setMonth(curDate.getMonth() + 1); // Add 1 month
          break;
        case MuteDuration.forever:
          expiryDate = null; // Use null to indicate no expiry
          break;
        default:
          throw new Error('Invalid mute duration');
      }
        return expiryDate;
    }
export const addMutedParticipant = async (
  participantId: number,
  userId: number,
  duration: MuteDuration
) => {
    const expiryDate = calcExoiryDate(duration);
  return await prisma.mutedParticipants.create({
    data: {
      userId,
      participantId,
      expiryDate,
    },
  });
};

export const removeMutedParticipant = async (
  participantId: number,
  userId: number
) => {
  return await prisma.mutedParticipants.deleteMany({
    where: {
      userId,
      participantId,
    },
  });
};

export const removeExpiredMutedParticipants = async (
  participantsIds: { participantId: number; userId: number }[]
) => {
  return await prisma.mutedParticipants.deleteMany({
    where: {
      OR: participantsIds.map(({ participantId, userId }) => ({
        participantId,
        userId,
      })),
    },
  });
};
export const updateMutedParticipant = async (
  participantId: number,
  userId: number,
  duration: MuteDuration
) => {
  const expiryDate = calcExoiryDate(duration);
  return await prisma.mutedParticipants.updateMany({
    where: {
      userId,
      participantId,
    },
    data: {
      expiryDate,
    },
  });
};

