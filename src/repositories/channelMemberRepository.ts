import prisma from '../prisma/client';
import { UpdateChannelMemberData } from '../types';

export const findChannelMember = async (userId: number, channelId: number) => {
  return await prisma.channelSubscriptions.findFirst({
    where: {
      userId,
      channelId,
      status: true,
    },
    select: {
      role: true,
    },
  });
};

export const findChannelMembers = async (channelId: number) => {
  return await prisma.channelSubscriptions.findMany({
    where: {
      channelId,
      status: true,
    },
    select: {
      channelId: true,
      userId: true,
      role: true,
      status: true,
      hasDownloadPermissions: true,
      users: {
        select: {
          username: true,
        },
      },
    },
  });
};

export const findExistingMember = async (
  memberId: number,
  channelId: number
) => {
  return await prisma.channelSubscriptions.findFirst({
    where: {
      AND: [{ userId: memberId }, { channelId }],
    },
    select: {
      role: true,
      hasDownloadPermissions: true,
      status: true,
    },
  });
};

export const addChannelMember = async (memberData: {
  channelId: number;
  userId: number;
}) => {
  return await prisma.channelSubscriptions.create({ data: memberData });
};

export const updateChannelMemberStatus = async (
  memberId: number,
  channelId: number,
  status: boolean
) => {
  return await prisma.channelSubscriptions.update({
    where: {
      userId_channelId: {
        userId: memberId,
        channelId,
      },
    },
    data: { status },
  });
};

export const updateChannelMemberData = async (
  memberId: number,
  channelId: number,
  data: UpdateChannelMemberData
) => {
  return await prisma.channelSubscriptions.update({
    where: {
      userId_channelId: {
        userId: memberId,
        channelId,
      },
    },
    data,
  });
};
