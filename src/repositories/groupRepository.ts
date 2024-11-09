import { prisma } from '../prisma/client';
import { AppError } from '../utility';

export const findAllGroups = async () => {
  return await prisma.groups.findMany({
    where: { status: true },
    select: {
      id: true,
      groupSize: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
};

export const findGroupById = async (id: number) => {
  const group = await prisma.groups.findUnique({
    where: { id },
    select: {
      id: true,
      groupSize: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  return group;
};

export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
  invitationLink: string;
}) => {
  const community = await prisma.communities.create({
    data: {
      name: data.name,
      privacy: data.privacy,
      creatorId: data.creatorId,
    },
  });

  return await prisma.groups.create({
    data: {
      groupSize: data.groupSize,
      status: true,
      communityId: community.id,
      invitationLink: data.invitationLink,
    },
    select: {
      id: true,
      groupSize: true,
      communities: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });
};

export const updateGroup = async (
  groupId: number,
  data: { name?: string; privacy?: boolean; groupSize?: number }
) => {
  const group = await prisma.groups.findUnique({
    where: { id: groupId },
    select: {
      communityId: true,
    },
  });
  //TODO: fix the error in DB
  if (!group || group.communityId === null) {
    throw new AppError('No Group found with that ID', 404);
  }

  if (data.name || data.privacy) {
    await prisma.communities.update({
      where: { id: group.communityId },
      data: {
        name: data.name,
        privacy: data.privacy,
      },
    });
  }

  if (data.groupSize !== undefined) {
    await prisma.groups.update({
      where: { id: groupId },
      data: {
        groupSize: data.groupSize,
      },
    });
  }

  return await findGroupById(groupId);
};

export const deleteGroup = async (id: number) => {
  const group = await prisma.communities.findUnique({
    where: { id },
  });

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  await prisma.groups.update({
    where: { id, status: true },
    data: { status: false },
  });

  return group;
};

export const applyGroupFilter = async (groupId: number, adminId: number) => {
  const group = await prisma.communities.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  let groupFilter = await prisma.adminGroupFilters.findFirst({
    where: { groupId: groupId },
  });

  if (!groupFilter) {
    await prisma.adminGroupFilters.delete({
      where: { groupId: groupId },
    });
    return groupFilter;
  }

  groupFilter = await prisma.adminGroupFilters.create({
    data: {
      groupId,
      adminId,
    },
  });

  return groupFilter;
};
