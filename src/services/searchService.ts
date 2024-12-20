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
  const users = (await searchRepository.findProfilesByUsername(username)) as
    | User[]
    | null;

  return users.map((user) => ({
    id: user.id,
    username: user.name,
    email: user.email,
    photo: user.photo,
    screenName: user.screenname,
    phone: user.phone,
    publicKey: user.publickey,
    lastSeen: user.lastseen,
    activeNow: user.activenow,
  }));
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
        imageURL: group.imageurl,
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
        imageURL: channel.imageurl,
      },
    }))
  );
};
