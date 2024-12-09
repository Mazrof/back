import prisma from '../prisma/client';
import { UpdateGroupMemberData } from '../types';
import { CommunityRole } from '@prisma/client';

export const getMembersCount = async (groupId: number) => {
  const group: { groupSize: number } | null = await prisma.groups.findUnique({
    where: { id: groupId },
    select: {
      groupSize: true,
    },
  });
  const count: number = await prisma.groupMemberships.count({
    where: {
      AND: {
        groupId,
        active: true,
      },
    },
  });
  return count === group?.groupSize;
};

export const findGroupMember = async (userId: number, groupId: number) => {
  return await prisma.groupMemberships.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    select: {
      role: true,
      active: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
    },
  });
};

export const findGroupMembers = async (groupId: number) => {
  return await prisma.groupMemberships.findMany({
    where: {
      groupId,
      active: true,
    },
    select: {
      groupId: true,
      userId: true,
      role: true,
      active: true,
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
  return await prisma.groupMemberships.findUnique({
    where: {
      userId_groupId: {
        userId: memberId,
        groupId: groupId,
      },
    },
    select: {
      role: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
      active: true,
    },
  });
};

export const addGroupMember = async (memberData: {
  groupId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  hasMessagePermissions: boolean;
}) => {
  return await prisma.groupMemberships.create({
    data: memberData,
    select: {
      groupId: true,
      userId: true,
      role: true,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
    },
  });
};

export const updateGroupMemberStatus = async (
  userId: number,
  groupId: number,
  active: boolean
) => {
  return await prisma.groupMemberships.update({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    data: { active },
  });
};

export const updateGroupMemberData = async (
  userId: number,
  groupId: number,
  data: UpdateGroupMemberData
) => {
  return await prisma.groupMemberships.update({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
    data,
  });
};

export const findGroupByInvitationLinkHash = async (invitationLink: string) => {
  return await prisma.groups.findUnique({
    where: { invitationLink },
    select: {
      id: true,
    },
  });
};

export const getAdminCounts = async (groupId: number) => {
  return await prisma.groupMemberships.count({
    where: {
      groupId,
      role: CommunityRole.admin,
    },
  });
};
