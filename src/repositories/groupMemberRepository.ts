import prisma from '../prisma/client';
import { UpdateCommunityMemberData } from '../types';

export const findGroupMember = async (userId: number, groupId: number) => {
  return await prisma.groupMemberships.findFirst({
    where: {
      userId,
      groupId,
      status: true,
    },
    select: {
      role: true,
    },
  });
};

export const findGroupMembers = async (groupId: number) => {
  return await prisma.groupMemberships.findMany({
    where: {
      groupId,
      status: true,
    },
    select: {
      groupId: true,
      userId: true,
      role: true,
      status: true,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      users: {
        select: {
          username: true,
        },
      },
    },
  });
};

export const findExistingMember = async (memberId: number, groupId: number) => {
  return await prisma.groupMemberships.findFirst({
    where: {
      AND: [{ userId: memberId }, { groupId }],
    },
    select: {
      role: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
      status: true,
    },
  });
};

export const addGroupMember = async (memberData: {
  groupId: number;
  userId: number;
}) => {
  return await prisma.groupMemberships.create({ data: memberData });
};

export const updateGroupMemberStatus = async (
  memberId: number,
  groupId: number,
  status: boolean
) => {
  return await prisma.groupMemberships.update({
    where: {
      userId_groupId: {
        userId: memberId,
        groupId,
      },
    },
    data: { status },
  });
};

export const updateGroupMemberData = async (
  memberId: number,
  groupId: number,
  data: UpdateCommunityMemberData
) => {
  return await prisma.groupMemberships.update({
    where: {
      userId_groupId: {
        userId: memberId,
        groupId,
      },
    },
    data,
  });
};
