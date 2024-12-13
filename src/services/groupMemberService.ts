import crypto from 'crypto';
import * as groupMemberRepository from '../repositories/groupMemberRepository';
import * as groupRepository from '../repositories/groupRepository';
import { CommunityRole } from '@prisma/client';
import { AppError } from '../utility';
import { UpdateGroupMemberData } from '../types';
import * as userRepository from '../repositories/adminRepository';

export const checkGroupMemberPermission = async (
  userId: number,
  groupId: number
) => {
  await findGroup(groupId);
  const groupMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );
  if (!groupMember || !groupMember.active) {
    throw new AppError('this is no user with this id in the group', 403);
  }
  if (groupMember.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

export const checkGroupMember = async (userId: number, groupId: number) => {
  await findGroup(groupId);
  const groupMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );
  if (!groupMember || !groupMember.active) {
    throw new AppError('this is no user with this id in the group', 403);
  }
  return groupMember;
};

export const checkCapacity = async (groupId: number) => {
  const full: boolean = await groupMemberRepository.getMembersCount(groupId);
  if (full) {
    throw new AppError('the group reaches its limit', 400);
  }
};

export const findGroup = async (groupId: number) => {
  const group = await groupRepository.findGroupById(groupId);
  if (!group) {
    throw new AppError('this is no group with this id', 404);
  }
};

export const checkGroupAdmin = async (adminId: number, groupId: number) => {
  if (!adminId) {
    throw new AppError('AdminId is missing', 400);
  }
  const user = await groupMemberRepository.findGroupMember(adminId, groupId);
  if (!user || !user.active || user.role !== CommunityRole.admin) {
    throw new AppError('Not Authorized', 403);
  }
};

export const checkUser = async (userId: number) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('this is no user with this id', 404);
  }
};

export const checkMember = async (userId: number, groupId: number) => {
  await checkUser(userId);

  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );

  if (existingMember) {
    if (!existingMember.active) {
      await checkCapacity(groupId);
      return await groupMemberRepository.updateGroupMemberStatus(
        userId,
        groupId,
        true
      );
    }
    throw new AppError('Member already exists in this group', 404);
  }
  return null;
};

export const getGroupMembers = async (groupId: number) => {
  await findGroup(groupId);
  return await groupMemberRepository.findGroupMembers(groupId);
};

export const addGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number,
  role: CommunityRole,
  hasDownloadPermissions: boolean,
  hasMessagePermissions: boolean
) => {
  // Check if there is a group
  await findGroup(groupId);

  // Check if the user is an admin in the group
  await checkGroupAdmin(adminId, groupId);

  // Check if the member already exists in the group
  const member = await checkMember(userId, groupId);
  if (member) {
    return member;
  }
  // check the group size
  await checkCapacity(groupId);
  // Create a new group membership for the member
  return await groupMemberRepository.addGroupMember({
    groupId,
    userId,
    role,
    hasDownloadPermissions,
    hasMessagePermissions,
  });
};

export const addGroupCreator = async (
  groupId: number,
  userId: number,
  role: CommunityRole
) => {
  // Check if the user is not admin
  await checkUser(userId);
  // Create a new group membership for the member
  return await groupMemberRepository.addGroupMember({
    groupId,
    userId,
    role,
    hasDownloadPermissions: true,
    hasMessagePermissions: true,
  });
};

export const updateGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number,
  updates: UpdateGroupMemberData
) => {
  // Check if there is a group
  await findGroup(groupId);
  // Check if the user is an admin in the group
  await checkGroupAdmin(adminId, groupId);

  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );

  if (!existingMember) {
    throw new AppError('Member not found in this group', 404);
  }

  const updatedData: UpdateGroupMemberData = {};
  if (updates.role) {
    updatedData.role =
      updates.role === 'admin' ? CommunityRole.admin : CommunityRole.member;
  }
  if (updates.hasMessagePermissions) {
    updatedData.hasMessagePermissions = updates.hasMessagePermissions;
  }
  if (updates.hasDownloadPermissions) {
    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
  }
  if (
    !updates.role &&
    !updates.hasMessagePermissions &&
    !updates.hasDownloadPermissions
  ) {
    throw new AppError('Not Data to update', 400);
  }
  return await groupMemberRepository.updateGroupMemberData(
    userId,
    groupId,
    updatedData
  );
};

export const deleteGroupMember = async (
  adminId: number,
  groupId: number,
  userId: number
) => {
  // Check if there is a group
  await findGroup(groupId);

  const existingMember = await groupMemberRepository.findExistingMember(
    userId,
    groupId
  );
  if (!existingMember || !existingMember.active) {
    throw new AppError('Member not found in this group', 404);
  }

  if (adminId !== userId) {
    const user = await groupMemberRepository.findGroupMember(adminId, groupId);
    if (!user || user.role !== CommunityRole.admin) {
      throw new AppError('Not Authorized', 403);
    }
  }
  const groupMember = await groupMemberRepository.updateGroupMemberStatus(
    userId,
    groupId,
    false
  );
  const adminCount = await groupMemberRepository.getAdminCounts(groupId);
  if (!adminCount) await groupRepository.deleteGroup(groupId);
  return groupMember;
};

export const joinGroupByInvite = async (
  token: string,
  userId: number,
  role: CommunityRole
) => {
  const invitationLinkHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const group: { id: number } | null =
    await groupMemberRepository.findGroupByInvitationLinkHash(
      invitationLinkHash
    );

  if (!group) {
    throw new Error('Invalid or expired invitation link');
  }

  // Check if the member already exists in the group
  await checkMember(userId, group.id);

  // Create a new group membership for the member
  return await groupMemberRepository.addGroupMember({
    groupId: group.id,
    userId,
    role,
    hasDownloadPermissions: false,
    hasMessagePermissions: false,
  });
};
