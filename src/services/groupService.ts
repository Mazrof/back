import crypto from 'crypto';
import * as groupRepository from '../repositories';

function generateInviteToken() {
  return crypto.randomBytes(32).toString('hex');
}

export const findAllGroups = async () => {
  return await groupRepository.findAllGroups();
};

export const findGroupById = async (id: number) => {
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

  return await groupRepository.createGroup({ ...data, invitationLink });
};

export const updateGroup = async (
  groupId: number,
  data: { name?: string; privacy?: boolean; groupSize?: number }
) => {
  return await groupRepository.updateGroup(groupId, data);
};

export const deleteGroup = async (id: number) => {
  return await groupRepository.deleteGroup(id);
};

export const applyGroupFilter = async (groupId: number, adminId: number) => {
  return await groupRepository.applyGroupFilter(groupId, adminId);
};
