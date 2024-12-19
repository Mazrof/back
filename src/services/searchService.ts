import * as searchRepository from '../repositories/searchRepository';
import { getFileFromFirebase } from '../third_party_services';

export const getProfileByUsername = async (username: string) => {
  return searchRepository.findProfilesByUsername(username);
};

export const getGroupByGroupName = async (groupName: string) => {
  const groups: any[] = await searchRepository.findGroupByGroupName(groupName);
  return await Promise.all(
    groups.map(async (group) => ({
      id: group.id,
      groupSize: group.groupsize,
      community: {
        name: group.name,
        privacy: group.privacy,
        imageURL: await getFileFromFirebase(group.imageurl),
      },
    }))
  );
};

export const getChannelByChannelName = async (channelName: string) => {
  const channels: any[] =
    await searchRepository.findChannelByChannelName(channelName);
  return await Promise.all(
    channels.map(async (channel) => ({
      id: channel.id,
      invitationLink: channel.invitationlink,
      canAddComments: channel.canaddcomments,
      community: {
        name: channel.name,
        privacy: channel.privacy,
        imageURL: await getFileFromFirebase(channel.imageurl),
      },
    }))
  );
};
