import crypto from 'crypto';
import * as groupRepository from '../repositories';
import * as groupMemberRepository from '../repositories';
import { CommunityRole } from '@prisma/client';

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export const findAllGroups = async (): Promise<
  {
    hasFilter: boolean;
    id: number;
    groupSize: number | null;
    community: { name: string; privacy: boolean | null };
  }[]
> => {
  return await groupRepository.findAllGroups();
};

export const findGroupById = async (
  id: number
): Promise<{
  id: number;
  community: { name: string; privacy: boolean | null };
  groupSize: number | null;
}> => {
  return await groupRepository.findGroupById(id);
};

export const createGroup = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  groupSize: number;
}) => {
  const token: string = generateInviteToken();
  const invitationLink: string = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const group: {
    id: number;
    community: { name: string; privacy: boolean };
    groupSize: number;
  } = await groupRepository.createGroup({ ...data, invitationLink });

  await groupMemberRepository.addGroupMember({
    groupId: group.id,
    userId: data.creatorId,
    role: CommunityRole.admin,
  });
  return group;
};

export const updateGroup = async (
  groupId: number,
  data: { name?: string; privacy?: boolean; groupSize?: number }
): Promise<{
  id: number;
  community: { name: string; privacy: boolean | null };
  groupSize: number | null;
}> => {
  return await groupRepository.updateGroup(groupId, data);
};

export const deleteGroup = async (
  id: number
): Promise<{ communityId: number }> => {
  return await groupRepository.deleteGroup(id);
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
