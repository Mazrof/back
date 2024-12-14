import prisma from '../prisma/client';
import { UpdateChannelMemberData } from '../types';
import { CommunityRole } from '@prisma/client';

export const findChannelMember = async (userId: number, channelId: number) => {
  return await prisma.channelSubscriptions.findUnique({
    where: {
      userId_channelId: {
        userId,
        channelId,
      },
    },
    select: {
      role: true,
      active: true,
    },
  });
};

export const findChannelMembers = async (channelId: number) => {
  return await prisma.channelSubscriptions.findMany({
    where: {
      channelId,
      // active: true,
    },
    select: {
      channelId: true,
      userId: true,
      role: true,
      active: true,
      hasDownloadPermissions: true,
      users: {
        select: {
          username: true,
        },
      },
    },
  });
};

export const findExistingMember = async (userId: number, channelId: number) => {
  return await prisma.channelSubscriptions.findUnique({
    where: {
      userId_channelId: {
        userId,
        channelId,
      },
    },
    select: {
      role: true,
      hasDownloadPermissions: true,
      active: true,
    },
  });
};

export const addChannelMember = async (memberData: {
  channelId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
}) => {
  return await prisma.channelSubscriptions.create({
    data: memberData,
    select: {
      channelId: true,
      userId: true,
      role: true,
      hasDownloadPermissions: true,
    },
  });
};

export const updateChannelMemberStatus = async (
  userId: number,
  channelId: number,
  active: boolean
) => {
  console.log('here');
  return await prisma.channelSubscriptions.update({
    where: {
      userId_channelId: {
        userId,
        channelId,
      },
    },
    data: { active },
  });
};

export const updateChannelMemberData = async (
  userId: number,
  channelId: number,
  data: UpdateChannelMemberData
) => {
  return await prisma.channelSubscriptions.update({
    where: {
      userId_channelId: {
        userId,
        channelId,
      },
    },
    data,
  });
};
export const findChannelByInvitationLinkHash = async (
  invitationLink: string
) => {
  return  prisma.channels.findUnique({
    where: { invitationLink },
    select: {
      id: true,
    },
  });
};

export const getAdminCounts = async (channelId) => {
  return await prisma.channelSubscriptions.count({
    where: {
      channelId,
      role: CommunityRole.admin,
      active: true,
    },
  });
};
