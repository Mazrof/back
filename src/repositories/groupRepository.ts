import { prisma } from '../prisma/client';
import { AppError } from '../utility';
import { ParticipiantTypes } from '@prisma/client';

export const findAllGroups = async (): Promise<
  {
    hasFilter: boolean;
    id: number;
    groupSize: number;
    community: { name: string; privacy: boolean; imageURL: string };
  }[]
> => {
  // Fetch the groups with their communities
  const groups: {
    id: number;
    groupSize: number;
    community: { name: string; privacy: boolean; imageURL: string };
  }[] = await prisma.groups.findMany({
    where: {
      community: {
        active: true,
      },
    },
    select: {
      id: true,
      groupSize: true,
      community: {
        select: {
          name: true,
          privacy: true,
          imageURL: true,
        },
      },
    },
  });
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
  const groupsWithFilters: {
    hasFilter: boolean;
    id: number;
    groupSize: number;
    community: { name: string; privacy: boolean | null; imageURL: string };
  }[] = groups.map((group) => ({
    ...group,
    hasFilter: filteredGroupIds.has(group.id),
  }));

  return groupsWithFilters;
};

export const findGroupById = async (
  id: number
): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  const group: {
    id: number;
    community: {
      name: string;
      privacy: boolean;
      active: boolean;
      imageURL: string;
    };
    groupSize: number;
  } | null = await prisma.groups.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      groupSize: true,
      community: {
        select: {
          name: true,
          privacy: true,
          active: true,
          imageURL: true,
        },
      },
    },
  });

  if (!group || !group.community.active) {
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
  imageURL?: string;
}): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  let message: string = '';
  if (!data.name) {
    message = 'Invalid Group name';
  }
  if (!data.creatorId) {
    if (message) message += ', ';
    message += 'Invalid Creator ID';
  }
  if (!data.groupSize || data.groupSize < 1) {
    if (message) message += ', ';
    message += 'Invalid Group size';
  }
  if (message) {
    throw new AppError(`${message}`, 400);
  }
  const community: {
    id: number;
    name: string;
    active: boolean | null;
    privacy: boolean | null;
    creatorId: number | null;
  } = await prisma.communities.create({
    data: {
      name: data.name,
      privacy: data.privacy,
      creatorId: data.creatorId,
      imageURL: data.imageURL,
    },
  });

  await prisma.participants.create({
    data: {
      communityId: community.id,
      type: ParticipiantTypes.community,
    },
  });

  const group: {
    id: number;
    community: { name: string; privacy: boolean; imageURL: string };
    groupSize: number;
  } = await prisma.groups.create({
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
          imageURL: true,
        },
      },
    },
  });
  return group;
};

export const updateGroup = async (
  groupId: number,
  data: {
    name?: string;
    privacy?: boolean;
    groupSize?: number;
    imageURL?: string;
  }
): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  if (!data.name && !data.privacy && !data.groupSize && !data.imageURL) {
    throw new AppError('No data to update', 400);
  }
  const group: {
    communityId: number;
    community: { active: boolean };
    groupSize: number;
  } | null = await prisma.groups.findUnique({
    where: { id: groupId },
    select: {
      communityId: true,
      groupSize: true,
      community: {
        select: {
          active: true,
        },
      },
    },
  });

  if (!group || !group.community.active) {
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
  const count: number = await prisma.groupMemberships.count({
    where: {
      AND: {
        groupId,
        active: true,
      },
    },
  });
  if (data.groupSize) {
    if (data.groupSize >= count /*&& data.groupSize > 2*/) {
      await prisma.groups.update({
        where: { id: groupId },
        data: {
          groupSize: data.groupSize,
        },
      });
    } else {
      throw new AppError('Invalid Group Size Limit', 400);
    }
  }

  return await findGroupById(groupId);
};

export const deleteGroup = async (
  id: number
): Promise<{ communityId: number }> => {
  const group: {
    communityId: number;
    community: { active: boolean | null };
  } | null = await prisma.groups.findUnique({
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

  if (!group || !group.community.active) {
    throw new AppError('No Group found with that ID', 404);
  }

  await prisma.communities.update({
    where: { id: group.communityId },
    data: { active: false },
  });

  return group;
};

export const applyGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{
  adminId: number;
  groupId: number;
} | null> => {
  if (!adminId) {
    throw new AppError('adminId are required', 400);
  }
  const group: {
    id: number;
    community: { name: string; privacy: boolean | null };
    groupSize: number | null;
  } = await findGroupById(groupId);

  if (!group) {
    throw new AppError('No Group found with that ID', 404);
  }

  let groupFilter: { adminId: number; groupId: number } | null =
    await prisma.adminGroupFilters.findFirst({
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
