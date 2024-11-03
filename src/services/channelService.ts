import * as channelRepository from '../repositories';

export const findAllChannels = async () => {
  return await channelRepository.findAllChannels();
};

export const findChannelById = async (id: number) => {
  return await channelRepository.findChannelById(id);
};

export const createChannel = async (data: {
  name: string;
  privacy: boolean;
  creatorId: number;
  canAddComments: boolean;
}) => {
  return await channelRepository.createChannel(data);
};

export const updateChannel = async (
  channelId: number,
  data: { name?: string; privacy?: boolean; canAddComments?: boolean }
) => {
  return await channelRepository.updateChannel(channelId, data);
};

export const deleteChannel = async (id: number) => {
  return await channelRepository.deleteChannel(id);
};
