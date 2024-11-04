import * as searchRepository from '../repositories/searchRepository';

export const getProfileByUsername = async (username: string) => {
  return await searchRepository.findProfilesByUsername(username);
};

export const getGroupByGroupName = async (groupName: string) => {
  return await searchRepository.findGroupByGroupName(groupName);
};

export const getChannelByChannelName = async (groupName: string) => {
  return await searchRepository.findChannelByChannelName(groupName);
};
