import * as channelMemberRepository from '../repositories/channelMemberRepository';
import { AppError } from '../utility';
import { UpdateChannelMemberData, ChannelRole } from '../types';

export const getChannelMembers = async (channelId: number) => {
  return await channelMemberRepository.findChannelMembers(channelId);
};

export const addChannelMember = async (memberId: number, channelId: number) => {
  // Check if the member already exists in the channel
  const existingMember = await channelMemberRepository.findExistingMember(
    memberId,
    channelId
  );
  if (existingMember) {
    if (!existingMember.status) {
      return await channelMemberRepository.updateChannelMemberStatus(
        memberId,
        channelId,
        true
      );
    }
    throw new AppError('Member already exists in this channel', 404);
  }

  // Create a new channel membership for the member
  return await channelMemberRepository.addChannelMember({
    channelId,
    userId: memberId,
  });
};

export const updateChannelMember = async (
  userId: number,
  channelId: number,
  memberId: number,
  updates: UpdateChannelMemberData
) => {
  const user = await channelMemberRepository.findChannelMember(
    userId,
    channelId
  );
  // TODO: DB ERR
  if (!user || user.role !== ChannelRole.admin) {
    throw new AppError('Not Authorized', 403);
  }

  const existingMember = await channelMemberRepository.findExistingMember(
    memberId,
    channelId
  );

  if (!existingMember) {
    throw new AppError('Member not found in this Channel', 404);
  }

  const updatedData: UpdateChannelMemberData = {};
  if (updates.role === 'admin') {
    updatedData.role = ChannelRole.admin;
  } else if (updates.role === 'member') {
    updatedData.role = ChannelRole.member;
  }

  if (updates.hasDownloadPermissions) {
    updatedData.hasDownloadPermissions = updates.hasDownloadPermissions;
  }

  return await channelMemberRepository.updateChannelMemberData(
    memberId,
    channelId,
    updatedData
  );
};

export const deleteChannelMember = async (
  channelId: number,
  memberId: number
) => {
  const existingMember = await channelMemberRepository.findExistingMember(
    memberId,
    channelId
  );

  if (!existingMember) {
    throw new AppError('Member not found in this channel', 404);
  }

  return await channelMemberRepository.updateChannelMemberStatus(
    memberId,
    channelId,
    false
  );
};
