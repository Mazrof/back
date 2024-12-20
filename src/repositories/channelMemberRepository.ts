import prisma from '../prisma/client';
import { CommunityRole } from '@prisma/client';

/**
 * Fetches a specific channel member's role and activity status.
 *
 * @param {number} userId - The ID of the user whose membership is being fetched.
 * @param {number} channelId - The ID of the channel where the user is a member.
 * @returns {Promise<{role: CommunityRole, active: boolean}>} A promise that resolves to the member's role and activity status.
 */
export const findChannelMember = async (
  userId: number,
  channelId: number
): Promise<{
  role: CommunityRole;
  active: boolean;
}> => {
  return prisma.channelSubscriptions.findUnique({
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

/**
 * Fetches all members of a specific channel, including their role, activity status, and permission to download.
 *
 * @param {number} channelId - The ID of the channel whose members are being fetched.
 * @returns {Promise<Array<{channelId: number, userId: number, role: CommunityRole, hasDownloadPermissions: boolean, active: boolean, users: { username: string }}>}>
 * A promise that resolves to an array of members with detailed information including role, download permissions, and activity status.
 */
export const findChannelMembers = async (
  channelId: number
): Promise<
  {
    channelId: number;
    userId: number;
    role: CommunityRole;
    hasDownloadPermissions: boolean;
    active: boolean;
    users: { username: string };
  }[]
> => {
  return prisma.channelSubscriptions.findMany({
    where: {
      channelId,
      active: true,
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

/**
 * Checks if a user is already a member of a specific channel, and retrieves their role, activity status, and download permissions.
 *
 * @param {number} userId - The ID of the user to check.
 * @param {number} channelId - The ID of the channel to check the user in.
 * @returns {Promise<{active: boolean, role: CommunityRole, hasDownloadPermissions: boolean userId: number; channelId: number;}>} A promise that resolves to the member's status, role, and download permissions.
 */
export const findExistingMember = async (
  userId: number,
  channelId: number
): Promise<{
  active: boolean;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  userId: number;
  channelId: number;
}> => {
  return prisma.channelSubscriptions.findUnique({
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
      channelId: true,
      userId: true,
    },
  });
};

/**
 * Adds a new member to a channel with specified role and download permissions.
 *
 * @param {Object} data - The data to create a new channel membership.
 * @param {number} data.channelId - The ID of the channel.
 * @param {number} data.userId - The ID of the user being added to the channel.
 * @param {CommunityRole} data.role - The role of the user in the channel.
 * @param {boolean} data.hasDownloadPermissions - Whether the user has download permissions.
 * @returns {Promise<{channelId: number, userId: number, role: CommunityRole, hasDownloadPermissions: boolean}>} A promise that resolves to the newly added member.
 */
export const addChannelMember = async (data: {
  channelId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
}): Promise<{
  channelId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
}> => {
  return prisma.channelSubscriptions.create({
    data,
    select: {
      channelId: true,
      userId: true,
      role: true,
      hasDownloadPermissions: true,
    },
  });
};

/**
 * Updates an existing channel member's role, download permissions, or activity status.
 *
 * @param {number} userId - The ID of the user whose membership is being updated.
 * @param {number} channelId - The ID of the channel where the membership is being updated.
 * @param {Object} data - The data to update the channel membership.
 * @param {CommunityRole} [data.role] - The new role of the user (optional).
 * @param {boolean} [data.hasDownloadPermissions] - Whether the user has download permissions (optional).
 * @param {boolean} [data.active] - Whether the user is active (optional).
 * @returns {Promise<{role: CommunityRole, hasDownloadPermissions: boolean}>} A promise that resolves to the updated membership data.
 */
export const updateChannelMember = async (
  userId: number,
  channelId: number,
  data: {
    role?: CommunityRole;
    hasDownloadPermissions?: boolean;
    active?: boolean;
  }
): Promise<{
  active: boolean;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  userId: number;
  channelId: number;
}> => {
  return prisma.channelSubscriptions.update({
    where: {
      userId_channelId: {
        userId,
        channelId,
      },
    },
    data,
    select: {
      active: true,
      role: true,
      hasDownloadPermissions: true,
      userId: true,
      channelId: true,
    },
  });
};

/**
 * Finds a channel by its invitation link hash.
 *
 * @param {string} invitationLink - The hashed invitation link to find the channel.
 * @returns {Promise<{id: number} | null>} A promise that resolves to the channel ID if the channel is found, or null if not.
 */
export const findChannelByInvitationLinkHash = async (
  invitationLink: string
): Promise<{ id: number; community: { active: boolean } } | null> => {
  return prisma.channels.findUnique({
    where: { invitationLink },
    select: {
      id: true,
      community: {
        select: {
          active: true,
        },
      },
    },
  });
};

/**
 * Retrieves the count of active admin members in a specific channel.
 *
 * @param {number} channelId - The ID of the channel.
 * @returns {Promise<number>} A promise that resolves to the count of active admin members in the channel.
 */
export const getChannelAdminCounts = async (
  channelId: number
): Promise<number> => {
  return prisma.channelSubscriptions.count({
    where: {
      channelId,
      role: CommunityRole.admin,
      active: true,
    },
  });
};
