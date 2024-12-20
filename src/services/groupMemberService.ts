import * as groupMemberRepository from '../repositories/groupMemberRepository';
import * as groupService from '../services/groupService';
import { CommunityRole } from '@prisma/client';
import { AppError } from '../utility';
import * as userRepository from '../repositories/adminRepository';
import { updateGroupMemberData } from '../repositories/groupMemberRepository';

/**
 * Checks if a group member has the required permission to perform admin actions.
 * @param userId - ID of the user.
 * @param groupId - ID of the group.
 * @throws {AppError} If the user is not an active admin in the group.
 */
export const checkGroupMemberPermission = async (
  userId: number,
  groupId: number
): Promise<void> => {
  const groupMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );
  if (!groupMember || !groupMember.active) {
    throw new AppError('This user is not part of the group', 403);
  }
  if (groupMember.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

/**
 * Verifies if a group member exists and is active.
 * @param userId - ID of the user.
 * @param groupId - ID of the group.
 * @returns Promise<
 * {
 *   role: CommunityRole;
 *   active: boolean;
 *   hasMessagePermissions: boolean;
 *   hasDownloadPermissions: boolean;
 *   userId: number;
 * }>
 * @throws {AppError} If the member does not exist or is inactive.
 */
export const checkGroupMemberExistence = async (
  userId: number,
  groupId: number
): Promise<{
  role: CommunityRole;
  active: boolean;
  hasMessagePermissions: boolean;
  hasDownloadPermissions: boolean;
  userId: number;
}> => {
  const groupMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );
  if (!groupMember || !groupMember.active) {
    throw new AppError('This user is not part of the group', 403);
  }
  return groupMember;
};

/**
 * Checks if the group has capacity for additional members.
 * @param groupId - ID of the group.
 * @throws {AppError} If the group has reached its size limit.
 */
export const checkCapacity = async (groupId: number): Promise<void> => {
  const group = await groupMemberRepository.getGroupSize(groupId);
  const membersCount = await groupMemberRepository.getMembersCount(groupId);
  if (group.groupSize <= membersCount) {
    throw new AppError('The group has reached its size limit', 400);
  }
};

/**
 * Checks if the user is an admin in the group.
 * @param adminId - ID of the admin user.
 * @param groupId - ID of the group.
 * @throws {AppError} If the user is not an active admin.
 */
export const checkGroupAdmin = async (
  adminId: number,
  groupId: number
): Promise<void> => {
  if (!adminId) {
    throw new AppError('AdminId is missing', 400);
  }
  const user = await groupMemberRepository.findGroupMember(adminId, groupId);
  if (!user || !user.active || user.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

/**
 * Validates the existence of a user.
 * @param userId - ID of the user.
 * @throws {AppError} If the user does not exist.
 */
export const checkUser = async (userId: number): Promise<void> => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('No user found with this ID', 404);
  }
};

/**
 * Checks if a user is already a member of a group.
 * @param userId - ID of the user.
 * @param groupId - ID of the group.
 * @returns Promise<{
 *   role: CommunityRole;
 *   active: boolean;
 *   hasMessagePermissions: boolean;
 *   hasDownloadPermissions: boolean;
 *   userId: number;
 *   groupId: number;
 * } | null>
 * @throws {AppError} If the member already exists and is active.
 */
export const checkGroupMember = async (
  userId: number,
  groupId: number
): Promise<{
  role: CommunityRole;
  hasMessagePermissions: boolean;
  hasDownloadPermissions: boolean;
  userId: number;
  groupId: number;
} | null> => {
  await checkUser(userId);
  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );

  if (existingMember) {
    if (!existingMember.active) {
      await checkCapacity(groupId);
      const member = await groupMemberRepository.updateGroupMemberStatus(
        userId,
        groupId,
        true
      );
      return member;
    }
    throw new AppError('Member already exists in this group', 400);
  }
  return null;
};

/**
 * Retrieves all members of a group.
 * @param groupId - ID of the group.
 * @param userId - ID of the requesting user.
 * @returns Promise<
 *   {
 *     groupId: number;
 *     userId: number;
 *     role: CommunityRole;
 *     active: boolean;
 *     hasDownloadPermissions: boolean;
 *     hasMessagePermissions: boolean;
 *     users: { username: string };
 *   }[]
 * >
 * @throws {AppError} If the group or user does not exist.
 */
export const getGroupMembers = async (
  groupId: number,
  userId: number
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
  await groupService.findGroupById(groupId);
  await checkGroupMemberExistence(userId, groupId);
  return groupMemberRepository.findGroupMembers(groupId);
};

/**
 * Adds a new member to a group.
 * @param adminId - ID of the admin adding the member.
 * @param groupId - ID of the group.
 * @param userId - ID of the user to be added.
 * @param role - Role of the new member.
 * @param hasDownloadPermissions - Download permission for the member.
 * @param hasMessagePermissions - Messaging permission for the member.
 * @returns Promise<{
 *   groupId: number;
 *   userId: number;
 *   role: CommunityRole;
 *   hasDownloadPermissions: boolean;
 *   hasMessagePermissions: boolean;
 * }>
 * @throws {AppError} If the group is full or permissions are invalid.
 */
