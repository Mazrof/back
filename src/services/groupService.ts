import crypto from 'crypto';
import * as groupRepository from '../repositories';
import * as groupMemberRepository from '../repositories';
import * as groupMemberService from '../services';
import { CommunityRole } from '@prisma/client';

export const checkPermission = async (adminId: number, groupId: number) => {
  await groupMemberService.checkGroupMemberPermission(adminId, groupId);
};

export function generateInviteToken(): string {
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
  admins: number[];
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

  for (const admin of data.admins) {
    await groupMemberService.addGroupMember(
      data.creatorId,
      group.id,
      admin,
      CommunityRole.admin
    );
  }
  return group;
};

export const updateGroup = async (
  groupId: number,
  adminId: number,
  data: { name?: string; privacy?: boolean; groupSize?: number }
): Promise<{
  id: number;
  community: { name: string; privacy: boolean | null };
  groupSize: number | null;
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
