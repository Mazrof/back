import { prisma } from '../prisma/client';
import { AppError } from '../utility';
import { ParticipiantTypes } from '@prisma/client';

export const findAllGroups = async () => {
  // Fetch the groups with their communities
  const groups: {
    id: number;
    groupSize: number | null;
    community: { name: string; privacy: boolean | null };
  }[] = await prisma.groups.findMany({
    where: {
      community: {
        status: true,
      },
    },
    select: {
      id: true,
      groupSize: true,
      community: {
        select: {
          name: true,
          privacy: true,
        },
      },
    },
  });

  // Check which groups have filters
  const filters: { groupId: number }[] =
    await prisma.adminGroupFilters.findMany({
      select: {
        groupId: true,
      },
    });

  // Create a Set of filtered group IDs for efficient lookup
  const filteredGroupIds: Set<number> = new Set(
    filters.map((filter) => filter.groupId)
  );

  // Add the filtered property to the groups
  const groupsWithFilter: {
    hasFilter: boolean;
    id: number;
    groupSize: number | null;
    community: { name: string; privacy: boolean | null };
  }[] = groups.map((group) => ({
    ...group,
    hasFilter: filteredGroupIds.has(group.id),
  }));

  return groupsWithFilter;
};

export const findGroupById = async (id: number) => {
  const group = await prisma.groups.findUnique({
    where: { id },
    select: {
      id: true,
      groupSize: true,
      community: {
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
  await prisma.participants.create({
    data: {
      communityId: community.id,
      type: ParticipiantTypes.community,
    },
  });
  return await prisma.groups.create({
    data: {
      groupSize: data.groupSize,
      communityId: community.id,
      invitationLink: data.invitationLink,
    },
    select: {
      id: true,
      groupSize: true,
      community: {
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
  const group = await prisma.groups.findUnique({
    where: { id },
    select: {
      communityId: true,
    },
  });

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  await prisma.communities.update({
    where: { id: group.communityId, status: true },
    data: { status: false },
  });

  return group;
};

export const applyGroupFilter = async (groupId: number, adminId: number) => {
  const group = await prisma.groups.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  let groupFilter = await prisma.adminGroupFilters.findFirst({
    where: { groupId: groupId },
  });

  if (groupFilter) {
    await prisma.adminGroupFilters.delete({
      where: { groupId: groupId },
      select: {
        groupId: true,
        adminId: true,
      },
    });
    return groupFilter;
  }

  groupFilter = await prisma.adminGroupFilters.create({
    data: {
      groupId,
      adminId,
    },
    select: {
      groupId: true,
      adminId: true,
    },
  });

  return groupFilter;
};
