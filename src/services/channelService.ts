import * as channelRepository from '../repositories';
import crypto from 'crypto';
import * as channelMemberService from '../services/channelMemberService';
import { CommunityRole } from '@prisma/client';

export const checkPermission = async (adminId: number, channelId: number) => {
  await channelMemberService.checkChannelMemberPermission(adminId, channelId);
};

export function generateInviteToken(): string {
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

  return channel;
};

export const updateChannel = async (
  channelId: number,
  adminId: number,
  data: { name?: string; privacy?: boolean; canAddComments?: boolean }
) => {
  // check permissions
  await checkPermission(adminId, channelId);

  return await channelRepository.updateChannel(channelId, data);
};

export const deleteChannel = async (channelId: number, adminId: number) => {
  // check permissions
  await checkPermission(adminId, channelId);

  return await channelRepository.deleteChannel(channelId);
};
