import { prisma } from '../prisma/client';
import { ParticipiantTypes } from '@prisma/client';
import {
  GroupResponse,
  DetailedGroupResponse,
} from './repositoriesTypes/groupTypes';

/**
 * Fetch all active groups with their community details.
 *
 * @returns {Promise<GroupResponse[]>}
 * Array of groups, each containing:
 *  - `id`: Group ID
 *  - `groupSize`: Number of members in the group
 *  - `adminGroupFilters`: Admin filters associated with the group
 *  - `community`: Community details including:
 *    - `name`: Community name
 *    - `privacy`: Community privacy setting
 *    - `imageURL`: Community image URL
 */
export const findAllGroups = async (): Promise<GroupResponse[]> => {
  return prisma.groups.findMany({
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
      adminGroupFilters: {
        select: {
          groupId: true,
        },
      },
    },
  });
};

/**
 * Find a group by its ID with detailed community information.
 *
 * @param {number} id - The ID of the group to retrieve.
 * @returns {Promise<DetailedGroupResponse | null>}
 * A group object or `null` if not found.
 */
export const findGroupById = async (
  id: number
): Promise<DetailedGroupResponse | null> => {
  return prisma.groups.findUnique({
    where: { id },
    select: {
      id: true,
      groupSize: true,
      communityId: true,
      community: {
        select: {
          name: true,
          privacy: true,
          active: true,
          imageURL: true,
        },
      },
      adminGroupFilters: {
        select: {
          groupId: true,
        },
      },
    },
  });
};

/**
 * Create a new group and its associated community.
 *
 * @param {Object} data - The data to create a new group.
 * @param {string} data.name - Community name.
 * @param {boolean} data.privacy - Community privacy setting.
 * @param {number} data.creatorId - ID of the creator.
 * @param {number} data.groupSize - Initial size of the group.
 * @param {string} data.invitationLink - Group invitation link.
 * @param {string} [data.imageURL] - Community image URL (optional).
 * @returns {Promise<GroupResponse>}
 * The newly created group object.
 */
export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
  invitationLink: string;
  imageURL?: string;
}): Promise<GroupResponse> => {
  return prisma.groups.create({
    data: {
      groupSize: data.groupSize,
      invitationLink: data.invitationLink,
      community: {
        create: {
          name: data.name,
          privacy: data.privacy,
          creatorId: data.creatorId,
          imageURL: data.imageURL,
          participants: {
            create: {
              type: ParticipiantTypes.community,
            },
          },
        },
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
};

/**
 * Update the size of a group.
 *
 * @param {number} groupId - The ID of the group to update.
 * @param {number} [groupSize] - The new group size (optional).
 * @returns {Promise<GroupResponse>}
 * The updated group object.
 */
export const updateGroup = async (
  groupId: number,
  groupSize?: number
): Promise<GroupResponse> => {
  return prisma.groups.update({
    where: { id: groupId },
    data: {
      groupSize,
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
};

/**
 * Get the number of active members in a group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<number>}
 * The count of active members.
 */
export const getGroupSize = async (groupId: number): Promise<number> => {
  return prisma.groupMemberships.count({
    where: {
      AND: {
        groupId,
        active: true,
      },
    },
  });
};

/**
 * Deactivate a group by its community ID.
 *
 * @param {number} communityId - The ID of the community to deactivate.
 * @returns {Promise<void>}
 */
export const deleteGroup = async (communityId: number): Promise<void> => {
  await prisma.communities.update({
    where: { id: communityId },
    data: { active: false },
  });
};

/**
 * Find an admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The filter object or `null` if not found.
 */
export const findGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{ adminId: number; groupId: number } | null> => {
  return prisma.adminGroupFilters.findUnique({
    where: {
      adminId_groupId: {
        adminId,
        groupId,
      },
    },
    select: {
      groupId: true,
      adminId: true,
    },
  });
};

/**
 * Remove an admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number } | null>}
 * The deleted filter object or `null` if not found.
 */
export const deleteGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{ adminId: number; groupId: number } | null> => {
  return prisma.adminGroupFilters.delete({
    where: {
      adminId_groupId: {
        adminId,
        groupId,
      },
    },
    select: {
      groupId: true,
      adminId: true,
    },
  });
};

/**
 * Create a new admin filter for a group.
 *
 * @param {number} groupId - The group ID.
 * @param {number} adminId - The admin ID.
 * @returns {Promise<{ adminId: number; groupId: number }>}
 * The created filter object.
 */
export const createGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{ adminId: number; groupId: number }> => {
  return prisma.adminGroupFilters.create({
    data: {
      groupId,
      adminId,
    },
    select: {
      groupId: true,
      adminId: true,
    },
  });
};
