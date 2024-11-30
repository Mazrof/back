import { prisma } from '../prisma/client';
import { AppError } from '../utility';
import { ParticipiantTypes } from '@prisma/client';

export const findAllChannels = async () => {
  return prisma.channels.findMany({
    where: {
      community: {
        active: true,
      },
    },
    select: {
      id: true,
      canAddComments: true,
      community: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
};

export const findChannelById = async (
  id: number
): Promise<{
  id: number;
  canAddComments: boolean;
  community: { name: string; privacy: boolean };
}> => {
  const channel: {
    id: number;
    canAddComments: boolean;
    community: { name: string; privacy: boolean; active: boolean };
  } | null = await prisma.channels.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      canAddComments: true,
      community: {
        select: {
          name: true,
          privacy: true,
          active: true,
        },
      },
    },
  });

  if (!channel || !channel.community.active) {
    throw new AppError('No channel found with that ID', 404);
  }

  return channel;
};

export const createChannel = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  canAddComments: boolean;
  invitationLink: string;
}) => {
  let message: string = '';
  if (!data.name) {
    message = 'Invalid Group name';
  }
  if (!data.creatorId) {
    if (message) message += ', ';
    message += 'Invalid Creator ID';
  }
  if (message) {
    throw new AppError(`${message}`, 400);
  }
  const community: {
    name: string;
    id: number;
    active: boolean;
    privacy: boolean;
    creatorId: number;
  } = await prisma.communities.create({
    data: {
      name: data.name,
      privacy: data.privacy,
      creatorId: data.creatorId,
    },
  });
  await prisma.participants.create({
    data: {
      communityId: community.id,
      type: ParticipiantTypes.community,
    },
  });

  const channel = prisma.channels.create({
    data: {
      canAddComments: data.canAddComments,
      communityId: community.id,
      invitationLink: data.invitationLink,
    },
    select: {
      id: true,
      canAddComments: true,
      community: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
  return channel;
};

export const updateChannel = async (
  channelId: number,
  data: { name?: string; privacy?: boolean; canAddComments?: boolean }
) => {
  if (!data.name && !data.privacy && !data.canAddComments) {
    throw new AppError('No data to update', 400);
  }
  const channel: {
    communityId: number;
    community: { active: boolean };
  } | null = await prisma.channels.findUnique({
    where: {
      id: channelId,
    },
    select: {
      communityId: true,
      community: {
        select: {
          active: true,
        },
      },
    },
  });

  if (!channel || !channel.community.active) {
    throw new AppError('No channel found with that ID', 404);
  }

  if (data.name || data.privacy) {
    await prisma.communities.update({
      where: { id: channel.communityId },
      data: {
        name: data.name,
        privacy: data.privacy,
      },
    });
  }

  if (data.canAddComments) {
    await prisma.channels.update({
      where: { id: channelId },
      data: {
        canAddComments: data.canAddComments,
      },
    });
  }

  return await findChannelById(channelId);
};

export const deleteChannel = async (
  id: number
): Promise<{ communityId: number }> => {
  const channel: {
    communityId: number;
    community: { active: boolean };
  } | null = await prisma.channels.findUnique({
    where: { id },
    select: {
      communityId: true,
      community: {
        select: {
          active: true,
        },
      },
    },
  });

  if (!channel || !channel.community.active) {
    throw new AppError('No channel found with that ID', 404);
  }

  await prisma.communities.update({
    where: { id: channel.communityId, active: true },
    data: { active: false },
  });

  return channel;
};
