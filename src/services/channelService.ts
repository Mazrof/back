import * as channelRepository from '../repositories';
import crypto from 'crypto';
import * as channelMemberService from '../services';
import { CommunityRole } from '@prisma/client';

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

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
  admins: [];
}) => {
  const token: string = generateInviteToken();
  const invitationLink: string = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const channel: {
    id: number;
    canAddComments: boolean;
    community: { name: string; privacy: boolean };
  } = await channelRepository.createChannel({
    ...data,
    invitationLink,
  });

  await channelMemberService.addChannelMember(
    data.creatorId,
    channel.id,
    CommunityRole.admin
  );

  for (const admin of data.admins) {
    await channelMemberService.addChannelMember(
      admin,
      channel.id,
      CommunityRole.admin
    );
  }
  return channel;
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
