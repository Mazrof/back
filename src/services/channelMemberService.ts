import * as Repository from '../repositories';
import * as channelService from '../services/channelService';
import { AppError } from '../utility';
import { CommunityRole } from '@prisma/client';
import { channelResponse } from '../repositories/repositoriesTypes/channelTypes';

/**
 * Helper function to check if a channel exists by its ID.
 * @param channelId - The ID of the channel to check.
 * @throws {AppError} If the channel does not exist.
 */
export const findChannel = async (channelId: number): Promise<void> => {
  const channel: channelResponse = await Repository.findChannelById(channelId);
  if (!channel || !channel.community.active) {
    throw new AppError('No channel found with this ID', 404);
  }
};

/**
 * Helper function to check if a user exists by their ID.
 * @param userId - The ID of the user to check.
 * @throws {AppError} If the user does not exist.
 */
export const checkUser = async (userId: number): Promise<void> => {
  const user: { id: number; username: string; status: boolean } =
    await Repository.findUserById(userId);
  if (!user) {
    throw new AppError('No user found with this ID', 404);
  }
};

/**
 * Function to check if a user has admin permissions for a specific channel.
 * @param userId - The ID of the user whose permissions are being checked.
 * @param channelId - The ID of the channel.
 * @throws {AppError} If the user is not an admin.
 */