export const addGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number,
  role: CommunityRole,
  hasDownloadPermissions: boolean,
  hasMessagePermissions: boolean
): Promise<{
  groupId: number;
  userId: number;
  role?: CommunityRole;
  hasDownloadPermissions?: boolean;
  hasMessagePermissions?: boolean;
}> => {
  await groupService.findGroupById(groupId);
  await checkGroupAdmin(adminId, groupId);
  let member: {
    userId: number;
    groupId: number;
    hasDownloadPermissions?: boolean;
    hasMessagePermissions?: boolean;
    role?: CommunityRole;
  } = await checkGroupMember(userId, groupId);
  if (member) {
    member = await updateGroupMemberData(userId, groupId, {
      role,
      hasDownloadPermissions,
      hasMessagePermissions,
    });
    return member;
  }
  await checkCapacity(groupId);

  return await groupMemberRepository.addGroupMember({
    groupId,
    userId,
    role,
    hasDownloadPermissions,
    hasMessagePermissions,
  });
};

/**
 * Adds a group creator with default permissions.
 * @param groupId - ID of the group.
 * @param userId - ID of the user to be added as the creator.
 * @param role - Role to be assigned (e.g., CommunityRole.admin).
 * @returns Promise<{
 *   groupId: number;
 *   userId: number;
 *   role: CommunityRole;
 *   hasDownloadPermissions: boolean;
 *   hasMessagePermissions: boolean;
 * }>
 * @throws {AppError} If the group is full or the user does not exist.
 */
export const addGroupCreator = async (
  groupId: number,
  userId: number,
  role: CommunityRole
): Promise<{
  groupId: number;
  userId: number;
  role: CommunityRole;
  hasDownloadPermissions: boolean;
  hasMessagePermissions: boolean;
}> => {
  await checkUser(userId);
  await checkCapacity(groupId);

  return await groupMemberRepository.addGroupMember({
    groupId,
    userId,
    role,
    hasDownloadPermissions: true,
    hasMessagePermissions: true,
  });
};

/**
 * Updates the attributes of an existing group member.
 * @param adminId - ID of the admin performing the update.
 * @param groupId - ID of the group.
 * @param userId - ID of the member to update.
 * @param updates - Update fields for the member (role, permissions, etc.).
 * @returns Promise<{
 *   userId: number;
 *   groupId: number;
 *   hasDownloadPermissions: boolean;
 *   hasMessagePermissions: boolean;
 *   role: CommunityRole;
 * }>
 * @throws {AppError} If the member is not found or updates are invalid.
 */
export const updateGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number,
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
  if (
    !data.role &&
    data.hasMessagePermissions === undefined &&
    data.hasDownloadPermissions === undefined
  ) {
    throw new AppError('No data to update', 400);
  }

  await groupService.findGroupById(groupId);
  await checkGroupAdmin(adminId, groupId);

  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );

  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this group', 404);
  }
  if (
    existingMember.role &&
    existingMember.role === CommunityRole.admin &&
    data.role === CommunityRole.member
  ) {
    const adminCount = await groupMemberRepository.getGroupAdminCounts(groupId);
    if (adminCount === 1) {
      throw new AppError('Group should have at least one admin.', 400);
    }
  }
  return await groupMemberRepository.updateGroupMemberData(
    userId,
    groupId,
    data
  );
};

/**
 * Removes a member from a group.
 * If the last admin is removed, all members are deactivated, and the group is deleted.
 * @param adminId - ID of the admin performing the action.
 * @param groupId - ID of the group.
 * @param userId - ID of the member to be removed.
 * @returns {Promise<null>}
 * @throws {AppError} If the member is not found or invalid operations occur.
 */
export const deleteGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number
): Promise<null> => {
  await groupService.findGroupById(groupId);

  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );

  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this group', 404);
  }

  if (adminId !== userId) {
    await checkGroupAdmin(adminId, groupId);
  }

  if (existingMember.role === CommunityRole.admin) {
    const adminCount = await groupMemberRepository.getGroupAdminCounts(groupId);

    if (adminCount === 1) {
      const members = await getGroupMembers(groupId, userId);
      for (const member of members) {
        if (member.active && member.userId !== existingMember.userId) {
          await groupMemberRepository.updateGroupMemberStatus(
            member.userId,
            groupId,
            false
          );
        }
      }

      await groupService.deleteGroup(groupId, userId);
    }
  }

  await groupMemberRepository.updateGroupMemberStatus(userId, groupId, false);
  return null;
};

/**
 * Allows a user to join a group via an invitation link.
 * @param token - Invitation link token.
 * @param userId - ID of the user joining the group.
 * @returns Promise<{
 *   role: CommunityRole;
 *   hasMessagePermissions: boolean;
 *   hasDownloadPermissions: boolean;
 *   userId: number;
 * }>
 * @throws {AppError} If the invitation link is invalid or the group is inactive.
 */
export const joinGroupByInvite = async (
  token: string,
  userId: number
): Promise<{
  role: CommunityRole;
  hasMessagePermissions: boolean;
  hasDownloadPermissions: boolean;
  userId: number;
}> => {
  const group =
    await groupMemberRepository.findGroupByInvitationLinkHash(token);

  if (!group || !group.community.active) {
    throw new AppError('Invalid invitation link', 400);
  }

  const member = await checkGroupMember(userId, group.id);

  if (member) {
    return member;
  }

  return await groupMemberRepository.addGroupMember({
    groupId: group.id,
    userId,
    role: CommunityRole.member,
    hasDownloadPermissions: false,
    hasMessagePermissions: false,
  });
};
