import crypto from 'crypto';
import * as groupMemberRepository from '../repositories/groupMemberRepository';
import { AppError } from '../utility';
import { UpdateCommunityMemberData } from '../types';

export const getGroupMembers = async (groupId: number) => {
  return await groupMemberRepository.findGroupMembers(groupId);
};

export const addGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number
) => {
  // Check if the user is an admin in the group
  const user = await groupMemberRepository.findGroupMember(userId, groupId);
  if (!user || user.role !== 'Admin') {
    throw new AppError('Not Authorized', 403);
  }

  // Check if the member already exists in the group
  const existingMember = await groupMemberRepository.findExistingMember(
    memberId,
    groupId
  );

  if (existingMember) {
    if (!existingMember.status) {
      return await groupMemberRepository.updateGroupMemberStatus(
        memberId,
        groupId,
        true
      );
    }
    throw new AppError('Member already exists in this group', 404);
  }

  // Create a new group membership for the member
  return await groupMemberRepository.addGroupMember({
    groupId,
    userId: memberId,
  });
};

export const updateGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number,
  updates: UpdateCommunityMemberData
) => {
  const user = await groupMemberRepository.findGroupMember(userId, groupId);
  if (!user || user.role !== 'Admin') {
    throw new AppError('Not Authorized', 403);
  }

  const existingMember = await groupMemberRepository.findExistingMember(
    memberId,
    groupId
  );
  if (!existingMember) {
    throw new AppError('Member not found in this group', 404);
  }

  const updatedData: UpdateCommunityMemberData = {};
  if (updates.role) {
    updatedData.role = updates.role;
  }
  if (updates.hasMessagePermissions) {
    updatedData.hasMessagePermissions = updates.hasMessagePermissions;
  }
  if (updates.hasDownloadPermissions) {
    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
  }

  return await groupMemberRepository.updateGroupMemberData(
    memberId,
    groupId,
    updatedData
  );
};

export const deleteGroupMember = async (
  userId: number,
  groupId: number,
  memberId: number
) => {
  const existingMember = await groupMemberRepository.findExistingMember(
    memberId,
    groupId
  );
  if (!existingMember) {
    throw new AppError('Member not found in this group', 404);
  }

  if (userId !== memberId) {
    const user = await groupMemberRepository.findGroupMember(userId, groupId);
    if (!user || user.role !== 'Admin') {
      throw new AppError('Not Authorized', 403);
    }
  }

  return await groupMemberRepository.updateGroupMemberStatus(
    memberId,
    groupId,
    false
  );
};

export const joinGroupByInvite = async (token: string, memberId: number) => {
  const invitationLinkHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const group =
    await groupMemberRepository.findGroupByInvitationLinkHash(
      invitationLinkHash
    );

  if (!group) {
    throw new Error('Invalid or expired invitation link');
  }

  // Check if the member already exists in the group
  const existingMember = await groupMemberRepository.findExistingMember(
    memberId,
    group.id
  );

  if (existingMember) {
    if (!existingMember.status) {
      return await groupMemberRepository.updateGroupMemberStatus(
        memberId,
        group.id,
        true
      );
    }
    throw new AppError('Member already exists in this group', 404);
  }

  // Create a new group membership for the member
  return await groupMemberRepository.addGroupMember({
    groupId: group.id,
    userId: memberId,
  });
};
