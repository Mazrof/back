import * as groupRepository from '../repositories';

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
  return await groupRepository.createGroup(data);
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