export const checkChannelMemberPermission = async (
  userId: number,
  channelId: number
): Promise<void> => {
  const channelMember = await checkChannelMember(userId, channelId);
  if (channelMember.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

/**
 * Helper function to check if a user is a member of a channel.
 * @param userId - The ID of the user to check.
 * @param channelId - The ID of the channel.
 * @returns The channel member's details, including permissions and role.
 * @throws {AppError} If the user is not a member or is inactive.
 */
export const checkChannelMember = async (
  userId: number,
  channelId: number
): Promise<{
  hasDownloadPermissions: boolean;
  active: boolean;
  role: CommunityRole;
}> => {
  await findChannel(channelId); // Ensure the channel exists
  const channelMember = await Repository.findExistingMember(userId, channelId);
  if (!channelMember || !channelMember.active) {
    throw new AppError('User is not a member of the channel', 403);
  }
  return channelMember;
};

/**
 * Function to check if a member exists and update them if inactive.
 * @param userId - The ID of the user.
 * @param channelId - The ID of the channel.
 * @returns The updated member details if the user is inactive and is updated.
 * @throws {AppError} If the user already exists as an active member.
 */
export const checkMember = async (
  userId: number,
  channelId: number
): Promise<{
  active: boolean;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  userId: number;
  channelId: number;
} | null> => {
  await checkUser(userId); // Ensure the user exists
  const existingMember = await Repository.findExistingMember(userId, channelId);
  if (existingMember) {
    if (!existingMember.active) {
      const member = await Repository.updateChannelMember(userId, channelId, {
        active: true,
        role: CommunityRole.member,
      });
      delete member.active;
      return member;
    }
    throw new AppError('Member already exists in this channel', 400);
  }
  return null;
};

/**
 * Helper function to check if the user is an admin of the channel.
 * @param adminId - The ID of the admin to check.
 * @param channelId - The ID of the channel.
 * @throws {AppError} If the user is not an admin or is not authorized.
 */
export const checkAdmin = async (adminId: number, channelId: number) => {
  if (!adminId) {
    throw new AppError('Admin ID is missing', 400);
  }
  const user = await Repository.findChannelMember(adminId, channelId);
  if (!user || !user.active || user.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

/**
 * Function to get all members of a channel.
 * @param channelId - The ID of the channel to get members for.
 * @param userId - The ID of the user requesting the member list.
 * @returns A list of channel members with their roles and permissions.
 * @throws {AppError} If the channel does not exist or the user is not a member.
 */
export const getChannelMembers = async (
  channelId: number,
  userId: number
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
  await findChannel(channelId); // Ensure the channel exists
  await checkChannelMember(userId, channelId); // Ensure the user is a member of the channel
  return Repository.findChannelMembers(channelId); // Retrieve the members
};

/**
 * Function to add a new member to the channel.
 * @param userId - The ID of the user to add.
 * @param channelId - The ID of the channel to add the user to.
 * @param requesterId - The ID of the user making the request.
 * @param role - The role to assign to the new member.
 * @param hasDownloadPermissions - Whether the new member has download permissions.
 * @returns The newly added member's details.
 * @throws {AppError} If the requester does not have permission to add an admin or if the member already exists.
 */
export const addChannelMember = async (
  userId: number,
  channelId: number,
  requesterId: number,
  role: CommunityRole,
  hasDownloadPermissions: boolean
) => {
  await findChannel(channelId); // Ensure the channel exists

  // Check if the member already exists in the channel
  const member = await checkMember(userId, channelId);

  // If the requester is adding an admin, ensure they have admin rights
  if (requesterId && role === CommunityRole.admin) {
    await checkAdmin(requesterId, channelId);
  }

  if (member) {
    return member; // Return existing member if already added
  }

  // Add the new member to the channel
  return await Repository.addChannelMember({
    channelId,
    userId,
    role,
    hasDownloadPermissions,
  });
};

/**
 * Function to update an existing channel member's data.
 * @param adminId - The ID of the admin requesting the update.
 * @param channelId - The ID of the channel.
 * @param userId - The ID of the member to update.
 * @param data - The data to update (role and/or permissions).
 * @returns The updated member's role and permissions.
 * @throws {AppError} If there is no data to update, or if the admin does not have permission.
 */
export const updateChannelMember = async (
  adminId: number,
  channelId: number,
  userId: number,
  data: {
    role?: CommunityRole;
    hasDownloadPermissions?: boolean;
  }
): Promise<{ role: CommunityRole; hasDownloadPermissions: boolean }> => {
  if (!data.role && !data.hasDownloadPermissions) {
    throw new AppError('No data to update', 400);
  }

  await findChannel(channelId); // Ensure the channel exists
  await checkAdmin(adminId, channelId); // Ensure the admin has permission

  const existingMember = await Repository.findExistingMember(userId, channelId);

  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this Channel', 404);
  }
  if (
    existingMember.role &&
    existingMember.role === CommunityRole.admin &&
    data.role === CommunityRole.member
  ) {
    const adminCount = await Repository.getChannelAdminCounts(channelId);
    if (adminCount === 1) {
      throw new AppError('Channel should have at least one admin.', 400);
    }
  }
  return await Repository.updateChannelMember(userId, channelId, data); // Update the member's data
};

/**
 * Function to delete a member from a channel.
 * @param channelId - The ID of the channel.
 * @param userId - The ID of the member to delete.
 * @returns The deleted member's details.
 * @throws {AppError} If the member is not found or is inactive.
 */
export const deleteChannelMember = async (
  channelId: number,
  userId: number
) => {
  const existingMember = await Repository.findExistingMember(userId, channelId);

  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this channel', 404);
  }

  if (existingMember.role === CommunityRole.admin) {
    const adminCount: number =
      await Repository.getChannelAdminCounts(channelId);

    if (adminCount === 1) {
      // Delete all users in the channel if the admin is being removed
      const members = await getChannelMembers(channelId, userId);
      for (const member of members) {
        if (member.active && member.userId !== existingMember.userId)
          await Repository.updateChannelMember(member.userId, channelId, {
            active: false,
          });
      }
      // Delete the channel if no admin remains
      await channelService.deleteChannel(channelId, userId);
    }
  }

  const channelMember = await Repository.updateChannelMember(
    userId,
    channelId,
    { active: false }
  );
  return channelMember;
};

/**
 * Function to allow a user to join a channel via an invitation link.
 *
 * This function verifies the invitation link, checks if the user is already a member,
 * and adds the user to the channel if they are not already a member. The user will be
 * assigned default permissions and role as a member.
 *
 * @param token - The invitation token containing the invitation link hash.
 * @param userId - The ID of the user accepting the invitation.
 * @returns The channel details including channelId, userId, role, and download permissions.
 * @throws {AppError} If the invitation link is invalid or the community is inactive.
 */
export const joinChannelByInvite = async (
  token: string,
  userId: number
): Promise<{
  channelId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
}> => {
  // Verify the channel using the invitation token
  const channel = await Repository.findChannelByInvitationLinkHash(token);

  // Check if the channel exists and is active
  if (!channel || !channel.community.active) {
    throw new AppError('Invalid invitation link', 400);
  }

  // Check if the user is already a member of the channel
  const member = await checkMember(userId, channel.id);

  if (member) {
    return member; // Return existing member if they are already part of the channel
  }

  // Add the user to the channel with default permissions (role: member, no download permissions)
  return await Repository.addChannelMember({
    channelId: channel.id,
    userId,
    role: CommunityRole.member,
    hasDownloadPermissions: false,
  });
};
