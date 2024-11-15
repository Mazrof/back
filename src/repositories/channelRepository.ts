import { prisma } from '../prisma/client';
import { AppError } from '../utility';

export const findAllChannels = async () => {
  return await prisma.channels.findMany({
    where: { status: true },
    select: {
      id: true,
      canAddComments: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
};

export const findChannelById = async (id: number) => {
  const channel = await prisma.channels.findUnique({
    where: { id },
    select: {
      id: true,
      canAddComments: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });

  if (!channel) {
    throw new AppError('No channel found with that ID', 404);
  }

  return channel;
};

export const createChannel = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  canAddComments: boolean;
}) => {
  const community = await prisma.communities.create({
    data: {
      name: data.name,
      privacy: data.privacy,
      creatorId: data.creatorId,
    },
  });

  return await prisma.channels.create({
    data: {
      canAddComments: data.canAddComments,
      communityId: community.id,
    },
    select: {
      id: true,
      canAddComments: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
};

export const updateChannel = async (
  channelId: number,
  data: { name?: string; privacy?: boolean; canAddComments?: boolean }
) => {
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
    select: {
      communityId: true,
    },
  });
  //TODO: fix the error in DB
  if (!channel || channel.communityId === null) {
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

  if (data.canAddComments !== undefined) {
    await prisma.channels.update({
      where: { id: channelId },
      data: {
        canAddComments: data.canAddComments,
      },
    });
  }

  return await findChannelById(channelId);
};

export const deleteChannel = async (id: number) => {
  const channel = await prisma.communities.findUnique({
    where: { id },
  });

  if (!channel) {
    throw new AppError('No channel found with that ID', 404);
  }

  await prisma.channels.update({
    where: { id, status: true },
    data: { status: false },
  });

  return channel;
};
