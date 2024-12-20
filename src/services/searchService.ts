import * as searchRepository from '../repositories/searchRepository';

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

type User = {
  profilePicVisibility: string | null;
  id: string;
  name: string;
  email: string;
  photo: string | null;
  screenname: string;
  phone: string;
  publickey: string;
  lastseen: Date | null;
  activenow: boolean;
};

type MappedUser = {
  id: string;
  username: string;
  email: string;
  photo: string | null;
  screenName: string;
  phone: string;
  publicKey: string;
  lastSeen: Date | null;
  activeNow: boolean;
};

export const getProfileByUsername = async (
  username: string
): Promise<MappedUser[]> => {
  const users = await searchRepository.findProfilesByUsername(username);

  // Type assertion to tell TypeScript that `users` will be an array of User
  if (!users) {
    return [];
  }

  return (users as User[]).map((user) => ({
    id: user.id,
    username: user.name,
    email: user.email,
    photo: user.profilePicVisibility == 'everyone' ? user.photo : null,
    screenName: user.screenname,
    phone: user.phone,
    publicKey: user.publickey,
    lastSeen: user.lastseen,
    activeNow: user.activenow,
  }));
};

export const getGroupByGroupName = async (groupName: string) => {
  const groups = await searchRepository.findGroupByGroupName(groupName);

  // Type assertion to tell TypeScript that `groups` will be an array of Group
  if (!groups) {
    return [];
  }

  return Promise.all(
    (groups as Group[]).map(async (group) => ({
      id: group.id,
      groupSize: group.groupsize,
      community: {
        name: group.name,
        privacy: group.privacy,
        imageURL: group.imageurl,
      },
    }))
  );
};

export const getChannelByChannelName = async (channelName: string) => {
  const channels = await searchRepository.findChannelByChannelName(channelName);

  // Type assertion to tell TypeScript that `channels` will be an array of Channel
  if (!channels) {
    return [];
  }

  return Promise.all(
    (channels as Channel[]).map(async (channel) => ({
      id: channel.id,
      invitationLink: channel.invitationlink,
      canAddComments: channel.canaddcomments,
      community: {
        name: channel.name,
        privacy: channel.privacy,
        imageURL: channel.imageurl,
      },
    }))
  );
};
