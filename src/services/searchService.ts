import * as searchRepository from '../repositories/searchRepository';
import { getFileFromFirebase } from '../third_party_services';

type Group = {
  id: string;
  groupsize: number;
  name: string;
  privacy: string;
  imageurl: string;
};

type Channel = {
  id: string;
  invitationlink: string;
  canaddcomments: boolean;
  name: string;
  privacy: string;
  imageurl: string;
};

export const getProfileByUsername = async (username: string) => {
  return searchRepository.findProfilesByUsername(username);
};

export const getGroupByGroupName = async (groupName: string) => {
  const groups = (await searchRepository.findGroupByGroupName(groupName)) as
    | Group[]
    | null;

  return Promise.all(
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
  const channels = (await searchRepository.findChannelByChannelName(
    channelName
  )) as Channel[] | null;

  return Promise.all(
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
