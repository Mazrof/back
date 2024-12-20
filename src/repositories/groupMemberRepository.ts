import prisma from '../prisma/client';
import { CommunityRole } from '@prisma/client';

/**
 * Retrieves the group size for a specific group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<{ groupSize: number } | null>} The size of the group or null if not found.
 */
export const getGroupSize = async (
  groupId: number
): Promise<{ groupSize: number } | null> => {
  return prisma.groups.findUnique({
    where: { id: groupId },
    select: { groupSize: true },
  });
};

/**
 * Counts the number of active members in a specific group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<number>} The count of active members in the group.
 */
export const getMembersCount = async (groupId: number): Promise<number> => {
  return prisma.groupMemberships.count({
    where: { AND: { groupId, active: true } },
  });
};

/**
 * Finds a group member by user ID and group ID.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<{ role: CommunityRole; active: boolean; hasMessagePermissions: boolean; hasDownloadPermissions: boolean } | null>}
 * Member details or null if not found.
 */
export const findGroupMember = async (
  userId: number,
  groupId: number
): Promise<{
  role: CommunityRole;
  active: boolean;
  hasMessagePermissions: boolean;
  hasDownloadPermissions: boolean;
} | null> => {
  return prisma.groupMemberships.findUnique({
    where: {
      userId_groupId: { userId, groupId },
    },
    select: {
      role: true,
      active: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
    },
  });
};

/**
 * Retrieves all members of a specific group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<Array<{ groupId: number; userId: number; role: CommunityRole; active: boolean; hasDownloadPermissions: boolean; hasMessagePermissions: boolean; users: { username: string } }>>}
 * An array of group members.
 */
export const findGroupMembers = async (
  groupId: number
): Promise<
  {
    groupId: number;
    userId: number;
    role: CommunityRole;
    active: boolean;
    hasDownloadPermissions: boolean;
    hasMessagePermissions: boolean;
    users: { username: string };
  }[]
> => {
  return prisma.groupMemberships.findMany({
    where: { groupId },
    select: {
      groupId: true,
      userId: true,
      role: true,
      active: true,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      users: { select: { username: true } },
    },
  });
};

/**
 * Checks if a specific user is a member of a group.
 *
 * @param {number} memberId - The ID of the member.
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<{ role: CommunityRole; active: boolean; hasMessagePermissions: boolean; hasDownloadPermissions: boolean; userId: number } | null>}
 * Member details or null if not found.
 */
export const findExistingMember = async (
  memberId: number,
  groupId: number
): Promise<{
  role: CommunityRole;
  active: boolean;
  hasMessagePermissions: boolean;
  hasDownloadPermissions: boolean;
  userId: number;
} | null> => {
  return prisma.groupMemberships.findUnique({
    where: {
      userId_groupId: { userId: memberId, groupId },
    },
    select: {
      role: true,
      active: true,
      hasMessagePermissions: true,
      hasDownloadPermissions: true,
      userId: true,
      groupId: true,
    },
  });
};

/**
 * Adds a new member to a group.
 *
 * @param {Object} memberData - The data of the member to add.
 * @returns {Promise<{ groupId: number; userId: number; role: CommunityRole; hasDownloadPermissions: boolean; hasMessagePermissions: boolean }>}
 * The added member's details.
 */
export const addGroupMember = async (memberData: {
  groupId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  hasMessagePermissions: boolean;
}): Promise<{
  groupId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  hasMessagePermissions: boolean;
}> => {
  return prisma.groupMemberships.create({
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

/**
 * Updates the active status of a group member.
 *
 * @param {number} userId - The ID of the user whose membership is being updated.
 * @param {number} groupId - The ID of the group the user belongs to.
 * @param {boolean} active - The new active status for the group member.
 * @returns {Promise<{
 *   userId: number;
 *   groupId: number;
 *   hasDownloadPermissions: boolean;
 *   hasMessagePermissions: boolean;
 *   role: CommunityRole;
 * }>}
 * A promise that resolves to the updated group membership details.
 */
export const updateGroupMemberStatus = async (
  userId: number,
  groupId: number,
  active: boolean
): Promise<{
  userId: number;
  groupId: number;
  hasDownloadPermissions: boolean;
  hasMessagePermissions: boolean;
  role: CommunityRole;
}> => {
  return prisma.groupMemberships.update({
    where: {
      userId_groupId: { userId, groupId },
    },
    data: { active },
    select: {
      userId: true,
      groupId: true,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      role: true,
    },
  });
};

/**
 * Updates the data of a group member.
 *
 * @param {number} userId - The ID of the user whose membership data is being updated.
 * @param {number} groupId - The ID of the group the user belongs to.
 * @param {object} data - An object containing the updated data for the group member.
 * @returns {Promise<{userId: number, groupId: number, hasDownloadPermissions: boolean, hasMessagePermissions: boolean, role: CommunityRole}>}
 * A promise that resolves to the updated group membership details.
 */
export const updateGroupMemberData = async (
  userId: number,
  groupId: number,
  data: {
    role?: CommunityRole;
    hasMessagePermissions?: boolean;
    hasDownloadPermissions?: boolean;
  }
): Promise<{
  userId: number;
  groupId: number;
  hasDownloadPermissions?: boolean;
  hasMessagePermissions?: boolean;
  role?: CommunityRole;
}> => {
  return prisma.groupMemberships.update({
    where: {
      userId_groupId: { userId, groupId },
    },
    data,
    select: {
      userId: true,
      groupId: true,
      hasDownloadPermissions: true,
      hasMessagePermissions: true,
      role: true,
    },
  });
};

/**
 * Finds a group by its invitation link hash.
 *
 * @param {string} invitationLink - The invitation link hash.
 * @returns {Promise<{ id: number; community: { active: boolean } } | null>}
 * The group details or null if not found.
 */
export const findGroupByInvitationLinkHash = async (
  invitationLink: string
): Promise<{ id: number; community: { active: boolean } } | null> => {
  return prisma.groups.findUnique({
    where: { invitationLink },
    select: {
      id: true,
      community: { select: { active: true } },
    },
  });
};

/**
 * Counts the number of active admin members in a group.
 *
 * @param {number} groupId - The ID of the group.
 * @returns {Promise<number>} The count of active admin members.
 */
export const getGroupAdminCounts = async (groupId: number): Promise<number> => {
  return prisma.groupMemberships.count({
    where: {
      groupId,
      role: CommunityRole.admin,
      active: true,
    },
  });
};
