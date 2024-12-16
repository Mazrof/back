import crypto from 'crypto';
import * as groupRepository from '../repositories';
import * as groupMemberService from '../services';
import { CommunityRole } from '@prisma/client';

export const checkPermission = async (adminId: number, groupId: number) => {
  await groupMemberService.checkGroupMemberPermission(adminId, groupId);
};

export const generateInviteToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const findAllGroups = async (): Promise<
  {
    hasFilter: boolean;
    id: number;
    groupSize: number;
    community: { name: string; privacy: boolean; imageURL: string };
  }[]
> => {
  return await groupRepository.findAllGroups();
};

export const findGroupById = async (
  id: number
): Promise<{
  id: number;
  community: { name: string; privacy: boolean | null; imageURL: string };
  groupSize: number | null;
}> => {
  return await groupRepository.findGroupById(id);
};

export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
  imageURL?: string;
}): Promise<{
  id: number;
  community: { name: string; privacy: boolean; imageURL: string };
  groupSize: number;
}> => {
  const token: string = generateInviteToken();
  const invitationLink: string = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const group: {
    id: number;
    community: { name: string; privacy: boolean; imageURL: string };
    groupSize: number;
  } = await groupRepository.createGroup({ ...data, invitationLink });

  // check he is users not admins and add it
  await groupMemberService.addGroupCreator(
    group.id,
    data.creatorId,
    CommunityRole.admin
  );

  return group;
};

export const updateGroup = async (
  groupId: number,
  adminId: number,
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
  await checkPermission(adminId, groupId);
  return await groupRepository.updateGroup(groupId, data);
};

export const deleteGroup = async (
  groupId: number,
  adminId: number
): Promise<{ communityId: number }> => {
  await checkPermission(adminId, groupId);
  return await groupRepository.deleteGroup(groupId);
};

export const applyGroupFilter = async (
  groupId: number,
  adminId: number
): Promise<{
  adminId: number;
  groupId: number;
} | null> => {
  return await groupRepository.applyGroupFilter(groupId, adminId);
};
